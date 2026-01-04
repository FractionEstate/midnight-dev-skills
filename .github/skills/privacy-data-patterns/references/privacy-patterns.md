# Privacy Patterns Reference

Comprehensive reference for privacy-preserving patterns in Midnight/Compact.

## Commitment Schemes

### Pedersen-style Commitment

```compact
// commitment = H(value || randomness)
witness value: Field;
witness randomness: Field;

circuit commit(): Field {
  return persistentCommit(value, randomness);
}

circuit verify(commitment: Field): Boolean {
  return persistentCommit(value, randomness) == commitment;
}
```

### Hash Commitment (Simpler)

```compact
// For non-secret randomness
circuit hashCommit(value: Uint<64>, nonce: Field): Field {
  return persistentHash(value, nonce);
}
```

### Multi-Value Commitment

```compact
struct SecretData {
  field1: Field,
  field2: Uint<64>,
  field3: Boolean
}

witness secretData: SecretData;
witness randomness: Field;

circuit commitStruct(): Field {
  // Commit to entire struct
  return persistentHash(
    secretData.field1,
    secretData.field2,
    secretData.field3,
    randomness
  );
}
```

## Nullifier Constructions

### Basic Nullifier

```compact
// nullifier = H(secret || commitment)
witness secret: Field;

circuit computeNullifier(commitment: Field): Field {
  return transientHash(secret, commitment);
}
```

### Domain-Separated Nullifier

```compact
// Prevent cross-contract nullifier reuse
circuit domainNullifier(commitment: Field, domain: Opaque<"string">): Field {
  return transientHash(secret, commitment, domain);
}
```

### Sequential Nullifier

```compact
// For sequential spending
witness secret: Field;
witness spendCount: Uint<32>;

circuit sequentialNullifier(commitment: Field): Field {
  return transientHash(secret, commitment, spendCount);
}
```

### Double-Nullifier (Revocation)

```compact
// One nullifier for spending, one for revocation
circuit spendNullifier(commitment: Field): Field {
  return transientHash(secret, commitment, "spend");
}

circuit revokeNullifier(commitment: Field): Field {
  return transientHash(secret, commitment, "revoke");
}
```

## Merkle Proof Patterns

### Standard Membership Proof

```compact
ledger tree: MerkleTree<20, Field>;

witness proof: Vector<20, Field>;
witness indices: Vector<20, Boolean>;
witness leaf: Field;

circuit verifyMembership(): Boolean {
  let current = leaf;

  for i in 0..20 {
    current = if indices[i] {
      persistentHash(proof[i], current)
    } else {
      persistentHash(current, proof[i])
    };
  }

  return current == tree.root();
}
```

### Non-Membership Proof

```compact
// Prove element is NOT in sorted tree
witness leftNeighbor: Field;
witness rightNeighbor: Field;
witness leftProof: Vector<20, Field>;
witness rightProof: Vector<20, Field>;

circuit verifyNonMembership(element: Field): Boolean {
  // Prove both neighbors are in tree
  assert verifyMembershipFor(leftNeighbor, leftProof);
  assert verifyMembershipFor(rightNeighbor, rightProof);

  // Element would be between them if in tree
  assert leftNeighbor < element;
  assert element < rightNeighbor;

  // But it's not
  return true;
}
```

### Historic State Proof

```compact
ledger tree: HistoricMerkleTree<20, Field>;

// Prove membership at specific point in time
circuit verifyHistoricMembership(
  element: Field,
  atRoot: Field
): Boolean {
  assert tree.wasRoot(atRoot);
  return verifyMembershipAt(element, atRoot);
}
```

## Witness Patterns

### Structured Witness

```compact
// Group related private inputs
struct PrivateInput {
  secret: Field,
  amount: Uint<64>,
  nonce: Field
}

witness privateInput: PrivateInput;

circuit usePrivateInput(): [] {
  // Access fields
  const s = privateInput.secret;
  const a = privateInput.amount;
  const n = privateInput.nonce;
}
```

### Optional Witness

```compact
// Witness that may or may not be provided
witness maybeValue: Maybe<Field>;

circuit handleOptional(): [] {
  match maybeValue {
    Maybe::Some(value) => {
      // Use value
    },
    Maybe::None => {
      // Handle missing
    }
  }
}
```

### Witness Array

```compact
// Fixed-size array of private values
witness secrets: Vector<10, Field>;

circuit processSecrets(): Field {
  let result = Field::from(0);
  for i in 0..10 {
    result = persistentHash(result, secrets[i]);
  }
  return result;
}
```

## Selective Disclosure Patterns

### Binary Property Disclosure

```compact
witness age: Uint<8>;
ledger ageCommitment: Field;

// Disclose only binary result
circuit proveAdult(): Boolean {
  const isAdult = age >= 18;
  disclose(isAdult);  // Only true/false is public
  return isAdult;
}
```

### Range Disclosure

