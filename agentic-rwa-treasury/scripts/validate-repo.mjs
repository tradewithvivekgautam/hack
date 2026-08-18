import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const required = [
  ".github/workflows/ci.yml",
  ".env.example",
  "package.json",
  "biome.json",
  "tsconfig.base.json",
  ".dockerignore",
  ".nvmrc",
  "README.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "PLAN.md",
  "VALIDATION.md",
  "BUILD_REPORT.json",
  "docs/ARCHITECTURE.md",
  "docs/THREAT_MODEL.md",
  "docs/DATA_SOURCES.md",
  "docs/DEPLOYMENT.md",
  "docs/OPERATIONS.md",
  "docs/TESTING.md",
  "docs/UI_SYSTEM.md",
  "docs/DEMO_SCRIPT.md",
  "infra/modal/deepseek_v4.py",
  "infra/modal/README.md",
  "scripts/configure-local.mjs",
  "scripts/format-check.mjs",
  "apps/web/Dockerfile",
  "apps/web/package.json",
  "apps/web/next.config.ts",
  "apps/web/postcss.config.mjs",
  "apps/web/playwright.config.ts",
  "apps/web/vitest.config.ts",
  "apps/web/public/icon.svg",
  "apps/web/public/site.webmanifest",
  "apps/web/src/app/layout.tsx",
  "apps/web/src/app/api/health/route.ts",
  "apps/web/src/app/vault/page.tsx",
  "apps/web/src/app/decisions/page.tsx",
  "apps/web/src/app/sources/page.tsx",
  "apps/web/src/app/protocol/page.tsx",
  "apps/web/src/features/vault/components/vault-screen.tsx",
  "apps/web/src/features/decisions/components/decisions-screen.tsx",
  "apps/web/src/features/decisions/components/verification-card.tsx",
  "apps/web/src/features/protocol/components/policy-simulator.tsx",
  "apps/web/src/components/ui/button.tsx",
  "apps/web/src/components/ui/dialog.tsx",
  "apps/web/src/components/ui/field.tsx",
  "apps/web/src/components/ui/input.tsx",
  "apps/web/src/components/ui/tabs.tsx",
  "apps/web/src/components/ui/tooltip.tsx",
  "apps/web/src/components/ui/data-table.tsx",
  "apps/web/src/components/shell/app-shell.tsx",
  "apps/web/src/components/shell/mobile-nav.tsx",
  "apps/web/src/components/wallet/connect-wallet-dialog.tsx",
  "apps/web/tests/e2e/vault.spec.ts",
  "apps/web/tests/e2e/decisions.spec.ts",
  "apps/web/tests/e2e/policy.spec.ts",
  "apps/web/tests/unit/vault-query.test.ts",
  "apps/web/tests/unit/verification.test.ts",
  "apps/agent/Dockerfile",
  "apps/agent/package.json",
  "apps/agent/src/config/env.ts",
  "apps/agent/src/chain/viem-gateway.ts",
  "apps/agent/src/epoch/run-epoch.ts",
  "apps/agent/src/providers/openai-compatible.ts",
  "apps/agent/src/sources/manifest.ts",
  "apps/agent/src/sources/okx-liquidity-source.ts",
  "apps/agent/test/manifest.test.ts",
  "apps/agent/test/pipeline.test.ts",
  "apps/agent/test/gather.test.ts",
  "apps/agent/test/local-store.test.ts",
  "contracts/package.json",
  "contracts/hardhat.config.ts",
  "contracts/script/deploy.ts",
  "contracts/src/RwaTreasuryVault.sol",
  "contracts/src/AllocationPolicy.sol",
  "contracts/src/ReasoningRegistry.sol",
  "contracts/src/adapters/RwaYieldAdapter.sol",
  "contracts/src/adapters/LendingAdapter.sol",
  "contracts/src/adapters/IdleAdapter.sol",
  "contracts/test/policy.test.ts",
  "contracts/test/registry.test.ts",
  "contracts/test/vault.test.ts",
  "packages/shared/package.json",
  "packages/shared/src/chain.ts",
  "packages/shared/src/reasoning.ts",
  "packages/shared/src/policy.ts",
  "packages/shared/src/contracts.ts",
  "packages/shared/test/policy.test.ts",
  "packages/shared/test/reasoning.test.ts",
  "packages/shared/src/generated/deployment.json",
  "apps/web/src/config/generated-deployment.json",
  "deployments/chain-1952.json",
];

