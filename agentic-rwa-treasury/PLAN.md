# Arca delivery plan

The repository implements the closed loop required for the hackathon submission:

1. Deposit mUSDC and mint rtUSD.
2. Gather bounded off-chain and on-chain evidence.
3. Produce a strict named-strategy allocation proposal.
4. Validate evidence references and schema.
5. Mirror the exact Solidity policy locally.
6. Canonicalize and hash the decision memo.
7. Preflight the live contract before creating an IPFS object.
8. Pin, read back, and simulate the exact CID.
9. Submit the policy-bounded transaction.
10. Read decisions from the registry and IPFS.
11. Verify exact bytes in the browser.
12. Withdraw underlying assets on demand.

## Submission gates

- X Layer testnet deployment receipt committed under `deployments/chain-1952.json`.
- Deployed source verified in the explorer where supported.
- Agent wallet funded with enough OKB for scheduled epochs.
- At least one successful epoch and one deliberate 80% cap rejection recorded for the demo.
- DeepSeek strict-tool smoke test captured.
- Modal provider deployment captured as the open-weight portability proof.
- OKX authenticated quote captured on X Layer mainnet or the fixture explicitly disclosed.
- `npm run check` and `npm run test:e2e` green.
- README addresses copied only through `npm run deployment:sync`.
- Three-minute demo recorded from the script in `docs/DEMO_SCRIPT.md`.
