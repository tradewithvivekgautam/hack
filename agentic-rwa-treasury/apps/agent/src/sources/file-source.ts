import { readFile, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { SourceDocument } from "@agentic-rwa/shared";
import type { DocumentSource } from "../domain/ports.js";
import { extractText } from "./extract.js";
import {
  makeSourceDocument,
  markFreshness,
  nowIso,
} from "./source-utils.js";

export class FileDocumentSource implements DocumentSource {
  constructor(
    public readonly id: string,
    private readonly options: {
      path: string;
      kind: SourceDocument["kind"];
      title: string;
      publishedAt?: string;
      staleAfterHours?: number;
    },
  ) {}

  async fetch(): Promise<SourceDocument> {
    const [bytes, metadata] = await Promise.all([
      readFile(this.options.path),
      stat(this.options.path),
    ]);
    if (bytes.byteLength > 12_000_000) {
      throw new Error(`Source ${this.id} exceeds 12 MB.`);
    }

    const text = await extractText(
      bytes,
      "application/octet-stream",
      this.options.path,
    );
    const document = makeSourceDocument({
      id: this.id,
      kind: this.options.kind,
      title: this.options.title,
      sourceUrl: pathToFileURL(this.options.path).href,
      publishedAt: this.options.publishedAt ?? metadata.mtime.toISOString(),
      fetchedAt: nowIso(),
      text,
      stale: false,
    });
    return markFreshness(
      document,
      this.options.staleAfterHours ?? 168,
    );
  }
}
