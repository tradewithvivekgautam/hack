import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import type { DocumentSource } from "../domain/ports.js";
import { CachedDocumentSource } from "./cached-source.js";
import { FileDocumentSource } from "./file-source.js";
import { HttpDocumentSource } from "./http-source.js";

const ItemSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum([
      "fund-factsheet",
      "credit-memo",
      "rate-announcement",
      "liquidity",
      "other",
    ]),
    title: z.string().min(1),
    location: z.string().min(1),
    publishedAt: z.string().datetime().optional(),
    staleAfterHours: z.number().positive().max(8_760).optional(),
  })
  .strict();

const ManifestSchema = z
  .object({ sources: z.array(ItemSchema).min(1) })
  .strict();

export async function sourcesFromManifest(
  path: string,
  cacheDirectory: string,
): Promise<DocumentSource[]> {
  const manifest = ManifestSchema.parse(
    JSON.parse(await readFile(path, "utf8")),
  );
  const baseDirectory = dirname(path);

  return manifest.sources.map((item) => {
    const metadata = {
      kind: item.kind,
      title: item.title,
      ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
      ...(item.staleAfterHours ? { staleAfterHours: item.staleAfterHours } : {}),
    };
    const inner: DocumentSource = /^https?:\/\//.test(item.location)
      ? new HttpDocumentSource(item.id, {
          ...metadata,
          url: item.location,
        })
      : new FileDocumentSource(item.id, {
          ...metadata,
          path: resolve(baseDirectory, item.location),
        });

    return new CachedDocumentSource(inner, cacheDirectory);
  });
}
