---
name: ledger-state-patterns
description: Design and use Compact ledger state types for on-chain storage. Covers Counter, Set, Map, List, MerkleTree, and HistoricMerkleTree with patterns for efficient state management and privacy-preserving data structures.
---

# Ledger State Patterns

Compact provides specialized ledger types for on-chain state management. These types are optimized for zero-knowledge proof generation while supporting common data structure patterns.

## When to Use

- Storing persistent contract state on-chain
- Building membership proofs and access control
- Managing key-value relationships
- Implementing privacy-preserving data structures
- Tracking historical state for auditing

## Ledger Types Overview

| Type | Use Case | Operations | Proofs |
|------|----------|------------|--------|
| `Counter` | Simple counters | Increment, read | Value |
| `Set<T>` | Membership tracking | Insert, remove, member | Membership |
| `Map<K,V>` | Key-value storage | Get, set, remove | Existence |
| `List<T>` | Ordered sequences | Push, pop, index | Position |
| `MerkleTree<n,T>` | Large sets | Insert, prove | Membership |
| `HistoricMerkleTree<n,T>` | Auditable sets | Append, historical proof | Historic membership |

## Counter

Simple numeric counter for tracking values:

```compact
pragma compact(">=0.18");

ledger totalSupply: Counter;
ledger transactionCount: Counter;

export circuit mint(amount: Uint<64>): [] {
  totalSupply = totalSupply + amount;
}

export circuit incrementTxCount(): [] {
  transactionCount = transactionCount + 1;
}

export circuit getSupply(): Uint<64> {
  return totalSupply;
}
```

### Counter Patterns

```compact
// Initialize to zero (default)
ledger count: Counter;

// Initialize to specific value
constructor() {
  count = 100;
}

// Increment
count = count + 1;

// Decrement (ensure non-negative)
assert count > 0;
count = count - 1;

// Read value
const current = count;
```

## Set<T>

Unordered collection with membership testing:

```compact
pragma compact(">=0.18");

ledger members: Set<Bytes<32>>;
ledger usedNonces: Set<Field>;

export circuit addMember(address: Bytes<32>): [] {
  assert !members.member(address);  // Not already member
  members.insert(address);
}

export circuit removeMember(address: Bytes<32>): [] {
  assert members.member(address);   // Must be member
  members.remove(address);
}

export circuit isMember(address: Bytes<32>): Boolean {
  return members.member(address);
}

// Nullifier pattern
export circuit useNonce(nullifier: Field): [] {
  assert !usedNonces.member(nullifier);
  usedNonces.insert(nullifier);
}
```

### Set Operations

```compact
// Insert element
mySet.insert(element);

// Remove element
mySet.remove(element);

// Check membership
const exists: Boolean = mySet.member(element);

// Conditional insert
if !mySet.member(element) {
  mySet.insert(element);
}
```

## Map<K,V>

Key-value storage with lookup:

```compact
pragma compact(">=0.18");

ledger balances: Map<Bytes<32>, Uint<64>>;
ledger metadata: Map<Bytes<32>, Opaque<"string">>;

export circuit setBalance(address: Bytes<32>, amount: Uint<64>): [] {
  balances[address] = amount;
}

export circuit getBalance(address: Bytes<32>): Uint<64> {
  const maybe = balances.lookup(address);
  match maybe {
    Maybe::None => return 0,
    Maybe::Some { value } => return value
  }
}

export circuit transfer(from: Bytes<32>, to: Bytes<32>, amount: Uint<64>): [] {
  const fromBalance = getBalance(from);
  assert fromBalance >= amount;

  balances[from] = fromBalance - amount;
  balances[to] = getBalance(to) + amount;
}
```

### Map Operations

```compact
// Direct access (fails if key missing)
const value = myMap[key];

// Safe lookup (returns Maybe<V>)
const maybe = myMap.lookup(key);

// Insert or update
myMap[key] = value;

// Remove key
myMap.remove(key);

// Check existence and get
const maybe = myMap.lookup(key);
match maybe {
  Maybe::None => // handle missing,
  Maybe::Some { value } => // use value
}
```

