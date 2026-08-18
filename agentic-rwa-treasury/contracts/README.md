# Contracts

The protocol deliberately keeps custody and policy enforcement on-chain:

- `RwaTreasuryVault`: ERC-4626 user accounting, strategy liquidity, atomic rebalance execution.
- `AllocationPolicy`: immutable concentration, turnover, and cooldown rules.
- `ReasoningRegistry`: append-only CID/hash audit trail.
- `RwaYieldAdapter`, `LendingAdapter`, `IdleAdapter`: testnet production-shaped adapters.

## Commands

```bash
npm run contracts:compile
npm run contracts:test
npm run contracts:node
npm run contracts:deploy:local
npm run deployment:sync -- 31337
```

The test adapters are honest mocks. Replace adapter addresses with production implementations without changing the vault-facing interface. This code has not received an external security audit and must not hold production funds before one.
