import "dotenv/config";
import { loadConfig } from "../config/env.js";
import { createAllocationProvider } from "../providers/factory.js";
import { FixtureChainGateway } from "../chain/fixture-gateway.js";
import { FileDocumentSource } from "../sources/file-source.js";
import { resolve } from "node:path";

const config = loadConfig(process.env);
const provider = createAllocationProvider(config);
const snapshot = await new FixtureChainGateway().snapshot();
const base = resolve(process.cwd(), "corpus");
const documents = await Promise.all([
  new FileDocumentSource("rwa-fund-factsheet", { path: resolve(base, "rwa-fund-factsheet.md"), kind: "fund-factsheet", title: "RWA fund factsheet" }).fetch(),
  new FileDocumentSource("credit-memo", { path: resolve(base, "private-credit-memo.md"), kind: "credit-memo", title: "Credit memo" }).fetch(),
  new FileDocumentSource("rate-statement", { path: resolve(base, "rate-statement.md"), kind: "rate-announcement", title: "Rate statement" }).fetch(),
]);
console.log(JSON.stringify(await provider.propose({ documents, snapshot }), null, 2));