await Promise.all(required.map((path) => access(path)));

const parseJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const rootPackage = await parseJson("package.json");
if (!rootPackage.workspaces?.includes("apps/*")) throw new Error("Root application workspaces are incomplete.");
if (!rootPackage.workspaces?.includes("packages/*")) throw new Error("Root package workspaces are incomplete.");
if (!rootPackage.workspaces?.includes("contracts")) throw new Error("Contracts workspace is missing.");
if (rootPackage.engines?.node !== ">=22.16.0") throw new Error("Node.js engine must remain pinned to the tested Node 22 baseline.");
if (rootPackage.devDependencies?.typescript !== "7.0.2") throw new Error("Root TypeScript version must be 7.0.2.");
for (const script of [
  "dev",
  "build",
  "typecheck",
  "lint",
  "test",
  "test:e2e",
  "contracts:compile",
  "contracts:node",
  "contracts:deploy:local",
  "contracts:deploy:testnet",
  "deployment:sync",
  "agent:epoch",
  "agent:worker",
  "validate:repo",
  "static:check",
  "local:configure",
  "format:check",
]) {
  if (!rootPackage.scripts?.[script]) throw new Error(`Root script ${script} is missing.`);
}

const packagePaths = [
  "apps/web/package.json",
  "apps/agent/package.json",
  "contracts/package.json",
  "packages/shared/package.json",
];
const packages = await Promise.all(packagePaths.map(parseJson));
for (const [index, packageJson] of packages.entries()) {
  if (packageJson.devDependencies?.typescript !== "7.0.2") {
    throw new Error(`${packagePaths[index]} must use TypeScript 7.0.2.`);
  }
}

const webPackage = packages[0];
const requiredExactWebDependencies = {
  "@base-ui/react": "1.6.0",
  "@tanstack/react-form": "1.33.2",
  "@tanstack/react-pacer": "0.21.1",
  "@tanstack/react-query": "5.101.4",
  "@tanstack/react-table": "9.0.0-beta.59",
  "@tanstack/react-virtual": "3.14.9",
  "date-fns": "4.4.0",
  "lucide-react": "1.28.0",
  "next": "16.3.1",
  "react": "19.2.8",
  "react-dom": "19.2.8",
  "viem": "2.55.8",
  "wagmi": "3.7.1",
  "zod": "4.4.3",
};
for (const [dependency, expected] of Object.entries(requiredExactWebDependencies)) {
  const actual = webPackage.dependencies?.[dependency];
  if (actual !== expected) throw new Error(`${dependency} must be pinned to ${expected}; received ${String(actual)}.`);
}
if (webPackage.devDependencies?.tailwindcss !== "4.3.3") throw new Error("Tailwind CSS must be pinned to 4.3.3.");
if (webPackage.devDependencies?.["@tailwindcss/postcss"] !== "4.3.3") throw new Error("Tailwind PostCSS plugin must match Tailwind CSS.");

const contractPackage = packages[2];
if (!contractPackage.dependencies?.["@openzeppelin/contracts"]) throw new Error("OpenZeppelin contracts dependency is missing.");
if (!contractPackage.devDependencies?.hardhat?.startsWith("3.")) throw new Error("Hardhat 3 is required.");

const deploymentPaths = [
  "packages/shared/src/generated/deployment.json",
  "apps/web/src/config/generated-deployment.json",
];
const deploymentCopies = await Promise.all(deploymentPaths.map(parseJson));
const deployment = deploymentCopies[0];
if (deployment.schemaVersion !== "1.0.0" || ![31337, 1952, 196].includes(deployment.chainId)) {
  throw new Error("Bundled deployment schema or chain is invalid.");
}
if (JSON.stringify(deploymentCopies[0]) !== JSON.stringify(deploymentCopies[1])) {
  throw new Error("Shared and web deployment receipts are not synchronized.");
}
const sourceDeploymentPath = `deployments/chain-${deployment.chainId}.json`;
try {
  const sourceDeployment = await parseJson(sourceDeploymentPath);
  if (JSON.stringify(sourceDeployment) !== JSON.stringify(deployment)) {
    throw new Error(`${sourceDeploymentPath} differs from synchronized deployment copies.`);
  }
} catch (error) {
  if (deployment.chainId === 1952) throw error;
}

