# Midnight Network Development Instructions

This document provides GitHub Copilot with comprehensive guidelines for developing
privacy-preserving DApps on Midnight Network.

## Priority Guidelines

When generating code for Midnight Network projects:

1. **Privacy First**: Always default to privacy-preserving patterns using zero-knowledge proofs
2. **Version Compatibility**: Use Compact compiler 0.26.0 (language 0.18.0), Next.js 16.1.1,
   and @midnight-ntwrk packages compatible with each other
3. **Context Files**: Reference skills in `.github/skills/` for patterns and examples
4. **Type Safety**: Use comprehensive TypeScript types for all Midnight APIs
5. **Security**: Handle witnesses, secrets, and private state with care

## Technology Stack

### Web Core Versions

- **Compact**: 0.26.0 compiler / 0.18 language / 0.3.0 dev tools (`pragma language_version 0.18;`)
- **Next.js**: 16.1.1 (App Router)
- **TypeScript**: 5.x (strict mode)
- **React**: 19.x (Server Components)

### Midnight Network Packages

```json
{
  "@midnight-ntwrk/dapp-connector-api": "^3.0.0",
  "@midnight-ntwrk/wallet": "^5.0.0",
  "@midnight-ntwrk/wallet-sdk-hd": "^5.0.0",
  "@midnight-ntwrk/ledger": "^4.0.0",
  "@midnight-ntwrk/zswap": "^4.0.0",
  "@midnight-ntwrk/midnight-js-types": "^2.1.0",
  "@midnight-ntwrk/midnight-js-contracts": "^2.1.0"
}
```

Notes:

- Prefer pinning to known-compatible versions (see the official release notes / compatibility matrix).
- Avoid using `"latest"` in docs or templates, because it can silently break reproducibility.
- The `@midnight-ntwrk/dapp-connector-api` npm page currently points to
  <https://github.com/input-output-hk/midnight-dapp-connector-api> as the upstream source.
  For version compatibility, defer to the Network Support Matrix.

### Network Endpoints (Testnet)

```typescript
const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://localhost:6300"
};
```

## Compact Language Guidelines

### File Structure

```compact
pragma language_version 0.18;

import CompactStandardLibrary;

// Type definitions
struct MyData {
  field1: Uint<32>,
  field2: Boolean
}

// Ledger state
ledger {
  counter: Counter,
  data: Cell<MyData>
}

// Constructor
constructor() {
  ledger.counter.increment(0n);
  ledger.data.write({ field1: 0, field2: false });
}

// Circuits
export circuit myCircuit(secret input: Field, witness w: Field): [] {
  // Private computation with witnesses
  assert(input == w, "Input must match witness");
}

// Impure circuits (affect ledger state - called impure by their use of ledger)
export circuit updateData(data: MyData): [] {
  ledger.data.write(data);
}
```

### Type System Priorities

1. **Use appropriate bit widths**: `Uint<8>`, `Uint<32>`, `Uint<64>`, `Uint<128>`, `Uint<256>`
2. **Field for ZK operations**: Hashing, commitments, and cryptographic proofs
3. **Bytes for raw data**: `Bytes<32>` for hashes, `Bytes<N>` for fixed-length
4. **Boolean for flags**: Simple true/false values
5. **Opaque types** for sensitive data that stays off-chain

### Ledger Types

```compact
// Counter - auto-incrementing values
ledger { counter: Counter }

// Cell - single mutable value
ledger { config: Cell<Config> }

// Map - key-value storage
ledger { balances: Map<Address, Uint<64>> }

// Set - unique elements
ledger { whitelist: Set<Address> }

// MerkleTree - cryptographic commitments
ledger { commitments: MerkleTree<256, Field> }
```

### Standard Library Usage

```compact
// Import the standard library (builtin since v0.13)
import CompactStandardLibrary;

// Hashing
const commitment = hash(secret_data);

// EC operations (for key management)
const pk = public_key(secret_key);

// Disclosure
const public_value = disclose(private_value);

// Coin management
circuit paymentCircuit(): [send(coins), receive(coins)] { ... }
```

## TypeScript Integration

