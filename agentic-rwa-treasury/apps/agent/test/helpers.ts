import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DocumentSource } from "../src/domain/ports.js";
import { FileDocumentSource } from "../src/sources/file-source.js";

export async function fixtureSources(): Promise<{ sources: DocumentSource[]; directory: string }> {
  const directory = await mkdtemp(join(tmpdir(), "agentic-rwa-agent-"));
  const rows = [
    ["rwa-fund-factsheet", "fund-factsheet", "Fund factsheet reports stable NAV and 4.3% short-duration income."],
    ["private-credit-memo", "credit-memo", "Credit memo reports senior secured collateral and modestly rising non-accruals."],
    ["okx-rwa-exit-liquidity", "liquidity", "OKX liquidity quote reports 28 bps impact at the observed notional."],
  ] as const;
  const sources: DocumentSource[] = [];
  for (const [id, kind, text] of rows) {
    const path = join(directory, `${id}.md`);
    await writeFile(path, text);
    sources.push(new FileDocumentSource(id, { path, kind, title: id }));
  }
  return { sources, directory };
}
