1. The product in one paragraph
Agentic RWA Treasury is a savings vault on X Layer. A user deposits stablecoins and gets a yield-bearing share token back. Behind the vault, an AI agent acts as the portfolio manager: it reads the messy off-chain material a real allocator reads — fund fact sheets, credit reports, rate announcements — and decides how to split the pooled money across tokenized real-world-asset yield (T-bills, private credit), DeFi lending, and idle cash. Every decision the AI makes is bounded by a smart contract that enforces hard risk limits, and the AI's full written reasoning is hashed and recorded on-chain, so anyone can verify why the vault holds what it holds.

Pitch line: An AI portfolio manager for tokenized real-world assets, where every decision is auditable on-chain.

2. The core design principle (this is the whole product)
The LLM proposes. The contract disposes.

Everything else follows from this one inversion:

What it does	What it can never do
AI agent (DeepSeek)	Reads unstructured documents, forms an allocation thesis, emits a structured proposal	Touch funds, exceed caps, bypass cooldowns, withdraw anything
Smart contract (policy)	Enforces deterministic bounds: max 60% per strategy, max 20% move per rebalance, 1-hour cooldown, whitelisted strategies only	Reason about a credit report
The AI does the thing code can't (turn prose into an investment thesis). The contract does the thing an LLM must never do (hold custody, enforce limits). A fully hacked agent key can only produce "a suboptimal allocation that is still inside policy bounds" — that sentence is the security model.

3. User journey (what a depositor experiences)
Deposit — connect wallet, deposit mUSDC into the vault, receive rtUSD shares (ERC-4626 standard, so shares appreciate as yield accrues).
Watch — the dashboard shows TVL, current APY, and the live allocation across strategies.
Understand — the Decision Log shows every rebalance the AI made: its thesis, per-strategy rationale, the risks it flagged, its confidence level.
Verify — click "Verify on-chain": the browser fetches the reasoning JSON from IPFS, re-hashes it, and compares against the hash the contract recorded. Green check = the explanation shown is provably the one the vault acted on. This button is the demo.
Withdraw — redeem rtUSD for underlying at any time.
4. The three layers, component by component
Layer 1 — On-chain (Solidity, X Layer testnet, chainId 1952)
Four contracts. Small on purpose — AI judges read code.

RwaTreasuryVault.sol — the money container

Standard ERC-4626: deposit, withdraw, mint, redeem, share accounting — all inherited from OpenZeppelin
One custom function: rebalance(weights, reasoningHash, reasoningCid), callable only by AGENT_ROLE
rebalance does three things in order: ask the policy to validate → move funds between adapters → record the decision in the registry
totalAssets() = sum of all adapter balances + idle cash
AllocationPolicy.sol — the guardrail (~150 lines, the heart of the pitch)

maxWeightBps = 6000 → no strategy ever holds >60%
maxDriftBps = 2000 → no single rebalance moves >20% of the portfolio
cooldownSeconds = 1 hours → rate-limits the agent
weights must sum to exactly 10,000 bps
Reverts on any violation before funds move. Every revert path gets a test, and "the contract rejects a malicious proposal" is a beat in the demo video.
ReasoningRegistry.sol — the novel bit

Per epoch, stores: timestamp, the weights, keccak256 of the reasoning JSON, the IPFS CID, the agent address
Emits DecisionRecorded — this is the on-chain audit trail the AI judges will read
Anyone can pull the CID, re-hash, and confirm the match
Three strategy adapters behind one interface (deposit / withdraw / totalAssets / apyBps):

RwaYieldAdapter — mock tokenized T-bill/private-credit vault, accrues a fixed rate
LendingAdapter — mock Aave-shaped lending pool
IdleAdapter — holds mUSDC at 0%, the "risk-off" bucket
All are honest mocks with production-shaped interfaces; mainnet is a one-line address swap, documented in the README
Layer 2 — Off-chain agent (TypeScript / Node 22)
An hourly cron job running an 8-step pipeline:


1. Gather     → fact sheets, credit memos, rate data, on-chain adapter
                state, OKX DEX liquidity quotes, prior epochs' decisions
2. Reason     → DeepSeek tool-use loop → structured AllocationProposal
3. Validate   → TypeScript re-checks every field (sum == 10000, ranges,
                known adapters) — never trust model output raw
4. Pre-check  → run the exact policy bounds locally; reject before chain
5. Simulate   → viem simulateContract against live testnet
6. Pin        → canonical JSON → IPFS → { cid, keccak256 }
7. Submit     → vault.rebalance(weights, hash, cid)
8. Record     → proposal + txHash → SQLite (feeds the frontend)
A failed epoch is a skipped epoch, never a crash and never a reverted tx on-chain.

Model routing:

