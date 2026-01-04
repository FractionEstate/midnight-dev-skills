---
name: compact-type-system
description: Master Compact's type system for building type-safe smart contracts. Covers primitive types (Boolean, Uint, Field, Bytes, Opaque), composite types (Tuples, Vector, struct, enum), and contract types with examples and best practices.
---

# Compact Type System

Compact provides a rich type system designed for zero-knowledge proof generation. Understanding types is essential for writing correct, efficient smart contracts.

## When to Use

- Designing contract state structures
- Choosing appropriate data representations
- Optimizing proof generation performance
- Ensuring type safety in contract logic

## Primitive Types

### Boolean

```compact
// Boolean: true or false
ledger isActive: Boolean;

circuit toggle(): [] {
  isActive = !isActive;
}

circuit checkCondition(value: Uint<64>): Boolean {
  return value > 100;
}
```

### Unsigned Integers - Uint<m..n>

Range-constrained integers for efficient proofs:

```compact
// Fixed-size unsigned integers
ledger count: Uint<64>;           // 0 to 2^64-1
ledger smallValue: Uint<8>;       // 0 to 255
ledger largeValue: Uint<256>;     // 0 to 2^256-1

// Range-constrained (minimum to maximum)
ledger percentage: Uint<0..100>;  // 0 to 100 inclusive
ledger score: Uint<1..10>;        // 1 to 10 inclusive

// Operations
circuit math(a: Uint<64>, b: Uint<64>): Uint<64> {
  const sum = a + b;      // Addition
  const diff = a - b;     // Subtraction (must not underflow)
  const prod = a * b;     // Multiplication
  const quot = a / b;     // Division
  const rem = a % b;      // Modulo
  return sum;
}
```

### Field

Prime field elements for cryptographic operations:

```compact
// Field: element of the scalar field
ledger secretHash: Field;

// Field operations
circuit fieldMath(a: Field, b: Field): Field {
  const sum = a + b;
  const prod = a * b;
  return sum * prod;
}

// Field is used for:
// - Hash outputs
// - Cryptographic commitments
// - Merkle tree nodes
```

### Bytes<n>

Fixed-length byte arrays:

```compact
// Fixed-length byte sequences
ledger hash32: Bytes<32>;         // 32 bytes (256 bits)
ledger address: Bytes<20>;        // 20 bytes (160 bits)
ledger data: Bytes<64>;           // 64 bytes

// Common patterns
ledger txHash: Bytes<32>;
ledger signature: Bytes<64>;
ledger publicKey: Bytes<33>;

// Bytes comparison
circuit compareHashes(a: Bytes<32>, b: Bytes<32>): Boolean {
  return a == b;
}
```

### Opaque<s>

External type references (resolved at runtime):

```compact
// Reference to external types
ledger message: Opaque<"string">;
ledger customData: Opaque<"MyCustomType">;
ledger jsonPayload: Opaque<"JSON">;

// Common opaque types
ledger userName: Opaque<"string">;
ledger timestamp: Opaque<"number">;
ledger metadata: Opaque<"object">;
```

## Composite Types

### Tuples

Fixed-size heterogeneous collections:

```compact
// Tuple types
ledger pair: (Uint<64>, Boolean);
ledger triple: (Bytes<32>, Uint<64>, Field);

// Access elements
circuit useTuple(t: (Uint<64>, Bytes<32>)): Uint<64> {
  const (value, hash) = t;  // Destructure
  return value;
}

// Create tuples
circuit makePair(a: Uint<64>, b: Boolean): (Uint<64>, Boolean) {
  return (a, b);
}
```

### Vector<n, T>

Fixed-length arrays of uniform type:

```compact
// Fixed-size arrays
ledger scores: Vector<10, Uint<64>>;      // 10 uint64s
ledger hashes: Vector<5, Bytes<32>>;      // 5 32-byte hashes
ledger flags: Vector<8, Boolean>;          // 8 booleans

// Indexing (0-based)
circuit getScore(index: Uint<4>): Uint<64> {
  return scores[index];
}

// Iteration
circuit sumScores(): Uint<64> {
  let total: Uint<64> = 0;
  for i in 0..10 {
    total = total + scores[i];
  }
  return total;
}
```

### Struct

Named field collections:

```compact
// Define struct type
struct User {
  id: Bytes<32>,
  balance: Uint<64>,
  isActive: Boolean
}

// Use in ledger
ledger owner: User;

// Create struct
circuit createUser(id: Bytes<32>): User {
  return User {
    id: id,
    balance: 0,
    isActive: true
  };
}

// Access fields
circuit getBalance(user: User): Uint<64> {
  return user.balance;
}

// Update struct (create new)
circuit updateBalance(user: User, amount: Uint<64>): User {
  return User {
    id: user.id,
    balance: amount,
    isActive: user.isActive
  };
}
```

