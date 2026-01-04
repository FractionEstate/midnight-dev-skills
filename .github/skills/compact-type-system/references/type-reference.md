# Compact Type Reference

## Primitive Types

### Boolean

```compact
// Values: true, false
ledger flag: Boolean;

// Operations
!a              // Negation
a && b          // Logical AND
a || b          // Logical OR
a == b          // Equality
a != b          // Inequality
```

### Uint<n> - Fixed Bit-Width

```compact
// Common bit widths
Uint<8>         // 0 to 255
Uint<16>        // 0 to 65,535
Uint<32>        // 0 to 4,294,967,295
Uint<64>        // 0 to 18,446,744,073,709,551,615
Uint<128>       // For very large numbers
Uint<256>       // For cryptographic values

// Operations
a + b           // Addition
a - b           // Subtraction
a * b           // Multiplication
a / b           // Division (floor)
a % b           // Modulo
a ** b          // Exponentiation

// Comparison
a == b          // Equal
a != b          // Not equal
a < b           // Less than
a <= b          // Less than or equal
a > b           // Greater than
a >= b          // Greater than or equal

// Bitwise
a & b           // Bitwise AND
a | b           // Bitwise OR
a ^ b           // Bitwise XOR
~a              // Bitwise NOT
a << n          // Left shift
a >> n          // Right shift
```

### Uint<m..n> - Range Constrained

```compact
// Range examples
Uint<0..100>    // 0 to 100 inclusive
Uint<1..10>     // 1 to 10 inclusive
Uint<0..255>    // Same as Uint<8>

// Benefits:
// - Smaller constraint system
// - More efficient proofs
// - Built-in bounds checking
```

### Field

```compact
// Prime field element (approximately 254 bits)
ledger hashValue: Field;

// Operations
a + b           // Field addition
a * b           // Field multiplication
a - b           // Field subtraction
a / b           // Field division (multiplicative inverse)

// Used for:
// - Hash outputs
// - Commitments
// - Merkle tree nodes
// - Cryptographic operations
```

### Bytes<n>

```compact
// Fixed-length byte arrays
Bytes<1>        // 1 byte
Bytes<20>       // 20 bytes (Ethereum address size)
Bytes<32>       // 32 bytes (common hash size)
Bytes<64>       // 64 bytes (signature size)

// Comparison
a == b          // Byte-by-byte equality
a != b          // Inequality

// No arithmetic operations
// Use for: hashes, addresses, identifiers
```

### Opaque<s>

```compact
// External type references
Opaque<"string">     // JavaScript string
Opaque<"number">     // JavaScript number
Opaque<"boolean">    // JavaScript boolean
Opaque<"object">     // JavaScript object
Opaque<"JSON">       // JSON-serializable value

// Custom types
Opaque<"UserProfile">
Opaque<"TransactionData">

// Properties:
// - No operations in Compact
// - Resolved at runtime
// - Used for private state
```

---

## Composite Types

### Tuples

```compact
// Definition
(T1, T2)                    // 2-tuple
(T1, T2, T3)                // 3-tuple
(Uint<64>, Boolean)         // Example
(Bytes<32>, Uint<64>, Field) // Example

// Creation
const pair = (42, true);
const triple = (hash, amount, commitment);

// Destructuring
const (a, b) = pair;
const (x, y, z) = triple;

// Indexing
pair.0                      // First element
pair.1                      // Second element
```

### Vector<n, T>

```compact
// Definition
Vector<5, Uint<64>>         // 5 uint64s
Vector<10, Boolean>         // 10 booleans
Vector<3, Bytes<32>>        // 3 32-byte arrays

// Creation (in circuit)
const vec = [1, 2, 3, 4, 5];

// Indexing
vec[0]                      // First element
vec[i]                      // Dynamic index (must be in bounds)

// Iteration
for i in 0..5 {
  // Access vec[i]
}

// No dynamic resize
// Length fixed at compile time
```

### Struct

