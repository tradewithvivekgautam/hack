# Three-Minute Demo Script

## 0:00–0:20 — Thesis

Open **Vault**.

> “Arca is an AI portfolio manager for tokenized real-world assets, but the model never has custody. The LLM proposes; the contract disposes.”

Point to TVL, APY, allocation, and the immutable policy summary.

## 0:20–0:50 — Depositor loop

Connect the demo/testnet wallet, claim mUSDC if needed, deposit 100 mUSDC, and show the `rtUSD` position update.

> “The user receives standard ERC-4626 shares. Yield increases the value represented by each share rather than minting arbitrary rewards to the user.”

## 0:50–1:20 — Agent decision

Open **Decision Log**, select the newest epoch, and show:

- thesis;
- per-strategy weights and prior weights;
- evidence IDs;
- risks;
- confidence;
- model and prompt version.

> “The agent reads allocator material code cannot understand, but outputs only three semantic weights and an auditable memo.”

## 1:20–1:55 — Verification moment

Click **Verify on-chain**.

Narrate the states: fetch CID, hash exact browser bytes, compare to X Layer.

> “This green result means the explanation displayed here is provably the exact memo committed with the executed allocation. It proves integrity, not hosted-model attestation.”

## 1:55–2:25 — Malicious agent rejection

Open **Protocol**, select **80% malicious cap** in the policy simulator, and show `STRATEGY CAP` plus “Contract will revert.” Optionally run the testnet rejection script and show the explorer revert.

> “Even the authorized agent key cannot place 80% into one sleeve. Policy validation happens before any adapter transfer or registry write.”

## 2:25–2:45 — Exit liquidity and source honesty

Open **Data Sources**. Show the OKX liquidity observation and any stale marker.

> “Exit liquidity is a risk input, not a decorative integration. When a live quote is unavailable, the fallback is explicitly stale rather than silently pretending to be current.”

## 2:45–3:00 — Close the loop

Return to **Vault** and withdraw.

> “The closed loop is deposit, reason, constrain, rebalance, verify, and withdraw. A hacked agent can make a suboptimal choice only inside policy bounds.”
