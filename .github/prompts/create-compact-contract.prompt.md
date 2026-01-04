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
   - Start with `pragma compact(">=0.25");`
   - Import necessary functions from "std"
   - Define all types before ledger
   - Declare ledger state
   - Include constructor if initialization needed
   - Export all public circuits

2. **Type Definitions**:
   - Use appropriate Uint bit widths (Uint<8>, Uint<32>, Uint<64>)
   - Use Field for ZK operations (hashing, commitments)
   - Use Bytes<N> for fixed-length data
   - Define structs for complex data
   - Define enums for state machines

3. **Ledger State**:
   - Use Counter for auto-increment IDs
   - Use Cell<T> for single values
   - Use Map<K, V> for key-value data
   - Use Set<T> for membership tracking
   - Use MerkleTree for commitments (if privacy needed)

4. **Circuits**:
   - Pure circuits for calculations (no state changes)
   - Impure circuits for state mutations
   - Use `witness` modifier for private inputs needing ZK proof
   - Use `secret` modifier for completely off-chain data
   - Include descriptive assertion error messages

5. **Privacy Patterns** (if privacy features enabled):
   - Hash sensitive data before storing
   - Use nullifiers to prevent double-actions
   - Generate commitments for private values
   - Support selective disclosure

## Output Format

Provide:
1. Complete `.compact` file with all code
2. Brief explanation of each circuit's purpose
3. Example usage showing how to interact with the contract
4. Security considerations for the implementation

Use #tool:search to find relevant patterns in the skills folder, then #tool:edit/editFiles to create the contract.
