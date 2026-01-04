---
name: privacy-data-patterns
description: Implement privacy-preserving patterns in Compact smart contracts. Covers commitment schemes, nullifier patterns, Merkle membership proofs, witnesses for private state, and selective disclosure for building confidential applications.
---

# Privacy Data Patterns

Midnight's core value proposition is privacy-preserving computation. This skill covers essential patterns for keeping data private while still proving properties about it.

## When to Use

- Hiding sensitive values while proving properties
- Preventing double-spend without revealing identity
- Proving set membership without revealing the element
- Managing private state across transactions
- Implementing confidential voting, auctions, or transfers

## Core Privacy Concepts

### Public vs Private State

| Aspect | Public (Ledger) | Private (Witness) |
|--------|-----------------|-------------------|
| Visibility | Everyone sees | Only prover knows |
| Storage | On blockchain | Off-chain |
| Persistence | Permanent | Per-transaction |
| Verification | Direct | Via ZK proof |

```compact
// Public state - visible to all
ledger publicCounter: Counter;

// Private state - only prover knows
witness secretValue: Field;
```

## Commitment Scheme

Hide a value while binding to it:

```compact
pragma compact(">=0.18");

ledger commitments: Set<Field>;

// Private randomness for commitment
witness randomness: Field;

// Commit: hash(value, randomness)
export circuit commit(value: Uint<64>): Field {
  const commitment = persistentCommit(value, randomness);
  commitments.insert(commitment);
  disclose(commitment);  // Public commitment
  return commitment;
}

// Reveal: prove you know the opening
export circuit reveal(value: Uint<64>, commitment: Field): [] {
  // Verify commitment matches
  assert persistentCommit(value, randomness) == commitment;

  // Verify commitment exists
  assert commitments.member(commitment);

  // Now safe to reveal value
  disclose(value);
}
```

### Commitment Properties

1. **Hiding**: Cannot determine `value` from `commitment`
2. **Binding**: Cannot find different `value'` with same `commitment`

```compact
// Commitment = hash(value || randomness)
// Without randomness: could brute-force small value spaces
// With randomness: hiding is information-theoretic
```

## Nullifier Pattern

Prevent double-use without revealing identity:

```compact
pragma compact(">=0.18");

ledger nullifiers: Set<Field>;
ledger commitments: Set<Field>;

witness secret: Field;  // User's secret key

// Nullifier = hash(secret, commitment)
// - Deterministic: same (secret, commitment) → same nullifier
// - Unlinkable: can't connect nullifier to secret or commitment

export circuit deposit(amount: Uint<64>): [] {
  // Create commitment to amount
  const commitment = persistentCommit(amount, secret);
  commitments.insert(commitment);

  // Receive the tokens
  receive(nativeToken(), amount);
}

export circuit withdraw(amount: Uint<64>, commitment: Field): [] {
  // Verify commitment opens correctly
  assert persistentCommit(amount, secret) == commitment;

  // Verify commitment exists
  assert commitments.member(commitment);

  // Compute and check nullifier
  const nullifier = transientHash(secret, commitment);
  assert !nullifiers.member(nullifier);  // Not already spent
  nullifiers.insert(nullifier);          // Mark as spent

  // Send tokens
  send(nativeToken(), amount, recipient);
}
```

### Nullifier Properties

1. **Prevents double-spend**: Same commitment can only be spent once
2. **Preserves privacy**: Can't link nullifier to depositor
3. **Deterministic**: User can't create multiple nullifiers for same commitment

## Merkle Membership Proofs

Prove membership in a large set efficiently:

```compact
pragma compact(">=0.18");

// 2^20 ≈ 1 million members
ledger memberTree: MerkleTree<20, Field>;

// Merkle proof witness
witness merkleProof: Vector<20, Field>;
witness proofIndices: Vector<20, Boolean>;

export circuit addMember(memberId: Field): [] {
  memberTree.insert(memberId);
}

export circuit proveMembership(memberId: Field): Boolean {
  // Verify Merkle path from leaf to root
  let current = memberId;

  for i in 0..20 {
    const sibling = merkleProof[i];
    current = if proofIndices[i] {
      persistentHash(sibling, current)
    } else {
      persistentHash(current, sibling)
    };
  }

  return current == memberTree.root();
}

// Prove membership without revealing which member
export circuit anonymousMemberAction(): [] {
  // memberId is private (witness)
  witness memberId: Field;

  // Prove membership
  assert proveMembership(memberId);

  // Can now perform action as "some member"
  // without revealing which one
}
```

## Witnesses for Private State

Witnesses provide private inputs to circuits:

