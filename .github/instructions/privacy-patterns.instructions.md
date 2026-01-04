---
applyTo: '**/contracts/**/*.compact,**/lib/privacy/**'
---

# Privacy-Preserving Code Patterns

You are an expert in implementing privacy-preserving patterns using zero-knowledge proofs on Midnight Network.

## Core Privacy Concepts

### Public vs Private Data

| Data Type | Storage | Visibility | Use Case |
|-----------|---------|------------|----------|
| `secret` | Off-chain | Only owner | Private keys, personal data |
| `witness` | Off-chain | Proven in ZK | Data verified without revealing |
| Public | On-chain (ledger) | Everyone | Commitments, hashes, public state |

### Privacy Decision Tree

```
Is the data sensitive?
├── No → Store in ledger (public)
└── Yes → Should it be verified?
    ├── No → Use `secret` (off-chain only)
    └── Yes → Use `witness` (ZK proof)
```

## Commitment Schemes

### Hash Commitment
```compact
import { hash } from "std";

// Phase 1: Commit (hide the value)
export circuit commit(witness secret: Field): Field {
  return hash(secret);
}

// Phase 2: Reveal (prove the value)
export circuit reveal(
  secret preimage: Field,
  commitment: Field
): [] {
  assert(is_equal(hash(preimage), commitment), "Invalid commitment");
  // Now we know the preimage without seeing it
}
```

### Pedersen Commitment (Value Hiding)
```compact
// For hiding amounts while proving properties
export circuit commitAmount(
  witness amount: Uint<64>,
  witness blinding: Field
): Field {
  return hash2(amount, blinding);
}
```

## Nullifiers

Prevent double-spending/double-use without revealing which item:

```compact
ledger {
  usedNullifiers: Set<Field>
}

export circuit useOnce(
  witness secret: Field,
  witness commitment: Field
): [] {
  // Generate nullifier from secret
  const nullifier = hash(secret);

  // Check not already used
  assert(!ledger.usedNullifiers.member(nullifier), "Already used");

  // Verify secret corresponds to commitment
  assert(is_equal(hash(secret), commitment), "Invalid proof");

  // Mark as used
  ledger.usedNullifiers.insert(nullifier);
}
```

## Merkle Proofs

Prove membership without revealing position:

```compact
ledger {
  membershipTree: MerkleTree<256, Field>
}

export circuit verifyMembership(
  witness leaf: Field,
  witness proof: Vector<256, Field>,
  witness index: Uint<256>
): Boolean {
  const root = ledger.membershipTree.root();
  return verify_merkle_path(leaf, proof, index, root);
}
```

## Selective Disclosure

### Age Verification (Prove > 18 without revealing age)
```compact
export circuit proveOver18(
  witness birthYear: Uint<16>,
  witness birthMonth: Uint<8>,
  witness birthDay: Uint<8>,
  currentYear: Uint<16>
): Boolean {
  // Calculate age (simplified)
  const age = currentYear - birthYear;

  // Only reveal: is over 18?
  return age >= 18;
}
```

### Balance Verification
```compact
export circuit hasSufficientFunds(
  witness balance: Uint<64>,
  requiredAmount: Uint<64>
): Boolean {
  // Prove balance >= required without revealing exact balance
  return balance >= requiredAmount;
}
```

## Range Proofs

Prove a value is within bounds:

```compact
export circuit proveInRange(
  witness value: Uint<64>,
  minValue: Uint<64>,
  maxValue: Uint<64>
): Boolean {
  assert(value >= minValue, "Below minimum");
  assert(value <= maxValue, "Above maximum");
  return true;
}
```

## Private State Management

### TypeScript Private State Provider
```typescript
import { createPrivateStateProvider } from '@midnight-ntwrk/midnight-js-providers';

// Private state stays encrypted on client
const privateState = createPrivateStateProvider();

// Store sensitive data
await privateState.set('userSecret', secretValue);

// Retrieve for witness generation
const secret = await privateState.get('userSecret');

// Generate ZK proof with secret as witness
const proof = await generateProof(circuit, { witness: secret });
```

## Best Practices

### DO ✅
- Hash all sensitive data before storing in ledger
- Use nullifiers for one-time-use credentials
- Design minimal disclosure proofs
- Store sensitive data in private state
- Use witnesses for data that needs ZK verification

### DON'T ❌
- Store plaintext personal data on ledger
- Reveal more than necessary in proofs
- Use predictable nullifier generation
- Log or expose witness values
- Skip commitment verification

## Privacy Patterns Summary

| Pattern | Use Case | On-Chain | Off-Chain |
|---------|----------|----------|-----------|
| Commitment | Hide-then-reveal | Hash | Preimage |
| Nullifier | Prevent double-spend | Nullifier set | Secret |
| Merkle Proof | Anonymous membership | Root | Leaf + path |
| Range Proof | Value bounds | Min/max | Actual value |
| Selective Disclosure | Partial reveal | Properties | Full data |
