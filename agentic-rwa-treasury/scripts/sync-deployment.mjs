import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const chainId = process.argv[2] ?? "1952";
const source = path.resolve(`deployments/chain-${chainId}.json`);
const targets = [
  path.resolve("packages/shared/src/generated/deployment.json"),
  path.resolve("apps/web/src/config/generated-deployment.json"),
];

await readFile(source, "utf8");
for (const target of targets) {
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  console.log(`Synced ${source} -> ${target}`);
}
