# Dense UI System and RainbowKit Login

## Scope

Standardize spacing and table/card structure across existing dashboard screens, then replace the custom wallet dialog with a dedicated RainbowKit-backed login route. Preserve existing product behavior, primary orange, compact typography, demo mode, and contract transaction flows.

## Visual system

- Body text remains `0.8125rem`; rendered text stays within `0.75rem` to `1rem` and weight `400` to `600`.
- Borders use the existing low-contrast `line` token. Borders separate regions; shadows remain limited to outer frames and elevated cards.
- Page sections use one consistent vertical rhythm: page identity, section/card, subsequent section.
- Card content uses stable slots rather than page-specific margin chains:
  - `Card`: surface, radius, border, optional elevation.
  - `CardHeader`: title, description, action with consistent horizontal and vertical padding.
  - `CardContent`: consistent padding and internal gaps.
  - `CardFooter`: optional divided action area.
- Existing `Panel` API remains as a compatibility wrapper or is migrated without changing semantics.
- Architecture cards use icon/index row, then a compact but clearly separated title/description block.
- Policy controls use shared card slots. Labels, fields, progress, presets, summary cells, and result callout receive consistent gaps.

## Table system

Create composable native table primitives modeled after the supplied API:

- `Table`, `TableHeader`, `TableBody`, `TableFooter`
- `TableRow`, `TableHead`, `TableCell`, `TableCaption`

Requirements:

- `data-slot` attributes on every primitive.
- Responsive horizontal scroll container in `Table`.
- `0.8125rem` base table text and tabular numeric support.
- Compact rows with consistent `0.625rem` to `0.75rem` cell padding.
- Very light horizontal and optional vertical separators.
- Muted header background, medium-weight header labels, hover and selected states.
- Accessible native table semantics; no ARIA replacement for native roles.
- Reuse across Contracts, Decisions, Vault allocation, Sources, and any remaining hand-built tabular rows where native table markup is appropriate.
- Key/value lists that are not relational tables keep list semantics but reuse shared row spacing.

## RainbowKit connection login

Install `@rainbow-me/rainbowkit` with the existing Wagmi, Viem, React Query, and Bun stack. Configure supported Hardhat and X Layer chains through RainbowKit's Wagmi configuration and import RainbowKit styles once in the client provider boundary.

Create a real `/login` page in an auth route group. It contains product identity, short custody explanation, network context, and a RainbowKit-powered connect action. It does not use the existing custom application dialog. RainbowKit may open its own wallet-selection modal after the user presses connect.

Use a client `WalletGate` around application content:

- Disconnected live user visiting an application route is redirected to `/login?next=<path>`.
- Connected user visiting `/login` is redirected to the validated same-origin `next` route or default dashboard route.
- Disconnect returns the user to `/login`.
- Demo mode exposes an explicit `Enter demo` action and preserves deterministic demo state.
- Connection state hydration shows a compact loading shell to prevent redirect flicker.

`proxy.ts` cannot securely validate a client wallet connection without SIWE. It will only normalize route access and keep `/login` public; actual connection gating remains client-side. No forgeable cookie will be presented as authentication.

Intercepting or parallel routes are not used for login because they create modal/overlay behavior that conflicts with the requested dedicated page. Route groups separate auth and application layouts cleanly.

## Component boundaries

- `src/components/ui/card.tsx`: shared card slots.
- `src/components/ui/table.tsx`: shared native table primitives.
- `src/components/auth/wallet-gate.tsx`: connection-aware routing only.
- `src/components/auth/login-screen.tsx`: login presentation and RainbowKit trigger.
- `src/app/(auth)/login/page.tsx`: dedicated route.
- `src/app/providers.tsx`: RainbowKit provider composition.
- `src/lib/chain/config.ts`: RainbowKit/Wagmi chain configuration.

## Error and edge handling

- Missing WalletConnect project ID keeps injected-wallet support and displays concise configuration guidance where needed.
- Unsupported chain uses RainbowKit's chain switch state.
- User rejection leaves login screen stable and retryable.
- `next` accepts only local paths beginning with one `/`; external and protocol-relative values fall back to the dashboard.
- Client gating is navigation control, not server authorization. API and contract security remain independent.

## Verification

- Typecheck and production build.
- Component tests for table class composition and safe `next` parsing.
- Wallet gate tests for disconnected, connecting, connected, demo, and disconnect states.
- Browser checks at narrow and wide viewports for Architecture, Policy, Contracts, Decisions, Vault, Sources, and login.
- Keyboard and focus checks for login action, RainbowKit modal, table links/actions, and horizontal overflow.

## Non-goals

- No SIWE signature/session.
- No database-backed user account.
- No new analytics, charts, tables, or product features unrelated to existing information.
- No primary color change.
