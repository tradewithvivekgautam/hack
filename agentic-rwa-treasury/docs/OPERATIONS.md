# Operations

## Before enabling scheduled epochs

- Confirm agent address has only `AGENT_ROLE`.
- Confirm registry writer is the vault, not the agent.
- Confirm all three adapters report the deployed vault.
- Confirm current and target weights sum to 10,000 bps.
- Confirm provider smoke test returns strict schema-valid output.
- Confirm canonical payload can be retrieved from the chosen IPFS store.
- Confirm `simulateContract` succeeds for a valid proposal and rejects an 80% proposal.
- Confirm the agent wallet has a low, monitored OKB balance.

## Monitoring

Watch:

- skipped epoch rate and reason;
- stale/fallback source count;
- provider latency and malformed tool output;
- IPFS pin/retrieval failures;
- simulation reverts;
- agent OKB balance;
- `DecisionRecorded` cadence;
- strategy balance drift and user withdrawal failures.

## Incident response

1. Stop the worker.
2. Rotate a suspected agent key and revoke the old role.
3. Pause the vault if adapter integrity is uncertain; withdrawals remain enabled.
4. Emergency-exit a strategy only after confirming its adapter remains callable.
5. Preserve source hashes, diagnostics, transaction hashes, and registry epochs.
6. Do not alter historical memos; publish a new incident record instead.

## Worker startup

`AGENT_RUN_ON_START=true` schedules one immediate epoch after process initialization. Cron execution then follows `AGENT_CRON`. The worker holds an in-process overlap guard; a slow epoch is allowed to finish, while a second trigger is skipped and logged. Run only one funded agent replica unless an external distributed lease is added.
