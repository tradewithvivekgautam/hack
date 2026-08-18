import { canonicalReasoningJson, hashReasoningEnvelope } from "@agentic-rwa/shared";
import { expect, it } from "vitest";
import { demoDecisions } from "@/lib/demo/decisions";

it("uses the same canonical bytes and hash in the demo registry", () => {
  const decision = demoDecisions[0];
  expect(decision?.envelope).toBeDefined();
  const envelope = decision?.envelope;
  if (!envelope || !decision) throw new Error("Missing demo decision.");
  expect(canonicalReasoningJson(envelope)).toContain('"schemaVersion":"1.0.0"');
  expect(hashReasoningEnvelope(envelope)).toBe(decision.reasoningHash);
});
