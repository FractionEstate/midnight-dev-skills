---
description: Add privacy-preserving features to a Midnight contract
name: Add Privacy Feature
agent: Midnight Developer
tools:
  - search
  - edit/editFiles
---

# Add Privacy Feature

Add privacy-preserving features to an existing Midnight contract.

## Input Variables

- **Contract Path**: ${input:contractPath:Path to the contract to modify}
- **Feature Type**: ${input:featureType:commitment, nullifier, merkle-proof, or selective-disclosure}
- **Data to Protect**: ${input:dataToProtect:Description of what data should be private}

## Privacy Patterns

### Commitment Scheme

Hide a value on-chain while allowing later verification:

```compact
export circuit commit(witness value: Uint<64>, witness salt: Field): Field {
  return hash2(value, salt);
}

export circuit reveal(secret value: Uint<64>, secret salt: Field, commitment: Field): [] {
  assert(is_equal(hash2(value, salt), commitment), "Invalid commitment");
}
```

### Nullifier Pattern

Prevent double-actions without revealing the secret:

```compact
ledger { nullifiers: Set<Field> }

export circuit claim(witness secret: Field): [] {
  const nullifier = hash(secret);
  assert(!ledger.nullifiers.member(nullifier), "Already claimed");
  ledger.nullifiers.insert(nullifier);
}
```

### Merkle Proof

Prove membership without revealing position:

```compact
ledger { members: MerkleTree<256, Field> }

export circuit proveMembership(
  witness memberSecret: Field,
  witness merkleProof: Vector<256, Field>
): [] {
  const commitment = hash(memberSecret);
  assert(ledger.members.verify(commitment, merkleProof), "Not a member");
}
```

### Selective Disclosure

Prove properties without revealing data:

```compact
export circuit proveOver18(
  witness birthYear: Uint<16>,
  currentYear: Uint<16>
): Boolean {
  return currentYear - birthYear >= 18;
}
```

## Output Format

Provide:

1. Modified contract code with new privacy feature
2. Explanation of the privacy guarantee
3. Example usage showing private inputs
4. Security considerations

Use #tool:search to find the existing contract. Use #tool:edit/editFiles to add the privacy feature.
