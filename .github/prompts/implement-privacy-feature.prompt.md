---
description: 'Implement a privacy-preserving feature using ZK proofs, commitments, and selective disclosure patterns'
---

# Implement Privacy Feature

## Configuration Variables
${FEATURE_TYPE="commitment|nullifier|merkle-proof|selective-disclosure|voting|credential"} <!-- Type of privacy feature -->
${FEATURE_NAME} <!-- Name for the feature -->
${DATA_TO_PROTECT} <!-- What data should be kept private -->
${VERIFICATION_NEEDED} <!-- What needs to be proven about the data -->

## Generated Prompt

Implement a privacy-preserving feature for Midnight Network with the following specification:

**Feature**: ${FEATURE_NAME}
**Type**: ${FEATURE_TYPE}
**Private Data**: ${DATA_TO_PROTECT}
**Verification**: ${VERIFICATION_NEEDED}

### Implementation Based on Feature Type

${FEATURE_TYPE === "commitment" ? `
#### Commitment Scheme Implementation

Create a hide-then-reveal pattern:

**Compact Contract:**
\`\`\`compact
pragma compact(">=0.25");

import { hash, hash2 } from "std";

ledger {
  commitments: Set<Field>,
  revealed: Map<Field, ${DATA_TYPE}>
}

// Phase 1: Create commitment
export circuit commit(
  witness value: ${DATA_TYPE},
  witness salt: Field
): Field {
  const commitment = hash2(value, salt);
  assert(!ledger.commitments.member(commitment), "Already committed");
  ledger.commitments.insert(commitment);
  return commitment;
}

// Phase 2: Reveal with proof
export circuit reveal(
  secret value: ${DATA_TYPE},
  secret salt: Field,
  commitment: Field
): [] {
  assert(ledger.commitments.member(commitment), "Unknown commitment");
  assert(is_equal(hash2(value, salt), commitment), "Invalid proof");
  ledger.revealed[commitment] = value;
}
\`\`\`
` : ""}

${FEATURE_TYPE === "nullifier" ? `
#### Nullifier Implementation

Prevent double-use while preserving privacy:

**Compact Contract:**
\`\`\`compact
pragma compact(">=0.25");

import { hash, hash2 } from "std";

ledger {
  usedNullifiers: Set<Field>,
  validCommitments: Set<Field>
}

// Register commitment (e.g., during setup)
export circuit register(witness value: Field): Field {
  const commitment = hash(value);
  ledger.validCommitments.insert(commitment);
  return commitment;
}

// Use once with nullifier
export circuit useOnce(
  witness secret: Field,
  witness context: Field
): [] {
  // Generate nullifier unique to secret + context
  const nullifier = hash2(secret, context);

  // Check not already used
  assert(!ledger.usedNullifiers.member(nullifier), "Already used");

  // Verify secret is valid
  const commitment = hash(secret);
  assert(ledger.validCommitments.member(commitment), "Invalid credential");

  // Mark as used
  ledger.usedNullifiers.insert(nullifier);
}
\`\`\`
` : ""}

${FEATURE_TYPE === "merkle-proof" ? `
#### Merkle Proof Implementation

Anonymous set membership:

**Compact Contract:**
\`\`\`compact
pragma compact(">=0.25");

import { hash } from "std";

ledger {
  memberTree: MerkleTree<256, Field>
}

// Add member (admin function)
export circuit addMember(memberCommitment: Field): [] {
  ledger.memberTree.insert(memberCommitment);
}

// Verify membership without revealing which member
export circuit verifyMember(
  witness leafValue: Field,
  witness merkleProof: Vector<256, Field>,
  witness index: Uint<256>
): Boolean {
  const root = ledger.memberTree.root();
  return verify_merkle_path(leafValue, merkleProof, index, root);
}

// Action requiring membership
export circuit memberAction(
  witness secret: Field,
  witness merkleProof: Vector<256, Field>,
  witness index: Uint<256>
): [] {
  // Verify membership
  const leaf = hash(secret);
  const isValid = verify_merkle_path(leaf, merkleProof, index, ledger.memberTree.root());
  assert(isValid, "Not a member");

  // Perform action...
}
\`\`\`
` : ""}

