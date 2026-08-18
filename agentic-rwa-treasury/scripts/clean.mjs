import { rm } from "node:fs/promises";
import { glob } from "node:fs/promises";

const patterns = ["**/.next", "**/dist", "**/artifacts", "**/cache", "**/coverage", "**/*.tsbuildinfo", "playwright-report", "test-results"];
for (const pattern of patterns) {
  for await (const path of glob(pattern, { exclude: ["node_modules/**"] })) {
    await rm(path, { recursive: true, force: true });
  }
}
