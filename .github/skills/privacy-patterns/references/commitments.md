# Commitment Schemes

Hide values while binding to them for later revelation.

## What is a Commitment?

A cryptographic commitment lets you:

1. **Commit:** Lock in a value without revealing it
2. **Reveal:** Later prove what value you committed to

```text
commit(value) → commitment
reveal(value, commitment) → true/false
```

## Properties

| Property    | Meaning                                |
| ----------- | -------------------------------------- |
| **Hiding**  | Cannot determine value from commitment |
| **Binding** | Cannot change value after committing   |

## Basic Commitment Pattern

```compact
pragma language_version 0.18;

import CompactStandardLibrary;

ledger commitments: Set<Field>;

// Randomness for hiding
witness randomness: Field;

// Create commitment
export circuit commit(value: Uint<64>): Field {
  // commitment = hash(value, randomness)
  const commitment = persistentCommit(value, randomness);
  commitments.insert(commitment);
  return commitment;
}

// Reveal and verify
export circuit reveal(value: Uint<64>, commitment: Field): [] {
  // Recompute commitment
  const computed = persistentCommit(value, randomness);

  // Verify it matches
  assert computed == commitment;
  assert commitments.member(commitment);

  // Now safe to reveal
  disclose(value);
}
```

## Why Randomness?

Without randomness, commitments are vulnerable to brute-force:

```compact
// ❌ BAD: Predictable commitment
const badCommitment = persistentHash(value);
// Attacker can try all possible values to find match

// ✅ GOOD: Randomized commitment
const goodCommitment = persistentCommit(value, randomness);
// Attacker cannot guess without knowing randomness
```

## Commitment Types

### persistentCommit

For values that persist on-chain:

```compact
witness randomness: Field;

circuit createCommitment(value: Uint<64>): Field {
  return persistentCommit(value, randomness);
}
```

### persistentHash (Deterministic)

For cases where hiding isn't needed:

```compact
// No randomness - same input always gives same output
circuit createHash(data: Bytes<32>): Field {
  return persistentHash(data);
}
```

## Use Cases

### Sealed Bid Auction

```compact
ledger bids: Map<Bytes<32>, Field>;  // bidder -> commitment
ledger revealedBids: Map<Bytes<32>, Uint<64>>;  // bidder -> amount

witness randomness: Field;

// Phase 1: Submit sealed bid
export circuit submitBid(bidder: Bytes<32>, amount: Uint<64>): [] {
  const commitment = persistentCommit(amount, randomness);
  bids[bidder] = commitment;
}

// Phase 2: Reveal bid
export circuit revealBid(bidder: Bytes<32>, amount: Uint<64>): [] {
  const stored = bids[bidder];
  assert persistentCommit(amount, randomness) == stored;
  revealedBids[bidder] = amount;
  disclose(amount);
}
```

### Hash Lock

```compact
ledger locks: Map<Field, Uint<64>>;  // hash -> amount

// Create lock (recipient knows preimage)
export circuit createLock(hashLock: Field, amount: Uint<64>): [] {
  receive(nativeToken(), amount);
  locks[hashLock] = amount;
}

// Claim with preimage
export circuit claim(preimage: Field): [] {
  const hashLock = persistentHash(preimage);
  const amount = locks[hashLock];
  assert amount > 0;
  locks[hashLock] = 0;
  send(nativeToken(), amount, sender);
}
```

### Vote Commitment

```compact
ledger voteCommitments: Map<Bytes<32>, Field>;
ledger votes: Map<Bytes<32>, Boolean>;

witness randomness: Field;

// Commit vote without revealing
export circuit commitVote(voter: Bytes<32>, vote: Boolean): [] {
  // Pack vote as uint (0 or 1)
  const packed: Uint<8> = if vote { 1 } else { 0 };
  const commitment = persistentCommit(packed, randomness);
  voteCommitments[voter] = commitment;
}

// Reveal vote
export circuit revealVote(voter: Bytes<32>, vote: Boolean): [] {
  const packed: Uint<8> = if vote { 1 } else { 0 };
  assert persistentCommit(packed, randomness) == voteCommitments[voter];
  votes[voter] = vote;
}
```

## Commitment Lifecycle

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   COMMIT     │───▶│    STORE     │───▶│   REVEAL     │
│              │    │              │    │              │
│ value +      │    │ commitment   │    │ value must   │
│ randomness   │    │ on-chain     │    │ match        │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Best Practices

1. **Always use randomness** for commitments that should hide values
2. **Store randomness securely** - losing it means cannot reveal
3. **One randomness per commitment** - don't reuse
4. **Check commitment exists** before allowing reveal
5. **Consider time limits** - add deadlines for reveal phase
6. **Handle non-reveals** - define behavior if reveal is skipped
