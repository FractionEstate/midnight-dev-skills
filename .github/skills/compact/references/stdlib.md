# Compact Standard Library

Essential functions for cryptographic operations, coin management, and utilities.

## Hashing Functions

### transientHash

Temporary hash - disappears after transaction:

```compact
circuit createTemporaryCommitment(secret: Field, value: Uint<64>): Field {
  return transientHash(secret, value);
}

// Multiple inputs
circuit hashMultiple(a: Field, b: Field, c: Uint<64>): Field {
  return transientHash(a, b, c);
}
```

### persistentHash

Permanent hash - stored on blockchain:

```compact
circuit createPermanentHash(data: Bytes<32>): Field {
  return persistentHash(data);
}

circuit hashUser(user: User): Field {
  return persistentHash(user.id, user.balance);
}
```

### persistentCommit

Commitment with blinding factor (hiding + binding):

```compact
witness randomness: Field;

circuit createCommitment(value: Uint<64>): Field {
  return persistentCommit(value, randomness);
}
```

### Hash Type Selection

| Function | Use Case | Persistence |
|----------|----------|-------------|
| `transientHash` | Temp proofs, within-tx checks | No |
| `persistentHash` | On-chain IDs, state roots | Yes |
| `persistentCommit` | Hidden values with opening | Yes |

## Elliptic Curve Operations

```compact
// Point addition
circuit addPoints(p1: CurvePoint, p2: CurvePoint): CurvePoint {
  return ecAdd(p1, p2);
}

// Scalar multiplication
circuit scalarMult(point: CurvePoint, scalar: Field): CurvePoint {
  return ecMul(point, scalar);
}

// Derive public key from private
circuit derivePublicKey(privateKey: Field): CurvePoint {
  return ecMul(generator(), privateKey);
}

// Get generator point
circuit getGenerator(): CurvePoint {
  return generator();
}
```

## Maybe Type (Optional Values)

```compact
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
```

## Either Type (Result/Error)

```compact
enum Either<L, R> {
  Left { value: L },   // Error
  Right { value: R }   // Success
}

circuit divide(a: Uint<64>, b: Uint<64>): Either<Uint<8>, Uint<64>> {
  if b == 0 {
    return Either::Left { value: 1 };  // Error code
  }
  return Either::Right { value: a / b };
}
```

## Coin Management

### Token Operations

```compact
// Get native token (tDUST)
circuit getNativeToken(): Bytes<32> {
  return nativeToken();
}

// Check if native token
circuit isNativeToken(token: Bytes<32>): Boolean {
  return token == nativeToken();
}
```

### Send Coins

```compact
circuit sendPayment(token: Bytes<32>, amount: Uint<64>, recipient: Bytes<32>): [] {
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
circuit receivePayment(token: Bytes<32>, expectedAmount: Uint<64>): [] {
  receive(token, expectedAmount);
}

circuit receiveAndValidate(token: Bytes<32>, minAmount: Uint<64>): Uint<64> {
  const received = receiveAmount(token);
  assert received >= minAmount;
  return received;
}
```

### Mint Tokens

```compact
circuit mintTokens(tokenId: Bytes<32>, amount: Uint<64>, recipient: Bytes<32>): [] {
  mintToken(tokenId, amount, recipient);
}
```

## Block Time Access

```compact
// Get current block timestamp
circuit checkExpiration(deadline: Uint<64>): Boolean {
  return blockTime() >= deadline;
}

// Time-locked operation
circuit timeLockedWithdraw(unlockTime: Uint<64>): [] {
  assert blockTime() >= unlockTime;
  // Proceed with withdrawal
}

// Set future deadline
circuit setDeadline(durationSeconds: Uint<64>): Uint<64> {
  return blockTime() + durationSeconds;
}
```

## Disclosure & Assertion

```compact
// Make private value public
circuit revealValue(secretValue: Uint<64>): [] {
  disclose(secretValue);
}

// Assert conditions
circuit validateInput(value: Uint<64>): [] {
  assert value > 0;
  assert value <= 1000;
}

circuit ensureAuthorized(caller: Bytes<32>, owner: Bytes<32>): [] {
  assert caller == owner;
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
