# Agentic RWA Treasury — Build Plan (DeepSeek edition)

**Hackathon:** OKX AI Season Hackathon (Build X Series), X Layer
**Deadline:** Aug 21, 2026, 23:59 UTC
**Plan written:** Aug 14, 2026 — **7 days remain, no code written yet**
**Target:** 1st place (30,000 USDT) + AI-RWA Liquidity Grant (50,000 USDT)
**Reasoning model:** DeepSeek V4 (`deepseek-v4-pro` / `deepseek-v4-flash`)

---

## 1. What we're building

**Agentic RWA Treasury** is a savings vault on X Layer. A user deposits stablecoins and
gets a yield-bearing share token back. Behind the vault, an AI agent acts as the portfolio
manager: it reads the messy off-chain material a real allocator reads — fund fact sheets,
credit reports, rate announcements — and decides how to split the pooled money across
tokenized real-world-asset yield (T-bills, private credit), DeFi lending, and idle cash.
Every decision the AI makes is bounded by a smart contract that enforces hard risk limits,
and the AI's full written reasoning is hashed and recorded on-chain, so anyone can verify
*why* the vault holds what it holds.

> **Pitch line:** An AI portfolio manager for tokenized real-world assets, where every
> decision is auditable on-chain.

### The core design principle (this is the whole product)

> **The LLM proposes. The contract disposes.**

Everything else follows from this one inversion:

| | What it does | What it can never do |
|---|---|---|
| **AI agent (DeepSeek)** | Reads unstructured documents, forms an allocation thesis, emits a structured proposal | Touch funds, exceed caps, bypass cooldowns, withdraw anything |
| **Smart contract (policy)** | Enforces deterministic bounds: max 60% per strategy, max 20% move per rebalance, 1-hour cooldown, whitelisted strategies only | Reason about a credit report |

The AI does the thing code can't (turn prose into an investment thesis). The contract does
the thing an LLM must never do (hold custody, enforce limits). A fully hacked agent key can
only produce *"a suboptimal allocation that is still inside policy bounds"* — that sentence
is the security model, and it belongs verbatim in the README.

### User journey (what a depositor experiences)

1. **Deposit** — connect wallet, deposit mUSDC into the vault, receive `rtUSD` shares
   (ERC-4626 standard, so shares appreciate as yield accrues).
2. **Watch** — the dashboard shows TVL, current APY, and the live allocation across
   strategies.
3. **Understand** — the Decision Log shows every rebalance the AI made: its thesis,
   per-strategy rationale, the risks it flagged, its confidence level.
4. **Verify** — click "Verify on-chain": the browser fetches the reasoning JSON from IPFS,
   re-hashes it, and compares against the hash the contract recorded. Green check = the
   explanation shown is provably the one the vault acted on. **This button is the demo.**
5. **Withdraw** — redeem `rtUSD` for underlying at any time.

---

## 2. Feasibility verdict — read this first

**Yes, this is buildable in 7 days — but only at the scope defined below.** The original
10-day plan is no longer the plan. Three things must be accepted up front, and if you are
not willing to accept them, pick a smaller idea today rather than on Aug 19.

1. **All three strategy adapters are mocks on testnet.** No real RWA vault, no real Aave.
   Mocks with production-shaped interfaces, documented honestly, with a one-line address
   swap for mainnet.
2. **No swap execution on testnet.** All adapters denominate in the same asset (mock USDC),
   so a rebalance is a transfer between adapters, not a swap. OKX DEX integration is real
   but read-side (see §8.4). This removes the single largest schedule risk in the original
   plan.
3. **Two frontend screens, not four.** Vault (deposit/withdraw + allocation) and Decision
   Log. The Decision Log is the demo; everything else is plumbing.

**What is genuinely different about this project** — and the reason it can score well
against a field of "AI trading agent" submissions — is the proposes/disposes inversion
above. The model never holds custody and never has an unbounded action. AI judges read
code and on-chain data — this gives them a small, auditable contract surface and a real
transaction history to read.

**Biggest remaining risk is not technical, it's wall-clock.** The buffer is gone. §15 has
the cut ladder for when you slip, ranked. Follow it in order; do not improvise cuts at 2am
on Aug 20.

---

## 3. Day-0 gates (do these before writing any contract)

Two of the original three unknowns are now resolved.