### Wallet Connection Pattern

```typescript
'use client';
import "@midnight-ntwrk/dapp-connector-api";

export async function connectWallet() {
  const connector = window.midnight?.mnLace;
  if (!connector) {
    console.error('Midnight Lace wallet not installed');
    return null;
  }

  try {
    // Request wallet authorization
    const api = await connector.enable();

    // Get wallet state including address
    const state = await api.state();
    console.log('Connected address:', state.address);

    return { api, state };
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return null;
  }
}

// Check if DApp is authorized
async function checkAuthorization() {
  const isEnabled = await window.midnight?.mnLace.isEnabled();
  return isEnabled ?? false;
}
```

### Contract Deployment Pattern

```typescript
import { ContractInstance, deployContract } from '@midnight-ntwrk/midnight-js-contracts';

export async function deployMyContract(
  privateState: PrivateStateProvider,
  publicDataProvider: PublicDataProvider,
  zkConfig: ZKConfigProvider,
  walletApi: WalletAPI
): Promise<ContractInstance> {
  const contractConfig = {
    privateState,
    publicDataProvider,
    zkConfig,
    wallet: walletApi
  };

  return await deployContract({
    contract: MyContract,
    initialState: { /* initial ledger state */ },
    ...contractConfig
  });
}
```

### Transaction Pattern

```typescript
import { Transaction, TransactionId } from '@midnight-ntwrk/midnight-js-types';

export async function submitTransaction(
  tx: Transaction,
  walletApi: WalletAPI
): Promise<TransactionId> {
  const signedTx = await walletApi.signTransaction(tx);
  const result = await walletApi.submitTransaction(signedTx);
  return result.txId;
}
```

## Privacy Patterns

### Commitment Scheme

```compact
// Create commitment (on-chain)
export circuit commit(witness preimage: Field): Field {
  return hash(preimage);
}

// Reveal with proof (on-chain)
export circuit reveal(secret preimage: Field, commitment: Field): [] {
  assert(is_equal(hash(preimage), commitment), "Invalid commitment");
}
```

### Selective Disclosure

```typescript
// Only reveal what's necessary
interface ProofOfAge {
  isOver18: boolean;  // Revealed: yes/no
  // birthDate is NOT revealed - stays private
}

// Generate ZK proof that user is over 18 without revealing exact age
const proof = await generateAgeProof(birthDate, minAge: 18);
```

### Merkle Proof Verification

```compact
export circuit verifyMembership(
  witness leaf: Field,
  witness merkleProof: Vector<256, Field>,
  root: Field
): Boolean {
  // Verify leaf is in tree without revealing position
  return verify_merkle_proof(leaf, merkleProof, root);
}
```

## Best Practices

### Do's ✅

- Use `secret` keyword for private inputs that stay off-chain
- Use `witness` keyword for private data that must be proven
- Validate all user inputs before state changes
- Use proper error messages in assertions
- Keep sensitive data in `privateState`, not ledger
- Use typed providers for all Midnight APIs

### Don'ts ❌

- Never expose secrets in transaction data
- Don't store unhashed sensitive data in ledger
- Avoid large state in Compact (gas costs)
- Don't use `any` types with Midnight APIs
- Never log private keys or witnesses
- Don't skip transaction confirmation checks

## File Organization

```text
my-midnight-dapp/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (Server Component)
│   └── dashboard/
│       └── page.tsx             # Client-side wallet interactions
├── contracts/                    # Compact contracts
│   ├── main.compact             # Main contract
│   └── types.compact            # Shared types
├── lib/
│   ├── midnight/
│   │   ├── client.ts           # Midnight client setup
│   │   ├── providers.ts        # Provider configuration
│   │   └── wallet.ts           # Wallet utilities
│   └── utils/
│       └── proofs.ts           # Proof generation helpers
├── hooks/
│   ├── useMidnightWallet.ts    # Wallet connection hook
│   └── useContract.ts          # Contract interaction hook
└── types/
    └── midnight.d.ts           # Type definitions
```

## Error Handling

