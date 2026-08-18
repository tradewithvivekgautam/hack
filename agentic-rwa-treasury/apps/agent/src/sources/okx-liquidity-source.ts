import { createHmac } from "node:crypto";
import type { SourceDocument } from "@agentic-rwa/shared";
import { z } from "zod";
import type { AgentConfig } from "../config/env.js";
import type { DocumentSource } from "../domain/ports.js";
import { makeSourceDocument, nowIso } from "./source-utils.js";

const OkxEnvelopeSchema = z
  .object({
    code: z.string(),
    msg: z.string().optional(),
    data: z.array(z.unknown()),
  })
  .passthrough();

function findPriceImpact(value: unknown): number {
  if (typeof value !== "object" || value === null) return 0;
  for (const [key, candidate] of Object.entries(value)) {
    if (/price.?impact/i.test(key)) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed <= 1
          ? Math.round(parsed * 10_000)
          : Math.round(parsed * 100);
      }
    }
    const nested = findPriceImpact(candidate);
    if (nested > 0) return nested;
  }
  return 0;
}

export class OkxLiquiditySource implements DocumentSource {
  public readonly id = "okx-rwa-exit-liquidity";

  constructor(private readonly config: AgentConfig["okx"]) {}

  async fetch(): Promise<SourceDocument> {
    if (
      !this.config.apiKey ||
      !this.config.secretKey ||
      !this.config.passphrase ||
      !this.config.tokenAddress ||
      !this.config.quoteTokenAddress
    ) {
      throw new Error(
        "OKX credentials and token addresses are not configured; the fixture source remains available.",
      );
    }

    const query = new URLSearchParams({
      chainIndex: "196",
      fromTokenAddress: this.config.tokenAddress,
      toTokenAddress: this.config.quoteTokenAddress,
      amount: this.config.amount,
      swapMode: "exactIn",
    });
    const requestPath = `/api/v6/dex/aggregator/quote?${query.toString()}`;
    const timestamp = new Date().toISOString();
    const signature = createHmac("sha256", this.config.secretKey)
      .update(`${timestamp}GET${requestPath}`)
      .digest("base64");

    const response = await fetch(`https://web3.okx.com${requestPath}`, {
      headers: {
        "OK-ACCESS-KEY": this.config.apiKey,
        "OK-ACCESS-PASSPHRASE": this.config.passphrase,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      throw new Error(`OKX quote returned HTTP ${response.status}.`);
    }

    const raw = OkxEnvelopeSchema.parse(await response.json());
    if (raw.code !== "0" || raw.data.length === 0) {
      throw new Error(
        `OKX quote failed with code ${raw.code}${raw.msg ? `: ${raw.msg}` : ""}.`,
      );
    }

    const text = JSON.stringify(
      {
        chainIndex: "196",
        venue: "OKX DEX Aggregator",
        observedAt: timestamp,
        notionalUsd: this.config.notionalUsd,
        estimatedPriceImpactBps: findPriceImpact(raw.data),
        routeAvailable: true,
        request: {
          fromTokenAddress: this.config.tokenAddress,
          toTokenAddress: this.config.quoteTokenAddress,
          amount: this.config.amount,
          swapMode: "exactIn",
        },
        response: raw.data,
      },
      null,
      2,
    );

    return makeSourceDocument({
      id: this.id,
      kind: "liquidity",
      title: "OKX DEX exit-liquidity quote",
      sourceUrl: "https://web3.okx.com/api/v6/dex/aggregator/quote",
      publishedAt: timestamp,
      fetchedAt: nowIso(),
      text,
      stale: false,
    });
  }
}
