# Testing Strategy

## Required gates

```bash
npm run validate:repo
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run contracts:compile
npm run build
npm run test:e2e
```

## Solidity tests

### Policy

- valid bounded allocation;
- exact 10,000-basis-point sum;
- 60% strategy cap;
- 20% turnover cap;
- one-hour cooldown;
- invalid constructor values.

### Vault

- deposit routes assets across all three adapters;
- share accounting matches ERC-4626 expectations;
- withdrawal retrieves idle, lending, and RWA liquidity;
- adapter yield increases share value;
- valid rebalance is atomic and registered;
- authorized malicious allocation reverts before movement;
- unauthorized caller reverts;
- cooldown enforcement;
- paused vault rejects deposits but permits redemptions;
- `maxDeposit` and `maxMint` report zero while paused;
- unconfigured adapters fail closed;
- governance-only emergency recovery while paused.

### Registry

- only the vault writer may append;
- hash, CID, weights, agent, timestamp, and assets persist exactly;
- decisions are addressable by monotonic epoch.

## Shared-domain tests

- policy math matches contract examples;
- canonical JSON is stable across key ordering;
- exact UTF-8 hashing is deterministic;
- unknown evidence references fail;
- allocation tuple conversion preserves strategy order.

## Agent tests

- end-to-end fixture epoch;
- malicious proposal rejected before submission;
- corrupted pinned bytes rejected;
- last-known-good source fallback marked stale;
- local reasoning store preserves exact text;
- optional diagnostics failure cannot invalidate a confirmed submission;
- provider failure receives only one bounded retry.

## Web tests

- vault read-model rounding preserves all assets;
- user position and share price calculations;
- canonical demo hash equals decision commitment;
- demo wallet deposit flow;
- responsive mobile navigation;
- policy simulator rejects an 80% sleeve;
- browser verification succeeds for committed bytes;
- browser verification fails for intercepted/tampered bytes.

## Invariants for production extension

Add fuzz and invariant coverage before using real adapters:

1. `totalAssets` equals local assets plus all adapter assets.
2. Successful deposit never decreases receiver shares.
3. Successful redeem never transfers more than ownership permits.
4. Successful rebalance preserves assets after accounting for explicitly bounded fees/loss.
5. No successful rebalance exceeds policy.
6. Every successful rebalance increments the registry exactly once.
7. Paused state never permits capital allocation changes.
