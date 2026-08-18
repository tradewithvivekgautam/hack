# Allocation Agent

## Responsibility

The agent turns a bounded corpus into one structured allocation proposal and submits it only after independent validation. It is not a wallet assistant, conversational chatbot, general browser agent, or custodian.

## Ports

- `AllocationProvider`: proposal generation.
- `DocumentSource`: normalized source retrieval.
- `ChainGateway`: state, simulation, and submission.
- `ReasoningStore`: exact-byte pin and retrieval.
- `DiagnosticsStore`: optional operational history.

This allows fixture, hosted DeepSeek, Modal, and Ollama providers to share exactly the same safety pipeline.

## Structured output

The model returns named sleeves, never addresses:

```json
{
  "allocations": {
    "rwa": { "weightBps": 5500, "rationale": "...", "evidence": [] },
    "lending": { "weightBps": 3000, "rationale": "...", "evidence": [] },
    "idle": { "weightBps": 1500, "rationale": "...", "evidence": [] }
  },
  "thesis": "...",
  "risks": ["..."],
  "confidence": "medium"
}
```

The schema requires exactly the three strategies, integer weights, 10,000-basis-point total, bounded text, one to four risks, and evidence references.

## Failure semantics

| Failure | Result |
|---|---|
| Source fetch fails with cache | Stale cached source, explicit reason |
| Fewer than three sources | Skip epoch |
| Provider request/schema fails | One bounded provider retry, then skip |
| Unknown evidence ID | Skip |
| Policy violation | Skip before pin/simulation |
| Pin or read-back mismatch | Skip |
| Simulation reverts | Skip, no transaction |
| Submission reverts | Skip, no registry entry |
| Diagnostics write fails after confirmation | Log warning; keep success |

## Prompt integrity

The system prompt has a version and hash in every envelope. The stable system prefix precedes volatile corpus data. The prompt explicitly forbids addresses and policy evasion. Prompt text alone is not a security control; contract enforcement remains authoritative.

## Scheduling

`AGENT_CRON` defaults to hourly UTC. Croner prevents overlapping scheduled execution and the worker has an additional in-process running guard. A failed epoch does not terminate the worker.

## Operations

```bash
npm run agent:smoke
npm run agent:epoch
npm run agent:worker
npm run agent:verify -- <cid> <0x-hash>
```

Use a dedicated low-balance agent wallet holding only enough OKB for expected gas. Monitor skipped epochs, role changes, pause events, receipt failures, and prolonged stale-source conditions.
