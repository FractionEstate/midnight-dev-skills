# Midnight Dev AI Working Notes

**_Privacy-preserving fractional real estate on Midnight Network (CIP-68-inspired NFT fractionalization)_**

## Monorepo Structure

Turborepo + pnpm workspaces with 5 apps and 5 packages:

```tree
apps/
  web/              Next.js 16.1.1 App Router → localhost:3000
  relay-node/       Midnight relay (REST API) → localhost:3001
  block-producer/   Midnight block producer (background)
  api-service/      TaaS API scaffold
  admin-dashboard/  Admin portal (Next.js)
  partner-dashboard/ Partner portal (Next.js)

packages/
  smartcontracts/   10 Compact contracts + CLI
  ui/               Shared React components
  types/            Shared TypeScript types
  config/           ESLint + TS configs
  api-contracts/    API type definitions
```

## Version Matrix (CRITICAL - Midnight compatibility)

```json
{
  "node": ">=22.0.0",
  "pnpm": "8.15.0",
  "compact-cli": "0.3.0",
  "compact-compiler": "0.26.0",
  "compact-language": "0.18.0",
  "nextjs": "16.1.1",
  "react": "19.0.0",
  "@midnight-ntwrk/midnight-js-types": "2.0.2"
}
```

**Always use**: `pragma language_version 0.18;` in `.compact` files.

## Core Workflows

### Development

```bash
pnpm dev          # Start all (web + relay + block-producer)
pnpm dev:web      # Web app only
pnpm dev:nodes    # Nodes only
pnpm build        # Build everything
pnpm lint         # Lint all workspaces
pnpm clean        # Clean artifacts
```

### Smart Contracts (packages/smartcontracts/contract)

**10 contracts** total (8/10 compile, 2 need nested Map workarounds):

```bash
# Compilation (from contract/ dir)
npm run compact:all           # All contracts
npm run compact:core          # fraction-mint, fraction-trade
npm run compact:governance    # property-governance
npm run compact:lending       # lending
npm run compact:institutional # kyc, custody, risk, audit

# Testing
npm run build && npm test     # Full suite
npm test -- src/test/fraction-*.test.ts  # Specific tests
npm test -- --watch           # Watch mode
```

**Contract locations**: `contract/src/*.compact` → compiled to `contract/src/managed/*/contract/*.cjs`

**Test files**: `contract/src/test/*.test.ts` (Vitest) - many need interface updates per CONTRACT-COMPILATION-STATUS.md (internal doc)

### Proof Server (REQUIRED for deployment/transactions)

**Via VS Code task** (preferred):

- "Midnight: Start Proof Server" (Docker, port 6300)
- "Midnight: Check Proof Server Health"

**Manual**:

```bash
docker pull midnightnetwork/proof-server
docker run -p 6300:6300 --rm midnightnetwork/proof-server midnight-proof-server --network testnet
```

Must be running before contract interactions. Check health: `curl http://localhost:6300/health`

## Compact Language Gotchas (0.26 Migration)

**API Changes**:

- ❌ `map.get(key)` → ✅ `map.lookup(key)` (returns `Maybe<T>`)
- ❌ `map.update(k, v)` → ✅ `map.insert(k, v)`
- ❌ `Map::new()`, `Set::new()` → ✅ No constructors needed
- ❌ `let x: Type = value` → ✅ `const x = value as Type`

**Privacy Rules**:

- All `witness` params used in ledger operations need `disclose()`: `ledger.insert(disclose(witnessParam), value)`
- Keep sensitive data in `privateState`, not ledger
- Use `secret` for off-chain, `witness` for ZK-verified inputs

**Type System**:

- Counters are `Uint<16>` by default → cast increments: `count.increment(amount as Uint<16>)`
- Use `Uint<32>` for small numbers, `Uint<64>` for timestamps/large values
- `Bytes<32>` for hashes, `Field` for cryptographic operations
- Division `/` not supported → use multiplication approximations

**Nested Collections**: ❌ `Map<K, Map<K2, V>>` not supported in 0.26 → use composite keys: `Map<Bytes<64>, V>` where key = `hash(k1, k2)`

## Web App (apps/web)

**Next.js 16.1.1 App Router** - strict Server/Client Component split:

