import "dotenv/config";

import {
  ReasoningEnvelopeSchema,
  hashUtf8Text,
} from "@agentic-rwa/shared";
import { loadConfig } from "../config/env.js";
import { createReasoningStore } from "../ipfs/factory.js";

const [cid, expectedHash] = process.argv.slice(2);
if (!cid || !expectedHash) {
  throw new Error(
    "Usage: npm run verify:reasoning --workspace @agentic-rwa/agent -- <cid> <0x-hash>",
  );
}
if (!/^0x[a-fA-F0-9]{64}$/.test(expectedHash)) {
  throw new Error("Expected hash must be a 32-byte 0x-prefixed hexadecimal value.");
}

const config = loadConfig();
const store = createReasoningStore(config);
const canonicalJson = await store.get(cid);
const actualHash = hashUtf8Text(canonicalJson);
const envelope = ReasoningEnvelopeSchema.parse(JSON.parse(canonicalJson));
const verified = actualHash.toLowerCase() === expectedHash.toLowerCase();

console.log(
  JSON.stringify(
    {
      verified,
      cid,
      expectedHash,
      actualHash,
      modelId: envelope.model.modelId,
      requestedAt: envelope.epochRequestedAt,
      weights: Object.fromEntries(
        Object.entries(envelope.proposal.allocations).map(([strategy, value]) => [
          strategy,
          value.weightBps,
        ]),
      ),
    },
    null,
    2,
  ),
);

if (!verified) process.exitCode = 2;
