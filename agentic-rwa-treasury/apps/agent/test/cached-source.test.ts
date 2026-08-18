import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DocumentSource } from "../src/domain/ports.js";
import { CachedDocumentSource } from "../src/sources/cached-source.js";
import { StaticDocumentSource } from "../src/sources/static-source.js";

describe("CachedDocumentSource", () => {
  it("falls back to last-known-good content", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "rwa-cache-"));
    const source = new StaticDocumentSource("source", { kind: "other", title: "Source", sourceUrl: "https://example.com", publishedAt: new Date().toISOString(), staleAfterHours: 24, text: "valid content" });
    await new CachedDocumentSource(source, directory).fetch();
    const broken: DocumentSource = { id: "source", fetch: async () => { throw new Error("offline"); } };
    const result = await new CachedDocumentSource(broken, directory).fetch();
    expect(result.text).toBe("valid content");
    expect(result.stale).toBe(true);
  });
});
