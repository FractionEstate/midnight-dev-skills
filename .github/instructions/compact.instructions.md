---
description: Compact language guidelines for Midnight Network smart contracts
name: Compact Language
applyTo: '**/*.compact'
---

# Compact Smart Contract Language Guidelines

You are an expert in Compact, the domain-specific language for Midnight Network smart contracts
with zero-knowledge proof capabilities.

## Pragma Declaration

Always start Compact files with the correct pragma:

```compact
pragma language_version 0.18;

import CompactStandardLibrary;
```

> **Note**: Since Compact 0.13+, the standard library is a builtin module imported as `CompactStandardLibrary`.

## Type System

### Primitive Types

- `Boolean`: true/false values
- `Uint<N>`: Unsigned integers with N-bit width (e.g., Uint<32>, Uint<64>)
- `Uint<0..N>`: Bounded integers with explicit bounds (0 to N inclusive)
- `Field`: Field elements for ZK operations (hashing, commitments)
- `Bytes<N>`: Fixed-length byte arrays
- `Opaque<"string">` / `Opaque<"Uint8Array">`: Sensitive data that stays off-chain
- `Opaque<"string">` / `Opaque<"Uint8Array">`: “Foreign” JS values that Compact can store/return but cannot inspect.
  - Only these two tags are currently supported.
  - **Important:** Opaque values are _opaque only to Compact_, not private on-chain.

### Compound Types

```compact
// Structs
struct Person {
  name: Bytes<32>,
  age: Uint<8>,
  isActive: Boolean
}

// Enums
enum Status {
  Pending,
  Active,
  Completed
}

// Tuples (heterogeneous)
// [] is the empty tuple type used for “no return value”
// [T1, T2, ...] is a tuple type of length N

// Vectors
Vector<N, T>  // Shorthand for a tuple type of length N with all elements type T

// Optional-like values
// The standard library provides `Maybe<T>` and constructors `some()` / `none()`.
```

## Ledger State

### Available Ledger Types

```compact
// Single values: declaring a Compact type `T` creates an implicit Cell<T>
export ledger config: Config;

// Auto-incrementing (Uint<64> value, increment/decrement by Uint<16>)
export ledger counter: Counter;

// Collections
export ledger balances: Map<Bytes<32>, Uint<64>>;
export ledger members: Set<Bytes<32>>;
export ledger items: List<Bytes<32>>;

// Cryptographic
export ledger commitments: MerkleTree<20, Bytes<32>>;
export ledger history: HistoricMerkleTree<20, Bytes<32>>;

// Note: You cannot write `Cell<T>` explicitly in a ledger declaration.
```

## Circuit Definitions

### Pure Circuits (No State Changes)

```compact
export pure circuit calculateId(x: Bytes<32>): Bytes<32> {
  // Hashing APIs are in CompactStandardLibrary (see docs linked below)
  return persistentHash<Bytes<32>>(x);
}
```

### Impure Circuits (State Changes)

```compact
// Circuits become impure when they access/modify ledger state
export circuit updateBalance(
  address: Bytes<32>,
  amount: Uint<64>
): [] {
  // Map operations are `insert`, `lookup`, `member`, `remove`, ...
  balances.insert(disclose(address), disclose(amount));
}
```

### About inputs and privacy

- Circuit arguments and witness returns are treated as potentially private (“witness data”).
- **Explicit disclosure** is required before storing potential witness data in public ledger state,
  returning it from an exported circuit, or passing it to another contract.
- Declare disclosure by wrapping the expression with `disclose(...)`.
- Some stdlib functions (e.g. commitment functions) are treated as “safe” by the compiler and don’t
  require explicit disclosure for their outputs.

## Assertions

Always include descriptive error messages:

```compact
assert(balance >= amount, "Insufficient balance");
assert(members.member(addr), "Not a member");
assert(!members.member(addr), "Already a member");
```

## Standard Library

Since Compact 0.13+, the standard library is a builtin module:

```compact
import CompactStandardLibrary;
```

Key pieces include:

- Data types: `Maybe<T>`, `Either<A,B>`, `CurvePoint`, `MerkleTreeDigest`, `ContractAddress`, ...
- Hashing/commitment: `transientHash`, `persistentHash`, `transientCommit`, `persistentCommit`
- Time helpers: `blockTimeLt`, `blockTimeLte`, `blockTimeGt`, `blockTimeGte`
- Coin/Zswap helpers: `ownPublicKey`, `send`, `receive`, `mintToken`, ...
- Utilities: `some`, `none`, `left`, `right`, and the `disclose(...)` wrapper

Authoritative reference: <https://docs.midnight.network/compact/compact-std-library>

## Best Practices

1. **Use appropriate types**: Choose the smallest Uint that fits your data
2. **Hash sensitive data**: Never store plaintext secrets in ledger
3. **Validate inputs**: Assert valid ranges and conditions
4. **Keep circuits focused**: One responsibility per circuit
5. **Document public interfaces**: Add comments for exported circuits

## Ledger ADT reference

- Ledger field operations (`Counter`, `Map`, `Set`, `List`, `MerkleTree`, ...) are documented at:
  <https://docs.midnight.network/compact/ledger-adt>
