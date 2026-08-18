# Deployment

## Environments

| Environment | Chain | Purpose |
|---|---:|---|
| Persistent Hardhat node | 31337 | contract and full-stack development |
| X Layer testnet | 1952 | hackathon deployment and public demo |
| X Layer mainnet | 196 | documented production path, not enabled by default |

## Role separation

Use distinct addresses for:

- deployer/bootstrap transaction sender;
- governance/admin multisig;
- agent signer.

The deployment script initializes with the deployer, completes all one-time adapter and registry wiring, grants the final admin, and renounces bootstrap administration when a different `ADMIN_ADDRESS` is configured.

## Complete local deployment

```bash
# terminal 1
npm run contracts:node

# terminal 2
npm run contracts:deploy:local
npm run local:configure -- 0x<PRIVATE_KEY_PRINTED_BY_HARDHAT_NODE>

# terminal 3
npm run dev:web

# terminal 4
npm run agent:epoch
```

The local configuration command performs all non-secret synchronization:

- verifies `deployments/chain-31337.json`;
- copies the receipt into shared and web generated configuration;
- writes `apps/web/.env.local` for live chain 31337;
- writes `apps/agent/.env` with the supplied local-only agent key;
- enables the server-only local IPFS bridge used by browser verification.

The generated environment files are git-ignored. Never reuse a Hardhat development private key on any public network.

## X Layer testnet contract deployment

```bash
cp contracts/.env.example contracts/.env
npm run contracts:compile
npm run contracts:deploy:testnet
npm run deployment:sync -- 1952
```

Expected receipt:

```text
deployments/chain-1952.json
```

## Web deployment

When generated deployment configuration is synchronized, address overrides are optional. Configure:

```env
NEXT_PUBLIC_APP_MODE=live
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1952
NEXT_PUBLIC_XLAYER_TESTNET_RPC_URL=https://testrpc.xlayer.tech/terigon
NEXT_PUBLIC_IPFS_GATEWAY_URL=https://ipfs.io/ipfs
IPFS_LOCAL_DIRECTORY=
```

Explicit `NEXT_PUBLIC_*_ADDRESS` values may be supplied instead. Live mode rejects missing addresses and rejects a synchronized receipt whose chain does not match the selected chain.

Build:

```bash
npm run build --workspace @agentic-rwa/web
npm run start --workspace @agentic-rwa/web
```

`GET /api/health` reports mode, chain, and whether every contract address is configured.

## Agent deployment

A synchronized receipt is used automatically when its chain ID matches `XLAYER_CHAIN_ID`; explicit addresses remain supported as overrides. Configure a dedicated agent key, RPC, provider, corpus, and IPFS:

```env
CHAIN_MODE=live
XLAYER_CHAIN_ID=1952
XLAYER_RPC_URL=https://testrpc.xlayer.tech/terigon
AGENT_PRIVATE_KEY=0x...
IPFS_PROVIDER=pinata
PINATA_JWT=...
```

For explicit address configuration:

```env
VAULT_ADDRESS=0x...
POLICY_ADDRESS=0x...
REGISTRY_ADDRESS=0x...
RWA_ADAPTER_ADDRESS=0x...
LENDING_ADAPTER_ADDRESS=0x...
IDLE_ADAPTER_ADDRESS=0x...
```

Run one fixture-provider epoch against the live chain first, then run the provider smoke test and enable the real provider. Finally start the hourly worker.

## Mainnet path

The mock adapters must be replaced rather than pointed at real capital. A production adapter must address:

- underlying token compatibility;
- deposit and withdrawal limits;
- asynchronous RWA redemptions;
- slippage and oracle protection;
- realized loss reporting;
- emergency unwinds;
- protocol pause/freeze state;
- KYC/transfer restrictions for tokenized securities;
- external protocol upgrades;
- independent audit.

The core vault intentionally depends only on `IStrategyAdapter`, so replacement does not require changing the model schema or browser verification path.

## Post-deployment checklist

- Verify all source code on the explorer.
- Confirm adapter `vault()` equals the deployed vault.
- Confirm registry `WRITER_ROLE` belongs to the vault.
- Confirm agent has `AGENT_ROLE` and no governance/admin role.
- Confirm deployer no longer has unintended admin/minter roles.
- Deposit a small amount, withdraw it, and compare asset/share accounting.
- Submit one valid rebalance.
- Submit the deliberate 80% invalid rebalance and record the revert.
- Fetch the registry CID and verify its hash independently.
- Configure monitoring before enabling the hourly worker.