deepseek-v4-pro — the allocation reasoning itself (the judged output; never downgrade)
deepseek-v4-flash — optional cheap pre-pass extracting figures from documents (first thing cut if behind)
Strict tool calling (strict: true on the propose_allocation schema, baseURL: https://api.deepseek.com/beta) so the proposal is schema-valid at the sampler
1M context = the whole document corpus + policy + history fits in one call; no RAG layer needed
Prompt ordered stable-prefix-first so DeepSeek's automatic caching hits (~$0.02/epoch)
The proposal the model must emit:


{ weights: [{ adapter, weightBps, rationale }],   // rationale must cite source evidence
  thesis,                                          // 3–5 sentences
  risks[],                                         // max 4
  confidence: low | medium | high }
Provider abstraction — one AllocationProvider interface with DeepSeek default, plus OpenAI-compatible and local-Ollama backends selectable by env var. Proof that the safety model doesn't depend on which model runs.

Layer 3 — Frontend (Next.js 15 + wagmi/viem, two screens)
Screen 1: Vault — connect, deposit/withdraw, TVL, your position, allocation as a plain table
Screen 2: Decision Log ★ — epoch timeline; expand one → thesis, rationales, risks, confidence, model ID + params, explorer link, and the Verify on-chain button. Build this screen well; everything else stays plain.
5. How a rebalance actually flows (end to end)

09:00 UTC — cron fires
  → agent pulls: 3 fund fact sheets, latest Fed statement, adapter APYs/TVLs,
    OKX DEX exit-liquidity quote for the RWA token, last 5 epochs
  → deepseek-v4-pro reasons over all of it, calls propose_allocation:
      RWA 55% ("SCOPE fund NAV stable, spread 380bps over T-bills…")
      Lending 30%, Idle 15%, confidence: medium, risks: [...]
  → TS validator: sum = 10000 ✓, all adapters known ✓
  → local policy check: 55% ≤ 60% cap ✓, drift 12% ≤ 20% ✓, cooldown elapsed ✓
  → simulateContract ✓
  → JSON pinned to IPFS → cid QmX…, hash 0xab…
  → vault.rebalance([5500,3000,1500], 0xab…, "QmX…")
  → funds move between adapters; DecisionRecorded emitted; epoch++
  → SQLite row written; Decision Log updates
Note the OKX DEX quote is load-bearing in the reasoning — the agent treats exit liquidity as a risk input ("can I get out of this position at size?"), which is a more honest integration than blind swap-routing on a testnet the aggregator doesn't serve.

6. Feature inventory
Shipping (all of it appears in the 3-min demo):

ERC-4626 deposit/withdraw with live share pricing
Three-strategy allocation with real fund movement per epoch
Policy enforcement with demonstrable rejection of a bad proposal
AI allocation from real unstructured documents, with cited evidence
On-chain reasoning-hash registry + IPFS storage
Browser-side hash verification (the green check)
~70 epochs of real on-chain history by submission (cron from Day 4)
OKX DEX liquidity data inside the reasoning
Provider-swappable model backend
Deliberately not building (stated in README — it reads as discipline, not absence): governance token, cross-chain, multi-agent orchestration, KYC flow, custom AMM, mobile.

The trust claim, stated precisely: we prove the reasoning shown is the reasoning acted on (integrity). We do not claim to prove DeepSeek's servers produced it (verifiable inference) — but because the weights are open/MIT, self-hosting with pinned weights + fixed seed is a credible roadmap to that, and the README says exactly this.

7. Repo structure to follow
Monorepo, three packages — mirrors the three layers:


agentic-rwa-treasury/
├── README.md                  ← architecture, safety model, mock inventory,
│                                addresses, demo link — judges read this first
├── PLAN.md
├── contracts/                 ← Foundry
│   ├── src/
│   │   ├── RwaTreasuryVault.sol
│   │   ├── AllocationPolicy.sol
│   │   ├── ReasoningRegistry.sol
│   │   ├── adapters/          (RwaYield, Lending, Idle)
│   │   ├── interfaces/        (IStrategyAdapter, IAllocationPolicy, IReasoningRegistry)
│   │   └── mocks/             (MockUSDC)
│   ├── test/                  ← one test file per contract; every revert path
│   ├── script/Deploy.s.sol
│   └── foundry.toml           (chainId 1952, RPC testrpc.xlayer.tech/terigon)
├── agent/                     ← TypeScript
│   ├── src/
│   │   ├── index.ts           (cron entry)
│   │   ├── pipeline/          (gather → reason → validate → precheck →
│   │   │                       simulate → pin → submit → record)
│   │   ├── providers/         (deepseek.ts, openai-compat.ts, local.ts)
│   │   ├── tools/             (adapterState, rwaDocuments, rateData, okxDexQuote)
│   │   ├── schema/            (proposal JSON schema + TS validator)
│   │   └── prompts/           (mandate.ts, policy-constraints.ts)
│   ├── data/documents/        (the fact sheets / memos the agent reads)
│   └── db/                    (SQLite)
└── web/                       ← Next.js 15
    └── app/
        ├── page.tsx           (Vault screen)
        └── decisions/         (Decision Log + verify button)
Build order = dependency order: contracts (Days 1–2) → agent (Days 3–4) → frontend (Days 5–6) → demo + submission (Day 7). The two gates that cannot slip: testnet deploy by Aug 16 and first live rebalance by Aug 18, because on-chain history needs wall-clock time to accumulate and that history is what the AI judges score.

8. Why each judging criterion is covered
Criterion	Answer
AI application	Unstructured→structured reasoning code can't do; not a chatbot wrapper
Innovation	On-chain reasoning-hash registry for AI financial decisions — nobody on X Layer has this
Completeness	Closed loop: deposit → allocate → rebalance → verify → withdraw, with UI
User value	Passive RWA+DeFi yield with an auditable "why"
X Layer integration	Contracts live on 1952, DEX data in the loop, mainnet path documented
Ecosystem contribution	X Layer's RWA category is empty; this fills it — the exact thesis OKX funded via STBL
If any section deserves deeper treatment before you start coding — the DeepSeek prompt design, the contract test matrix, or the exact document corpus the agent will read — say which and I'll expand it. Otherwise the next concrete step is the Day-0 gate list in §1 of PLAN.md: faucet, DeepSeek smoke test, repo, X account.