# Ledger State Patterns

Specialized ledger types for on-chain state management optimized for ZK proofs.

## Ledger Type Overview

| Type | Use Case | Operations |
|------|----------|------------|
| `Counter` | Simple counters | Increment, read |
| `Set<T>` | Membership tracking | Insert, remove, member |
| `Map<K,V>` | Key-value storage | Get, set, lookup |
| `List<T>` | Ordered sequences | Push, pop, index |
| `MerkleTree<n,T>` | Large sets | Insert, prove membership |
| `HistoricMerkleTree<n,T>` | Auditable sets | Append, historical proof |

## Counter

```compact
ledger totalSupply: Counter;
ledger transactionCount: Counter;

export circuit mint(amount: Uint<64>): [] {
  totalSupply = totalSupply + amount;
}

export circuit incrementTxCount(): [] {
  transactionCount = transactionCount + 1;
}
```

## Set<T>

Unordered collection with membership testing:

```compact
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

**Operations:**
- `insert(element)` - Add element
- `remove(element)` - Remove element
- `member(element)` - Check membership (returns Boolean)

## Map<K,V>

Key-value storage with lookup:

```compact
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

**Operations:**
- `map[key] = value` - Set value
- `map[key]` - Get value (panics if missing)
- `lookup(key)` - Returns `Maybe<V>`

## MerkleTree<N,T>

Large sets with efficient membership proofs:

```compact
// 2^20 ≈ 1 million members
ledger memberTree: MerkleTree<20, Field>;

// Merkle proof witness
witness merkleProof: Vector<20, Field>;
witness proofIndices: Vector<20, Boolean>;

export circuit addMember(memberId: Field): [] {
  memberTree.insert(memberId);
}

export circuit proveMembership(memberId: Field): Boolean {
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
```

## HistoricMerkleTree<N,T>

Auditable Merkle tree with historical proofs:

```compact
ledger auditLog: HistoricMerkleTree<20, Field>;

export circuit appendEntry(entry: Field): [] {
  auditLog.append(entry);
}

export circuit proveHistoricEntry(entry: Field, atIndex: Uint<32>): Boolean {
  // Prove entry existed at specific point in time
  return auditLog.proveAt(entry, atIndex);
}
```

## Common Patterns

### Token Balances

```compact
ledger balances: Map<Bytes<32>, Uint<64>>;

circuit safeTransfer(from: Bytes<32>, to: Bytes<32>, amount: Uint<64>): [] {
  // Cache reads for efficiency
  const fromBal = balances.lookup(from);
  const toBal = balances.lookup(to);

  match fromBal {
    Maybe::None => assert false,
    Maybe::Some { value } => {
      assert value >= amount;
      balances[from] = value - amount;
    }
  }

  match toBal {
    Maybe::None => balances[to] = amount,
    Maybe::Some { value } => balances[to] = value + amount
  }
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
ledger nullifiers: Set<Field>;
witness secret: Field;

circuit spend(commitment: Field): [] {
  const nullifier = transientHash(secret, commitment);
  assert !nullifiers.member(nullifier);
  nullifiers.insert(nullifier);
}
```

## Best Practices

1. **Use Counter** for simple incrementing values
2. **Use Set** for membership checks and nullifiers
3. **Use Map** for key-value relationships
4. **Use MerkleTree** for large datasets (>1000 items)
5. **Cache reads** - store in local variable before multiple uses
6. **Check before modify** - always verify preconditions
