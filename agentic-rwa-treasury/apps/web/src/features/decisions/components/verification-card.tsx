"use client";

import { CheckCircle2, Fingerprint, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel } from "@/components/ui/panel";
import { Typography } from "@/components/ui/typography";
import { errorMessage } from "@/lib/errors";
import { formatHash } from "@/lib/format";
import type { DecisionRecord, VerificationResult } from "../model/types";
import { verifyReasoningPayload } from "../verification/verify";

export function VerificationCard({ decision }: { decision: DecisionRecord }) {
  const [result, setResult] = useState<VerificationResult>({ status: "idle" });

  const verify = async () => {
    setResult({ status: "verifying", expectedHash: decision.reasoningHash });
    try {
      const payload = await verifyReasoningPayload({ cid: decision.reasoningCid, expectedHash: decision.reasoningHash });
      setResult({
        status: payload.matches ? "verified" : "mismatch",
        expectedHash: payload.expectedHash,
        calculatedHash: payload.calculatedHash,
        message: payload.matches
          ? "The exact UTF-8 bytes fetched through IPFS hash to the value committed on X Layer."
          : "The fetched payload does not match the contract commitment. Do not trust the displayed reasoning.",
      });
    } catch (error) {
      setResult({ status: "error", expectedHash: decision.reasoningHash, message: errorMessage(error) });
    }
  };

  const verified = result.status === "verified";
  const failed = result.status === "mismatch" || result.status === "error";
  const message = "message" in result ? result.message : undefined;
  const calculatedHash = "calculatedHash" in result ? result.calculatedHash : undefined;
  return (
    <Panel className={verified ? "overflow-hidden border-success/25 bg-success-soft" : failed ? "overflow-hidden border-danger/25 bg-danger-soft" : "overflow-hidden"}>
      <div className="flex flex-wrap items-start gap-3 p-4">
        <div className={verified ? "grid size-8 place-items-center rounded-[0.625rem] bg-success text-white" : failed ? "grid size-8 place-items-center rounded-[0.625rem] bg-danger text-white" : "grid size-8 place-items-center rounded-[0.625rem] border border-line bg-soft text-muted"}>
          {verified ? <ShieldCheck className="size-4" /> : failed ? <ShieldAlert className="size-4" /> : <Fingerprint className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <Typography as="h3" className="text-ink" variant="title">Verify on-chain</Typography>
          <Typography aria-live="polite" className="mt-1 max-w-2xl text-muted" variant="body">{message ?? "Fetch the canonical decision memo, hash its exact bytes in this browser, and compare the result with the registry commitment."}</Typography>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-[0.625rem] border border-line/80 bg-surface/75 px-2.5 py-2">
              <Typography as="div" className="font-semibold text-subtle" variant="label">On-chain hash</Typography>
              <Typography as="div" className="mt-1 flex items-center gap-1 font-medium text-ink" variant="caption"><span className="truncate">{formatHash(decision.reasoningHash)}</span><CopyButton value={decision.reasoningHash} /></Typography>
            </div>
            <div className="rounded-[0.625rem] border border-line/80 bg-surface/75 px-2.5 py-2">
              <Typography as="div" className="font-semibold text-subtle" variant="label">Browser hash</Typography>
              <Typography as="div" className="mt-1 flex items-center gap-1 font-medium text-ink" variant="caption">
                <span className="truncate">{calculatedHash ? formatHash(calculatedHash) : "Not calculated"}</span>
                {calculatedHash ? <CopyButton value={calculatedHash} /> : null}
              </Typography>
            </div>
          </div>
        </div>
        <Button
          leadingIcon={verified ? <CheckCircle2 className="size-3.5" /> : <RefreshCw className="size-3.5" />}
          loading={result.status === "verifying"}
          onClick={() => void verify()}
          variant={verified ? "secondary" : "primary"}
        >
          {verified ? "Verified" : result.status === "verifying" ? "Verifying" : "Verify on-chain"}
        </Button>
      </div>
    </Panel>
  );
}
