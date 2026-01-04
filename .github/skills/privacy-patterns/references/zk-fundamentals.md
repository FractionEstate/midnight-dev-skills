# Zero-Knowledge Proof Fundamentals

Understanding ZK-SNARKs for Midnight Network development.

## What is a Zero-Knowledge Proof?

A proof that demonstrates knowledge of something without revealing what you know.

**Example:** Prove you're over 21 without showing your birthdate.

### ZKP Properties

| Property | Meaning |
| -------- | ------- |
| **Completeness** | True statements always verify |
| **Soundness** | False statements never verify |
| **Zero-Knowledge** | Verifier learns nothing except validity |

## ZK-SNARKs

**SNARK** = **S**uccinct **N**on-interactive **AR**gument of **K**nowledge

| Component | Description |
| --------- | ----------- |
| **Succinct** | Tiny proofs (~288 bytes) |
| **Non-interactive** | Single message, no back-and-forth |
| **Argument** | Computationally secure |
| **of Knowledge** | Proves prover knows the data |

## How ZK-SNARKs Work

```text
1. SETUP (once per contract)
   ┌──────────┐     ┌─────────────────────┐
   │ Circuit  │ ──▶ │ Proving Key (pk)    │
   │ (rules)  │     │ Verifying Key (vk)  │
   └──────────┘     └─────────────────────┘

2. PROVE (per transaction)
   ┌──────────────────┐     ┌──────────┐
   │ Private Inputs   │     │          │
   │ Public Inputs    │ ──▶ │  Proof   │
   │ Proving Key (pk) │     │          │
   └──────────────────┘     └──────────┘

3. VERIFY (on-chain)
   ┌──────────────────┐     ┌───────────┐
   │ Proof            │     │           │
   │ Public Inputs    │ ──▶ │ true/false│
   │ Verifying Key    │     │           │
   └──────────────────┘     └───────────┘
```

## From Compact to ZK Circuit

**Compact Code:**

```compact
export circuit verifyAge(birthYear: Uint<32>, minAge: Uint<32>): Boolean {
  let currentYear = 2024;
  let age = currentYear - birthYear;
  return disclose(age >= minAge);
}
```

**Becomes Constraints:**

```text
age = 2024 - birthYear        (constraint 1)
result = (age >= minAge)      (constraint 2)
```

- **Private (witness):** birthYear
- **Public:** result (true/false only)

## Privacy Levels

| Level | Code | What's Public |
| ----- | ---- | ------------- |
| Fully Private | `let x = input;` | Nothing |
| Disclosed Value | `disclose(input)` | The value itself |
| Proven Property | `disclose(input >= min)` | Only the boolean |

## Witness Variables

Witnesses are private inputs provided by the prover:

```compact
// Declared outside circuit
witness secretKey: Field;
witness merkleProof: Vector<20, Field>;

export circuit proveOwnership(publicKey: Field): [] {
  // Verify secretKey hashes to publicKey
  assert persistentHash(secretKey) == publicKey;
}
```

**Properties:**

- Known only to prover
- Not stored on-chain
- Must be provided each transaction
- Used for private computations

## Proof Generation

```text
                     ┌─────────────────┐
                     │  Proof Server   │
                     │  (localhost)    │
                     └────────┬────────┘
                              │
   ┌──────────────┐           │           ┌──────────────┐
   │ Private      │───────────┼──────────▶│   Proof      │
   │ Inputs       │           │           │ (~288 bytes) │
   └──────────────┘           │           └──────────────┘
   ┌──────────────┐           │
   │ Proving      │───────────┘
   │ Keys         │
   └──────────────┘
```

**Performance:**

| Operation | Time |
| --------- | ---- |
| Proof generation | 1-30 seconds |
| Verification | ~10 milliseconds |
| Proof size | ~288 bytes |

## Circuit Complexity

The number of constraints affects proof generation time:

```compact
// Simple: ~100 constraints, ~1s proof
export circuit simpleCheck(a: Uint<64>, b: Uint<64>): Boolean {
  return a > b;
}

// Medium: ~1000 constraints, ~5s proof
export circuit mediumLogic(values: Vector<10, Uint<64>>): Uint<64> {
  let sum: Uint<64> = 0;
  for i in 0..10 {
    sum = sum + values[i];
  }
  return sum;
}

// Complex: ~10000 constraints, ~30s proof
export circuit merkleVerify(
  leaf: Field,
  path: Vector<20, Field>,
  indices: Vector<20, Boolean>
): Boolean {
  // Full Merkle path verification
  ...
}
```

## Security Guarantees

| Guarantee | Meaning |
| --------- | ------- |
| **Privacy** | Private inputs never leave prover's machine |
| **Integrity** | Cannot create valid proof with wrong data |
| **Verifiability** | Anyone can verify without secrets |
| **Non-forgeability** | Cannot forge proofs without knowledge |

## Best Practices

1. **Minimize public outputs** - Reveal only what's necessary
2. **Use proper randomness** - For commitments, use crypto-secure random
3. **Optimize constraints** - Fewer constraints = faster proofs
4. **Batch operations** - Combine related proofs when possible
5. **Test thoroughly** - Verify privacy guarantees in testing