| # | Assumption | Status |
|---|---|---|
| 1 | X Layer **testnet** chainId | ✅ **1952** (`0x7a0`) — verified live against `https://testrpc.xlayer.tech/terigon` and `https://xlayertestrpc.okx.com/terigon` |
| 2 | X Layer **mainnet** chainId | ✅ **196** (`0xc4`) — verified live against `https://rpc.xlayer.tech` |
| 3 | OKX DEX aggregator supports chain 1952 | ❌ **Unverified — needs your API key.** `/api/v5/dex/aggregator/supported/chain` rejects unauthenticated calls (`50103`). Strong prior: mainnet-only. §8.4 is designed so this does not block you either way. |

Still to clear, today, in this order — none should take more than 20 minutes:

- [ ] **Faucet works.** `https://web3.okx.com/xlayer/faucet` → testnet OKB in your deployer
      wallet. Gas token on X Layer is OKB, not ETH.
- [ ] **DeepSeek key + strict tool calling.** Run the smoke test in §9.2. You are
      confirming three things at once: the key works, `deepseek-v4-pro` responds, and
      `strict: true` against `https://api.deepseek.com/beta` returns a schema-valid tool call.
- [ ] **OKX Web3 dev API key.** Register, then call
      `GET https://web3.okx.com/api/v6/dex/aggregator/supported/chain` with your
      `OK-ACCESS-KEY` header and record whether `1952` and `196` appear. Write the answer
      into the README either way — "we checked, testnet is not supported, here is our
      documented mainnet path" reads far better than silence.
- [ ] **Public repo + project X account live.** Both are hard submission requirements and
      both take ten minutes. Do them now, not on Aug 21. The X account must stay active
      through the project's lifetime, so post a build-in-public update most days.
- [ ] **Verify the Aave-on-X-Layer-mainnet claim** before writing it into the README —
      it came from an earlier research doc and has not been independently confirmed.

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  OFFCHAIN — Agent (TypeScript / Node 22)                             │
│                                                                      │
│   data sources               DeepSeek V4              output         │
│   ─────────────              ───────────              ──────         │
│   fund fact sheets  ─┐   flash: bulk extraction                      │
│   rate announcements ├──► pro:   allocation      ──►  AllocationProposal
│   protocol APYs      │          reasoning             { weights[],   │
│   custodian attests  │   (thinking enabled,             thesis,      │
│   OKX DEX quotes     │    strict tool schema)           risks[],     │
│   prior epochs      ─┘                                  confidence } │
│                                    │                                 │
│                                    ▼                                 │
│                     policy pre-check (local) → simulate → reject     │
│                                    │                                 │
│                     canonical reasoning JSON → IPFS → keccak256      │
└────────────────────────────────────┼─────────────────────────────────┘
                                     │ rebalance(weights, hash, cid)
┌────────────────────────────────────▼─────────────────────────────────┐
│  ONCHAIN — X Layer testnet (chainId 1952)                            │
│                                                                      │
│   RwaTreasuryVault (ERC-4626, asset = mUSDC, share = rtUSD)           │
│        ├── AllocationPolicy   ─ caps / drift / cooldown / whitelist  │
│        ├── ReasoningRegistry  ─ hash + CID + weights, per epoch       │
│        └── IStrategyAdapter[]                                        │
│              ├── RwaYieldAdapter  (mock tokenized T-bill / credit)   │
│              ├── LendingAdapter   (mock Aave-shaped pool)            │
│              └── IdleAdapter      (holds mUSDC, 0%)                  │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────┐
│  FRONTEND — Next.js 15 + wagmi/viem                                  │
│   Screen 1: Vault — deposit/withdraw, TVL, allocation table          │
│   Screen 2: ★ Decision Log — thesis, risks, "Verify on-chain" button │
└──────────────────────────────────────────────────────────────────────┘
```

### Stack

| Layer | Choice |
|---|---|
| Contracts | Solidity 0.8.24, Foundry, OpenZeppelin `ERC4626` |
| Agent | TypeScript, Node 22, `openai` SDK pointed at DeepSeek, `viem` |
| Model | `deepseek-v4-pro` (reasoning), `deepseek-v4-flash` (bulk extraction) |
| Frontend | Next.js 15 App Router, wagmi + viem, Tailwind |
| Chain | X Layer testnet — **chainId 1952**, RPC `https://testrpc.xlayer.tech/terigon` |
| Storage | IPFS via Pinata or web3.storage |
| Agent DB | SQLite (feeds the frontend Decision Log) |

