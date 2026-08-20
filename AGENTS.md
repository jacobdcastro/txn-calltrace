# AGENTS.md

## Cursor Cloud specific instructions

`txn-calltrace` is a single Next.js 15 (App Router, React 19, TypeScript) app managed with
pnpm. It has no database or other local backing services — it is one Next.js process that
talks to two external HTTP APIs. Standard scripts live in `package.json` (`dev`, `build`,
`start`, `test`, `lint`); the update script already runs `pnpm install`.

### Required environment variables
- `NEXT_PUBLIC_QUICKNODE_RPC_URL` and `ETHERSCAN_API_KEY` are read lazily via Effect `Config`
  when a live service layer is provided (not at module import). Missing values fail as a
  tagged `ConfigError` at runtime.
- The update script auto-creates two gitignored env files if missing (they hold no real
  secrets): `.env.test` (dummy values, consumed by `jest.setup.ts`) and `.env.local`
  (used by `pnpm dev`). Delete a file and re-run the update script to regenerate it.
- If you set real credentials via the Secrets panel, those injected env vars take precedence
  over the `.env*` files (Next.js and dotenv do not override already-set env vars).
- Effect unit tests inject config and HTTP via `Layer` overrides, so they do not depend on
  live credentials. `.env.test` remains for any code that still reads `process.env` directly.

### RPC endpoint notes
- The RPC must support `debug_traceTransaction` with the `callTracer` tracer. The free public
  endpoint `https://eth.drpc.org` supports it and is used as the default in `.env.local`.
  `publicnode`, `cloudflare-eth`, and `ankr` (keyless) do **not** support the debug namespace.
- Swap in a real QuickNode endpoint via `.env.local` for production-grade rate limits.

### Etherscan is degraded (pre-existing code issue, not an env issue)
- The code calls the deprecated Etherscan **V1** endpoint `https://api.etherscan.io/api`, which
  now returns `NOTOK` ("switch to Etherscan API V2") regardless of key. `getVerifiedContract`
  therefore throws, but `enhanceCallTraceWithVerifiedSource` catches it silently, so the raw
  call-trace tree still renders — only contract names / decoded params are missing. A real
  `ETHERSCAN_API_KEY` will NOT fix decoding until the code is migrated to Etherscan V2.

### Running / testing
- Dev server: `pnpm dev` (Turbopack) on port 3000. Hello-world: open `/`, paste a mainnet tx
  hash, click "Decode Transaction" to render the recursive call-trace tree.
- Tests: `pnpm test` (Jest + ts-jest, requires `.env.test`).
- Lint: `pnpm lint` is **not configured** — the repo ships no ESLint config, so `next lint`
  only offers an interactive setup prompt and exits non-zero. Do not rely on it in CI/automation
  unless an ESLint config is added first.