```typescript
import { MidnightError, WalletError } from '@midnight-ntwrk/errors';

try {
  await walletApi.submitTransaction(tx);
} catch (error) {
  if (error instanceof WalletError) {
    // Handle wallet-specific errors
    console.error('Wallet error:', error.code, error.message);
  } else if (error instanceof MidnightError) {
    // Handle Midnight network errors
    console.error('Network error:', error.details);
  } else {
    throw error;
  }
}
```

## Documentation Standards

- Always include JSDoc comments for public APIs
- Reference relevant skill files for complex patterns
- Include usage examples in component documentation
- Document privacy implications of each circuit

## Reference Resources

- **Skills**: `.github/skills/` - Comprehensive development guides
- **Docs**: <https://docs.midnight.network> - Official documentation
- **Examples**: <https://github.com/midnight-ntwrk> - Official examples

---

## Web Development Stack

This workspace also supports general full-stack web development with modern tooling.

## Web Technology Stack

### Core Versions

- **Next.js**: 16.1+ (App Router, Turbopack stable)
- **React**: 19.x (Server Components, Suspense)
- **TypeScript**: 5.x (strict mode)
- **Tailwind CSS**: 4.x (CSS-first config)
- **Prisma**: 6.x (Type-safe ORM)
- **Turborepo**: 2.7.2 (Monorepo tooling)
- **Playwright**: 1.49+ (E2E testing)
- **pnpm**: 10.x (Package manager)

## Project Types

### Monorepo Structure (Turborepo)

```text
my-project/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Backend API
├── packages/
│   ├── ui/               # Shared components
│   ├── config/           # Shared configs
│   └── utils/            # Shared utilities
├── turbo.json
└── pnpm-workspace.yaml
```

### Next.js App Router

```text
app/
├── layout.tsx            # Root layout
├── page.tsx              # Home page
├── loading.tsx           # Loading UI
├── error.tsx             # Error boundary
├── (auth)/               # Route group
│   ├── login/page.tsx
│   └── register/page.tsx
└── api/                  # Route handlers
    └── users/route.ts
```

## Skills Reference

| Skill | Path | Use For |
| ----- | ---- | ------- |
| Next.js | `.github/skills/nextjs/` | App Router, Server Components, Data Fetching |
| Tailwind CSS | `.github/skills/tailwindcss/` | Styling, Theming, Components |
| Turborepo | `.github/skills/turborepo/` | Monorepo setup, Caching, CI/CD |
| Prisma | `.github/skills/prisma/` | Database, ORM, Migrations |
| Playwright | `.github/skills/playwright/` | E2E Testing, Visual Regression |

## Instructions Reference

| File | Applies To | Purpose |
| ---- | ---------- | ------- |
| `nextjs.instructions.md` | `app/**/*.tsx` | Next.js patterns |
| `tailwindcss.instructions.md` | `*.css, *.tsx` | Styling guidelines |
| `turborepo.instructions.md` | `turbo.json` | Monorepo config |
| `prisma.instructions.md` | `prisma/**` | Database patterns |
| `playwright.instructions.md` | `e2e/**` | Testing patterns |

## Quick Patterns

### Server Component with Data Fetching

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await prisma.post.findMany();
  return <PostList posts={posts} />;
}
```

### Server Action

```tsx
'use server';
export async function createPost(formData: FormData) {
  await prisma.post.create({ data: { ... } });
  revalidatePath('/posts');
}
```

### Tailwind v4 Theme

```css
@import "tailwindcss";
@theme {
  --color-primary-500: oklch(0.55 0.2 250);
}
```

### Prisma Query

```typescript
const users = await prisma.user.findMany({
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
});
```

### Playwright Test

```typescript
test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL('/about');
});
```

## Agents Reference

| Agent | Purpose |
| ----- | ------- |
| Fullstack Developer | Next.js, Turborepo, React, Prisma, Tailwind |
| API Developer | REST APIs, Server Actions, Authentication |
| UI Designer | Tailwind CSS, Components, Accessibility |
| DevOps Engineer | CI/CD, Docker, Vercel, Turborepo |
| E2E Testing Engineer | Playwright, Visual Testing, Chrome DevTools |
