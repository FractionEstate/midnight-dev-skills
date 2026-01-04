# Zero-Knowledge Proof Patterns Reference

Common patterns for implementing privacy-preserving features using ZK proofs.

## Core Concepts

### Public vs Private Data

```text
┌─────────────────────────────────────────────────────────┐
│                    Transaction                          │
├─────────────────────────────────────────────────────────┤
│  PUBLIC (on-chain)          │  PRIVATE (off-chain)      │
│  • Commitments/hashes       │  • Actual values          │
│  • Nullifiers               │  • Witnesses              │
│  • Public parameters        │  • Secrets                │
│  • ZK Proofs                │  • Private state          │
└─────────────────────────────────────────────────────────┘
```

### Commitment Scheme

```text
commit(value, nonce) = hash(value || nonce)

Properties:
• Hiding: commitment reveals nothing about value
• Binding: cannot find different value with same commitment
```

## Pattern 1: Commit-Reveal

Use case: Voting, auctions, sealed bids

```text
Phase 1 (Commit):
  User computes: commitment = hash(vote + random_nonce)
  User submits: commitment (public)
  User keeps: vote, nonce (secret)

Phase 2 (Reveal):
  User submits: vote, nonce (as witness)
  Contract verifies: hash(vote + nonce) == stored_commitment
  Contract records: vote (now public)
```

```compact
// Commit phase
export circuit commit(
  commitmentHash: Field,
  secret value: Field,
  secret nonce: Field
): [] {
  assert(hash(value, nonce) == commitmentHash);
  ledger.commitments.insert(commitmentHash);
}

// Reveal phase
export circuit reveal(
  witness value: Field,
  witness nonce: Field,
  commitmentHash: Field
): [] {
  assert(ledger.commitments.member(commitmentHash));
  assert(hash(value, nonce) == commitmentHash);
  // Process revealed value
}
```

## Pattern 2: Nullifiers (Double-Spend Prevention)

Use case: Token transfers, voting (one person one vote)

```text
nullifier = hash(secret_key + unique_identifier)

Properties:
• Unique per action (prevents replay)
• Doesn't reveal identity (privacy)
• Deterministic (same inputs = same nullifier)
```

```compact
export circuit spend(
  witness secretKey: Field,
  tokenId: Field
): [] {
  // Compute nullifier
  const nullifier = hash(secretKey, tokenId);

  // Check not already spent
  assert(!ledger.nullifiers.member(nullifier), "Already spent");

  // Record nullifier
  ledger.nullifiers.insert(nullifier);
}
```

## Pattern 3: Merkle Tree Membership

Use case: Prove membership without revealing position

```text
         Root
        /    \
       H12    H34
      /  \   /  \
     H1  H2 H3  H4
     |   |  |   |
     L1  L2 L3  L4  (leaves)

Proof for L2: [H1, H34]
Verify: hash(H1, hash(L2)) == H12
        hash(H12, H34) == Root ✓
```

```compact
export circuit proveMembership(
  witness leaf: Field,
  witness proof: Vector<256, Field>,
  witness indices: Vector<256, Boolean>,
  root: Field
): Boolean {
  let current = leaf;

  for i in 0..256 {
    if (indices[i]) {
      current = hash(proof[i], current);
    } else {
      current = hash(current, proof[i]);
    }
  }

  return current == root;
}
```

## Pattern 4: Range Proofs

Use case: Prove value is in range without revealing it

```compact
export circuit proveInRange(
  witness value: Uint<64>,
  minValue: Uint<64>,
  maxValue: Uint<64>
): Boolean {
  // ZK proof that value ∈ [minValue, maxValue]
  assert(value >= minValue, "Below minimum");
  assert(value <= maxValue, "Above maximum");
  return true;
}
```

## Pattern 5: Selective Disclosure

Use case: Prove properties without revealing underlying data

```compact
// Prove age > 18 without revealing birthdate
export circuit proveAdult(
  witness birthdate: Uint<64>
): Boolean {
  const age = (currentTime - birthdate) / SECONDS_PER_YEAR;
  return age >= 18;
  // Only returns true/false, not the actual age
}
```

## Pattern 6: Private State Transitions

Use case: Update state without revealing intermediate values

```compact
export circuit privateTransfer(
  witness senderBalance: Uint<64>,
  witness amount: Uint<64>,
  senderCommitment: Field,
  recipientCommitment: Field
): [] {
  // Verify sender has funds
  assert(senderBalance >= amount);

  // Verify sender's balance commitment
  assert(hash(senderBalance) == senderCommitment);

  // Create new commitments
  const newSenderBalance = senderBalance - amount;
  const newSenderCommitment = hash(newSenderBalance);

  // Update commitments (amounts stay private)
  ledger.balances[sender] = newSenderCommitment;
}
```

## Security Considerations

### Nonce Requirements

- Use cryptographically random nonces (256 bits)
- Never reuse nonces
- Store nonces securely client-side

### Hash Function Selection

- Use collision-resistant hash functions
- Midnight uses Poseidon (ZK-friendly)

### Timing Attacks

- Ensure constant-time operations
- Add randomized delays if needed

### Front-Running Protection

- Use commit-reveal for sensitive operations
- Implement minimum delay between phases

## Common Mistakes

❌ **Revealing secrets in events**

```compact
// BAD: secret value logged
emit ValueSubmitted(secretValue);

// GOOD: only commitment logged
emit CommitmentSubmitted(hash(secretValue));
```

❌ **Deterministic nullifiers without secret**

```compact
// BAD: anyone can compute
const nullifier = hash(publicTokenId);

// GOOD: requires secret knowledge
const nullifier = hash(secretKey, publicTokenId);
```

❌ **Missing binding in commitments**

```compact
// BAD: malleable commitment
const commitment = hash(value);

// GOOD: bound with random nonce
const commitment = hash(value, randomNonce);
```
