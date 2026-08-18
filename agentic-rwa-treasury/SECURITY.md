# Security Policy

## Scope

Security reports may cover the Solidity contracts, deployment scripts, allocation agent, IPFS integrity path, wallet transaction flow, and web verification implementation.

## Core invariant

> The LLM proposes. The contract disposes.

The model and agent process are treated as untrusted. They produce data, never custody. A successful rebalance requires all of the following:

- the caller has `AGENT_ROLE`;
- all three adapters are the constructor-fixed adapters;
- weights sum to exactly 10,000 basis points;
- no strategy exceeds the immutable concentration cap;
- one-way turnover stays inside the immutable turnover cap;
- the cooldown has elapsed;
- the vault is not paused;
- all adapter withdrawals and deposits complete atomically;
- total assets are preserved across the transfer-only testnet rebalance;
- the registry accepts the exact non-zero hash and CID.

## Privileged roles

| Role | Powers | Explicitly cannot |
|---|---|---|
| `AGENT_ROLE` | Call `rebalance` with weights, hash, and CID | Withdraw users, change adapters, alter policy, pause, grant roles |
| `GOVERNANCE_ROLE` | Pause/unpause and recover one strategy while paused | Rewrite prior decisions or bypass ERC-4626 ownership |
| `DEFAULT_ADMIN_ROLE` | Manage roles | Rewrite immutable constructor references |
| Registry `WRITER_ROLE` | Append decisions | Update or delete existing decisions |

The deployment script grants registry writing only to the vault. A separate agent address is strongly recommended.

## Emergency behavior

- Pausing blocks deposits, mints, and rebalances.
- Withdrawals and redemptions remain available while paused.
- Governance may call `emergencyExitStrategy` only while paused.
- `maxDeposit` and `maxMint` report zero while paused or before adapters are configured.

## Integrity limitations

The hash/CID mechanism proves that displayed canonical bytes equal the bytes committed with the on-chain allocation. It does not prove who generated the memo, whether source publishers were honest, or whether an off-chain document was true before it was fetched.

## Reporting

Do not test against deployments containing third-party funds. Include:

- affected commit and component;
- reproduction steps or test;
- expected and actual behavior;
- impact and prerequisites;
- suggested remediation when known.

## Audit status

The code has not received an independent security audit. Testnet mocks must not be interpreted as production integrations.