---

## 5. Repo structure

Monorepo, three packages — mirrors the three layers. Build order = dependency order:
contracts → agent → frontend.

```
agentic-rwa-treasury/
├── README.md                  ← architecture, safety model, mock inventory,
│                                addresses, demo link — judges read this first
├── PLAN.md                    ← this file
├── contracts/                 ← Foundry
│   ├── src/
│   │   ├── RwaTreasuryVault.sol
│   │   ├── AllocationPolicy.sol
│   │   ├── ReasoningRegistry.sol
│   │   ├── adapters/          RwaYieldAdapter.sol · LendingAdapter.sol · IdleAdapter.sol
│   │   ├── interfaces/        IStrategyAdapter · IAllocationPolicy · IReasoningRegistry
│   │   └── mocks/             MockUSDC.sol
│   ├── test/                  ← one test file per contract; every revert path covered
│   ├── script/Deploy.s.sol
│   └── foundry.toml           (chainId 1952, RPC testrpc.xlayer.tech/terigon)
├── agent/                     ← TypeScript
│   ├── src/
│   │   ├── index.ts           (cron entry)
│   │   ├── pipeline/          gather → reason → validate → precheck →
│   │   │                      simulate → pin → submit → record
│   │   ├── providers/         deepseek.ts · openai-compat.ts · local.ts
│   │   ├── tools/             adapterState · rwaDocuments · rateData · okxDexQuote
│   │   ├── schema/            proposal JSON schema + TypeScript validator
│   │   └── prompts/           mandate.ts · policy-constraints.ts
│   ├── data/documents/        (the fact sheets / memos the agent reads)
│   └── db/                    (SQLite)
└── web/                       ← Next.js 15
    └── app/
        ├── page.tsx           (Vault screen)
        └── decisions/         (Decision Log + Verify button)
```

---

## 6. Contracts

Four files. Keep them short and heavily commented — the AI judges read code, and a small
reviewable surface *is* the pitch.

### 6.1 `RwaTreasuryVault.sol` — the money container

Extends OZ `ERC4626`. Asset = `mUSDC` (mock, 6 decimals). Share = `rtUSD`. Standard
`deposit / withdraw / mint / redeem` and share accounting are all inherited; the only
custom entry point is `rebalance`.

```solidity
contract RwaTreasuryVault is ERC4626, AccessControl, Pausable {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    IAllocationPolicy  public policy;
    IReasoningRegistry public registry;
    address[]          public adapters;
    uint256            public currentEpoch;

    /// @notice Agent-submitted rebalance. Policy validates BEFORE any funds move.
    function rebalance(
        uint16[] calldata targetWeightsBps,   // must sum to 10_000
        bytes32           reasoningHash,      // keccak256 of canonical reasoning JSON
        string   calldata reasoningCid        // IPFS CID of that JSON
    ) external onlyRole(AGENT_ROLE) whenNotPaused {
        policy.validate(currentEpoch, _currentWeightsBps(), targetWeightsBps);
        _executeRebalance(targetWeightsBps);
        registry.record(currentEpoch, targetWeightsBps, reasoningHash, reasoningCid);
        unchecked { ++currentEpoch; }
    }

    function totalAssets() public view override returns (uint256) {
        // sum(adapter.totalAssets()) + idle balance held by the vault
    }
}
```

**Safety property to state verbatim in the README:** `AGENT_ROLE` can call exactly one
function, with arguments that must pass `policy.validate`. It cannot withdraw, cannot add
or remove adapters, cannot change the policy, cannot unpause. A fully compromised agent
key caps the blast radius at *"a suboptimal allocation that is still inside policy bounds."*
This sentence is the single highest-leverage thing in your README.

### 6.2 `AllocationPolicy.sol` — the deterministic guardrail (~150 lines)

```solidity
contract AllocationPolicy is IAllocationPolicy, Ownable {
    uint16  public maxWeightBps    = 6_000;    // no strategy above 60%
    uint16  public maxDriftBps     = 2_000;    // no single rebalance moves >20%
    uint256 public cooldownSeconds = 1 hours;  // rate-limit the agent
    uint256 public lastRebalanceAt;

    mapping(address => bool) public allowedAdapter;

    function validate(
        uint256 epoch,
        uint16[] calldata current,
        uint16[] calldata target
    ) external view {
        require(target.length == current.length,                    "length mismatch");
        require(_sum(target) == 10_000,                             "weights != 100%");
        require(block.timestamp >= lastRebalanceAt + cooldownSeconds, "cooldown");
        for (uint256 i; i < target.length; ++i) {
            require(target[i] <= maxWeightBps,                      "concentration cap");
            require(_absDiff(current[i], target[i]) <= maxDriftBps, "drift cap");
        }
    }
}
```

