import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

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
  "__pycache__",
]);
const binaryExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".pyc",
  ".webp",
  ".zip",
]);
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (!binaryExtensions.has(extname(entry.name).toLowerCase())) files.push(path);
  }
}

await walk(".");

const failures = [];
for (const path of files) {
  const contents = await readFile(path, "utf8");
  const displayPath = relative(".", path);
  if (contents.includes("\r")) failures.push(`${displayPath}: use LF line endings`);
  if (contents.includes("\t")) failures.push(`${displayPath}: tabs are not allowed`);
  if (!contents.endsWith("\n")) failures.push(`${displayPath}: missing final newline`);
  for (const [index, line] of contents.split("\n").entries()) {
    if (line !== line.trimEnd()) {
      failures.push(`${displayPath}:${index + 1}: trailing whitespace`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Source hygiene passed for ${files.length} text files: LF endings, no tabs, no trailing whitespace, and final newlines.`);
}
