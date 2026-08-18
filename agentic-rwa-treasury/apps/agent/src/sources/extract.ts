import * as cheerio from "cheerio";
import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

const MAX_TEXT_CHARACTERS = 300_000;

function limit(text: string): string {
  const normalized = text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!normalized) throw new Error("Document contained no extractable text.");
  return normalized.slice(0, MAX_TEXT_CHARACTERS);
}

export async function extractText(bytes: Uint8Array, contentType: string, sourceName: string): Promise<string> {
  const lower = sourceName.toLowerCase();
  if (contentType.includes("pdf") || lower.endsWith(".pdf")) {
    const document = await getDocumentProxy(bytes);
    const result = await extractPdfText(document, { mergePages: true });
    return limit(String(result.text));
  }

  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (contentType.includes("html") || /\.(html?|xhtml)$/.test(lower)) {
    const $ = cheerio.load(decoded);
    $("script, style, noscript, svg").remove();
    return limit($("body").text());
  }
  if (contentType.includes("json") || lower.endsWith(".json")) {
    return limit(JSON.stringify(JSON.parse(decoded), null, 2));
  }
  return limit(decoded);
}
