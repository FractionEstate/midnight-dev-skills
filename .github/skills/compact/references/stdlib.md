# Compact Standard Library (v0.18)

This reference is intentionally **minimal and accurate**. For the authoritative API, see:

- <https://docs.midnight.network/compact/compact-std-library>
- <https://docs.midnight.network/compact/compact-std-library/exports>

## Hashing & commitments

From the official API:

- `transientHash<T>(value: T): Field`
- `transientCommit<T>(value: T, rand: Field): Field`
- `persistentHash<T>(value: T): Bytes<32>`
- `persistentCommit<T>(value: T, rand: Bytes<32>): Bytes<32>`

Key nuance: `transientHash` / `persistentHash` **do not** automatically protect witness inputs from disclosure.
If their input includes witness-derived values and the output flows to public state or an exported return,
you must explicitly acknowledge that with `disclose(...)`.

Commitments (`transientCommit` / `persistentCommit`) _are_ considered sufficient to protect witness inputs
assuming the randomness is unpredictable.

```compact
// Persistent identifiers (Bytes<32>)
circuit idFor(x: Bytes<32>): Bytes<32> {
  return persistentHash<Bytes<32>>(x);
}

// Persistent commitment (Bytes<32>)
circuit commitBid(bid: Uint<64>, nonce: Bytes<32>): Bytes<32> {
  return persistentCommit(bid, nonce);
}

// Transient commitment (Field)
circuit commitEphemeral(x: Field, rand: Field): Field {
  return transientCommit(x, rand);
}
```

## Maybe and Either

In Compact v0.18, `Maybe<T>` and `Either<A,B>` are **structs**:

```compact
struct Maybe<T> { isSome: Boolean, value: T }
struct Either<A, B> { isLeft: Boolean, left: A, right: B }
```

Use the constructors provided by the standard library:

```compact
circuit ok<T, E>(x: T): Either<E, T> {
  return right<E, T>(x);
}

circuit err<T, E>(e: E): Either<E, T> {
  return left<E, T>(e);
}
```

## Merkle helpers

If you have a `MerkleTreePath`, you can derive a root with:

```compact
circuit rootOf<#n, T>(path: MerkleTreePath<n, T>): MerkleTreeDigest {
  return merkleTreePathRoot<#n, T>(path);
}
```

## Block time helpers

The standard library exposes comparisons without requiring you to read the current time:

```compact
circuit isExpired(deadline: Uint<64>): Boolean {
  return blockTimeGte(deadline);
}

circuit isStillActive(deadline: Uint<64>): Boolean {
  return blockTimeLt(deadline);
}
```

## Zswap coin management (signatures)

The coin-management API is powerful but easy to get wrong; keep your contract examples aligned with
the official signatures:

- `mintToken(domainSep: Bytes<32>, value: Uint<128>, nonce: Bytes<32>, recipient: Either<ZswapCoinPublicKey, ContractAddress>): CoinInfo`
- `receive(coin: CoinInfo): []`
- `send(input: QualifiedCoinInfo, recipient: Either<ZswapCoinPublicKey, ContractAddress>, value: Uint<128>): SendResult`

For full examples, prefer linking to the official docs rather than maintaining large bespoke snippets here.
