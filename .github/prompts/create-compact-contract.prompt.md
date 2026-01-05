---
description: Generate a complete Compact smart contract for Midnight Network
name: Create Compact Contract
agent: Midnight Developer
tools:
  - edit/editFiles
  - search
---

# Create Compact Contract

Create a Compact smart contract for Midnight Network with the following specification.

## Input Variables

- **Contract Name**: ${input:contractName:ContractName}
- **Purpose**: ${input:purpose:Brief description of what the contract does}
- **Uses Privacy Features**: ${input:hasPrivacy:yes or no}
- **State Requirements**: ${input:ledgerState:e.g., users, balances, permissions}

## Requirements

1. **File Structure**:
   - Start with `pragma language_version 0.18;`
   - Import CompactStandardLibrary (builtin since v0.13)
   - Define all types before ledger
   - Declare ledger state
   - Include constructor if initialization needed
   - Export all public circuits

2. **Type Definitions**:
   - Use appropriate Uint bit widths (`Uint<8>`, `Uint<32>`, `Uint<64>`)
   - Use Field for ZK operations (hashing, commitments)
   - Use `Bytes<N>` for fixed-length data
   - Define structs for complex data
   - Define enums for state machines

3. **Ledger State**:
   - Use Counter for auto-increment IDs
   - For single values, declare the Compact type `T` directly (this creates an implicit `Cell<T>`)
     - Note: you cannot write `Cell<T>` explicitly in a ledger declaration
   - Use `Map<K, V>` for key-value data
   - Use `Set<T>` for membership tracking
   - Use `MerkleTree` for commitments (if privacy needed)

4. **Circuits**:
   - Pure circuits for calculations (no state changes)
   - Impure circuits for state mutations
   - Declare witnesses as functions (e.g. `witness secretKey(): Bytes<32>;`) and call them inside circuits
   - Use explicit disclosure: wrap expressions with `disclose(...)` before writing witness-derived data to public ledger state
     or returning it from an exported circuit
   - Include descriptive assertion error messages

5. **Privacy Patterns** (if privacy features enabled):
   - Hash sensitive data before storing
   - Use nullifiers to prevent double-actions
   - Generate commitments for private values
   - Support selective disclosure

### v0.18 API reminders

- `persistentHash<T>(value: T): Bytes<32>`
- `persistentCommit<T>(value: T, rand: Bytes<32>): Bytes<32>`
- Ledger ADTs: `Counter.increment(Uint<16>)`, `Counter.decrement(Uint<16>)`, `Map.member/lookup/insert/remove`
- Block time comparisons: `blockTimeLt(...)`, `blockTimeGte(...)`, ...

## Output Format

Provide:

1. Complete `.compact` file with all code
2. Brief explanation of each circuit's purpose
3. Example usage showing how to interact with the contract
4. Security considerations for the implementation

Use #tool:search to find relevant patterns in the skills folder, then #tool:edit/editFiles to create the contract.
