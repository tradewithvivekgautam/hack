"use client";

import { CheckCircle2, Fingerprint, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel } from "@/components/ui/panel";
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
  return (
    <Panel className={verified ? "overflow-hidden border-success/25 bg-success-soft" : failed ? "overflow-hidden border-danger/25 bg-danger-soft" : "overflow-hidden"}>
      <div className="flex flex-wrap items-start gap-3 p-4">
        <div className={verified ? "grid size-8 place-items-center rounded-[0.625rem] bg-success text-white" : failed ? "grid size-8 place-items-center rounded-[0.625rem] bg-danger text-white" : "grid size-8 place-items-center rounded-[0.625rem] border border-line bg-soft text-muted"}>
          {verified ? <ShieldCheck className="size-4" /> : failed ? <ShieldAlert className="size-4" /> : <Fingerprint className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[0.8125rem] font-semibold text-ink">Verify on-chain</h3>
          <p aria-live="polite" className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            {result.message ?? "Fetch the canonical decision memo, hash its exact bytes in this browser, and compare the result with the registry commitment."}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-[0.625rem] border border-line/80 bg-surface/75 px-2.5 py-2">
              <div className="text-xs font-semibold uppercase tracking-[0.06em] text-subtle">On-chain hash</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-ink"><span className="truncate">{formatHash(decision.reasoningHash)}</span><CopyButton value={decision.reasoningHash} /></div>
            </div>
            <div className="rounded-[0.625rem] border border-line/80 bg-surface/75 px-2.5 py-2">
              <div className="text-xs font-semibold uppercase tracking-[0.06em] text-subtle">Browser hash</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-ink">
                <span className="truncate">{result.calculatedHash ? formatHash(result.calculatedHash) : "Not calculated"}</span>
                {result.calculatedHash ? <CopyButton value={result.calculatedHash} /> : null}
              </div>
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