Write a test for **every** revert path. "It correctly rejects a malicious proposal" is a
demo beat, not just a test — show it in the video.

### 6.3 `ReasoningRegistry.sol` — the novel bit

```solidity
contract ReasoningRegistry is IReasoningRegistry {
    struct Decision {
        uint256  timestamp;
        uint16[] weightsBps;
        bytes32  reasoningHash;   // keccak256 of the canonical reasoning JSON
        string   reasoningCid;    // IPFS CID of that JSON
        address  agent;
    }
    mapping(uint256 => Decision) public decisions;   // epoch => decision

    event DecisionRecorded(
        uint256 indexed epoch,
        bytes32         reasoningHash,
        string          reasoningCid,
        address indexed agent
    );
}
```

Per epoch it stores: timestamp, weights, reasoning hash, IPFS CID, agent address. The
`DecisionRecorded` event stream is the on-chain audit trail the AI judges will read.
Anyone can fetch the CID, re-hash the JSON, and confirm it matches what the vault acted on.
**That check is a button in the UI** — it is the most demo-able moment in the project.

### 6.4 Adapters

```solidity
interface IStrategyAdapter {
    function deposit(uint256 assets) external;
    function withdraw(uint256 assets) external;
    function totalAssets() external view returns (uint256);
    function apyBps() external view returns (uint16);   // reported, for display
}
```

| Adapter | Testnet implementation | Role in the portfolio | Mainnet path |
|---|---|---|---|
| `RwaYieldAdapter` | Mock ERC-4626 accruing a fixed rate; interface shaped to an STBL / Securitize-style RWA vault | The RWA yield leg | Swap in the real vault address |
| `LendingAdapter` | Mock Aave-shaped pool | The DeFi yield leg | Aave v3 on X Layer mainnet — **verify deployment before claiming (§3)** |
| `IdleAdapter` | Holds mUSDC, 0% | The risk-off bucket | Same |

**Document the mocks explicitly.** Judges reward an honest testnet mock with a clean
upgrade path far more than they reward a vague claim of integration they can't verify.

---

## 7. How a rebalance actually flows (end to end)

```
09:00 UTC — cron fires
  → agent pulls: 3 fund fact sheets, latest Fed statement, adapter APYs/TVLs,
    OKX DEX exit-liquidity quote for the RWA token, last 5 epochs
  → deepseek-v4-pro reasons over all of it, calls propose_allocation:
      RWA 55%      ("SCOPE fund NAV stable, spread 380bps over T-bills…")
      Lending 30%  ("utilization down, supply APY compressed to 4.1%…")
      Idle 15%     ("holding buffer given FOMC uncertainty this week")
      confidence: medium, risks: [rate cut compresses RWA spread, …]
  → TS validator: sum = 10000 ✓, all adapters known ✓, ranges ✓
  → local policy check: 55% ≤ 60% cap ✓, drift 12% ≤ 20% ✓, cooldown elapsed ✓
  → simulateContract ✓
  → canonical JSON pinned to IPFS → cid QmX…, hash 0xab…
  → vault.rebalance([5500,3000,1500], 0xab…, "QmX…")
  → funds move between adapters; DecisionRecorded emitted; epoch++
  → SQLite row written; Decision Log updates
```

A failed step anywhere in that chain means a *skipped* epoch, never a crash and never a
reverted tx on-chain.

---

## 8. The agent

### 8.1 Why DeepSeek is a good fit here — and where it isn't

DeepSeek V4 gives you three things this project specifically needs:

- **1M context.** The whole document corpus, the policy, and full decision history fit in
  one call. You do not build a retrieval layer. On a 7-day clock this saves a full day.
- **Cost is a non-issue.** ~30k in + 8k out per epoch on `deepseek-v4-pro` ≈ **$0.02 per
  epoch** uncached. Hourly rebalances for the entire remaining hackathon cost under $5.
  Cache hits are ~120× cheaper than misses, so in practice it's less.
