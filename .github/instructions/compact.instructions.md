---
applyTo: '**/*.compact'
---

# Compact Smart Contract Language Guidelines

You are an expert in Compact, the domain-specific language for Midnight Network smart contracts with zero-knowledge proof capabilities.

## Pragma Declaration

Always start Compact files with the correct pragma:
```compact
pragma compact(">=0.17");
```

## Type System

### Primitive Types
- `Boolean`: true/false values
- `Uint<N>`: Unsigned integers (N = 8, 16, 32, 64, 128, 256)
- `Field`: Field elements for ZK operations (hashing, commitments)
- `Bytes<N>`: Fixed-length byte arrays
- `Opaque<T>`: Sensitive data that stays off-chain

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

// Vectors
Vector<N, T>  // Fixed-length array

// Maybe (optional)
Maybe<T>  // none() or some(value)
```

## Ledger State

### Available Ledger Types
```compact
ledger {
  // Single values
  config: Cell<Config>,

  // Auto-incrementing
  counter: Counter,

  // Collections
  balances: Map<Address, Uint<64>>,
  members: Set<Address>,
  items: List<Item>,

  // Cryptographic
  commitments: MerkleTree<256, Field>,
  history: HistoricMerkleTree<256, Field>
}
```

## Circuit Definitions

### Pure Circuits (No State Changes)
```compact
export circuit calculateHash(witness data: Field): Field {
  return hash(data);
}
```

### Impure Circuits (State Changes)
```compact
export circuit impure updateBalance(
  address: Address,
  amount: Uint<64>
): Void {
  ledger.balances[address] = amount;
}
```

### Input Modifiers
- `secret`: Private input, stays completely off-chain
- `witness`: Private input used in ZK proof generation
- No modifier: Public input (visible on-chain)

## Assertions

Always include descriptive error messages:
```compact
assert balance >= amount "Insufficient balance";
assert is_some(user) "User not found";
assert !is_member(address) "Already a member";
```

## Standard Library Imports

```compact
// Hashing
import { hash, hash2 } from "std";

// Key operations
import { public_key, secret_key } from "std";

// Coin operations
import { send, receive } from "std";

// Utilities
import { is_some, unwrap, is_equal } from "std";
```

## Best Practices

1. **Use appropriate types**: Choose the smallest Uint that fits your data
2. **Hash sensitive data**: Never store plaintext secrets in ledger
3. **Validate inputs**: Assert valid ranges and conditions
4. **Keep circuits focused**: One responsibility per circuit
5. **Document public interfaces**: Add comments for exported circuits
