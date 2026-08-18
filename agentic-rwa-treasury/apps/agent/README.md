# Allocation agent

The agent is an unprivileged proposal worker. It gathers a bounded corpus, asks one configured model provider for a strict named-strategy proposal, validates evidence and policy locally, stores exact canonical reasoning bytes, simulates the same contract call, and only then submits it. It never receives user custody and cannot select arbitrary strategy addresses.

## Commands

```bash
cp apps/agent/.env.example apps/agent/.env
npm run agent:smoke     # provider schema/tool-call smoke test
npm run agent:epoch     # one complete epoch
npm run agent:worker    # cron worker with overlap protection
npm run agent:verify -- <cid> <expected-hash>
```

## Provider modes

- `fixture`: deterministic offline proposal, intended for tests and the first local run.
- `deepseek`: hosted DeepSeek beta endpoint with forced strict tool output.
- `modal`: authenticated OpenAI-compatible endpoint created by `infra/modal/deepseek_v4.py`.
- `ollama`: local OpenAI-compatible development endpoint.

Every provider returns the same `AllocationProposal` and is parsed by the same Zod schema. Provider selection never changes contract policy or custody.

## Source behavior

`corpus/sources.json` defines approved file and HTTP documents, type, URL/path, freshness window, timeout, retry limit, and maximum size. File/HTML/JSON/PDF extraction happens before inference. Each successful document is content-hashed. A failed fresh retrieval may use an explicitly stale last-known-good copy; the model sees that stale flag and reason. The epoch is skipped when the minimum corpus cannot be assembled.

## Fail-closed stages

1. gather and hash documents;
2. read current chain state and prior decisions;
3. request strict model output with one bounded retry;
4. validate schema, strategy IDs, evidence references, and policy;
5. canonicalize and hash the exact UTF-8 JSON;
6. preflight `rebalance` with the real hash and a deterministic non-empty CID;
7. pin the canonical bytes, read them back, and verify their hash;
8. simulate the exact real CID, submit, and await confirmation;
9. record optional, non-authoritative diagnostics.

Any failure before confirmation produces no successful epoch record. `AGENT_RUN_ON_START=true` runs one epoch when the worker boots, then Croner follows `AGENT_CRON`. Concurrent epochs are rejected rather than overlapped.

## Persistence

X Layer and IPFS are authoritative. SQLite is optional diagnostics only and can be deleted without changing vault history. Local IPFS and cache files are written beneath `.data/`, which is ignored by Git.
