---
name: midnight-glossary
description: Comprehensive glossary of Midnight Network terminology and concepts. Quick reference for zkSNARKs, Compact language, protocol terms, and blockchain concepts essential for Midnight development.
---

# Midnight Glossary

Quick reference for Midnight Network terminology and concepts.

## When to Use

- Understanding Midnight documentation
- Learning new concepts
- Quick reference while developing
- Onboarding new team members

## Protocol & Network

### Midnight Network
A privacy-first blockchain that uses zero-knowledge proofs to enable confidential smart contracts while maintaining regulatory compliance through selective disclosure.

### ZSwap
The token transfer protocol used by Midnight for shielded and unshielded transactions. Handles coin inputs, outputs, and value conservation.

### Shielded Transaction
A transaction where sender, receiver, and amount are hidden using zero-knowledge proofs. Only the transaction validity is publicly verifiable.

### Unshielded Transaction
A transparent transaction where details are publicly visible on-chain, similar to traditional blockchains.

### Selective Disclosure
The ability to reveal specific pieces of private information to authorized parties while keeping other data hidden. Core feature of Midnight's privacy model.

### DShield
"Disclosure Shield" - Midnight's mechanism for managing what data is disclosed and to whom.

## Zero-Knowledge Proofs

### Zero-Knowledge Proof (ZKP)
A cryptographic method allowing one party (prover) to prove to another (verifier) that a statement is true without revealing any information beyond the validity of the statement.

### zkSNARK
"Zero-Knowledge Succinct Non-Interactive Argument of Knowledge" - The specific type of ZKP used by Midnight. Proofs are small and fast to verify.

### Prover
The party generating a zero-knowledge proof. In Midnight, this is typically the user's proof server.

### Verifier
The party checking the validity of a proof. The Midnight network nodes act as verifiers.

### Witness
Private input data used to generate a proof. In Compact, declared with `witness` keyword. Never revealed on-chain.

### Circuit
A mathematical representation of a computation that can be proven in zero-knowledge. Compact contracts compile to circuits.

### Proof Server
A service that generates zero-knowledge proofs from circuit definitions and witness data. Required for Midnight transactions.

### Proving Key
Cryptographic key used by the prover to generate proofs. Specific to each circuit.

### Verification Key
Cryptographic key used to verify proofs. Smaller than proving key, stored on-chain.

## Compact Language

### Compact
Midnight's domain-specific language for writing privacy-preserving smart contracts. Compiles to ZK circuits.

### Ledger State
Public blockchain state declared with `ledger` keyword. Visible to all network participants.

```compact
ledger counter: Counter;
ledger balances: Map<Bytes<32>, Uint<64>>;
```

### Witness
Private input that only the prover knows. Declared with `witness` keyword.

```compact
witness secretValue: Field;
witness userKey: Bytes<32>;
```

### Export
A function that can be called from outside the contract. Declared with `export` keyword.

```compact
export circuit transfer(amount: Uint<64>): [] {
  // ...
}
```

### Circuit
A function in Compact that executes in zero-knowledge. Can be `export` or internal.

### Disclose
Reveal a value publicly as part of a transaction. Makes private data visible.

```compact
const result = privateValue * 2;
disclose(result);  // Now publicly visible
```

### Assert
Statement that must be true for the proof to be valid. If false, proof generation fails.

```compact
assert balance >= amount;
assert !nullifiers.member(nullifier);
```

## Data Types

### Field
A prime field element (~254 bits). Used for cryptographic operations.

### Uint<N>
Unsigned integer with N bits. Range: 0 to 2^N - 1.
```compact
Uint<8>   // 0 to 255
Uint<64>  // 0 to 18,446,744,073,709,551,615
Uint<256> // Very large numbers
```

### Bytes<N>
Fixed-size byte array of N bytes. Used for addresses, hashes, etc.
```compact
Bytes<32>  // 256-bit hash or address
Bytes<64>  // 512-bit signature
```

### Opaque<S>
Type that exists in TypeScript but is opaque to Compact. Used for complex external data.
```compact
Opaque<"EncryptedPayload">
Opaque<"UserProfile">
```

### Vector<N, T>
Fixed-size array of N elements of type T.
```compact
Vector<10, Field>      // 10 field elements
Vector<20, Boolean>    // 20 boolean flags
```

## Ledger Types

### Counter
Unsigned integer that can be incremented or compared.
```compact
ledger count: Counter;
count = count + 1;
```

