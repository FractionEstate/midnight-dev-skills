# Ledger Types Reference

## Counter

Simple numeric value storage.

```compact
// Declaration
ledger counter: Counter;

// Operations
counter = 0;            // Set value
counter = counter + 1;  // Increment
counter = counter - 1;  // Decrement
const val = counter;    // Read

// Properties
// - Default: 0
// - Range: Uint<64>
// - Single value storage
```

---

## Set<T>

Unordered collection with membership operations.

```compact
// Declaration
ledger items: Set<Bytes<32>>;
ledger nullifiers: Set<Field>;

// Operations
items.insert(element);           // Add element
items.remove(element);           // Remove element
const exists = items.member(element);  // Check membership

// Properties
// - No duplicates
// - Unordered
// - O(1) membership check
// - Good for: access lists, spent nullifiers
```

### Set Type Constraints

```compact
// Supported element types
Set<Bytes<n>>     // Fixed-length bytes
Set<Field>        // Field elements
Set<Uint<n>>      // Unsigned integers
Set<Boolean>      // Booleans (limited use)
Set<MyStruct>     // Custom structs

// NOT supported
// Set<Opaque<s>>  // Cannot hash opaque types
// Set<Vector<n,T>>// Use struct wrapper instead
```

---

## Map<K, V>

Key-value storage with lookup.

```compact
// Declaration
ledger balances: Map<Bytes<32>, Uint<64>>;
ledger names: Map<Uint<64>, Opaque<"string">>;

// Operations
map[key] = value;              // Insert/update
const val = map[key];          // Direct access (panics if missing)
const maybe = map.lookup(key); // Safe lookup (returns Maybe<V>)
map.remove(key);               // Delete entry

// Properties
// - Key-value pairs
// - Keys must be hashable
// - Values can be any type
// - O(1) average lookup
```

### Map Lookup Pattern

```compact
// Always prefer lookup() for safety
circuit safeGet(key: Bytes<32>): Uint<64> {
  const maybe = balances.lookup(key);
  match maybe {
    Maybe::None => return 0,
    Maybe::Some { value } => return value
  }
}

// Direct access only when key guaranteed to exist
circuit mustExist(key: Bytes<32>): Uint<64> {
  assert balances.lookup(key) != Maybe::None;
  return balances[key];
}
```

### Map Key Types

```compact
// Supported key types
Map<Bytes<n>, V>    // Common: addresses, hashes
Map<Field, V>       // Cryptographic keys
Map<Uint<n>, V>     // Numeric IDs
Map<(K1, K2), V>    // Composite keys (tuples)

// NOT supported as keys
// Map<Opaque<s>, V>   // Cannot hash
// Map<Boolean, V>     // Use if/else instead
```

---

## List<T>

Ordered sequence with index access.

```compact
// Declaration
ledger items: List<Bytes<32>>;
ledger events: List<Opaque<"Event">>;

// Operations
items.push(element);           // Append to end
const elem = items.pop();      // Remove from end
const len = items.length;      // Get current length
const elem = items[index];     // Index access
items[index] = newValue;       // Index assignment

// Properties
// - Ordered sequence
// - Dynamic length
// - O(1) push/pop
// - O(1) index access
```

### List Bounds Checking

```compact
// Always check bounds
circuit safeGet(index: Uint<64>): Bytes<32> {
  assert index < items.length;
  return items[index];
}

// Iterate safely
circuit sumValues(): Uint<64> {
  let sum: Uint<64> = 0;
  for i in 0..items.length {
    sum = sum + values[i];
  }
  return sum;
}
```

---

## MerkleTree<n, T>

Merkle tree for efficient membership proofs.

```compact
// Declaration (2^n leaves)
ledger tree: MerkleTree<20, Bytes<32>>;  // ~1M leaves
ledger small: MerkleTree<8, Field>;       // 256 leaves

// Operations
tree.insert(leaf);                        // Add leaf
tree.verify(leaf, path, indices);         // Verify membership
const root = tree.root();                 // Get current root

// Witness for proofs
witness path: Vector<20, Field>;          // Sibling nodes
witness indices: Vector<20, Boolean>;     // Left/right path

// Properties
// - Efficient membership proofs
// - O(log n) proof size
// - Append-only by default
// - Good for: large commitment sets
```

### MerkleTree Verification

```compact
ledger tree: MerkleTree<20, Field>;

witness proof: Vector<20, Field>;
witness indices: Vector<20, Boolean>;

circuit verifyMember(leaf: Field): Boolean {
  // Compute root from leaf + proof
  let current = leaf;

  for i in 0..20 {
    const sibling = proof[i];
    current = if indices[i] {
      // Leaf is on right
      persistentHash(sibling, current)
    } else {
      // Leaf is on left
      persistentHash(current, sibling)
    };
  }

  return current == tree.root();
}
```

---

## HistoricMerkleTree<n, T>

Append-only tree preserving historical roots.

```compact
// Declaration
ledger history: HistoricMerkleTree<20, Field>;

// Operations (append-only)
history.append(leaf);                      // Add leaf
history.root();                            // Current root
history.verifyAtRoot(leaf, root, path, indices);  // Historic proof

// Witness
witness proof: Vector<20, Field>;
witness indices: Vector<20, Boolean>;
witness historicRoot: Field;

// Properties
// - Preserves all historical roots
// - Append-only (no removal)
// - Prove membership at any past root
// - Good for: audit trails, timestamping
```

### HistoricMerkleTree Pattern

```compact
ledger log: HistoricMerkleTree<20, Field>;

// Record with timestamp
circuit record(data: Field): Field {
  log.append(data);
  return log.root();  // Return root as "timestamp"
}

// Prove existed at specific root
circuit proveAtTime(
  data: Field,
  timestamp: Field  // Root at that time
): Boolean {
  return log.verifyAtRoot(data, timestamp, proof, indices);
}
```

---

## Type Summary

| Type | Insert | Remove | Lookup | Order | Proofs |
|------|--------|--------|--------|-------|--------|
| Counter | Set | Set | Direct | N/A | Value |
| Set<T> | O(1) | O(1) | O(1) | No | Membership |
| Map<K,V> | O(1) | O(1) | O(1) | No | Existence |
| List<T> | O(1) | O(1)* | O(1) | Yes | Position |
| MerkleTree | O(log n) | N/A | O(log n) | No | Membership |
| HistoricMerkleTree | O(log n) | N/A | O(log n) | Yes | Historic |

*List only supports pop (remove from end)

---

## Common Patterns

### Existence Check

```compact
// Set
const exists = mySet.member(item);

// Map
const maybe = myMap.lookup(key);
const exists = match maybe {
  Maybe::None => false,
  Maybe::Some { _ } => true
};

// List
const exists = index < myList.length;
```

### Safe Iteration

```compact
// Fixed iteration (compile-time bound)
for i in 0..10 {
  if i < myList.length {
    // process myList[i]
  }
}

// Cannot use runtime length in for bounds
// for i in 0..myList.length { }  // ERROR
```

### Composite Keys

```compact
// Use tuples for multi-part keys
ledger allowances: Map<(Bytes<32>, Bytes<32>), Uint<64>>;

circuit setAllowance(owner: Bytes<32>, spender: Bytes<32>, amount: Uint<64>): [] {
  allowances[(owner, spender)] = amount;
}

circuit getAllowance(owner: Bytes<32>, spender: Bytes<32>): Uint<64> {
  const maybe = allowances.lookup((owner, spender));
  match maybe {
    Maybe::None => return 0,
    Maybe::Some { value } => return value
  }
}
```