### Map Patterns

```compact
// Get with default
circuit getOrDefault(key: Bytes<32>, default: Uint<64>): Uint<64> {
  const maybe = balances.lookup(key);
  match maybe {
    Maybe::None => return default,
    Maybe::Some { value } => return value
  }
}

// Update if exists
circuit updateIfExists(key: Bytes<32>, newValue: Uint<64>): Boolean {
  const maybe = balances.lookup(key);
  match maybe {
    Maybe::None => return false,
    Maybe::Some { value } => {
      balances[key] = newValue;
      return true;
    }
  }
}

// Increment value
circuit increment(key: Bytes<32>, amount: Uint<64>): [] {
  const current = getOrDefault(key, 0);
  balances[key] = current + amount;
}
```

## List<T>

Ordered sequence with index access:

```compact
pragma compact(">=0.18");

ledger transactions: List<Bytes<32>>;
ledger eventLog: List<Opaque<"Event">>;

export circuit addTransaction(txHash: Bytes<32>): Uint<64> {
  transactions.push(txHash);
  return transactions.length - 1;  // Return index
}

export circuit getTransaction(index: Uint<64>): Bytes<32> {
  assert index < transactions.length;
  return transactions[index];
}

export circuit getLatestTransactions(count: Uint<8>): Vector<10, Bytes<32>> {
  let result: Vector<10, Bytes<32>>;
  const start = if transactions.length > count {
    transactions.length - count
  } else {
    0
  };

  for i in 0..10 {
    if start + i < transactions.length {
      result[i] = transactions[start + i];
    }
  }

  return result;
}
```

### List Operations

```compact
// Push to end
myList.push(element);

// Pop from end
const element = myList.pop();

// Get length
const len = myList.length;

// Index access
const element = myList[index];

// Index assignment
myList[index] = newValue;
```

## MerkleTree<n,T>

Efficient membership proofs for large sets:

```compact
pragma compact(">=0.18");

// 2^20 = ~1 million leaves
ledger commitments: MerkleTree<20, Bytes<32>>;

// Witness for Merkle path
witness path: Vector<20, Field>;
witness indices: Vector<20, Boolean>;

export circuit addCommitment(commitment: Bytes<32>): [] {
  // Insert into tree (updates root)
  commitments.insert(commitment);
}

export circuit verifyMembership(leaf: Bytes<32>): Boolean {
  return commitments.verify(leaf, path, indices);
}
```

### MerkleTree Pattern: Commitment Scheme

```compact
ledger tree: MerkleTree<20, Field>;

witness secret: Field;
witness merkleProof: Vector<20, Field>;
witness proofIndices: Vector<20, Boolean>;

// Add commitment
export circuit commit(value: Uint<64>): Field {
  const commitment = persistentCommit(value, secret);
  tree.insert(commitment);
  return commitment;
}

// Verify and reveal
export circuit reveal(
  value: Uint<64>,
  commitment: Field
): [] {
  // Verify commitment opens correctly
  assert persistentCommit(value, secret) == commitment;

  // Verify membership in tree
  assert tree.verify(commitment, merkleProof, proofIndices);

  disclose(value);
}
```

## HistoricMerkleTree<n,T>

Append-only tree with historical proofs:

```compact
pragma compact(">=0.18");

// Preserves all historical roots
ledger history: HistoricMerkleTree<20, Field>;

witness proof: Vector<20, Field>;
witness indices: Vector<20, Boolean>;
witness historicRoot: Field;

// Can only append (no modifications)
export circuit record(item: Field): [] {
  history.append(item);
}

// Prove membership at any historical root
export circuit proveHistoricMembership(
  item: Field,
  atRoot: Field
): Boolean {
  return history.verifyAtRoot(item, atRoot, proof, indices);
}

// Get current root
export circuit getCurrentRoot(): Field {
  return history.root();
}
```

