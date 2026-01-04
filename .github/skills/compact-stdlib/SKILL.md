---
name: compact-stdlib
description: Use the Compact standard library for cryptographic operations, coin management, and utility functions. Covers hashing (transient/persistent), elliptic curve operations, Maybe/Either types, coin transfer functions, and block time access.
---

# Compact Standard Library

The Compact standard library provides essential functions for cryptographic operations, coin management, and common utilities. These functions are optimized for zero-knowledge proof generation.

## When to Use

- Implementing cryptographic commitments and hashes
- Managing coins and token transfers
- Building privacy-preserving data structures
- Handling optional values and errors
- Accessing blockchain context (block time)

## Hashing Functions

### Transient Hash

For values that don't persist between transactions:

```compact
// transientHash - for temporary commitments
// Hash disappears after transaction completes

circuit createTemporaryCommitment(secret: Field, value: Uint<64>): Field {
  return transientHash(secret, value);
}

// Multiple inputs
circuit hashMultiple(a: Field, b: Field, c: Uint<64>): Field {
  return transientHash(a, b, c);
}
```

### Persistent Hash

For values that persist on-chain:

```compact
// persistentHash - stored on blockchain
// Consistent across transactions

circuit createPermanentHash(data: Bytes<32>): Field {
  return persistentHash(data);
}

// Hash struct data
circuit hashUser(user: User): Field {
  return persistentHash(user.id, user.balance);
}
```

### Persistent Commit

For hiding values with randomness:

```compact
// persistentCommit - commitment with blinding factor
// commit = hash(value, randomness)

witness randomness: Field;

circuit createCommitment(value: Uint<64>): Field {
  return persistentCommit(value, randomness);
}

// Commitment scheme:
// - Hiding: Can't determine value from commitment
// - Binding: Can't find different value with same commitment
```

### Choosing Hash Type

| Function | Use Case | Persistence |
|----------|----------|-------------|
| `transientHash` | Temporary proofs, within-tx checks | No |
| `persistentHash` | On-chain identifiers, state roots | Yes |
| `persistentCommit` | Hidden values with opening | Yes |

## Elliptic Curve Operations

### Point Addition

```compact
// Add two curve points
circuit addPoints(p1: CurvePoint, p2: CurvePoint): CurvePoint {
  return ecAdd(p1, p2);
}
```

### Scalar Multiplication

```compact
// Multiply point by scalar
circuit scalarMult(point: CurvePoint, scalar: Field): CurvePoint {
  return ecMul(point, scalar);
}

// Generate public key from private
circuit derivePublicKey(privateKey: Field): CurvePoint {
  return ecMul(generator(), privateKey);
}
```

### Generator Point

```compact
// Get the curve generator point
circuit getGenerator(): CurvePoint {
  return generator();
}
```

## Maybe Type (Optional Values)

```compact
// Maybe<T> for optional values
enum Maybe<T> {
  None,
  Some { value: T }
}

// Map lookup returns Maybe
circuit safeGet(key: Bytes<32>): Maybe<Uint<64>> {
  return balances.lookup(key);
}

// Handle Maybe
circuit processBalance(key: Bytes<32>): Uint<64> {
  const result = balances.lookup(key);

  match result {
    Maybe::None => return 0,
    Maybe::Some { value } => return value
  }
}

// isNone / isSome helpers
circuit checkExists(maybe: Maybe<Uint<64>>): Boolean {
  match maybe {
    Maybe::None => return false,
    Maybe::Some { value } => return true
  }
}
```

## Either Type (Result/Error)

```compact
// Either<L, R> for success/error
enum Either<L, R> {
  Left { value: L },
  Right { value: R }
}

// Convention: Left = error, Right = success
circuit divide(a: Uint<64>, b: Uint<64>): Either<Uint<8>, Uint<64>> {
  if b == 0 {
    return Either::Left { value: 1 };  // Error code
  }
  return Either::Right { value: a / b };
}

// Handle result
circuit safeDivide(a: Uint<64>, b: Uint<64>): Uint<64> {
  const result = divide(a, b);

  match result {
    Either::Left { value } => {
      assert false;  // Division by zero
      return 0;
    },
    Either::Right { value } => return value
  }
}
```

## Coin Management

### Token Type

```compact
// Get token type identifier
circuit getNativeToken(): Bytes<32> {
  return tokenType();
}

// Get specific token
circuit getCustomToken(id: Bytes<32>): Bytes<32> {
  return id;  // Token type is just its identifier
}

// Native token constant
circuit isNativeToken(token: Bytes<32>): Boolean {
  return token == nativeToken();
}
```

### Native Token

```compact
// Reference to native token (tDUST)
circuit transferNative(amount: Uint<64>, recipient: Bytes<32>): [] {
  send(nativeToken(), amount, recipient);
}
```

### Send Coins