### Set<T>
Unordered collection of unique elements with membership testing.
```compact
ledger nullifiers: Set<Field>;
nullifiers.insert(value);
assert !nullifiers.member(value);
```

### Map<K, V>
Key-value storage with lookup and insertion.
```compact
ledger balances: Map<Bytes<32>, Uint<64>>;
balances[address] = amount;
```

### List<T>
Ordered collection that can be indexed and iterated.
```compact
ledger entries: List<Entry>;
entries.push(newEntry);
```

### MerkleTree<N, T>
Merkle tree with 2^N leaf capacity. Provides membership proofs.
```compact
ledger memberTree: MerkleTree<20, Field>;
memberTree.insert(leaf);
```

### HistoricMerkleTree<N, T>
Merkle tree that tracks historical roots. Can prove membership at past states.

## Cryptographic Primitives

### Commitment
A cryptographic binding to a value that hides the value until revealed.
```compact
commitment = persistentCommit(value, randomness);
```

### Nullifier
A unique identifier used to mark something as "spent" without revealing what was spent.
```compact
nullifier = transientHash(secret, commitment);
```

### Hash
A deterministic function that maps data to a fixed-size output.
- `transientHash`: Per-transaction, not stored
- `persistentHash`: Stored in state

### Merkle Proof
A proof that a leaf is part of a Merkle tree. Uses sibling nodes along path to root.

## Wallet & Addresses

### Shielded Address
Address for receiving private transactions. Begins with `shielded1`.
```
shielded1qyqszqgpqyqszqgpqyqszqg...
```

### Transparent Address
Address for public transactions. Begins with `midnight1`.
```
midnight1qvk8v9j6e7u3pxhsf4yzj2qw...
```

### Diversified Address
Multiple unlinkable addresses derived from a single key. Each has unique diversifier.

### Spending Key
Private key that authorizes spending funds. Must be kept secret.

### Viewing Key
Key that can view transaction details but cannot spend. Used for read-only access.

### Full Viewing Key
Can view all transactions for an address. Derived from spending key.

### Seed Phrase
BIP-39 mnemonic used to derive wallet keys. Typically 24 words.

## Transactions

### UTXO
"Unspent Transaction Output" - Represents unspent value that can be used as input to new transactions.

### Input
Value being spent in a transaction. References a previous output.

### Output
Value being created in a transaction. Becomes a UTXO.

### Coin
A specific unit of value with type (native token or custom token).

### Native Token
The base currency of the Midnight network (tDUST on testnet).

### Gas
Fee paid for transaction execution. Compensates validators for computation.

### Offer
A partial transaction that can be combined with other offers. Used for atomic swaps.

## Infrastructure

### Indexer
Service that indexes blockchain data and provides GraphQL query interface.

### Node
Full node that validates transactions and maintains blockchain state.

### RPC
"Remote Procedure Call" - API for submitting transactions and querying node.

### GraphQL
Query language used by the Midnight indexer. Supports queries and subscriptions.

### WebSocket
Protocol for real-time subscriptions to blockchain events.

## Development

### DApp Connector API
Interface for connecting web applications to Midnight wallets.

### Provider
Service that provides specific functionality (proofs, state, transactions).

### Compiled Contract
Output of Compact compiler. Includes circuit bytecode and TypeScript bindings.

### Private State
Application state stored locally, not on blockchain. Used with witnesses.

### Public State
State stored on the blockchain ledger. Visible to all.

## Quick Reference Table

| Term | Category | One-Line Definition |
|------|----------|---------------------|
| Compact | Language | DSL for privacy-preserving contracts |
| Circuit | ZKP | Mathematical representation for ZK proving |
| Witness | ZKP | Private input to a proof |
| Ledger | Compact | Public on-chain state |
| Disclose | Compact | Reveal private value publicly |
| Nullifier | Crypto | Unique spend marker |
| Commitment | Crypto | Hidden value binding |
| Shielded | Address | Private transaction address |
| ZSwap | Protocol | Token transfer protocol |
| Proof Server | Infra | ZK proof generator |

## Related Skills

- [zero-knowledge-proofs](../zero-knowledge-proofs/SKILL.md) - ZKP concepts
- [compact-type-system](../compact-type-system/SKILL.md) - Type details
- [privacy-data-patterns](../privacy-data-patterns/SKILL.md) - Privacy patterns

## References

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Reference](https://docs.midnight.network/develop/reference/compact/lang-ref)
