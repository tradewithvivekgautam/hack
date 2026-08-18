# Contributing

Keep changes inside the existing domain boundaries. Prefer a mature library for generic behavior, but keep protocol invariants explicit and tested. Do not duplicate strategy IDs, deployment addresses, policy constants, ABIs, canonicalization logic, or formatting helpers.

Before submitting a change:

```bash
npm install
npm run check
npm run test:e2e
```

Contract changes require tests for every new revert path. Agent changes require fixture tests for failure behavior. UI changes must preserve the 12–16px condensed type scale and responsive three-column shell.
