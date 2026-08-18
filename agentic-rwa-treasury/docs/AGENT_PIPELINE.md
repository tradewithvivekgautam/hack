# Agent pipeline

Each epoch follows one fail-closed sequence.

## 1. Gather

The worker reads the configured manifest, fetches each file or URL with bounded size/timeouts, extracts text using `unpdf` or `cheerio`, computes a Keccak content hash, and wraps the source in a strict schema. It appends normalized chain state and up to five prior decisions. An authenticated OKX quote is attempted separately and falls back through the same last-known-good cache.

## 2. Propose

`AllocationProvider.propose()` receives the complete bounded corpus and chain snapshot. The tool schema permits only:

- `allocations.rwa.weightBps`
- `allocations.lending.weightBps`
- `allocations.idle.weightBps`
- rationale and evidence IDs for each strategy
- thesis, one to four risks, and confidence

No address, receiver, calldata, or arbitrary tool is available to the model.

## 3. Validate

Zod validates structure and the exact 10,000-bps sum. Every evidence ID must exist in the gathered corpus. TypeScript evaluates the same concentration, turnover, and cooldown policy as Solidity.

## 4. Build the memo

The agent constructs a `ReasoningEnvelope` containing chain identity, provider/model settings, prompt version/hash, policy snapshot, current weights, normalized market state, proposal, and source metadata/hashes. Raw private model chain-of-thought is not stored; the auditable artifact is the decision memo.

## 5. Canonicalize and hash

`json-canonicalize` produces deterministic bytes. `keccak256(stringToBytes(canonicalJson))` becomes the reasoning commitment.

## 6. Live-chain preflight

The agent calls `viem.simulateContract` with the exact weights and reasoning hash plus a deterministic non-empty preflight CID. This proves the caller role, cooldown, concentration cap, turnover cap, strategy set, and vault state are acceptable before an IPFS object is created.

## 7. Pin, read back, and simulate exact arguments

The exact canonical string is stored through either the local content-addressed store or Pinata. The store immediately reads the object back and verifies both exact bytes and `keccak256`. The agent then runs a second simulation using the real CID, so the submitted arguments are simulated exactly.

## 8. Submit

The wallet submits the simulated request and waits for confirmation. The registry epoch is read after confirmation. Optional SQLite diagnostics are written afterward and are explicitly non-authoritative; diagnostics failure cannot change the chain result.

## Provider routing

- `fixture`: deterministic local development and CI.
- `deepseek`: DeepSeek beta endpoint with strict function calling.
- `modal`: authenticated OpenAI-compatible Modal endpoint.
- `ollama`: local OpenAI-compatible endpoint; Zod remains the enforcement boundary.
