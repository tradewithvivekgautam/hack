import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { webEnv } from "@/config/env";
import { getDemoReasoningText } from "@/lib/demo/decisions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function demoEpoch(cid: string): number | null {
  const match = /^demo-epoch-(\d{1,3})$/.exec(cid);
  return match ? Number(match[1]) : null;
}

async function localPayload(cid: string): Promise<string | undefined> {
  const directory = process.env.IPFS_LOCAL_DIRECTORY;
  if (!directory) return undefined;
  try {
    return await readFile(resolve(process.cwd(), directory, `${cid}.json`), "utf8");
  } catch {
    return undefined;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ cid: string }> },
) {
  const { cid } = await context.params;

  if (!/^[a-zA-Z0-9-]{8,128}$/.test(cid)) {
    return new Response("Invalid CID", { status: 400 });
  }

  const epoch = demoEpoch(cid);
  if (epoch !== null) {
    try {
      let text = getDemoReasoningText(epoch);
      if (new URL(request.url).searchParams.get("tamper") === "1") {
        text = text.replace(
          "Preserve diversified yield exposure",
          "Tampered diversified yield exposure",
        );
      }
      return new Response(text, {
        headers: {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8",
        },
      });
    } catch {
      return new Response("Demo decision not found", { status: 404 });
    }
  }

  const local = await localPayload(cid);
  if (local !== undefined) {
    return new Response(local, {
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      `${webEnv.ipfsGatewayUrl.replace(/\/$/, "")}/${encodeURIComponent(cid)}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return new Response("IPFS content unavailable", {
        status: response.status,
      });
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "cache-control": "no-store",
        "content-type":
          response.headers.get("content-type") ??
          "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return new Response(
      timedOut ? "IPFS gateway timed out" : "IPFS gateway request failed",
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
