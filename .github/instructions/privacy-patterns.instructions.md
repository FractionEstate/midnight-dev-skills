---
description: Privacy-preserving code patterns for zero-knowledge proofs
name: Privacy Patterns
applyTo: "**/contracts/**/*.compact,**/lib/privacy/**"
---

# Privacy-Preserving Code Patterns

You are an expert in implementing privacy-preserving patterns using zero-knowledge proofs on Midnight Network.

## Core Privacy Concepts

### Public vs Private Data

| Data Type | Storage | Visibility | Use Case |
| --------- | ------- | ---------- | -------- |
| `secret` | Off-chain | Only owner | Private keys, personal data |
| `witness` | Off-chain | Proven in ZK | Data verified without revealing |
| Public | On-chain (ledger) | Everyone | Commitments, hashes, public state |

### Privacy Decision Tree

```text
Is the data sensitive?
├── No → Store in ledger (public)
└── Yes → Should it be verified?
    ├── No → Use `secret` (off-chain only)
    └── Yes → Use `witness` (ZK proof)
```

## Commitment Schemes

### Hash Commitment

```compact
pragma language_version 0.18;

import CompactStandardLibrary;

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

## Nullifier Patterns

### Basic Nullifier (Prevent Double-Spend)

```compact
ledger {
  nullifiers: Set<Field>
}

export circuit claim(witness secret: Field): [] {
  const nullifier = hash(secret);
  assert(!ledger.nullifiers.member(nullifier), "Already claimed");
  ledger.nullifiers.insert(nullifier);
}
```

### Contextual Nullifier (Per-Contract/Action)

```compact
export circuit claimWithContext(
  witness secret: Field,
  actionType: Uint<8>
): [] {
  // Include context to prevent cross-action replay
  const nullifier = hash2(secret, actionType);
  assert(!ledger.nullifiers.member(nullifier), "Already performed this action");
  ledger.nullifiers.insert(nullifier);
}
```

## Merkle Proofs

### Membership Proof

```compact
ledger {
  members: MerkleTree<256, Field>
}

export circuit proveMembership(
  witness memberSecret: Field,
  witness merkleProof: Vector<256, Field>
): [] {
  const commitment = hash(memberSecret);
  assert(
    ledger.members.verify(commitment, merkleProof),
    "Not a member"
  );
}
```

## Selective Disclosure

### Age Verification (Over 18)

```compact
export circuit proveOver18(
  witness birthYear: Uint<16>,
  currentYear: Uint<16>
): Boolean {
  // Proves age >= 18 without revealing exact age
  const age = currentYear - birthYear;
  return age >= 18;
}
```

### Range Proofs

```compact
export circuit proveInRange(
  witness value: Uint<64>,
  minValue: Uint<64>,
  maxValue: Uint<64>
): Boolean {
  return value >= minValue && value <= maxValue;
}
```

## Privacy Anti-Patterns (Avoid!)

### ❌ Exposing Witnesses

```compact
// WRONG: Returns the witness
export circuit getSecret(witness s: Field): Field {
  return s;  // Leaks the secret!
}
```

### ❌ Weak Nullifiers

```compact
// WRONG: Predictable nullifier
export circuit claim(userId: Uint<32>): [] {
  const nullifier = hash(userId);  // Anyone can compute!
}
```

### ❌ Commitment Without Salt

```compact
// WRONG: Low entropy
export circuit commit(witness value: Uint<8>): Field {
  return hash(value);  // Only 256 possible values!
}
```

## Best Practices

1. **Always salt commitments**: Use `hash2(value, salt)` not `hash(value)`
2. **Include context in nullifiers**: Prevent cross-contract/action replay
3. **Never return witnesses**: Return hashes or booleans instead
4. **Use appropriate bit widths**: Balance privacy with proof size
5. **Document privacy guarantees**: What is hidden? What is revealed?