- **Open weights, MIT-licensed.** This is the real argument, and it is *stronger* than
  the equivalent for a closed model. Your on-chain reasoning hash is an attestation today;
  because the weights are open, "re-run the same weights at temperature 0 and reproduce
  the decision" is a credible roadmap item rather than a thing you can never do. Put that
  in the README as the stated path to trustless verification.

Where it isn't ideal, and you should know before committing:

- **Tool-call arguments are not guaranteed valid.** DeepSeek's own docs warn that generated
  arguments may be malformed or contain hallucinated parameters. Strict mode (§9.2) removes
  most of this; your local validator removes the rest. **Never** pass a model-produced
  number into a transaction without re-validating it in code.
- **It is a hosted API in a single jurisdiction.** Data-residency and latency considerations
  apply. Keep the provider behind a one-interface abstraction (§8.5) so this is a config
  line, not a rewrite.
- **Rate limits and occasional latency spikes.** With an hourly cadence this is harmless,
  but the harness must treat a failed epoch as a skipped epoch, not a crash.

### 8.2 Model routing

| Call | Model | Why |
|---|---|---|
| Bulk figure extraction from fact sheets / credit memos | `deepseek-v4-flash` | Mechanical; $0.14/M input. Reduces the pro-model prompt to clean structured facts. |
| Allocation reasoning → `propose_allocation` | `deepseek-v4-pro` | This is the judged output. Do not downgrade it. |

Skip the flash pre-pass entirely on Day 3 if you are behind — with 1M context you can feed
raw documents straight to `pro`. Add the pre-pass on Day 6 only if you have slack.

**Model IDs matter:** `deepseek-chat` and `deepseek-reasoner` were retired on 24 July 2026.
Any tutorial you copy from that uses those names is stale.

### 8.3 Harness pipeline

```
1. Gather    → RWA docs, on-chain adapter state, rate data, OKX DEX liquidity, prior epochs
2. Reason    → DeepSeek tool-use loop → AllocationProposal
3. Validate  → re-check every field in TypeScript (ranges, sum == 10000, known adapters)
4. Pre-check → run the same bounds AllocationPolicy enforces, locally. Reject and log.
5. Simulate  → viem simulateContract against the live testnet
6. Pin       → canonical JSON → IPFS → { cid, keccak256 }
7. Submit    → vault.rebalance(weights, hash, cid)
8. Record    → proposal + txHash into SQLite for the UI
```

Steps 3–5 are not optional. **A reverted transaction in your demo video is worse than a
skipped epoch**, and a model that occasionally emits `weightBps: 10500` is a normal
Tuesday, not an emergency.

### 8.4 OKX DEX integration — the honest version

Because all adapters denominate in the same asset, testnet rebalances need no swaps. That
kills the aggregator-on-testnet dependency dead. OKX DEX still does real work, on the read
side, and it is arguably a *better* integration than blind swap-routing:

- Before proposing weights, the agent queries the **OKX DEX quote API** for the RWA token
  on mainnet and feeds **price impact and available liquidity at size** into its reasoning
  as an exit-liquidity risk input. An allocator that ignores whether it can get out of a
  position is a bad allocator; this makes the DEX data load-bearing in the AI's actual
  decision.
- The `_executeRebalance` swap path is written against the aggregator interface and used
  on mainnet. Document it, and if the supported-chains call from §3 confirms testnet is
  unsupported, say so plainly in the README.

### 8.5 Provider abstraction

One interface, three implementations, chosen by env var:

```ts
interface AllocationProvider {
  propose(ctx: EpochContext): Promise<AllocationProposal>;
}
// deepseek (default) | openai-compatible (Together/Fireworks/OpenRouter) | local (Ollama)
```

Two reasons this is worth the 30 minutes: it protects you if DeepSeek has a bad night
during the demo, and it is direct evidence for the README that **the contract-side safety
model does not depend on which model you use.** That claim is a large part of why this
architecture is defensible.

---

## 9. DeepSeek implementation details

### 9.1 Endpoints and models

