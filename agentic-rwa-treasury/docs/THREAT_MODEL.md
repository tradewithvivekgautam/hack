# Threat Model

## Assets to protect

- Depositor mUSDC and `rtUSD` ownership.
- Correct ERC-4626 share pricing.
- Strategy concentration and movement limits.
- Decision-log integrity.
- Agent signing key and governance keys.
- Source and prompt provenance.
- Availability of withdrawals and verification.

## Trust assumptions

Trusted only within their explicit powers:

- X Layer consensus and EVM execution.
- OpenZeppelin primitives as integrated.
- Governance key for pause and emergency recovery.
- Production adapter implementations after independent review.

Treated as untrusted or fallible:

- LLM output;
- agent host;
- agent key;
- document publishers;
- RPC and IPFS gateways;
- OKX quote responses;
- browser storage;
- optional SQLite diagnostics;
- testnet mock economics.

## Threats and controls

### Compromised model or prompt injection

**Threat:** a source document instructs the model to allocate 100% to one strategy or fabricate evidence.

**Controls:** source text has no direct execution path; the model emits a strict schema; semantic strategy IDs replace addresses; evidence IDs must exist; local policy is checked; `simulateContract` executes the exact Solidity rule; the contract rechecks all bounds.

### Compromised agent key

**Threat:** an attacker submits hostile allocations.

**Controls:** the key has only `AGENT_ROLE`; strategy addresses are fixed in the vault; no receiver is supplied; maximum concentration, turnover, and cadence are immutable; withdrawals are not exposed to the role.

**Residual risk:** the attacker can choose a suboptimal allocation inside policy limits and can repeatedly act once each cooldown expires until the role is revoked or the vault is paused.

### Governance compromise

**Threat:** an attacker pauses, changes roles, or performs emergency exits.

**Controls:** governance cannot rewrite historical registry entries or steal through an arbitrary receiver function. Operational mitigation requires multisig ownership, hardware-backed keys, monitoring, and role separation before production.

### Malicious or broken adapter

**Threat:** an adapter lies about assets, fails withdrawal, or transfers incorrectly.

**Controls in this build:** adapters are fixed and same-asset; only the vault may call capital methods; a rebalance checks total assets before and after; testnet mocks are intentionally simple.

**Production requirement:** adapter-specific audits, oracle design, max-loss checks, liquidity accounting, and asynchronous-redemption modeling.

### IPFS substitution

**Threat:** a gateway serves different JSON at a CID or an application displays modified text.

**Controls:** the agent reads pinned bytes back before simulation; the chain stores a hash; the browser hashes raw UTF-8 text and compares before trusting parsed content. A mismatch is rendered as a hard failure.

### Canonicalization mismatch

**Threat:** semantically identical JSON serializes differently and fails verification.

**Controls:** one shared schema and canonical JSON implementation generate the committed bytes. Verification hashes the exact fetched bytes rather than parse/stringify output.

### Source outage or stale data

**Threat:** a required site or PDF is unavailable.

**Controls:** bounded timeout and retry; source-size limit; last-known-good cache; explicit `stale` and `staleReason`; minimum source count; skipped epoch when the corpus is inadequate.

### RPC failure, reorg, or transaction replacement

**Threat:** simulation succeeds but submission fails, or a transaction is not final.

**Controls:** the agent waits for a receipt; no diagnostics record is authoritative; the web app reconstructs from chain events/state. Production should increase confirmations and monitor reorgs.

### Denial of service

**Threat:** huge documents, hanging endpoints, overlapping cron runs, or repeated model failure.

**Controls:** 12 MB input cap, 300,000-character extraction cap, request timeouts, bounded retries, Croner protection, in-process overlap guard, and fail-closed skipped epochs.

### Share-price manipulation

**Threat:** donation or rounding manipulation around ERC-4626.

**Controls:** OpenZeppelin ERC-4626 implementation and tests. Production should review virtual-share behavior for the chosen OpenZeppelin version, initial deposit policy, and any fee-on-transfer/rebasing asset incompatibility.

## Security invariants

1. Only the vault moves funds into or out of adapters.
2. The agent cannot provide addresses or receivers.
3. A successful rebalance has a corresponding registry record.
4. A failed policy check moves no funds.
5. Strategy weights always sum to 10,000 basis points after a successful proposal.
6. Depositor withdrawals are available while paused.
7. Historical decisions cannot be updated or deleted.
8. Optional diagnostics are never a source of truth.
