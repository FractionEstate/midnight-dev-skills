# Midnight Network Development Instructions

This document provides GitHub Copilot with comprehensive guidelines for developing privacy-preserving DApps on Midnight Network.

## Priority Guidelines

When generating code for Midnight Network projects:

1. **Privacy First**: Always default to privacy-preserving patterns using zero-knowledge proofs
2. **Version Compatibility**: Use Compact 0.25+, Next.js 16.1.1, and @midnight-ntwrk packages
3. **Context Files**: Reference skills in `.github/skills/` for patterns and examples
4. **Type Safety**: Use comprehensive TypeScript types for all Midnight APIs
5. **Security**: Handle witnesses, secrets, and private state with care

## Technology Stack

### Core Versions
- **Compact**: 0.18+ (pragma compact(">=0.25");
- **Next.js**: 16.1.1 (App Router)
- **TypeScript**: 5.x (strict mode)
- **React**: 19.x (Server Components)

### Midnight Network Packages
```json
{
  "@midnight-ntwrk/dapp-connector-api": "^3.0.0",
  "@midnight-ntwrk/wallet": "^5.0.0",
  "@midnight-ntwrk/wallet-sdk-hd": "latest",
  "@midnight-ntwrk/ledger": "latest",
  "@midnight-ntwrk/zswap": "^4.0.0",
  "@midnight-ntwrk/midnight-js-types": "latest",
  "@midnight-ntwrk/midnight-js-contracts": "latest"
}
```

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
pragma compact(">=0.25");

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
// Hashing
import { hash } from "std";
const commitment = hash(secret_data);

// EC operations (for key management)
import { public_key } from "std";
const pk = public_key(secret_key);

// Coin management
import { send, receive } from "std";
circuit paymentCircuit(): [send(coins), receive(coins)] { ... }
```

## TypeScript Integration

### Wallet Connection Pattern
```typescript
'use client';
import type { DAppConnectorAPI, WalletAPI } from '@midnight-ntwrk/dapp-connector-api';

// Check for wallet availability
declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}

export async function connectWallet(): Promise<WalletAPI | null> {
  const connector = window.midnight;
  if (!connector) {
    console.error('Midnight wallet not installed');
    return null;
  }

  const state = await connector.state();
  if (state.enabledWalletApiVersion === null) {
    await connector.enable();
  }

  const walletApi = await connector.walletAPI();
  return walletApi;
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

```
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
- **Docs**: https://docs.midnight.network - Official documentation
- **Examples**: https://github.com/midnight-ntwrk - Official examples