| Thing | Value |
|---|---|
| OpenAI-compatible base URL | `https://api.deepseek.com` (or `/v1`) |
| Anthropic-compatible base URL | `https://api.deepseek.com/anthropic` |
| **Beta base URL — required for strict tool calling** | `https://api.deepseek.com/beta` |
| Models | `deepseek-v4-pro`, `deepseek-v4-flash` |
| Context | 1M tokens; output up to 384K |
| `deepseek-v4-pro` price | $0.435/M input (miss) · $0.003625/M input (hit) · $0.87/M output |
| `deepseek-v4-flash` price | $0.14/M input (miss) · $0.0028/M input (hit) · $0.28/M output |

Use the standard `openai` npm SDK with `baseURL` overridden. No custom client needed.

### 9.2 Strict tool calling — the smoke test to run today

Tool use in thinking mode is supported (since V3.2). Strict schema adherence requires the
beta base URL and `strict: true` per function.

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey:  process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/beta",   // ← required for strict mode
});

const proposeAllocation = {
  type: "function" as const,
  function: {
    name: "propose_allocation",
    description:
      "Submit the final target allocation. Weights are basis points and must sum to 10000. " +
      "Call this exactly once, after gathering and reasoning over the source material.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["weights", "thesis", "risks", "confidence"],
      properties: {
        weights: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["adapter", "weightBps", "rationale"],
            properties: {
              adapter:   { type: "string" },
              weightBps: { type: "integer" },
              rationale: { type: "string" },
            },
          },
        },
        thesis:     { type: "string" },
        risks:      { type: "array", items: { type: "string" } },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
  },
};

