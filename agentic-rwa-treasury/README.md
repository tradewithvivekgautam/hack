# Arca — Agentic RWA Treasury

> **The LLM proposes. The contract disposes.**

Arca is an ERC-4626 savings vault for X Layer. Depositors supply mUSDC and receive `rtUSD` shares. An off-chain allocation agent reads fund factsheets, credit surveillance, rate material, live adapter state, recent decisions, and OKX DEX exit-liquidity observations. It emits a structured three-strategy allocation memo. The on-chain policy either accepts the proposal inside immutable limits or reverts before any capital moves. The exact canonical memo is stored on IPFS and its `keccak256` hash is recorded with the executed weights, CID, timestamp, agent, and vault assets.

**Pitch:** an AI portfolio manager for tokenized real-world assets where every executed decision is independently auditable on-chain.

## What ships

- ERC-4626 deposit, mint, withdraw, and redeem flows with yield-bearing `rtUSD` shares.
- Three same-asset strategy adapters: tokenized RWA yield, DeFi lending, and idle reserve.
- Atomic two-phase rebalancing: withdraw every excess sleeve, then fund every deficit.
- Deterministic policy enforcement:
  - exactly three fixed strategies;
  - weights sum to 10,000 basis points;
  - maximum 60% in one strategy;
  - maximum 20% one-way portfolio turnover per rebalance;
  - one-hour cooldown;
  - only `AGENT_ROLE` may request a rebalance.
- Append-only decision registry with the exact reasoning hash and IPFS CID.
- Browser-side exact-byte verification: fetch, hash, compare, then parse and render.
- A fail-closed TypeScript agent with DeepSeek, Modal, Ollama, and fixture providers.
- File, HTTP, HTML, JSON, PDF, chain-state, decision-history, and OKX liquidity sources.
- Source hashing, freshness limits, bounded retries, size limits, and last-known-good fallback.
- A responsive, condensed Next.js application with Vault, Decision Log, Data Sources, and Protocol views.
- A deterministic demo mode with 71 complete decision epochs and no wallet/API requirements.
- Contract, shared-domain, agent, component, and Playwright test suites.

## Repository map

```text
agentic-rwa-treasury/
├── apps/
│   ├── web/                  Next.js 16.3.1 product interface
│   └── agent/                TypeScript allocation worker
├── contracts/                Solidity contracts, deployment scripts, tests
├── packages/shared/          Schemas, policy math, chains, ABIs, canonical hashing
├── deployments/              Chain-specific deployment receipts
├── docs/                     Architecture, security, operations, UI, demo
├── infra/modal/              Optional self-hosted DeepSeek V4 runtime
└── scripts/                  Deployment sync, cleanup, repository validation
```

The project intentionally has only four code boundaries. UI concerns stay in `apps/web`, agent orchestration stays in `apps/agent`, on-chain custody and policy stay in `contracts`, and genuinely shared deterministic types stay in `packages/shared`.

## Technology

| Layer | Stack |
|---|---|
| Web | Next.js 16.3.1, React 19, Tailwind CSS v4, Base UI, TanStack Query, Form, Pacer, Table v9 beta, Virtual, wagmi, viem, Lucide, date-fns, Zod |
| Agent | Node.js 22.16+, TypeScript, OpenAI SDK, DeepSeek-compatible strict tools, Zod, viem, unpdf, Cheerio, Croner, Pacer-style bounded execution primitives |
| Contracts | Solidity 0.8.24, OpenZeppelin 5, ERC-4626, AccessControl, Pausable, ReentrancyGuard, Hardhat 3, viem |
| Integrity | RFC-style canonical JSON, UTF-8 `keccak256`, IPFS/Pinata, X Layer decision registry |
| Optional inference | DeepSeek hosted API, Modal-hosted open-weight DeepSeek, local Ollama |

## Start in deterministic demo mode

Requirements:

- Node.js 22.16 or newer
- npm 10 or newer

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run validate
npm run dev
```

Open `http://localhost:3000`. Demo mode supports:

1. connecting a deterministic demo wallet;
2. claiming mUSDC;
3. depositing and withdrawing through ERC-4626 accounting;
4. inspecting 71 decision epochs;
5. verifying a committed memo in the browser;
6. running the malicious 80% allocation through the policy simulator.

No private key, RPC write access, model key, IPFS account, or database is needed for this mode. The copied web environment file is optional in demo mode, but makes the mode explicit.

## Run the complete local protocol

Start the persistent Hardhat node and copy the private key of its first printed account. The default deployment assigns that account `AGENT_ROLE` for local development.

```bash
# terminal 1
npm run contracts:node

# terminal 2
npm run contracts:deploy:local
npm run local:configure -- 0x<PRIVATE_KEY_PRINTED_BY_HARDHAT_NODE>

# terminal 3
npm run dev:web

# terminal 4 — one deterministic proposal against the live local contracts
npm run agent:epoch
```

