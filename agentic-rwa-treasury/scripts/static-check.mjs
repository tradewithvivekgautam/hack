import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function loadTypeScript() {
  for (const packageName of ["@typescript/typescript6", "typescript"]) {
    try {
      const candidate = require(packageName);
      if (typeof candidate.createSourceFile === "function") return candidate;
    } catch {
      // Try the next local compatibility package.
    }
  }
  throw new Error(
    "The TypeScript compiler API is unavailable. Run bun install before static:check.",
  );
}

const ts = loadTypeScript();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".data",
  "artifacts",
  "cache",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const allFiles = walk(root);
const sourceFiles = allFiles.filter((path) => /\.(?:ts|tsx|mts|cts)$/.test(path));
const jsonFiles = allFiles.filter((path) => extname(path) === ".json");
const solidityFiles = allFiles.filter((path) => extname(path) === ".sol");
const pythonFiles = allFiles.filter((path) => extname(path) === ".py");
const failures = [];

for (const path of jsonFiles) {
  try {
    JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`${relative(root, path)}: invalid JSON (${String(error)})`);
  }
}

const importExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".json"];

function importCandidates(importer, specifier) {
  const base = resolve(dirname(importer), specifier);
  const withoutRuntimeExtension = specifier.endsWith(".js")
    ? resolve(dirname(importer), specifier.slice(0, -3))
    : base;
  return [
    base,
    withoutRuntimeExtension,
    ...importExtensions.map((extension) => `${base}${extension}`),
    ...importExtensions.map((extension) => `${withoutRuntimeExtension}${extension}`),
    ...importExtensions.map((extension) => join(base, `index${extension}`)),
    ...importExtensions.map((extension) =>
      join(withoutRuntimeExtension, `index${extension}`),
    ),
  ];
}