const res = await client.chat.completions.create({
  model: "deepseek-v4-pro",
  temperature: 0,                              // determinism; log it in the reasoning JSON
  messages: [
    { role: "system",  content: ALLOCATION_MANDATE + "\n\n" + POLICY_CONSTRAINTS },
    { role: "user",    content: `Rebalance epoch ${epoch}.` },
  ],
  tools: [proposeAllocation, fetchAdapterState, fetchRwaDocuments, fetchRateData],
});
```

**Strict-mode constraints that shape your schema — design around these, don't fight them:**

- Every object property must be listed in `required`, and every object needs
  `additionalProperties: false`. There are no optional fields. If something is genuinely
  optional, model it as an explicit nullable or a sentinel value.
- `minLength` / `maxLength` on strings and array size constraints are **not supported**.
- Do not rely on numeric `minimum` / `maximum` for safety. Enforce `0 <= weightBps <= 10000`
  and `sum == 10000` in your TypeScript validator. The schema is for shape; your code is
  for safety.

### 9.3 Prompt caching

DeepSeek caches automatically on the prefix — there are no `cache_control` breakpoints to
place. The only thing you must do is **order the prompt correctly**:

```
[ stable prefix — cached ]   mandate → policy constraints → document corpus
[ volatile suffix        ]   epoch number → live adapter state → rate data → history
```

Confirm it is working by checking `usage.prompt_cache_hit_tokens > 0` on the second run.
If it is zero, something volatile leaked into the prefix — most commonly a timestamp or a
re-serialized object with non-deterministic key order.

### 9.4 Prompting notes

- **Cap the prose.** Instruct explicit length limits: thesis 3–5 sentences, each rationale
  one sentence, at most 4 risks. Left unconstrained these run long, and long rationales
  make the Decision Log screen unreadable — which is the screen you are being judged on.
- **Force evidence citation.** Every `rationale` must reference a specific figure or
  statement from the source material. This is what separates a real allocation thesis from
  plausible-sounding filler, and it is exactly what a human judge will spot-check.
- **Restate the hard bounds in the system prompt** (max 60% per strategy, max 20% drift per
  rebalance). The contract enforces them regardless, but a model that knows the bounds
  produces valid proposals instead of rejected ones — and rejected epochs are wasted history.

### 9.5 The reasoning JSON — be precise about what you're claiming

Canonical JSON, deterministically serialized (sorted keys, no whitespace variance), pinned
to IPFS, keccak256 hashed, hash + CID written on-chain:

```jsonc
{
  "epoch": 12,
  "timestamp": 1755100800,
  "model": "deepseek-v4-pro",
  "params": { "temperature": 0 },
  "inputsHash": "0x…",           // hash of the exact document corpus + on-chain state fed in
  "proposal": { "weights": [...], "thesis": "…", "risks": [...], "confidence": "medium" },
  "policyPrecheck": { "passed": true, "bounds": { "maxWeightBps": 6000, "maxDriftBps": 2000 } }
}
```

**Claim exactly this and no more:** *anyone can verify that the reasoning displayed is the
reasoning the vault acted on.* That is an integrity guarantee, and it is real.

Do **not** claim verifiable inference — you cannot prove DeepSeek's servers produced that
output. Say so in the README, and immediately follow it with the mitigation: the weights
are open and MIT-licensed, so the path to reproducible inference is self-hosting with
pinned weights and a fixed seed. Judges notice the difference between a team that
understands its own trust boundary and one that oversells. Being the first kind is worth
more than the claim you'd be giving up.

---

## 10. Frontend — two screens

**Screen 1 — Vault.** Connect wallet, TVL, your position, deposit/withdraw, current
allocation as a plain table (adapter · weight · APY · TVL). A table, not a donut. Ship the
chart only if Day 6 has slack.

**Screen 2 — ★ Decision Log.** The demo. A timeline of epochs; click one to expand:

- the agent's thesis, per-adapter rationale, risks, confidence
- the model ID and parameters used
- **a "Verify on-chain" button** that fetches the JSON from IPFS, re-hashes it in the
  browser, and diffs against `ReasoningRegistry`. Green check = provably the reasoning the
  vault acted on.
- a link to the rebalance tx on the X Layer explorer

Build Screen 2 well. Everything else can look plain.

---

## 11. Feature inventory

**Shipping — all of it appears in the 3-minute demo:**

1. ERC-4626 deposit/withdraw with live share pricing
2. Three-strategy allocation with real fund movement per epoch
3. Policy enforcement with demonstrable rejection of a bad proposal
4. AI allocation from *real unstructured documents*, with cited evidence
5. On-chain reasoning-hash registry + IPFS storage
6. Browser-side hash verification (the green check)
7. ~70 epochs of real on-chain history by submission (cron from Day 4)
8. OKX DEX liquidity data inside the reasoning
9. Provider-swappable model backend

**Deliberately not building** (stated in README — it reads as discipline, not absence):

- No governance token, no tokenomics
- No cross-chain — X Layer only
- No multi-agent orchestration — one agent, one job
- No permissioned KYC flow — testnet mocks assume an open vault
- No custom AMM — mainnet swaps route through OKX DEX
- No mobile app

---

## 12. Why this wins — mapped to the judging criteria

| Criterion | How we hit it |
|---|---|
| **Application of AI** | Unstructured→structured reasoning that deterministic code can't do; not a chatbot wrapper |
| **Innovation** | On-chain reasoning-hash registry for AI financial decisions — nobody on X Layer has this |
| **Product completeness** | Closed loop: deposit → allocate → rebalance → verify → withdraw, with UI |
| **User value** | Passive RWA+DeFi stablecoin yield with an auditable "why" |
| **X Layer integration** | Contracts live on 1952, DEX liquidity data in the reasoning loop, mainnet path documented |
| **Growth potential** | Every mainnet rebalance generates DEX volume — the Launch Grant metric |
| **Ecosystem contribution** | X Layer's RWA category is empty; this fills it — the exact thesis OKX funded via STBL |

**Strategic tailwind:** OKX Ventures backed STBL (Feb 2026) to launch an RWA-backed
stablecoin on X Layer with Hamilton Lane + Securitize, and OKX shipped RWA Index
Perpetuals. This project is the thing OKX has already publicly decided it wants and cannot
yet point to.

---

## 13. Seven-day schedule

Aug 14 → Aug 21. There is no buffer day. Treat each "done when" as a gate, and if you miss
one by more than half a day, go to §15 immediately.

| Day | Date | Work | Done when |
|---|---|---|---|
| 0 | **Aug 14 (today)** | §3 gates. Foundry scaffold. Repo public + README skeleton. X account live. DeepSeek strict-mode smoke test passes. | Testnet wallet funded, `forge test` runs, strict tool call returns valid JSON |
| 1 | Aug 15 | `RwaTreasuryVault` + `IStrategyAdapter` + `IdleAdapter` + `mUSDC`. Tests. | Deposit/withdraw round-trips in tests |
| 2 | Aug 16 | `AllocationPolicy` + `ReasoningRegistry` + `RwaYieldAdapter` + `LendingAdapter`. Full revert-path tests. **Deploy all contracts to X Layer testnet, verify sources.** | Live addresses in README; `rebalance()` passes and reverts on every bound |
| 3 | Aug 17 | Agent: data tools, DeepSeek loop, strict schema, TypeScript validator. Confirm cache hits. | Agent produces a valid, policy-passing proposal from real documents |
| 4 | Aug 18 | Agent: pre-check, simulate, IPFS pin, tx submit. **First live rebalance.** Start the hourly cron and leave it running. | First reasoning hash on-chain; epochs accumulating unattended |
| 5 | Aug 19 | Frontend: wallet connect, vault screen, deposit/withdraw, allocation table. | Deposit works from the UI |
| 6 | Aug 20 | Frontend: **Decision Log + Verify button.** README in full: architecture, safety model, mock inventory, addresses, run instructions. Deploy frontend. | Verify button shows green on a real epoch |
| 7 | **Aug 21** | Record 3-min demo. X launch post tagging **@XLayerOfficial**. Submit Google Form. **Deadline 23:59 UTC.** | Submitted — target 18:00 UTC, not 23:00 |

**Critical path: Day 2 (testnet deploy) and Day 4 (first live rebalance).** Day 4 is the
harder deadline of the two, because on-chain history needs wall-clock time to accumulate
and the AI judges read on-chain data. Hourly from Aug 18 evening gives you ~70 epochs by
submission. If Day 4 slips past Aug 19 morning, you are submitting a project with a handful
of decisions instead of a track record, and that is a visible scoring difference.

**Scope rule for the whole build:** if it does not appear in the 3-minute demo video, it
does not get built before Aug 21.

---

## 14. Demo video outline (3 minutes)

1. **0:00–0:30** — The problem and the inversion: "AI that moves money is scary. Ours
   can't. The LLM proposes, the contract disposes."
2. **0:30–1:15** — Deposit from the UI; show the allocation table and live TVL.
3. **1:15–2:15** — The Decision Log: open a real epoch, read the thesis and cited
   evidence, click **Verify on-chain**, green check, show the tx on the explorer.
4. **2:15–2:45** — The guardrail: show a malicious/oversized proposal being rejected by
   `AllocationPolicy` (from a test or a scripted attempt).
5. **2:45–3:00** — The track record: ~70 epochs on-chain, mainnet path, close.

---

## 15. Cut ladder — in this order, no improvising

1. Allocation donut chart → plain table *(already assumed)*
2. `deepseek-v4-flash` pre-extraction pass → feed raw docs to `pro`
3. `LendingAdapter` → ship with two adapters (RWA + Idle)
4. Frontend deposit/withdraw → read-only dashboard, demo deposits via cast/script
5. IPFS pin → store reasoning JSON in the repo, on-chain hash still verifies

**Never cut, at any point:** the deployed contracts, the policy revert tests, the on-chain
decision history, or the Decision Log screen. Those four are the submission.

---

## 16. Submission checklist

- [ ] AI element in the product design — the allocation agent
- [ ] **Deployed on X Layer testnet during the hackathon** (chainId 1952)
- [ ] Public repo, clean commit history, thorough README — AI judges review code
- [ ] Real on-chain transaction history — many rebalance epochs, not one
- [ ] **Dedicated project X account, kept active** through the project's lifetime
- [ ] Launch post on X **mentioning @XLayerOfficial**
- [ ] Google Form submitted by **Aug 21, 23:59 UTC**
- [ ] Mainnet launch commitment stated in the README

**README must contain:** architecture diagram · the LLM-proposes / contract-disposes safety
model · the explicit mock inventory and how each swaps to mainnet · deployed addresses ·
demo video link · how to run the agent locally · **the trust-boundary statement from §9.5**.

---

## 17. On the Launch Grant

It requires $10M cumulative volume through the OKX DEX **interface** (API transactions are
explicitly excluded) by Aug 31 — ten days after submission. A brand-new vault will not hit
$10M. **Treat it as upside; do not design a single decision around it.** Realistic ceiling
is 30k + 50k = 80k USDT.

---

## 18. Open decisions

1. **Rebalance cadence.** Hourly during the hackathon for demonstrable on-chain activity,
   documented as configurable. Recommend hourly.
2. **Team split.** 2+ people: one on contracts (Days 1–2), one on agent (Days 3–4), converge
   on frontend Days 5–6. **Solo: apply cut-ladder items 2 and 3 pre-emptively on Day 0** —
   do not discover on Day 5 that you needed the time.
3. **Second submission.** An OnchainOS Skill packaging the RWA-yield reader is a cheap
   second entry. Day 6 only, and only if genuinely ahead.
