# Compact Type System

Complete reference for Compact's type system optimized for zero-knowledge proofs.

## Primitive Types

### Boolean

```compact
ledger isActive: Boolean;
circuit checkCondition(value: Uint<64>): Boolean {
  return value > 100;
}
```

### Unsigned Integers - `Uint<N>`

| Type         | Range      | Use Case              |
| ------------ | ---------- | --------------------- |
| `Uint<8>`    | 0-255      | Flags, small counters |
| `Uint<32>`   | 0-4B       | User IDs, timestamps  |
| `Uint<64>`   | 0-18×10¹⁸  | Balances, amounts     |
| `Uint<128>`  | Very large | Big numbers           |
| `Uint<256>`  | Huge       | Crypto primitives     |
| `Uint<a..b>` | a to b     | Constrained ranges    |

```compact
ledger count: Uint<64>;
ledger percentage: Uint<0..100>;  // Range-constrained

circuit math(a: Uint<64>, b: Uint<64>): Uint<64> {
  return a + b;  // Also: -, *, /, %
}
```

### Field

Prime field elements for cryptographic operations:

```compact
ledger secretHash: Field;

circuit fieldMath(a: Field, b: Field): Field {
  return a + b * a;  // Field arithmetic
}
```

**Use for:** Hash outputs, commitments, Merkle nodes, EC operations.

### `Bytes<N>`

Fixed-length byte arrays:

```compact
ledger hash32: Bytes<32>;      // 256 bits
ledger address: Bytes<32>;     // 256-bit identifiers (common for Midnight addresses/IDs)
ledger signature: Bytes<64>;   // 512 bits
```

### `Opaque<S>`

External type references resolved at runtime:

```compact
ledger message: Opaque<"string">;
ledger timestamp: Uint<64>;  // Prefer Compact numeric types for on-ledger arithmetic
ledger metadata: Opaque<"object">;
```

## Composite Types

### Tuples

```compact
ledger pair: (Uint<64>, Boolean);

circuit useTuple(t: (Uint<64>, Bytes<32>)): Uint<64> {
  const (value, hash) = t;  // Destructure
  return value;
}
```

### `Vector<N, T>`

Fixed-length arrays:

```compact
ledger scores: Vector<10, Uint<64>>;

circuit sumScores(): Uint<64> {
  let total: Uint<64> = 0;
  for i in 0..10 {
    total = total + scores[i];
  }
  return total;
}
```

### Struct

```compact
struct User {
  id: Bytes<32>,
  balance: Uint<64>,
  isActive: Boolean
}

ledger owner: User;

circuit createUser(id: Bytes<32>): User {
  return User {
    id: id,
    balance: 0,
    isActive: true
  };
}
```

### Enum

Tagged unions for variant types:

```compact
enum Status {
  Pending,
  Active { since: Uint<64> },
  Completed { result: Boolean, timestamp: Uint<64> }
}

ledger currentStatus: Status;

circuit checkStatus(): Boolean {
  match currentStatus {
    Status::Pending => return false,
    Status::Active { since } => return since > 0,
    Status::Completed { result, timestamp } => return result
  }
}
```

## Type Conversions

### Widening (Automatic)

```compact
circuit widen(small: Uint<8>): Uint<64> {
  return small;  // Implicit widening
}
```

### Narrowing (Explicit)

```compact
circuit narrow(large: Uint<64>): Uint<8> {
  assert large <= 255;
  return large as Uint<8>;
}
```

## Best Practices

1. **Use smallest bit width** that fits your data
2. **Prefer structs** for related data
3. **Use enums** for state machines
4. **Bound all ranges** explicitly
5. **Field for crypto** operations

## Quick Reference

| Type          | Description    | Example                             |
| ------------- | -------------- | ----------------------------------- |
| `Boolean`     | True/false     | `ledger flag: Boolean;`             |
| `Uint<n>`     | n-bit unsigned | `ledger count: Uint<64>;`           |
| `Uint<a..b>`  | Range a to b   | `ledger pct: Uint<0..100>;`         |
| `Field`       | Prime field    | `ledger hash: Field;`               |
| `Bytes<n>`    | n bytes        | `ledger data: Bytes<32>;`           |
| `Opaque<s>`   | External type  | `ledger msg: Opaque<"string">;`     |
| `(T1, T2)`    | Tuple          | `ledger pair: (Uint<64>, Boolean);` |
| `Vector<n,T>` | Array          | `ledger arr: Vector<10, Uint<64>>;` |
| `struct`      | Named fields   | `struct User { ... }`               |
| `enum`        | Variants       | `enum Status { ... }`               |
