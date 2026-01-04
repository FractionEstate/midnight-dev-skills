# Midnight Development Memory

This file stores learned patterns, fixes, and best practices discovered during development.
Entries are organized by domain and include context for future reference.

## Compact Language

### Type System
- Use `Uint<32>` for counters and small integers to save gas
- Use `Field` for cryptographic operations (hashing, commitments)
- `Bytes<32>` is the standard size for hashes
- Prefer `Uint<64>` for timestamps and larger numeric values

### Common Patterns
- Always use `impure` keyword when modifying ledger state
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

### Unit Tests
- Mock wallet API for offline testing
- Use test fixtures for contract state
- Verify both success and failure paths

### Integration Tests
- Use testnet for full integration
- Wait for block confirmation
- Clean up deployed contracts after tests

## Security Checklist

### Before Deployment
- [ ] All inputs validated
- [ ] No private data in public ledger
- [ ] Access control verified
- [ ] Integer overflow checked
- [ ] Circuit constraints complete
- [ ] Error messages don't leak info

---
*This file is automatically updated as new patterns are discovered.*