### Enum

Tagged unions for variant types:

```compact
// Define enum
enum Status {
  Pending,
  Active { since: Uint<64> },
  Completed { result: Boolean, timestamp: Uint<64> }
}

ledger currentStatus: Status;

// Match on enum
circuit checkStatus(): Boolean {
  match currentStatus {
    Status::Pending => return false,
    Status::Active { since } => return since > 0,
    Status::Completed { result, timestamp } => return result
  }
}

// Create variants
circuit setPending(): [] {
  currentStatus = Status::Pending;
}

circuit setActive(time: Uint<64>): [] {
  currentStatus = Status::Active { since: time };
}
```

## Contract Types

Contracts group related state and operations:

```compact
// Full contract definition
contract MyContract {
  // Ledger state
  ledger counter: Uint<64>;
  ledger owner: Bytes<32>;

  // Constructor (optional)
  constructor(initialOwner: Bytes<32>) {
    counter = 0;
    owner = initialOwner;
  }

  // Circuits
  circuit increment(): [] {
    counter = counter + 1;
  }

  circuit getCounter(): Uint<64> {
    return counter;
  }
}
```

## Type Constraints

### Range Constraints

```compact
// Constrained ranges for optimization
ledger age: Uint<0..150>;           // 0-150
ledger percentage: Uint<0..100>;    // 0-100
ledger dayOfWeek: Uint<1..7>;       // 1-7

// Tighter ranges = smaller proofs
ledger hour: Uint<0..23>;
ledger minute: Uint<0..59>;
```

### Bit-width Optimization

```compact
// Choose smallest sufficient bit-width
ledger flags: Uint<8>;          // 8-bit for small values
ledger balance: Uint<64>;       // 64-bit for amounts
ledger bigNumber: Uint<256>;    // 256-bit for crypto

// Trade-off: larger = more expensive proofs
```

## Type Conversions

### Widening

```compact
// Smaller to larger is automatic
circuit widen(small: Uint<8>): Uint<64> {
  return small;  // Implicit widening
}
```

### Narrowing (Explicit)

```compact
// Larger to smaller requires care
circuit narrow(large: Uint<64>): Uint<8> {
  assert large <= 255;  // Ensure fits
  return large as Uint<8>;
}
```

## Best Practices

### 1. Use Appropriate Bit Widths

```compact
// Good: appropriate for use case
ledger userId: Uint<32>;        // Up to 4 billion users
ledger balance: Uint<64>;       // Handles large amounts

// Avoid: oversized types waste proof space
// ledger small: Uint<256>;     // When Uint<64> suffices
```

### 2. Prefer Structs for Related Data

```compact
// Good: grouped related data
struct Transaction {
  sender: Bytes<32>,
  receiver: Bytes<32>,
  amount: Uint<64>,
  timestamp: Uint<64>
}

// Avoid: scattered related values
// ledger txSender: Bytes<32>;
// ledger txReceiver: Bytes<32>;
// ledger txAmount: Uint<64>;
```

### 3. Use Enums for State Machines

```compact
// Good: clear state representation
enum AuctionState {
  NotStarted,
  Active { endTime: Uint<64> },
  Ended { winner: Bytes<32>, amount: Uint<64> }
}
```

### 4. Bound All Ranges

```compact
// Good: explicit bounds
ledger score: Uint<0..100>;

// Risky: unbounded can cause issues
// ledger score: Uint<64>;  // Could overflow expectations
```

## Type Reference Quick Guide

| Type | Description | Example |
|------|-------------|---------|
| `Boolean` | True/false | `ledger flag: Boolean;` |
| `Uint<n>` | n-bit unsigned | `ledger count: Uint<64>;` |
| `Uint<a..b>` | Range a to b | `ledger pct: Uint<0..100>;` |
| `Field` | Prime field | `ledger hash: Field;` |
| `Bytes<n>` | n bytes | `ledger data: Bytes<32>;` |
| `Opaque<s>` | External type | `ledger msg: Opaque<"string">;` |
| `(T1, T2)` | Tuple | `ledger pair: (Uint<64>, Boolean);` |
| `Vector<n,T>` | Array | `ledger arr: Vector<10, Uint<64>>;` |
| `struct` | Named fields | `struct User { ... }` |
| `enum` | Variants | `enum Status { ... }` |

## Related Skills

- [compact-smart-contracts](../compact-smart-contracts/SKILL.md) - Contract basics
- [compact-stdlib](../compact-stdlib/SKILL.md) - Standard library
- [ledger-state-patterns](../ledger-state-patterns/SKILL.md) - State management

## References

- [Compact Type Reference](https://docs.midnight.network/develop/reference/compact/lang-ref)
- [Writing Compact Contracts](https://docs.midnight.network/develop/reference/compact/writing)
