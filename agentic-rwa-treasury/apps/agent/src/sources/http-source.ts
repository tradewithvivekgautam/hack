import type { SourceDocument } from "@agentic-rwa/shared";
import pRetry, { AbortError } from "p-retry";
import pTimeout from "p-timeout";
import type { DocumentSource } from "../domain/ports.js";
import { extractText } from "./extract.js";
import {
  makeSourceDocument,
  markFreshness,
  nowIso,
} from "./source-utils.js";

export class HttpDocumentSource implements DocumentSource {
  constructor(
    public readonly id: string,
    private readonly options: {
      url: string;
      kind: SourceDocument["kind"];
      title: string;
      publishedAt?: string;
      headers?: Record<string, string>;
      timeoutMs?: number;
      staleAfterHours?: number;
    },
  ) {}

  async fetch(): Promise<SourceDocument> {
    return pRetry(
      async () => {
        const timeoutMs = this.options.timeoutMs ?? 15_000;
        const response = await pTimeout(
          fetch(this.options.url, {
            headers: {
              "user-agent": "Agentic-RWA-Treasury/1.0",
              ...this.options.headers,
            },
            signal: AbortSignal.timeout(timeoutMs),
          }),
          { milliseconds: timeoutMs },
        );

        if (response.status === 404) {
          throw new AbortError(`Source ${this.id} returned 404.`);
        }
        if (!response.ok) {
          throw new Error(
            `Source ${this.id} returned HTTP ${response.status}.`,
          );
        }

        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.byteLength > 12_000_000) {
          throw new AbortError(`Source ${this.id} exceeds 12 MB.`);
        }

        const text = await extractText(
          bytes,
          response.headers.get("content-type") ?? "",
          this.options.url,
        );
        const lastModified = response.headers.get("last-modified");
        const publishedAt =
          this.options.publishedAt ??
          (lastModified ? new Date(lastModified).toISOString() : nowIso());
        const document = makeSourceDocument({
          id: this.id,
          kind: this.options.kind,
          title: this.options.title,
          sourceUrl: this.options.url,
          publishedAt,
          fetchedAt: nowIso(),
          text,
          stale: false,
        });
        return markFreshness(
          document,
          this.options.staleAfterHours ?? 168,
        );
      },
      { retries: 2, minTimeout: 500, maxTimeout: 2_000 },
    );
  }
}
