import type { SourceDocument } from "@agentic-rwa/shared";
import type { DocumentSource } from "../domain/ports.js";
import { contentHash, markFreshness } from "./source-utils.js";

export class StaticDocumentSource implements DocumentSource {
  constructor(public readonly id: string, private readonly document: {
    kind: SourceDocument["kind"];
    title: string;
    sourceUrl: string;
    publishedAt: string;
    staleAfterHours: number;
    text: string;
  }) {}

  async fetch(): Promise<SourceDocument> {
    const fetchedAt = new Date().toISOString();
    return markFreshness({
      id: this.id,
      kind: this.document.kind,
      title: this.document.title,
      sourceUrl: this.document.sourceUrl,
      publishedAt: this.document.publishedAt,
      fetchedAt,
      text: this.document.text,
      contentHash: contentHash(this.document.text),
    }, this.document.staleAfterHours);
  }
}