```compact
// Definition
struct Name {
  field1: Type1,
  field2: Type2,
  ...
}

// Example
struct User {
  id: Bytes<32>,
  balance: Uint<64>,
  isActive: Boolean,
  joinedAt: Uint<64>
}

// Creation
const user = User {
  id: someId,
  balance: 100,
  isActive: true,
  joinedAt: timestamp
};

// Field access
user.id
user.balance
user.isActive

// Update (create new)
const updated = User {
  id: user.id,
  balance: user.balance + 50,
  isActive: user.isActive,
  joinedAt: user.joinedAt
};
```

### Enum

```compact
// Simple enum (no data)
enum Color {
  Red,
  Green,
  Blue
}

// Enum with data
enum Result {
  Success { value: Uint<64> },
  Error { code: Uint<8>, message: Opaque<"string"> }
}

// Enum with mixed variants
enum State {
  Empty,                           // No data
  Single { item: Bytes<32> },      // One field
  Multiple { a: Uint<64>, b: Boolean } // Multiple fields
}

// Pattern matching
match value {
  Color::Red => // handle red,
  Color::Green => // handle green,
  Color::Blue => // handle blue
}

match result {
  Result::Success { value } => // use value,
  Result::Error { code, message } => // handle error
}

// Creation
const color = Color::Red;
const success = Result::Success { value: 42 };
const error = Result::Error { code: 1, message: "fail" };
```

---

## Ledger Types (State Containers)

### Counter

```compact
ledger myCounter: Counter;

// Operations
myCounter = 0;              // Initialize
myCounter = myCounter + 1;  // Increment
const val = myCounter;      // Read
```

### Set<T>

```compact
ledger members: Set<Bytes<32>>;

// Operations
members.insert(item);       // Add item
members.remove(item);       // Remove item
members.member(item);       // Check membership (Boolean)
```

### Map<K, V>

```compact
ledger balances: Map<Bytes<32>, Uint<64>>;

// Operations
balances[key] = value;      // Insert/update
const val = balances[key];  // Lookup (fails if missing)
balances.lookup(key);       // Returns Maybe<V>
balances.remove(key);       // Remove entry
```

### List<T>

```compact
ledger items: List<Bytes<32>>;

// Operations
items.push(item);           // Add to end
const item = items.pop();   // Remove from end
const len = items.length;   // Get length
const item = items[index];  // Index access
```

### MerkleTree<n, T>

```compact
ledger tree: MerkleTree<20, Bytes<32>>;  // 2^20 leaves

// Operations (typically via witnesses)
// Insertions and proofs require witness functions
```

### HistoricMerkleTree<n, T>

```compact
ledger tree: HistoricMerkleTree<20, Bytes<32>>;

// Append-only tree with historical root access
// Roots are preserved for historical membership proofs
```

---

## Type Conversion

### Implicit Widening

```compact
// Smaller Uint to larger (automatic)
const small: Uint<8> = 42;
const large: Uint<64> = small;  // OK
```

### Explicit Narrowing

```compact
// Larger to smaller requires assertion
const large: Uint<64> = 42;
assert large <= 255;
const small: Uint<8> = large as Uint<8>;
```

### No Implicit Conversions

```compact
// These don't auto-convert:
// - Uint to Field
// - Field to Uint
// - Bytes<n> to Bytes<m>
// - Opaque to anything
```

---

## Type Inference

```compact
// Type can often be inferred
const x = 42;           // Inferred as Uint
const y = true;         // Inferred as Boolean
const z = (1, 2);       // Inferred as tuple

// Sometimes explicit needed
const a: Uint<64> = 0;  // Specify bit width
const b: Field = 0;     // Field not Uint
```

---

## Generic Patterns

### Maybe<T>

```compact
// Standard library type for optional values
enum Maybe<T> {
  None,
  Some { value: T }
}

// Usage
const result: Maybe<Uint<64>> = map.lookup(key);
match result {
  Maybe::None => // handle missing,
  Maybe::Some { value } => // use value
}
```

### Either<L, R>

```compact
// Standard library for error handling
enum Either<L, R> {
  Left { value: L },
  Right { value: R }
}

// Commonly: Left = error, Right = success
type Result<T, E> = Either<E, T>;
```
