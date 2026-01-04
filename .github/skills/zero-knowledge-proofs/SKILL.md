---
name: zero-knowledge-proofs
description: Guide explaining zero-knowledge proofs and ZK-SNARKs for Midnight Network development. Use when users need to understand cryptographic foundations, privacy concepts, circuit constraints, or selective disclosure. Triggers on ZKP questions, privacy explanations, circuit understanding, or proof generation concepts.
---

# Understanding Zero-Knowledge Proofs for Midnight

Master the cryptographic foundations powering Midnight Network's privacy features.

## What Are Zero-Knowledge Proofs?

A zero-knowledge proof lets you prove you know something without revealing what you know.

**Real-World Example**: Prove you're over 21 without showing your birthdate.

### ZKP Properties

| Property | Meaning |
|----------|---------|
| **Completeness** | True statements always verify |
| **Soundness** | False statements never verify |
| **Zero-Knowledge** | Verifier learns nothing else |

## ZK-SNARKs

**SNARK** = **S**uccinct **N**on-interactive **AR**gument of **K**nowledge

| Part | Meaning |
|------|---------|
| **Succinct** | Tiny proofs (~288 bytes) |
| **Non-interactive** | Single message, no back-and-forth |
| **Argument** | Computationally secure |
| **of Knowledge** | Proves prover knows the data |

## How ZK-SNARKs Work

```
1. SETUP (once per contract)
   Circuit → Proving Key (pk) + Verifying Key (vk)

2. PROVE (per transaction)
   Private Inputs + Public Inputs + pk → Proof

3. VERIFY (on-chain)
   Proof + Public Inputs + vk → true/false
```

## From Compact to ZK Circuit

**Compact code**:
```compact
export circuit verifyAge(birthYear: Opaque<"number">, minAge: Opaque<"number">): Boolean {
  let currentYear = 2024;
  let age = currentYear - disclose(birthYear);  // birthYear stays private
  return disclose(age >= minAge);               // Only result is public
}
```

**Becomes constraints**:
```
age = 2024 - birthYear        (constraint 1)
result = (age >= minAge)      (constraint 2)
```

- Private: birthYear (witness)
- Public: result (true/false only)

## Selective Disclosure

Choose exactly what to reveal:

```compact
// Reveal NOTHING about amount, just validity
export circuit proveBalance(balance: Opaque<"number">, required: Opaque<"number">): Boolean {
  return disclose(balance >= required);
}

// Reveal SUM without individual values
export circuit proveTotal(a: Opaque<"number">, b: Opaque<"number">, expected: Opaque<"number">): Boolean {
  return disclose(a + b == expected);
}
```

## Privacy Levels in Compact

| Level | Code | What's Public |
|-------|------|---------------|
| Fully Private | `let x = input;` | Nothing |
| Disclosed | `disclose(input)` | The value |
| Proven | `disclose(input >= 0)` | Only boolean result |

## Proof Server

The proof server generates ZK proofs:

```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet
```

**What happens**:
1. User calls circuit with private inputs
2. Proof server loads proving key
3. Generates proof (~1-30 seconds)
4. Proof + public inputs submitted to network
5. Network verifies with verifying key (~milliseconds)

## Security Guarantees

| Guarantee | Meaning |
|-----------|---------|
| **Privacy** | Private inputs never leave your machine |
| **Integrity** | Can't create valid proof with wrong data |
| **Verifiability** | Anyone can verify without secrets |

## Performance

| Operation | Time |
|-----------|------|
| Proof generation | 1-30s (depends on circuit complexity) |
| Verification | ~10ms |
| Proof size | ~288 bytes |

## Optimization Tips

### Reduce Constraints
```compact
// ❌ Many constraints
require(a > 0);
require(b > 0);
require(c > 0);

// ✅ Fewer constraints
require(a > 0 && b > 0 && c > 0);
```

### Minimize Disclosures
```compact
// ❌ Reveals more than needed
disclose(actualBalance);

// ✅ Reveals minimum
disclose(actualBalance >= requiredAmount);
```

## Common Patterns

### Age Verification
```compact
export circuit verifyAdult(birthYear: Opaque<"number">): Boolean {
  let age = 2024 - birthYear;
  return disclose(age >= 18);  // Only reveals: "is adult"
}
```

### Balance Check
```compact
export circuit hasSufficientFunds(balance: Opaque<"number">, amount: Opaque<"number">): Boolean {
  return disclose(balance >= amount);  // Only reveals: "can afford"
}
```

### Private Voting
```compact
export circuit vote(choice: Boolean): [] {
  if (choice) {
    yesVotes = disclose(yesVotes + 1);
  } else {
    noVotes = disclose(noVotes + 1);
  }
  // Individual choice stays private, only totals revealed
}
```

## Resources

- Nightpaper: https://midnight.network/whitepaper
- ZK Learning: https://zkproof.org/
- Midnight Architecture: https://docs.midnight.network/architecture/