```compact
// Send coins to a recipient
circuit sendPayment(
  token: Bytes<32>,
  amount: Uint<64>,
  recipient: Bytes<32>
): [] {
  send(token, amount, recipient);
}

// Multiple sends
circuit splitPayment(
  token: Bytes<32>,
  amounts: Vector<3, Uint<64>>,
  recipients: Vector<3, Bytes<32>>
): [] {
  for i in 0..3 {
    send(token, amounts[i], recipients[i]);
  }
}
```

### Receive Coins

```compact
// Receive coins from transaction
circuit receivePayment(
  token: Bytes<32>,
  expectedAmount: Uint<64>
): [] {
  receive(token, expectedAmount);
}

// Receive with validation
circuit receiveAndValidate(
  token: Bytes<32>,
  minAmount: Uint<64>
): Uint<64> {
  const received = receiveAmount(token);
  assert received >= minAmount;
  return received;
}
```

### Mint Token

```compact
// Mint new tokens (contract must have authority)
circuit mintTokens(
  tokenId: Bytes<32>,
  amount: Uint<64>,
  recipient: Bytes<32>
): [] {
  mintToken(tokenId, amount, recipient);
}
```

## Block Time Access

```compact
// Access current block timestamp
circuit checkExpiration(deadline: Uint<64>): Boolean {
  const now = blockTime();
  return now >= deadline;
}

// Time-locked operations
circuit timeLockedWithdraw(unlockTime: Uint<64>): [] {
  assert blockTime() >= unlockTime;
  // Proceed with withdrawal
}

// Set future deadline
circuit setDeadline(durationSeconds: Uint<64>): Uint<64> {
  return blockTime() + durationSeconds;
}
```

## Disclose (Make Public)

```compact
// Reveal private value publicly
circuit revealValue(secretValue: Uint<64>): [] {
  disclose(secretValue);
}

// Conditional disclosure
circuit conditionalReveal(value: Uint<64>, shouldReveal: Boolean): [] {
  if shouldReveal {
    disclose(value);
  }
}
```

## Assertion

```compact
// Assert conditions
circuit validateInput(value: Uint<64>): [] {
  assert value > 0;
  assert value <= 1000;
}

// Assert with expression
circuit ensureAuthorized(caller: Bytes<32>, owner: Bytes<32>): [] {
  assert caller == owner;
}
```

## Common Patterns

### Commitment Scheme

```compact
witness secret: Field;
ledger commitments: Set<Field>;

// Commit a value (hide it)
circuit commit(value: Uint<64>): Field {
  const commitment = persistentCommit(value, secret);
  commitments.insert(commitment);
  return commitment;
}

// Reveal and verify
circuit reveal(value: Uint<64>, commitment: Field): [] {
  const computed = persistentCommit(value, secret);
  assert computed == commitment;
  assert commitments.member(commitment);
  disclose(value);
}
```

### Nullifier Pattern

```compact
ledger nullifiers: Set<Field>;

witness secret: Field;

circuit spend(commitment: Field): [] {
  // Create nullifier from secret
  const nullifier = transientHash(secret, commitment);

  // Ensure not already spent
  assert !nullifiers.member(nullifier);

  // Mark as spent
  nullifiers.insert(nullifier);
}
```

### Merkle Proof Verification

```compact
ledger root: Field;

witness path: Vector<20, Field>;
witness indices: Vector<20, Boolean>;

circuit verifyMembership(leaf: Field): Boolean {
  let current = leaf;

  for i in 0..20 {
    const sibling = path[i];
    current = if indices[i] {
      persistentHash(sibling, current)
    } else {
      persistentHash(current, sibling)
    };
  }

  return current == root;
}
```

## Function Reference

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `transientHash(...)` | Any values | `Field` | Temporary hash |
| `persistentHash(...)` | Any values | `Field` | Permanent hash |
| `persistentCommit(v, r)` | Value, randomness | `Field` | Commitment |
| `ecAdd(p1, p2)` | CurvePoints | `CurvePoint` | Point addition |
| `ecMul(p, s)` | Point, scalar | `CurvePoint` | Scalar mult |
| `generator()` | None | `CurvePoint` | Generator |
| `nativeToken()` | None | `Bytes<32>` | tDUST type |
| `tokenType()` | None | `Bytes<32>` | Current token |
| `send(t, a, r)` | Token, amount, recipient | `[]` | Send coins |
| `receive(t, a)` | Token, amount | `[]` | Receive coins |
| `mintToken(t, a, r)` | Token, amount, recipient | `[]` | Mint tokens |
| `blockTime()` | None | `Uint<64>` | Current time |
| `disclose(v)` | Value | `[]` | Make public |
| `assert(c)` | Boolean | `[]` | Verify condition |

## Related Skills

- [compact-type-system](../compact-type-system/SKILL.md) - Types reference
- [privacy-data-patterns](../privacy-data-patterns/SKILL.md) - Privacy patterns
- [zswap-transactions](../zswap-transactions/SKILL.md) - Token transfers

## References

- [Compact Standard Library](https://docs.midnight.network/develop/reference/compact/std-lib)
- [Compact Language Reference](https://docs.midnight.network/develop/reference/compact/lang-ref)