const sourceManifest = await readFile("apps/agent/src/sources/manifest.ts", "utf8");
if (!sourceManifest.includes("staleAfterHours")) throw new Error("Source manifest freshness configuration is not wired through.");
const chainDefinitions = await readFile("packages/shared/src/chain.ts", "utf8");
for (const chainId of ["31_337", "1_952", "196"]) {
  if (!chainDefinitions.includes(chainId)) throw new Error(`Supported chain ${chainId} is missing.`);
}
const hardhatConfig = await readFile("contracts/hardhat.config.ts", "utf8");
if (!hardhatConfig.includes("localhost") || !hardhatConfig.includes("127.0.0.1:8545")) {
  throw new Error("Persistent local Hardhat network configuration is missing.");
}
const worker = await readFile("apps/agent/src/cli/worker.ts", "utf8");
if (!worker.includes("runOnStart")) throw new Error("Worker run-on-start behavior is missing.");

const demoDecisions = await readFile("apps/web/src/lib/demo/decisions.ts", "utf8");
if (!demoDecisions.includes("length: 71")) throw new Error("The deterministic demo must include 71 epochs.");
const verification = await readFile("apps/web/src/features/decisions/verification/verify.ts", "utf8");
if (!verification.includes("hashUtf8Text(raw)")) throw new Error("Browser verification must hash exact fetched UTF-8 text.");

const vault = await readFile("contracts/src/RwaTreasuryVault.sol", "utf8");
for (const invariant of [
  "function maxDeposit",
  "function maxMint",
  "Phase one: withdraw every over-allocated strategy",
  "Phase two: fund every under-allocated strategy",
  "policy.validate",
  "registry.recordDecision",
  "function emergencyExitStrategy",
]) {
  if (!vault.includes(invariant)) throw new Error(`Vault invariant is missing: ${invariant}`);
}

const allFiles = [];
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", ".next", "node_modules", "dist", "artifacts", "cache", "coverage", ".data"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else allFiles.push(path);
  }
}
await walk(".");

if (allFiles.length < 210) throw new Error(`Expected a complete source tree with at least 210 files; found ${allFiles.length}.`);

for (const path of allFiles.filter((path) => extname(path) === ".json")) {
  try {
    JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${relative(".", path)} contains invalid JSON: ${String(error)}`);
  }
}

const webTextFiles = allFiles.filter((path) => path.startsWith("apps/web/") && /\.(?:css|ts|tsx)$/.test(path));
for (const path of webTextFiles) {
  const text = await readFile(path, "utf8");
  for (const match of text.matchAll(/text-\[(\d+(?:\.\d+)?)rem\]/g)) {
    const rem = Number(match[1]);
    if (rem < 0.75 || rem > 1) throw new Error(`${path} uses ${rem}rem text; the design system allows 0.75rem–1rem.`);
  }
  for (const match of text.matchAll(/font-size:\s*(\d+(?:\.\d+)?)rem/g)) {
    const rem = Number(match[1]);
    if (rem < 0.75 || rem > 1) throw new Error(`${path} uses ${rem}rem CSS font-size; the design system allows 0.75rem–1rem.`);
  }
}
const globalCss = await readFile("apps/web/src/app/globals.css", "utf8");
if (!globalCss.includes("font-size: 0.8125rem")) throw new Error("The condensed 13px body reset is missing.");

const dependencyText = packagePaths.concat("package.json").map(async (path) => JSON.stringify(await parseJson(path)));
if ((await Promise.all(dependencyText)).some((text) => text.includes("better-sqlite3"))) {
  throw new Error("Native better-sqlite3 is intentionally excluded; Node 22 node:sqlite is used instead.");
}

console.log(
  `Repository validation passed: ${required.length} critical artifacts, ${allFiles.length} source files, workspace scripts, exact dependency pins, synchronized deployments, local/X Layer chain support, protocol invariants, demo integrity, JSON, and condensed typography checked.`,
);