- Pages in `src/app/*/page.tsx` (Server by default)
- Client components need `"use client"` directive
- Shared UI from `@fraction-estate/ui` package
- Global styles in `src/app/globals.css` (Tailwind utilities)

**Environment** (create `.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MIDNIGHT_INDEXER=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_MIDNIGHT_RPC=https://rpc.testnet-02.midnight.network
```

**Wallet integration**:

- Check `window.midnight?.mnLace` availability before connecting
- Handle `isEnabled === null` case
- Type all Midnight APIs (see `.github/instructions/midnight-typescript.instructions.md`)

## Midnight Nodes

**Relay Node** (`apps/relay-node`):

- REST API on port 3001
- Uses `.env.example` template for config
- Exposes endpoints for web app

**Block Producer** (`apps/block-producer`):

- Background service
- Requires `.env.example` setup

Both nodes need Midnight Network endpoints from env vars.

## Privacy & Security Defaults

- Never log witness/secret values
- Use `Opaque<"string">` / `Opaque<"Uint8Array">` for off-chain data
- Keep private state in circuit `privateState`, not on ledger
- All wallet operations must check `window.midnight` availability first
- Commitments: `Hash(secret + nonce)` pattern for ZK proofs

## Architecture Context

**Business Model**: CIP-68-inspired NFT fractionalization (Property NFT → fungible fraction tokens)

**10 Smart Contracts**:

1. property-registry (NFT minting) ✅
2. fraction-mint (fractionalization) ✅
3. fraction-trade (P2P marketplace) ✅
4. property-governance (anonymous voting) ✅
5. lending (collateralized loans) ✅
6. tokenization-service (TaaS) ⚠️ needs privacy fixes
7. kyc-verification (KYC/AML) ✅
8. institutional-custody ⚠️ needs nested Map workaround
9. risk-management (circuit breakers) ✅
10. audit-trail (compliance) ⚠️ has 1 remaining `.get()` call

See COMPACT-0.26-MIGRATION-STATUS.md (internal doc) for detailed status.

## Key Reference Files

**Architecture**:

- README.md - Full feature list and architecture (main monorepo)
- ARCHITECTURE.md - Detailed system design (main monorepo)
- CONTRACT-COMPILATION-STATUS.md - Current compilation state (internal doc)

**Instructions** (file-pattern rules): `.github/instructions/*.instructions.md`

- `compact.instructions.md` - Compact language rules
- `midnight-typescript.instructions.md` - Midnight API usage
- `nextjs.instructions.md` - App Router patterns
- `privacy-patterns.instructions.md` - ZK best practices
- `testing.instructions.md` - Test patterns

**Skills** (worked examples): `.github/skills/*/SKILL.md`

- Compact, Next.js, privacy patterns, testing, Playwright, Prisma, Tailwind, Turborepo

**Agents/Prompts**: `.github/AGENTS.md` + `.github/agents/*.agent.md` + `.github/prompts/*.prompt.md`

## Testing

**Contracts**: Vitest (`packages/smartcontracts/contract/vitest.config.ts`)

- Many tests need updates for new compiled interfaces (see CONTRACT-COMPILATION-STATUS.md)
- Run specific suites with `-- src/test/pattern*.test.ts`

**E2E**: Playwright (see `.github/skills/playwright/SKILL.md`)

**Keep runtimes short** - prefer targeted test files over full suites during development.

## Code Quality

- ESLint: `apps/*/eslint.config.cjs`, `packages/*/eslint.config.*`
- Prettier: Root config applies to all `**/*.{ts,tsx,md,json}`
- Format: `pnpm format` (auto-fix) or `pnpm format:check`
- **No auto-reflows** - preserve existing formatting
- pnpm lockfile managed at workspace root only

## Migration Status (Current)

**Compact 0.26**: 8/10 contracts compile cleanly. 2 blocked on:

1. `tokenization-service.compact` - needs ~50 `disclose()` additions
2. `audit-trail.compact` - 1 remaining `.get()` → `.lookup()` fix

**Tests**: Most test files need simulator updates for new contract interfaces (missing ledger properties, renamed circuits, changed signatures).

See migration docs for details before making contract changes.
