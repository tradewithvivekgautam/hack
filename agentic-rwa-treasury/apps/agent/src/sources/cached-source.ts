import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SourceDocumentSchema, type SourceDocument } from "@agentic-rwa/shared";
import type { DocumentSource } from "../domain/ports.js";
import { asError, nowIso } from "./source-utils.js";

export class CachedDocumentSource implements DocumentSource {
  public readonly id: string;

  constructor(private readonly inner: DocumentSource, private readonly directory: string) {
    this.id = inner.id;
  }

  private get cachePath(): string {
    return join(this.directory, `${this.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
  }

  async fetch(): Promise<SourceDocument> {
    try {
      const document = await this.inner.fetch();
      await mkdir(this.directory, { recursive: true });
      await writeFile(this.cachePath, JSON.stringify(document), "utf8");
      return document;
    } catch (error) {
      try {
        const cached = SourceDocumentSchema.parse(JSON.parse(await readFile(this.cachePath, "utf8")));
        return SourceDocumentSchema.parse({
          ...cached,
          fetchedAt: nowIso(),
          stale: true,
          staleReason: `Last-known-good fallback: ${asError(error).message}`,
        });
      } catch {
        throw error;
      }
    }
  }
}
