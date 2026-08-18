# Security model

## Security statement

A fully compromised agent key can request only a suboptimal allocation that still satisfies policy. It cannot custody funds, select new strategies, exceed concentration/turnover limits, bypass cooldowns, choose withdrawal receivers, grant roles, or alter prior reasoning records.

## Assumptions

- OpenZeppelin ERC-20/ERC-4626 and access-control implementations behave as documented.
- The configured underlying follows standard ERC-20 semantics.
- Governance/admin keys are protected independently from the agent key.
- Production adapters accurately report and return assets.
- Users understand that IPFS/hash verification proves integrity, not hosted-model provenance.

## Enforced controls

- `AGENT_ROLE` can call only the vault rebalance entry point.
- Adapter identities are fixed at vault construction.
- Adapters accept deposits/withdrawals only from the configured vault.
- Registry writes are restricted to the vault.
- Reentrancy guards protect vault and adapter state transitions.
- Policy validation occurs before the first external strategy movement.
- EVM atomicity reverts movements if any adapter or registry operation fails.
- Emergency exits require governance, pause state, and a valid fixed index.
- New deposits and rebalances are disabled while paused; user exits remain available.
- Exact-byte hashing prevents a UI or gateway from silently changing a memo.

## Known testnet limitations

- Yield adapters mint mock USDC to model accrual and are not production investments.
- No KYC, legal wrapper, transfer restriction, oracle, or tokenized-fund redemption workflow is implemented.
- No external audit has been performed.
- A production vault needs independent smart-contract review, adapter-specific risk controls, monitoring, multisig/timelock governance, incident procedures, and jurisdiction-specific compliance.

## Key separation

Use distinct keys for deployer, governance/admin, and agent. The agent should hold only enough OKB for scheduled transactions. Production governance should be a multisig behind a timelock; the hackathon deployment keeps contracts non-upgradeable to minimize the trust surface.

## Reporting

Do not publish live secret material in an issue. Rotate affected keys first, pause the vault where appropriate, then share a minimal reproduction privately with the maintainers.
