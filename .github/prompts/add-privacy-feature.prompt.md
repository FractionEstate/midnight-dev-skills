---
description: "Add a privacy-preserving feature to an existing contract or dApp"
---

# Add Privacy Feature

Implement a privacy-preserving feature using zero-knowledge proofs.

## Feature Request

${input:feature_description:Describe the feature you want to add (e.g., "anonymous voting", "private balance transfer")}

## Privacy Requirements

${input:privacy_level:What should be private? (e.g., "voter identity", "transfer amounts", "all data")}

## Existing Code Context

${input:existing_contract:Path to existing contract or "new" for a new contract}

## Implementation Steps

1. **Analyze Privacy Requirements**
   - What data must be hidden?
   - What can be public?
   - Who needs to prove what?

2. **Design the ZK Pattern**
   - Choose: commitment, nullifier, Merkle proof, or combination
   - Define witness inputs (private data for proofs)
   - Define public outputs (what verifiers see)

3. **Implement in Compact**
   ```compact
   // Use witness for private inputs
   export circuit privateAction(
     witness privateData: Field,  // Hidden from everyone
     publicInput: Uint<32>        // Visible on-chain
   ): [] {
     // Prove knowledge without revealing
     const commitment = hash(privateData);
     // ... rest of logic
   }
   ```

4. **Add TypeScript Integration**
   - Create witness provider
   - Handle private state management
   - Ensure no data leakage in UI

5. **Security Review**
   - Verify no privacy leaks
   - Check nullifier uniqueness
   - Validate commitment schemes

## Privacy Patterns Reference

| Pattern | Use Case | Compact Implementation |
|---------|----------|----------------------|
| Commitment | Hide value, reveal later | `hash(secret + salt)` |
| Nullifier | Prevent double-spend/vote | `hash(unique_id + secret)` |
| Merkle Proof | Prove membership | `MerkleTree` ledger type |
| Range Proof | Prove value in range | Assertions on witnesses |