```compact
witness income: Uint<64>;
ledger incomeCommitment: Field;

// Disclose income bracket, not exact value
export circuit discloseBracket(): Uint<8> {
  assert persistentHash(income, randomness) == incomeCommitment;

  const bracket = if income < 50000 { 1 }
    else if income < 100000 { 2 }
    else if income < 200000 { 3 }
    else { 4 };

  disclose(bracket);
  return bracket;
}
```

### Equality Disclosure

```compact
witness value1: Field;
witness value2: Field;

// Prove two hidden values are equal
circuit proveEquality(): Boolean {
  const equal = value1 == value2;
  disclose(equal);
  return equal;
}
```

### Threshold Disclosure

```compact
witness balance: Uint<64>;

// Prove balance >= threshold
circuit proveMinBalance(threshold: Uint<64>): Boolean {
  const meetsThreshold = balance >= threshold;
  disclose(meetsThreshold);
  return meetsThreshold;
}
```

## Privacy Composition Patterns

### Commit-Then-Prove

```compact
// Phase 1: Commit
export circuit commitToValue(): Field {
  const commitment = persistentCommit(secretValue, randomness);
  commitments.insert(commitment);
  return commitment;
}

// Phase 2: Prove property about committed value
export circuit proveProperty(commitment: Field): [] {
  // Verify commitment
  assert persistentCommit(secretValue, randomness) == commitment;
  assert commitments.member(commitment);

  // Prove property
  assert secretValue > 100;
}
```

### Private Transfer

```compact
// Sender's commitment: C_in
// Receiver's commitment: C_out
// Public: amounts sum to zero

witness inAmount: Uint<64>;
witness outAmount: Uint<64>;
witness inRandom: Field;
witness outRandom: Field;

circuit privateTransfer(
  inputCommitment: Field,
  outputCommitment: Field
): [] {
  // Verify input commitment
  assert persistentCommit(inAmount, inRandom) == inputCommitment;

  // Verify output commitment
  assert persistentCommit(outAmount, outRandom) == outputCommitment;

  // Conservation (public check)
  assert inAmount == outAmount;
}
```

### Ring Signature Style

```compact
// Prove ownership by one of N keys without revealing which
ledger keyRing: Vector<10, Field>;

witness myIndex: Uint<8>;
witness mySecret: Field;

circuit ringProve(): [] {
  // Verify I know secret for one key in ring
  assert persistentHash(mySecret) == keyRing[myIndex];

  // Index and secret stay private
  // Only proves "some key in ring"
}
```

## Error Handling in Privacy Circuits

```compact
// Assertions fail proof, not execution
circuit safePrivacyCheck(value: Field): Maybe<Boolean> {
  // Can't use assert for recoverable errors
  // Must return success/failure

  if validCondition(value) {
    return Maybe::Some(true);
  } else {
    return Maybe::None;
  }
}

// For hard failures, assert
circuit hardPrivacyCheck(value: Field): [] {
  assert validCondition(value);  // Proof fails if false
}
```

## Security Considerations

### Replay Protection

```compact
// Always use unique nullifiers
ledger usedNullifiers: Set<Field>;

circuit antiReplay(commitment: Field): [] {
  const nullifier = transientHash(secret, commitment);
  assert !usedNullifiers.member(nullifier);
  usedNullifiers.insert(nullifier);
}
```

### Randomness Quality

```compact
// Use sufficient randomness (at least 128 bits)
witness randomness: Field;  // ~254 bits, good

// For multiple uses, derive from single source
witness masterRandom: Field;
const random1 = persistentHash(masterRandom, "use1");
const random2 = persistentHash(masterRandom, "use2");
```

### Side Channel Awareness

```compact
// Avoid data-dependent branches where possible
// BAD: reveals something about secret
if secretValue > threshold {
  publicAction1();
} else {
  publicAction2();
}

// BETTER: compute both, select privately
const result1 = computeAction1();
const result2 = computeAction2();
const result = if secretValue > threshold { result1 } else { result2 };
```

## Pattern Selection Guide

| Need | Pattern | Complexity |
|------|---------|------------|
| Hide value, prove later | Commitment | Low |
| Prevent double-use | Nullifier | Low |
| Prove set membership | Merkle Proof | Medium |
| Anonymous identity | Ring-style | Medium |
| Private transfer | Commit+Nullifier | Medium |
| Selective reveal | Disclosure | Low |
| Time-bound proof | Historic Merkle | High |

## Testing Privacy Patterns

```typescript
// Test commitment
const { commitment, randomness } = generateCommitment(value);
await contract.commit(commitment);
const result = await contract.reveal(value, randomness);
expect(result.verified).toBe(true);

// Test nullifier
const nullifier = computeNullifier(secret, commitment);
await contract.spend(commitment);
// Second spend should fail
await expect(contract.spend(commitment)).rejects.toThrow();

// Test Merkle proof
const proof = generateMerkleProof(tree, element);
const verified = await contract.verifyMembership(proof);
expect(verified).toBe(true);
```
