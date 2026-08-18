import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sourcesFromManifest } from "../src/sources/manifest.js";

describe("source manifest", () => {
  it("applies each source freshness window", async () => {
    const directory = await mkdtemp(join(tmpdir(), "agentic-rwa-manifest-"));
    const corpusPath = join(directory, "old-memo.md");
    const manifestPath = join(directory, "sources.json");
    const cachePath = join(directory, "cache");

    await writeFile(corpusPath, "A sufficiently detailed historical credit memo.");
    await writeFile(
      manifestPath,
      JSON.stringify({
        sources: [
          {
            id: "old-credit-memo",
            kind: "credit-memo",
            title: "Old credit memo",
            location: "old-memo.md",
            publishedAt: "2020-01-01T00:00:00.000Z",
            staleAfterHours: 24,
          },
        ],
      }),
    );

    const [source] = await sourcesFromManifest(manifestPath, cachePath);
    expect(source).toBeDefined();
    const document = await source!.fetch();

    expect(document.stale).toBe(true);
    expect(document.staleReason).toContain("24-hour freshness");
  });
});