```compact
pragma compact(">=0.18");

// Declare witnesses (private inputs)
witness privateKey: Field;
witness secretBid: Uint<64>;
witness encryptedData: Opaque<"EncryptedPayload">;

// Witnesses are:
// - Known only to the prover
// - Not stored on-chain
// - Must be provided each transaction
// - Can be complex types

export circuit proveKnowledge(): [] {
  // Prove you know privateKey that hashes to publicKey
  const derivedPublic = persistentHash(privateKey);
  assert derivedPublic == publicKey;
}

export circuit sealedBidAuction(commitment: Field): [] {
  // Prove your bid matches your commitment
  assert persistentCommit(secretBid, randomness) == commitment;

  // Bid value stays private
  // Only commitment is public
}
```

### Witness Best Practices

```compact
// 1. Use witnesses for user secrets
witness userSecret: Field;

// 2. Use witnesses for Merkle proofs
witness proof: Vector<20, Field>;

// 3. Use witnesses for private state
witness privateBalance: Uint<64>;

// 4. Never store witnesses on-chain
// BAD: ledger secret: Field;  // Would be public!

// 5. Verify witness values against commitments
assert persistentCommit(privateBalance, randomness) == storedCommitment;
```

## Selective Disclosure

Reveal only what's necessary:

```compact
pragma compact(">=0.18");

struct PrivateProfile {
  name: Opaque<"string">,
  age: Uint<8>,
  country: Opaque<"string">,
  income: Uint<64>
}

witness profile: PrivateProfile;
ledger profileCommitment: Field;

// Prove property without revealing data
export circuit proveOver18(): Boolean {
  // Verify profile matches commitment
  assert persistentHash(profile) == profileCommitment;

  // Reveal only the age check result
  const isOver18 = profile.age >= 18;
  disclose(isOver18);  // Only this is public

  return isOver18;
}

// Prove income range without exact value
export circuit proveIncomeRange(min: Uint<64>, max: Uint<64>): Boolean {
  assert persistentHash(profile) == profileCommitment;

  const inRange = profile.income >= min && profile.income <= max;
  disclose(inRange);

  return inRange;
}
```

## Private Voting

Anonymous votes with verifiable tallies:

```compact
pragma compact(">=0.18");

ledger voterTree: MerkleTree<20, Field>;
ledger usedBallots: Set<Field>;
ledger yesVotes: Counter;
ledger noVotes: Counter;

witness voterId: Field;
witness voteProof: Vector<20, Field>;
witness voteIndices: Vector<20, Boolean>;
witness voterSecret: Field;

export circuit registerVoter(voterCommitment: Field): [] {
  voterTree.insert(voterCommitment);
}

export circuit vote(choice: Boolean): [] {
  // 1. Prove voter is registered (without revealing which)
  let current = persistentHash(voterId, voterSecret);
  for i in 0..20 {
    const sibling = voteProof[i];
    current = if voteIndices[i] {
      persistentHash(sibling, current)
    } else {
      persistentHash(current, sibling)
    };
  }
  assert current == voterTree.root();

  // 2. Prevent double voting
  const nullifier = transientHash(voterSecret, "vote");
  assert !usedBallots.member(nullifier);
  usedBallots.insert(nullifier);

  // 3. Count vote (choice is public)
  if choice {
    yesVotes = yesVotes + 1;
  } else {
    noVotes = noVotes + 1;
  }
}
```

## Encrypted State Pattern

Store encrypted data on-chain:

```compact
pragma compact(">=0.18");

ledger encryptedMessages: Map<Bytes<32>, Opaque<"EncryptedMessage">>;

witness decryptionKey: Field;

export circuit storeEncrypted(
  recipient: Bytes<32>,
  encryptedData: Opaque<"EncryptedMessage">
): [] {
  encryptedMessages[recipient] = encryptedData;
}

// Off-chain: decrypt with recipient's key
// On-chain: only encrypted data visible
```

## Privacy Pattern Summary

| Pattern | Hides | Proves | Use Case |
|---------|-------|--------|----------|
| Commitment | Value | Binding | Sealed bids, hidden balances |
| Nullifier | Identity | Single-use | Double-spend prevention |
| Merkle Proof | Element | Membership | Anonymous access |
| Witness | Input | Computation | Private state |
| Selective Disclosure | Details | Properties | Age verification |

## Best Practices

1. **Never store secrets in ledger state**
2. **Always use randomness in commitments**
3. **Verify witness values against stored commitments**
4. **Use nullifiers to prevent replay attacks**
5. **Minimize disclosed information**
6. **Document what is public vs private**

## Related Skills

- [compact-stdlib](../compact-stdlib/SKILL.md) - Hashing functions
- [ledger-state-patterns](../ledger-state-patterns/SKILL.md) - State types
- [zero-knowledge-proofs](../zero-knowledge-proofs/SKILL.md) - ZKP concepts

## References

- [Keeping Data Private](https://docs.midnight.network/learn/how-midnight-works/keeping-data-private)
- [Compact Language Reference](https://docs.midnight.network/develop/reference/compact/lang-ref)
