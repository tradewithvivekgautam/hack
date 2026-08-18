# Architecture

## System objective

Arca converts unstructured allocator material into a bounded, auditable allocation change without granting the model custody or discretionary contract access.

## Context

```text
Depositor wallet
      │ deposit / redeem
      ▼
RwaTreasuryVault (ERC-4626)
      │
      ├── RwaYieldAdapter
      ├── LendingAdapter
      └── IdleAdapter

Off-chain agent
      │ rebalance(weights, hash, CID)
      ▼
RwaTreasuryVault ──validate──> AllocationPolicy
      │
      └──append───────────────> ReasoningRegistry
                                      │
Browser <──CID + hash─────────────────┘
   │
   └──fetch exact bytes──> IPFS
```

## Repository boundaries

### `contracts`

Owns custody, share accounting, policy enforcement, role checks, adapter interactions, pause behavior, and the immutable audit record. It does not parse prose or call a model.

### `apps/agent`

Owns document gathering, model invocation, schema validation, local policy pre-checking, canonicalization, IPFS pinning, simulation, submission, and optional diagnostics. It cannot choose arbitrary addresses because semantic strategy IDs are mapped by configuration.

### `apps/web`

Owns wallet interaction, read models, demo state, responsive presentation, decision exploration, and browser-side verification. It reads decisions from the chain in live mode rather than treating SQLite as authoritative.

### `packages/shared`

Contains only types and deterministic behavior that must be identical across more than one boundary: strategy IDs, policy math, reasoning schemas, canonical hashing, chain definitions, deployment schema, and ABIs.

## Contract topology

```text
RwaTreasuryVault
  immutable asset
  immutable AllocationPolicy
  immutable ReasoningRegistry
  fixed adapter[3]
  targetWeights[3]
  lastRebalanceAt

AllocationPolicy
  maxWeightBps = 6000
  maxTurnoverBps = 2000
  cooldownSeconds = 3600

ReasoningRegistry
  epoch
  mapping(epoch => Decision)
```

No proxy, factory, strategy registry, or governance module is included. Immutability reduces the attack surface and keeps the judged contract surface understandable.

## Deposit and withdrawal

### Deposit

1. ERC-4626 calculates shares from pre-deposit total assets and supply.
2. mUSDC transfers from the user to the vault.
3. The received assets are split according to `TARGET_WEIGHTS`.
4. Rounding residue is assigned to the idle strategy.

### Withdrawal

1. ERC-4626 calculates shares to burn.
2. `_ensureLiquidity` checks local vault mUSDC.
3. Liquidity is pulled in deterministic order: idle, lending, RWA.
4. ERC-4626 burns shares and transfers assets to the receiver.

This closes the common ERC-4626 integration gap where `totalAssets()` counts strategy positions but a withdrawal cannot actually retrieve them.

## Rebalance transaction

```text
read current weights
  → policy.validate
  → snapshot totalAssets
  → calculate target assets
  → withdraw all excess sleeves
  → fund all deficit sleeves
  → require totalAssets unchanged
  → update target weights and timestamp
  → append registry decision
  → emit Rebalanced
```

Every step executes in one EVM transaction. If any adapter or registry action reverts, all preceding movements revert.

## Turnover definition

```text
turnover = Σ |proposedWeight - currentWeight| / 2
```

Dividing by two avoids counting the same movement once as an outflow and once as an inflow.

## Agent pipeline

```text
1 Gather
2 Propose
3 Validate evidence, schema, and local policy
4 Canonicalize and hash
5 Preflight the live contract before pinning
6 Pin and read back the exact bytes
7 Simulate the exact hash and real CID
8 Submit and confirm
9 Record optional diagnostics
```

A failure before submission creates a skipped epoch. Optional diagnostics failures are logged but cannot turn a confirmed on-chain success into a failure.

## Read models

- Vault state is fetched with viem multicall.
- Decision summaries are fetched from `ReasoningRegistry`.
- Full memo bodies are fetched from IPFS by CID.
- The browser hashes raw response text before parsing it.
- Demo mode implements the same UI contracts with deterministic in-memory data.

## Production replacement points

The testnet adapters expose `asset`, `vault`, `name`, `totalAssets`, `apyBps`, `deposit`, `withdraw`, and `withdrawAll`. Production adapters can replace their internals while preserving the vault interface. Real adapters would additionally require slippage bounds, oracle rules, asynchronous redemption handling, liquidity queues, and integration-specific audits.