`local:configure` validates `deployments/chain-31337.json`, synchronizes it into the shared/web generated configuration, writes a live chain-31337 web environment, and writes an agent environment using the fixture model plus the real local chain. The web IPFS route reads the agent's local content-addressed store, so the browser Verify action exercises the exact on-chain CID/hash loop without Pinata.

For a real model, change only `AGENT_PROVIDER` and the corresponding provider credentials in `apps/agent/.env`. The contract policy and submission path remain unchanged.

## Container builds

The web and agent images are deliberately separate so the browser service never receives the agent private key or model credentials.

```bash
npm run docker:web
npm run docker:agent
```

The web image uses Next.js standalone output. The agent image runs the compiled hourly worker as an unprivileged user and persists local cache/diagnostics only under `apps/agent/.data`.

## X Layer testnet

1. Fund the deployer with testnet OKB.
2. Copy `contracts/.env.example` to `contracts/.env` and configure the deployer, admin, and dedicated agent address.
3. Deploy and sync:

```bash
npm run contracts:deploy:testnet
npm run deployment:sync -- 1952
```

4. Copy the receipt addresses into `apps/web/.env.local` and `apps/agent/.env`.
5. Set `NEXT_PUBLIC_APP_MODE=live` and `CHAIN_MODE=live`.
6. Run the web app and agent worker.

The testnet adapters are honest mocks with production-shaped interfaces. All use mUSDC so rebalancing is transfer-based rather than swap-based. Mainnet adapter replacement points are documented in [Deployment](docs/DEPLOYMENT.md).

## Agent modes

### Fixture

```env
AGENT_PROVIDER=fixture
CHAIN_MODE=fixture
IPFS_PROVIDER=local
```

Runs the complete gather → propose → validate → live preflight → pin/read-back → exact simulation → submit pipeline deterministically.

### DeepSeek hosted API

```env
AGENT_PROVIDER=deepseek
AGENT_MODEL=deepseek-v4-pro
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com/beta
```

The provider forces `propose_allocation`, enables strict tool schema enforcement, and still parses the result with Zod. Model output is never used raw.

### Modal self-hosted

Deploy `infra/modal/deepseek_v4.py`, then configure:

```env
AGENT_PROVIDER=modal
AGENT_MODEL=deepseek-ai/DeepSeek-V4
MODAL_BASE_URL=https://<workspace>--<app>.modal.run/v1
MODAL_API_KEY=...
```

Modal is a portability proof and controlled self-host path. The safety boundary is unchanged because the provider cannot custody funds or bypass Solidity.

### Ollama

```env
AGENT_PROVIDER=ollama
AGENT_MODEL=<openai-compatible-local-model>
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
```

## Decision integrity

The integrity path is deliberately simple:

```text
structured proposal
  → Zod validation
  → policy pre-check
  → canonical reasoning envelope
  → exact UTF-8 bytes
  → keccak256(bytes)
  → simulateContract with a deterministic preflight CID
  → pin exact bytes
  → read-back and hash verification
  → simulateContract with the real CID
  → rebalance(weights, hash, CID)
  → DecisionRecorded
```

The browser repeats the critical verification without trusting the agent database:

```text
read CID + hash from registry
  → fetch raw IPFS text
  → hash raw UTF-8 text
  → compare hashes
  → parse only after comparison
```

This proves **integrity**: the memo shown is the memo committed with the allocation. It does not claim cryptographic proof that a particular hosted inference server generated the memo.

## Security model

A fully compromised agent key can propose only a policy-valid allocation. It cannot:

- withdraw user assets;
- select arbitrary strategy addresses;
- choose a receiver;
- change the strategy set;
- exceed concentration or turnover limits;
- bypass the cooldown;
- write directly to the registry;
- change governance roles;
- move capital while the vault is paused.

See [SECURITY.md](SECURITY.md) and [Threat Model](docs/THREAT_MODEL.md).

## Quality gates

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

The CI workflow runs validation, formatting, type checking, unit/contract tests, production builds, and browser tests. No claim of production safety should be made until every gate passes in the target environment and the contracts receive an independent audit.

## Deliberate exclusions

This hackathon build does not include a governance token, cross-chain routing, KYC UI, multi-agent orchestration, custom AMM, production RWA custody, or mobile application. Those features do not strengthen the core judged loop:

```text
deposit → reason → constrain → rebalance → verify → withdraw
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Agent pipeline](docs/AGENT.md)
- [Data sources](docs/DATA_SOURCES.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)
- [UI system](docs/UI_SYSTEM.md)
- [Demo script](docs/DEMO_SCRIPT.md)
- [Engineering decisions](docs/DECISIONS.md)

## Status and disclaimer

This repository is a complete hackathon implementation and reference architecture. The strategy contracts are testnet mocks, the contracts have not been independently audited, and the software must not be used with real capital without production adapters, formal operational controls, legal review, and a professional security audit.
