# Engineering Decisions

## Non-upgradeable contracts

Chosen to keep the hackathon trust surface small. Production migration can deploy a new vault rather than hiding mutable logic behind a proxy during judging.

## Same-asset testnet adapters

Chosen to demonstrate real capital movement and atomic rebalancing without pretending a testnet swap or RWA market exists. Mainnet replacement is interface-based.

## Registry and IPFS instead of application database

The chain is the authoritative decision index and IPFS is the authoritative memo body. SQLite stores optional diagnostics only. This prevents the frontend and chain from presenting divergent histories.

## Semantic strategy IDs

The model emits `rwa`, `lending`, and `idle`. Address mapping belongs to trusted configuration and immutable contracts. This removes hallucinated/hostile addresses from the model boundary.

## Exact-byte verification

The browser hashes response text before parse/stringify. Canonicalization is used to create the payload; it is not repeated during verification, avoiding false matches or mismatches caused by serialization changes.

## One-way turnover

`Σ|new-old|/2` measures actual portfolio movement rather than double-counting both the source and destination sleeve.

## Provider abstraction without a framework container

A small TypeScript interface is sufficient. A dependency-injection framework, message bus, CQRS layer, and service mesh would add delivery risk without strengthening the security model.

## Feature-oriented web structure

Business UI lives under `features`, reusable visual primitives under `components/ui`, and infrastructure under `lib`/`config`. Components do not fetch arbitrary data directly; query and mutation hooks own I/O.

## Deterministic demo mode

A complete zero-secret mode guarantees the judged UI remains navigable even when wallets, faucets, gateways, or model providers are unavailable. Live mode uses the same screen contracts and verification implementation.