### HistoricMerkleTree Use Cases

```compact
// Audit trail
ledger auditLog: HistoricMerkleTree<20, Field>;

circuit logAction(actionHash: Field): [] {
  auditLog.append(actionHash);
}

// Prove action existed at specific time
circuit proveActionAtTime(
  actionHash: Field,
  rootAtTime: Field
): Boolean {
  return auditLog.verifyAtRoot(actionHash, rootAtTime, proof, indices);
}
```

## State Design Patterns

### Ownership Pattern

```compact
ledger owner: Bytes<32>;
ledger admins: Set<Bytes<32>>;

export circuit onlyOwner(caller: Bytes<32>): [] {
  assert caller == owner;
}

export circuit onlyAdmin(caller: Bytes<32>): [] {
  assert admins.member(caller) || caller == owner;
}

export circuit transferOwnership(
  caller: Bytes<32>,
  newOwner: Bytes<32>
): [] {
  onlyOwner(caller);
  owner = newOwner;
}
```

### Pausable Pattern

```compact
ledger paused: Boolean;
ledger owner: Bytes<32>;

export circuit pause(caller: Bytes<32>): [] {
  assert caller == owner;
  paused = true;
}

export circuit unpause(caller: Bytes<32>): [] {
  assert caller == owner;
  paused = false;
}

export circuit whenNotPaused(): [] {
  assert !paused;
}
```

### Balance Management

```compact
ledger balances: Map<Bytes<32>, Uint<64>>;
ledger totalSupply: Counter;

circuit getBalance(addr: Bytes<32>): Uint<64> {
  const maybe = balances.lookup(addr);
  match maybe {
    Maybe::None => return 0,
    Maybe::Some { value } => return value
  }
}

export circuit mint(to: Bytes<32>, amount: Uint<64>): [] {
  balances[to] = getBalance(to) + amount;
  totalSupply = totalSupply + amount;
}

export circuit burn(from: Bytes<32>, amount: Uint<64>): [] {
  const bal = getBalance(from);
  assert bal >= amount;
  balances[from] = bal - amount;
  totalSupply = totalSupply - amount;
}
```

## Best Practices

### 1. Choose Appropriate Type

```compact
// Use Set for membership only
ledger voters: Set<Bytes<32>>;

// Use Map when you need associated data
ledger voteChoices: Map<Bytes<32>, Uint<8>>;

// Use List when order matters
ledger voteOrder: List<Bytes<32>>;

// Use MerkleTree for large sets with proofs
ledger allVotes: MerkleTree<20, Field>;
```

### 2. Handle Missing Values

```compact
// Always use lookup() for Maps
const maybe = balances.lookup(key);
match maybe {
  Maybe::None => // handle missing,
  Maybe::Some { value } => // use value
}

// Check Set membership before operations
assert members.member(address);
members.remove(address);
```

### 3. Minimize State Updates

```compact
// Bad: multiple updates
balances[from] = balances[from] - amount;
balances[to] = balances[to] + amount;
counter = counter + 1;

// Better: batch logical operations
export circuit transfer(from: Bytes<32>, to: Bytes<32>, amount: Uint<64>): [] {
  const fromBal = getBalance(from);
  const toBal = getBalance(to);

  assert fromBal >= amount;

  balances[from] = fromBal - amount;
  balances[to] = toBal + amount;
}
```

## Related Skills

- [compact-type-system](../compact-type-system/SKILL.md) - Base types
- [privacy-data-patterns](../privacy-data-patterns/SKILL.md) - Privacy patterns
- [compact-stdlib](../compact-stdlib/SKILL.md) - Standard library

## References

- [Compact Language Reference](https://docs.midnight.network/develop/reference/compact/lang-ref)
- [Writing Compact Contracts](https://docs.midnight.network/develop/reference/compact/writing)