${FEATURE_TYPE === "selective-disclosure" ? `
#### Selective Disclosure Implementation

Prove properties without revealing data:

**Compact Contract:**
\`\`\`compact
pragma compact(">=0.25");

import { hash } from "std";

struct Credential {
  commitment: Field,  // Public: hash of attributes
  issuedAt: Uint<64>
}

ledger {
  credentials: Map<Uint<32>, Credential>
}

// Prove age > threshold without revealing exact age
export circuit proveAge(
  witness birthYear: Uint<16>,
  witness credentialSecret: Field,
  threshold: Uint<16>,
  currentYear: Uint<16>,
  credentialId: Uint<32>
): Boolean {
  // Verify credential ownership
  const cred = unwrap(ledger.credentials.lookup(credentialId));
  assert(is_equal(hash(credentialSecret), cred.commitment), "Invalid credential");

  // Calculate and verify age (private)
  const age = currentYear - birthYear;
  return age >= threshold;
  // Only returns true/false, not the actual age
}

// Prove value in range
export circuit proveInRange(
  witness value: Uint<64>,
  witness salt: Field,
  commitment: Field,
  minValue: Uint<64>,
  maxValue: Uint<64>
): Boolean {
  // Verify commitment
  assert(is_equal(hash2(value, salt), commitment), "Invalid commitment");

  // Check range without revealing exact value
  return value >= minValue && value <= maxValue;
}
\`\`\`
` : ""}

${FEATURE_TYPE === "voting" ? `
#### Anonymous Voting Implementation

\`\`\`compact
pragma compact(">=0.25");

import { hash, hash2 } from "std";

struct Proposal {
  id: Uint<32>,
  yes: Uint<64>,
  no: Uint<64>,
  deadline: Uint<64>
}

ledger {
  proposals: Map<Uint<32>, Proposal>,
  voterRegistry: Set<Field>,  // Registered voter commitments
  nullifiers: Set<Field>      // Used nullifiers
}

// Register voter (admin)
export circuit registerVoter(voterCommitment: Field): [] {
  ledger.voterRegistry.insert(voterCommitment);
}

// Cast anonymous vote
export circuit vote(
  witness voterSecret: Field,
  proposalId: Uint<32>,
  voteYes: Boolean
): [] {
  // Verify registered voter
  const voterCommitment = hash(voterSecret);
  assert(ledger.voterRegistry.member(voterCommitment), "Not registered");

  // Generate nullifier unique to this proposal
  const nullifier = hash2(voterSecret, proposalId);
  assert(!ledger.nullifiers.member(nullifier), "Already voted");
  ledger.nullifiers.insert(nullifier);

  // Record vote
  const proposal = unwrap(ledger.proposals.lookup(proposalId));
  if (voteYes) {
    ledger.proposals[proposalId] = Proposal {
      id: proposal.id,
      yes: proposal.yes + 1,
      no: proposal.no,
      deadline: proposal.deadline
    };
  } else {
    ledger.proposals[proposalId] = Proposal {
      id: proposal.id,
      yes: proposal.yes,
      no: proposal.no + 1,
      deadline: proposal.deadline
    };
  }
}
\`\`\`
` : ""}

### TypeScript Integration

```typescript
// Example: Using the privacy feature
import { contract } from './contract.cjs';
import { privateState } from '@midnight-ntwrk/midnight-js-providers';

// Store secret in private state (never exposed)
await privateState.set('userSecret', secretValue);

// Generate proof without revealing secret
const secret = await privateState.get('userSecret');
const result = await contract.${FEATURE_NAME}({ witness: secret, ...publicInputs });
```

### Security Checklist

- [ ] Secrets never stored in ledger
- [ ] Nullifiers unique per context
- [ ] Commitments include salt/randomness
- [ ] Only necessary information revealed
- [ ] Proof verification before state changes
