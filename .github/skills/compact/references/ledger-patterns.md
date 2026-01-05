# Ledger State Patterns

Specialized ledger types for on-chain state management optimized for ZK proofs.

## Ledger Type Overview

| Type                      | Use Case            | Operations                 |
| ------------------------- | ------------------- | -------------------------- |
| `Counter`                 | Simple counters     | Increment, decrement, read |
| `Set<T>`                  | Membership tracking | Insert, remove, member     |
| `Map<K,V>`                | Key-value storage   | Insert, lookup, member     |
| `List<T>`                 | Ordered sequences   | PushFront, popFront, head  |
| `MerkleTree<n,T>`         | Large sets          | Insert, checkRoot          |
| `HistoricMerkleTree<n,T>` | Auditable sets      | Insert, checkRoot, history |

## Counter

```compact
// Counter increments/decrements by Uint<16> amounts.
ledger transactionCount: Counter;
ledger totalSupply: Uint<64>;

export circuit mint(amount: Uint<64>): [] {
  totalSupply = disclose((totalSupply + amount) as Uint<64>);
}

export circuit incrementTxCount(): [] {
  transactionCount.increment(1);
}
```

## `Set<T>`

Unordered collection with membership testing:

```compact
ledger members: Set<Bytes<32>>;
ledger usedNonces: Set<Field>;

export circuit addMember(address: Bytes<32>): [] {
  const addr = disclose(address);
  assert(!members.member(addr), "Already a member");
  members.insert(addr);
}

export circuit removeMember(address: Bytes<32>): [] {
  const addr = disclose(address);
  assert(members.member(addr), "Not a member");
  members.remove(addr);
}

export circuit isMember(address: Bytes<32>): Boolean {
  return members.member(disclose(address));
}

// Nullifier pattern
export circuit useNonce(nullifier: Field): [] {
  assert !usedNonces.member(nullifier);
  usedNonces.insert(nullifier);
}
```

**Operations:**

- `insert(element)` - Add element
- `remove(element)` - Remove element
- `member(element)` - Check membership (returns Boolean)

## `Map<K,V>`

Key-value storage with lookup:

```compact
ledger balances: Map<Bytes<32>, Uint<64>>;
ledger metadata: Map<Bytes<32>, Opaque<"string">>;

export circuit setBalance(address: Bytes<32>, amount: Uint<64>): [] {
  balances.insert(disclose(address), disclose(amount));
}

export circuit getBalance(address: Bytes<32>): Uint<64> {
  const addr = disclose(address);
  return balances.member(addr) ? balances.lookup(addr) : 0;
}

export circuit transfer(from: Bytes<32>, to: Bytes<32>, amount: Uint<64>): [] {
  const fromAddr = disclose(from);
  const toAddr = disclose(to);
  const fromBalance = getBalance(fromAddr);
  assert(fromBalance >= amount, "Insufficient balance");

  balances.insert(fromAddr, fromBalance - amount);
  balances.insert(toAddr, (getBalance(toAddr) + amount) as Uint<64>);
}
```

**Operations:**

- `insert(key, value)` - Set value at key
- `member(key)` - Check membership
- `lookup(key)` - Get value (requires key exists)
- `remove(key)` - Remove key

## `MerkleTree<N,T>`

Large sets with efficient membership proofs:

```compact
// 2^20 ≈ 1 million members
ledger memberTree: MerkleTree<20, Field>;

// Merkle membership proofs are typically passed in as a MerkleTreePath witness.
// You can verify by deriving the root and checking it matches the current tree root.

export circuit addMember(memberId: Field): [] {
  memberTree.insert(memberId);
}

export circuit proveMembership(path: MerkleTreePath<20, Field>): Boolean {
  const derivedRoot = merkleTreePathRoot<20, Field>(path);
  return memberTree.checkRoot(derivedRoot);
}
```

## `HistoricMerkleTree<N,T>`

Auditable Merkle tree with historical proofs:

```compact
ledger auditLog: HistoricMerkleTree<20, Field>;

export circuit appendEntry(entry: Field): [] {
  auditLog.insert(entry);
}
```

## Common Patterns

### Token Balances

```compact
ledger balances: Map<Bytes<32>, Uint<64>>;

circuit safeTransfer(from: Bytes<32>, to: Bytes<32>, amount: Uint<64>): [] {
  const fromAddr = disclose(from);
  const toAddr = disclose(to);

  // Cache reads for efficiency
  const fromBal = balances.member(fromAddr) ? balances.lookup(fromAddr) : 0;
  const toBal = balances.member(toAddr) ? balances.lookup(toAddr) : 0;

  assert(fromBal >= amount, "Insufficient balance");
  balances.insert(fromAddr, fromBal - amount);
  balances.insert(toAddr, (toBal + amount) as Uint<64>);
}
```

### Allowlist/Denylist

```compact
ledger allowlist: Set<Bytes<32>>;
ledger denylist: Set<Bytes<32>>;

circuit checkAccess(user: Bytes<32>): Boolean {
  return allowlist.member(user) && !denylist.member(user);
}
```

### Nullifier (Double-Spend Prevention)

```compact
ledger nullifiers: Set<Bytes<32>>;
witness secretKey(): Bytes<32>;

circuit spend(commitment: Bytes<32>): [] {
  const nul = disclose(persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "midnight:example:nullifier"),
    secretKey(),
    commitment,
  ]));
  assert(!nullifiers.member(nul), "Already spent");
  nullifiers.insert(nul);
}
```

## Best Practices

1. **Use Counter** for simple incrementing values
2. **Use Set** for membership checks and nullifiers
3. **Use Map** for key-value relationships
4. **Use MerkleTree** for large datasets (>1000 items)
5. **Cache reads** - store in local variable before multiple uses
6. **Check before modify** - always verify preconditions
