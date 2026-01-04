---
description: Learned patterns and fixes discovered during Midnight development
name: Development Memory
applyTo: "**"
---

# Midnight Development Memory

This file stores learned patterns, fixes, and best practices discovered during development.
Entries are organized by domain and include context for future reference.

## Compact Language

### Version Info

- Latest compiler: 0.26.0 (Minokawa)
- Latest language: 0.18.0
- Developer tools: 0.3.0
- Pragma: `pragma language_version 0.18;`
- Standard library: `import CompactStandardLibrary;` (builtin since v0.13)
- Install:

  ```bash
  curl --proto '=https' --tlsv1.2 -LsSf \
    https://github.com/midnightntwrk/compact/releases/download/compact-v0.3.0/compact-installer.sh \
    | sh
  ```

### Type System

- Use `Uint<32>` for counters and small integers to save gas
- Use `Field` for cryptographic operations (hashing, commitments)
- `Bytes<32>` is the standard size for hashes
- Prefer `Uint<64>` for timestamps and larger numeric values
- `Opaque<"string">` / `Opaque<"Uint8Array">` for off-chain data

### Common Patterns

- Circuits become impure when they access/modify ledger state
- `secret` keyword keeps data off-chain, `witness` provides ZK verification
- Constructor must initialize all ledger values
- Use `assert` with descriptive error messages for validation

### Debugging

- "Type mismatch" usually means wrong bit width (e.g., Uint<32> vs Uint<64>)
- "Undefined symbol" - check pragma version and imports
- Circuit compilation errors often relate to witness/secret misuse

## TypeScript Integration

### Wallet Connection

- Always check `window.midnight` availability before connecting
- Handle both `enabledWalletApiVersion === null` and connection errors
- Use optional chaining when accessing wallet properties

### Contract Deployment

- Provider setup order: privateState → publicDataProvider → zkConfig → wallet
- Wait for transaction confirmation before proceeding
- Handle proof generation timeout (default 30s may be insufficient)

### Common Errors

- "Wallet not connected" - Re-prompt user to connect
- "Insufficient funds" - Check tDUST balance on testnet
- "Proof generation failed" - Check proof server is running on port 6300

## Privacy Patterns

### Commitments

- Hash(secret + nonce) for commitment schemes
- Store commitment on-chain, reveal with proof
- Nonce prevents dictionary attacks

### Merkle Trees

- Use for membership proofs without revealing position
- 256-depth trees support large datasets
- Proof verification is O(log n)

### Selective Disclosure

- Prove properties without revealing data
- Example: "Over 18" without revealing birthdate
- Use range proofs for numeric comparisons

## Testing

### Simulator Setup

- Always call `setNetworkId(NetworkId.Undeployed)` before tests
- Use `sampleContractAddress()` for mock addresses
- Access ledger via `ledger(circuitContext.transactionContext.state)`

### Common Test Failures

- Assertion errors: Check error message for cause
- State not updated: Ensure circuit is called on simulator instance
- Proof timeout: Increase test timeout or mock proof generation

## Network Configuration

### Testnet-02 (Current)

- Indexer: `https://indexer.testnet-02.midnight.network/api/v1/graphql`
- RPC: `https://rpc.testnet-02.midnight.network`
- Faucet: `https://faucet.testnet-02.midnight.network`

### Proof Server

- Default port: 6300
- Docker: `docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet`
- Must be running for transaction submission
