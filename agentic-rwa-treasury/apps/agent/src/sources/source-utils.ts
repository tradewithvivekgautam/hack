import {
  hashUtf8Text,
  SourceDocumentSchema,
  type SourceDocument,
} from "@agentic-rwa/shared";

export function contentHash(text: string) {
  return hashUtf8Text(text);
}

export function makeSourceDocument(
  input: Omit<SourceDocument, "contentHash">,
): SourceDocument {
  return SourceDocumentSchema.parse({
    ...input,
    contentHash: contentHash(input.text),
  });
}

export function markFreshness(
  document: Omit<SourceDocument, "stale" | "staleReason">,
  staleAfterHours: number,
): SourceDocument {
  const ageMilliseconds =
    Date.parse(document.fetchedAt) - Date.parse(document.publishedAt);
  const stale =
    Number.isFinite(ageMilliseconds) &&
    ageMilliseconds > staleAfterHours * 60 * 60 * 1_000;

  return SourceDocumentSchema.parse({
    ...document,
    stale,
    ...(stale
      ? {
          staleReason: `Source is older than the ${staleAfterHours}-hour freshness limit.`,
        }
      : {}),
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