for (const path of sourceFiles) {
  const text = readFileSync(path, "utf8");
  const sourceFile = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  for (const diagnostic of sourceFile.parseDiagnostics) {
    const position = sourceFile.getLineAndCharacterOfPosition(
      diagnostic.start ?? 0,
    );
    failures.push(
      `${relative(root, path)}:${position.line + 1}:${position.character + 1}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
    );
  }

  const identifierCounts = new Map();
  function countIdentifiers(node) {
    if (ts.isIdentifier(node)) {
      identifierCounts.set(
        node.text,
        (identifierCounts.get(node.text) ?? 0) + 1,
      );
    }
    ts.forEachChild(node, countIdentifiers);
  }
  countIdentifiers(sourceFile);

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }

    const specifier = statement.moduleSpecifier.text;
    if (specifier.startsWith(".")) {
      const found = importCandidates(path, specifier).some(existsSync);
      if (!found) {
        failures.push(
          `${relative(root, path)}: unresolved relative import ${JSON.stringify(specifier)}`,
        );
      }
    } else if (specifier.startsWith("@/")) {
      const webTarget = resolve(root, "apps/web/src", specifier.slice(2));
      const found = [
        webTarget,
        ...importExtensions.map((extension) => `${webTarget}${extension}`),
        ...importExtensions.map((extension) =>
          join(webTarget, `index${extension}`),
        ),
      ].some(existsSync);
      if (!found) {
        failures.push(
          `${relative(root, path)}: unresolved web alias ${JSON.stringify(specifier)}`,
        );
      }
    }

    const clause = statement.importClause;
    if (!clause) continue;
    const importedNames = [];
    if (clause.name) importedNames.push(clause.name.text);
    if (clause.namedBindings) {
      if (ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          importedNames.push(element.name.text);
        }
      } else {
        importedNames.push(clause.namedBindings.name.text);
      }
    }
    for (const name of importedNames) {
      if ((identifierCounts.get(name) ?? 0) <= 1) {
        failures.push(`${relative(root, path)}: unused import ${name}`);
      }
    }
  }

  if (/\b(?:TODO|FIXME)\b|Not implemented/i.test(text)) {
    failures.push(
      `${relative(root, path)}: unfinished implementation marker found`,
    );
  }
}

function stripSolidityCommentsAndStrings(text) {
  let result = "";
  let state = "code";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (state === "code") {
      if (char === "/" && next === "/") {
        state = "line-comment";
        result += "  ";
        index += 1;
      } else if (char === "/" && next === "*") {
        state = "block-comment";
        result += "  ";
        index += 1;
      } else if (char === '"') {
        state = "double-string";
        result += " ";
      } else if (char === "'") {
        state = "single-string";
        result += " ";
      } else {
        result += char;
      }
    } else if (state === "line-comment") {
      if (char === "\n") {
        state = "code";
        result += "\n";
      } else {
        result += " ";
      }
    } else if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = "code";
        result += "  ";
        index += 1;
      } else {
        result += char === "\n" ? "\n" : " ";
      }
    } else {
      const quote = state === "double-string" ? '"' : "'";
      if (char === "\\") {
        result += "  ";
        index += 1;
      } else if (char === quote) {
        state = "code";
        result += " ";
      } else {
        result += char === "\n" ? "\n" : " ";
      }
    }
  }
  if (state === "block-comment" || state.endsWith("string")) {
    return { text: result, unterminated: state };
  }
  return { text: result, unterminated: undefined };
}

for (const path of solidityFiles) {
  const original = readFileSync(path, "utf8");
  if (!original.includes("SPDX-License-Identifier")) {
    failures.push(`${relative(root, path)}: SPDX identifier is missing`);
  }
  if (!/pragma solidity\s+(?:\^)?0\.8\.24\s*;/.test(original)) {
    failures.push(`${relative(root, path)}: Solidity pragma must target 0.8.24`);
  }
  if (/\b(?:TODO|FIXME)\b|Not implemented/i.test(original)) {
    failures.push(
      `${relative(root, path)}: unfinished implementation marker found`,
    );
  }

  for (const match of original.matchAll(/import\s+(?:[^"']*from\s+)?["']([^"']+)["']\s*;/g)) {
    const specifier = match[1];
    if (specifier.startsWith(".")) {
      const target = resolve(dirname(path), specifier);
      if (!existsSync(target)) {
        failures.push(
          `${relative(root, path)}: unresolved Solidity import ${JSON.stringify(specifier)}`,
        );
      }
    } else if (!specifier.startsWith("@openzeppelin/contracts/")) {
      failures.push(
        `${relative(root, path)}: unexpected external Solidity import ${JSON.stringify(specifier)}`,
      );
    }
  }

  const stripped = stripSolidityCommentsAndStrings(original);
  if (stripped.unterminated) {
    failures.push(
      `${relative(root, path)}: unterminated ${stripped.unterminated}`,
    );
  }
  const pairs = new Map([
    [")", "("],
    ["]", "["],
    ["}", "{"],
  ]);
  const stack = [];
  for (let index = 0; index < stripped.text.length; index += 1) {
    const char = stripped.text[index];
    if ("([{".includes(char)) stack.push({ char, index });
    if (pairs.has(char)) {
      const opening = stack.pop();
      if (!opening || opening.char !== pairs.get(char)) {
        failures.push(
          `${relative(root, path)}: unmatched ${char} near character ${index}`,
        );
        break;
      }
    }
  }
  if (stack.length > 0) {
    failures.push(
      `${relative(root, path)}: unmatched ${stack.at(-1).char} near character ${stack.at(-1).index}`,
    );
  }
}

if (pythonFiles.length > 0) {
  try {
    const pythonExecutable = process.platform === "win32" ? "python" : "python3";
    execFileSync(
      pythonExecutable,
      ["-m", "py_compile", ...pythonFiles],
      {
        cwd: root,
        env: {
          ...process.env,
          PYTHONPYCACHEPREFIX: join(
            process.env.TEMP ?? join(root, ".data"),
            "agentic-rwa-pycache",
          ),
        },
        stdio: "pipe",
      },
    );
  } catch (error) {
    failures.push(`Python syntax validation failed: ${String(error)}`);
  }
}

if (sourceFiles.length < 120) {
  failures.push(
    `Expected at least 120 TypeScript files, found ${sourceFiles.length}.`,
  );
}
if (solidityFiles.length < 11) {
  failures.push(
    `Expected at least 11 Solidity files, found ${solidityFiles.length}.`,
  );
}

const globalCssPath = resolve(root, "apps/web/src/app/globals.css");
const globalCss = readFileSync(globalCssPath, "utf8");
if (!globalCss.includes("font-size: 0.8125rem")) {
  failures.push("apps/web/src/app/globals.css: condensed 13px body reset missing");
}
for (const match of globalCss.matchAll(/font-size:\s*([\d.]+)(px|rem)/g)) {
  const value = Number(match[1]);
  const pixels = match[2] === "rem" ? value * 16 : value;
  if (pixels < 12 || pixels > 16) {
    failures.push(
      `apps/web/src/app/globals.css: font-size ${match[0]} is outside the 12px–16px product scale`,
    );
  }
}
for (const path of allFiles.filter((candidate) =>
  candidate.startsWith(resolve(root, "apps/web")) &&
  /\.(?:css|ts|tsx)$/.test(candidate),
)) {
  const text = readFileSync(path, "utf8");
  for (const match of text.matchAll(/text-\[([\d.]+)(px|rem)\]/g)) {
    const value = Number(match[1]);
    const pixels = match[2] === "rem" ? value * 16 : value;
    if (pixels < 12 || pixels > 16) {
      failures.push(
        `${relative(root, path)}: ${match[0]} is outside the 12px–16px product scale`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(
    `Static source validation failed with ${failures.length} issue(s):`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Static source validation passed: ${sourceFiles.length} TypeScript, ${solidityFiles.length} Solidity, ${pythonFiles.length} Python, and ${jsonFiles.length} JSON files checked; local imports resolve; source delimiters and typography constraints pass; no unfinished markers or unused imports detected.`,
  );
}
