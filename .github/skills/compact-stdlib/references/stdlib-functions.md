# Compact Standard Library Functions Reference

## Hashing Functions

### transientHash

Creates a hash that exists only during transaction execution.

```compact
// Signature
transientHash(...values: any[]): Field

// Usage
const hash = transientHash(a, b, c);

// Properties
// - Non-persistent: disappears after tx
// - Fast: optimized for within-tx operations
// - Use for: temporary proofs, intermediate calculations
```

### persistentHash

Creates a hash that persists on-chain.

```compact
// Signature
persistentHash(...values: any[]): Field

// Usage
const hash = persistentHash(data);
const multiHash = persistentHash(a, b, c);

// Properties
// - Persistent: stored on blockchain
// - Deterministic: same inputs = same output
// - Use for: identifiers, state roots, public commitments
```

### persistentCommit

Creates a cryptographic commitment (hash with blinding factor).

```compact
// Signature
persistentCommit(value: T, randomness: Field): Field

// Usage
witness r: Field;
const commitment = persistentCommit(secretValue, r);

// Properties
// - Hiding: value cannot be determined from commitment
// - Binding: cannot find different value with same commitment
// - Use for: hidden balances, sealed bids, private votes
```

---

## Elliptic Curve Operations

### ecAdd

Add two elliptic curve points.

```compact
// Signature
ecAdd(p1: CurvePoint, p2: CurvePoint): CurvePoint

// Usage
const sum = ecAdd(point1, point2);

// Properties
// - Group operation on curve
// - Commutative: ecAdd(a, b) == ecAdd(b, a)
```

### ecMul

Multiply a curve point by a scalar.

```compact
// Signature
ecMul(point: CurvePoint, scalar: Field): CurvePoint

// Usage
const result = ecMul(generator(), privateKey);

// Properties
// - Scalar multiplication
// - Used for key derivation
// - result = point * scalar (in group notation)
```

### generator

Get the elliptic curve generator point.

```compact
// Signature
generator(): CurvePoint

// Usage
const G = generator();
const publicKey = ecMul(G, privateKey);

// Properties
// - Standard generator for the curve
// - Fixed, well-known point
```

---

## Coin Management

### nativeToken

Get the native token type (tDUST).

```compact
// Signature
nativeToken(): Bytes<32>

// Usage
const dust = nativeToken();
send(nativeToken(), 100, recipient);

// Properties
// - Returns token type identifier
// - Native to Midnight network
```

### tokenType

Get the current token type in context.

```compact
// Signature
tokenType(): Bytes<32>

// Usage
const currentToken = tokenType();
```

### send

Send coins to a recipient.

```compact
// Signature
send(token: Bytes<32>, amount: Uint<64>, recipient: Bytes<32>): []

// Usage
send(nativeToken(), 100, recipientAddress);

// Properties
// - Creates output in transaction
// - Recipient receives coins
// - Must be balanced by inputs
```

### receive

Receive coins from transaction inputs.

```compact
// Signature
receive(token: Bytes<32>, amount: Uint<64>): []

// Usage
receive(nativeToken(), 100);

// Properties
// - Consumes input from transaction
// - Contract receives the coins
// - Amount must match available input
```

### mintToken

Mint new tokens.

```compact
// Signature
mintToken(tokenId: Bytes<32>, amount: Uint<64>, recipient: Bytes<32>): []

// Usage
mintToken(customTokenId, 1000, recipientAddress);

// Properties
// - Creates new tokens
// - Contract must have minting authority
// - Increases total supply
```

---

## Time Functions

### blockTime

Get current block timestamp.

```compact
// Signature
blockTime(): Uint<64>

// Usage
const now = blockTime();
assert blockTime() >= deadline;

// Properties
// - Unix timestamp (seconds since epoch)
// - Set by block producer
// - Approximate, not precise
```

---

## Control Flow

### assert

Assert a condition is true.

```compact
// Signature
assert(condition: Boolean): []

// Usage
assert value > 0;
assert caller == owner;
assert balances[key] >= amount;

// Properties
// - Fails transaction if false
// - No return value
// - Use for validation
```

### disclose

Make a value public (visible on-chain).

```compact
// Signature
disclose(value: T): []

// Usage
disclose(finalResult);
disclose(winningBid);

// Properties
// - Reveals private value publicly
// - Value becomes visible on blockchain
// - Irreversible within transaction
```

---

## Maybe Type

### Definition

```compact
enum Maybe<T> {
  None,
  Some { value: T }
}
```

### Usage Patterns

```compact
// Creation
const none: Maybe<Uint<64>> = Maybe::None;
const some: Maybe<Uint<64>> = Maybe::Some { value: 42 };

// Pattern matching
match maybeValue {
  Maybe::None => // handle missing,
  Maybe::Some { value } => // use value
}

// With map lookup
const result = balances.lookup(key);  // Returns Maybe<V>

// Unwrap with default
circuit unwrapOr(maybe: Maybe<Uint<64>>, default: Uint<64>): Uint<64> {
  match maybe {
    Maybe::None => return default,
    Maybe::Some { value } => return value
  }
}
```

---

## Either Type

### Definition

```compact
enum Either<L, R> {
  Left { value: L },
  Right { value: R }
}
```

### Usage Patterns

```compact
// Convention: Left = error, Right = success
type Result<T, E> = Either<E, T>;

// Creation
const error: Either<Uint<8>, Uint<64>> = Either::Left { value: 1 };
const success: Either<Uint<8>, Uint<64>> = Either::Right { value: 42 };

// Pattern matching
match result {
  Either::Left { value } => // handle error with code `value`,
  Either::Right { value } => // use success value
}

// Error handling example
circuit safeDivide(a: Uint<64>, b: Uint<64>): Either<Uint<8>, Uint<64>> {
  if b == 0 {
    return Either::Left { value: 1 };  // Error: division by zero
  }
  return Either::Right { value: a / b };
}
```

---

## CurvePoint Type

### Definition

```compact
// Elliptic curve point (x, y coordinates)
// Internal representation - not directly constructible
struct CurvePoint {
  // Implementation details hidden
}
```

### Operations

```compact
// Only through stdlib functions
const G = generator();              // Get generator
const P = ecMul(G, scalar);         // Scalar multiplication
const Q = ecAdd(P1, P2);            // Point addition
```

---

## Common Patterns

### Safe Map Access

```compact
circuit safeGet(key: Bytes<32>): Uint<64> {
  const maybe = balances.lookup(key);
  match maybe {
    Maybe::None => return 0,
    Maybe::Some { value } => return value
  }
}
```

### Error Propagation

```compact
circuit process(input: Uint<64>): Either<Uint<8>, Uint<64>> {
  if input == 0 {
    return Either::Left { value: 1 };
  }

  const result = compute(input);
  if result > MAX_VALUE {
    return Either::Left { value: 2 };
  }

  return Either::Right { value: result };
}
```

### Time-Based Logic

```compact
circuit canExecute(deadline: Uint<64>): Boolean {
  return blockTime() >= deadline;
}

circuit setExpiration(durationSeconds: Uint<64>): Uint<64> {
  return blockTime() + durationSeconds;
}
```

### Commitment/Reveal

```compact
witness secret: Field;

circuit commit(value: Uint<64>): Field {
  return persistentCommit(value, secret);
}

circuit reveal(value: Uint<64>, commitment: Field): Boolean {
  return persistentCommit(value, secret) == commitment;
}
```
