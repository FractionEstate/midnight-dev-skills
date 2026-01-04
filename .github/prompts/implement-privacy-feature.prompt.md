---
description: Implement a privacy-preserving feature in a Midnight dApp
name: Implement Privacy Feature
agent: Midnight Developer
tools:
  - search
  - edit/editFiles
---

# Implement Privacy Feature

Implement a complete privacy-preserving feature across both Compact contract and TypeScript dApp.

## Input Variables

- **Feature Name**: ${input:featureName:Name of the feature to implement}
- **Privacy Goal**: ${input:privacyGoal:What should be kept private?}
- **User Flow**: ${input:userFlow:Describe the user interaction}

## Implementation Steps

### 1. Contract Layer (Compact)

Design the privacy-preserving circuit:
- Identify public vs private inputs
- Use `witness` for ZK-verified data
- Use `secret` for off-chain-only data
- Implement commitment/nullifier patterns

### 2. TypeScript Integration

Create the dApp integration:
- Set up provider configuration
- Implement contract interaction functions
- Handle private state management
- Build user interface components

### 3. Privacy Verification

Ensure privacy guarantees:
- Witnesses are never exposed
- Commitments hide values
- Nullifiers prevent replay
- Error messages don't leak info

## Example: Private Voting

### Contract
```compact
pragma compact(">=0.25");
import { hash, hash2 } from "std";

ledger {
  commitments: Set<Field>,
  nullifiers: Set<Field>,
  yesCounts: Counter,
  noCounts: Counter
}

export circuit registerVote(witness choice: Boolean, witness salt: Field): Field {
  const commitment = hash2(choice, salt);
  ledger.commitments.insert(commitment);
  return commitment;
}

export circuit castVote(
  witness choice: Boolean,
  witness salt: Field,
  commitment: Field
): [] {
  assert(ledger.commitments.member(commitment), "Not registered");
  const nullifier = hash(salt);
  assert(!ledger.nullifiers.member(nullifier), "Already voted");
  ledger.nullifiers.insert(nullifier);
  if (choice) {
    ledger.yesCounts.increment(1n);
  } else {
    ledger.noCounts.increment(1n);
  }
}
```

### TypeScript
```typescript
async function vote(choice: boolean) {
  const salt = generateRandomField();
  const commitment = await contract.call.registerVote({ choice, salt });

  // Store salt securely in private state
  await privateState.set('voteSalt', salt);

  // Cast the vote
  await contract.call.castVote({ choice, salt, commitment });
}
```

## Output Format

Provide:
1. Complete Compact contract code
2. TypeScript integration code
3. Privacy analysis (what is hidden, what is revealed)
4. Security considerations
5. Test cases for privacy properties

Use #tool:search to find relevant patterns. Use #tool:edit/editFiles to implement the feature.
