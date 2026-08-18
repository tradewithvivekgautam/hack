# Data Sources

## Corpus contract

Every source becomes:

```ts
type SourceDocument = {
  id: string;
  kind: SourceKind;
  title: string;
  sourceUrl: string;
  publishedAt: string;
  fetchedAt: string;
  text: string;
  contentHash: `0x${string}`;
  stale: boolean;
  staleReason?: string;
};
```

The content hash covers extracted text. The reasoning envelope stores metadata and hashes, while the full source text is supplied to the model but omitted from the on-chain decision memo to keep it compact.

## Supported source forms

- local Markdown and text;
- local or remote JSON;
- HTML with scripts/styles removed;
- PDF text through `unpdf`;
- normalized X Layer vault/adapter state;
- recent registry decisions;
- authenticated OKX DEX aggregator quote.

## Controls

- 12 MB maximum fetched file;
- 300,000-character extraction cap;
- 15-second default HTTP timeout;
- two bounded retries for transient HTTP failures;
- source-specific freshness window;
- last-known-good cache with stale reason;
- minimum three external/corpus sources before generated chain/history documents;
- exact UTF-8 content hash.

## Included demonstration corpus

| Source | Role | Freshness window |
|---|---|---:|
| Tokenized treasury factsheet | duration, NAV, yield, redemption facts | 168 hours |
| Private-credit surveillance memo | collateral and non-accrual risk | 72 hours |
| Rate statement | macro/rate regime | 720 hours |
| OKX liquidity fixture | exit-risk demonstration when credentials are absent | 6 hours |
| Live chain state | balances, APYs, policy | generated each epoch |
| Recent decision history | allocation continuity | generated each epoch |

The OKX fixture is deliberately marked stale after six hours. It is not silently presented as live. When credentials and token addresses are configured, the authenticated source is added and the newest valid liquidity observation populates the normalized market snapshot.

## OKX integration

The integration is read-side and risk-oriented. The agent asks, “Can the RWA token be exited at the target notional, and what price impact is observed?” It does not route a testnet rebalance through the aggregator. X Layer mainnet uses chain index `196`; the testnet vault uses same-asset mocks.

## Adding a source

1. Add it to `corpus/sources.json` or implement `DocumentSource`.
2. Choose a stable ID that the model can cite.
3. Define a realistic freshness window.
4. Ensure extraction is deterministic and bounded.
5. Add a source/cache failure test.
6. Do not include secrets or licensed material that cannot be republished.
