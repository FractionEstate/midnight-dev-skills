---
description: 'Generate a complete Compact smart contract for Midnight Network with proper structure, types, ledger state, and circuits'
---

# Create Compact Contract

## Configuration Variables
${CONTRACT_NAME} <!-- Name of the contract (PascalCase) -->
${CONTRACT_PURPOSE} <!-- Brief description of what the contract does -->
${HAS_PRIVACY="yes|no"} <!-- Whether the contract uses ZK privacy features -->
${LEDGER_STATE} <!-- Comma-separated list of state needed (e.g., "users, balances, permissions") -->

## Generated Prompt

Create a Compact smart contract for Midnight Network with the following specification:

**Contract Name**: ${CONTRACT_NAME}
**Purpose**: ${CONTRACT_PURPOSE}
**Uses Privacy Features**: ${HAS_PRIVACY}
**State Requirements**: ${LEDGER_STATE}

### Requirements

1. **File Structure**:
   - Start with `pragma compact(">=0.18");`
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

5. **Privacy Patterns** (if ${HAS_PRIVACY} = yes):
   - Hash sensitive data before storing
   - Use nullifiers to prevent double-actions
   - Generate commitments for private values
   - Support selective disclosure

### Output Format

Provide:
1. Complete `.compact` file with all code
2. Brief explanation of each circuit's purpose
3. Example usage showing how to interact with the contract
4. Security considerations for the implementation

### Example Structure

```compact
pragma compact(">=0.18");

import { hash, is_some, unwrap } from "std";

// Type definitions
struct ${CONTRACT_NAME}Data {
  // fields based on requirements
}

// Ledger state
ledger {
  // state based on ${LEDGER_STATE}
}

// Constructor
constructor() {
  // initialization
}

// Exported circuits
export circuit query(...): ReturnType {
  // pure query logic
}

export circuit mutate(...): [] {
  // state mutation with assertions
}
```
