import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "@agentic-rwa/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts") } },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"], include: ["tests/**/*.test.{ts,tsx}"] },
});
