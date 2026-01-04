# Selective Disclosure

Prove properties about data without revealing the data itself.

## Core Concept

Instead of revealing data, reveal only boolean facts about it:

```compact
// ❌ Reveals actual balance
disclose(myBalance);  // "1234.56 tDUST"

// ✅ Reveals only sufficiency
disclose(myBalance >= requiredAmount);  // "true"
```

## Basic Patterns

### Range Proofs

Prove a value falls within a range:

```compact
// Prove age >= 18 without revealing actual age
export circuit verifyAdult(birthYear: Uint<32>): Boolean {
  const currentYear = 2024;
  const age = currentYear - birthYear;
  return disclose(age >= 18);
}

// Prove salary is in range without revealing amount
export circuit verifySalaryRange(salary: Uint<64>, minSalary: Uint<64>, maxSalary: Uint<64>): Boolean {
  return disclose(salary >= minSalary && salary <= maxSalary);
}
```

### Equality Proofs

Prove values match without revealing them:

```compact
// Prove password matches without revealing it
export circuit verifyPassword(
  inputHash: Field,
  storedHash: Field
): Boolean {
  return disclose(inputHash == storedHash);
}

// Prove membership without revealing which member
export circuit proveMembership(
  myId: Field,
  memberList: Vector<100, Field>
): Boolean {
  let found = false;
  for i in 0..100 {
    if myId == memberList[i] {
      found = true;
    }
  }
  return disclose(found);
}
```

### Comparison Proofs

Prove relationships without revealing values:

```compact
// Prove account A has more than account B
export circuit compareBalances(
  balanceA: Uint<64>,
  balanceB: Uint<64>
): Boolean {
  return disclose(balanceA > balanceB);
}

// Prove sum without revealing components
export circuit proveSum(
  a: Uint<64>,
  b: Uint<64>,
  expectedSum: Uint<64>
): Boolean {
  return disclose(a + b == expectedSum);
}
```

## Advanced Patterns

### Credential Verification

```compact
struct Credential {
  issuedDate: Uint<64>,
  expiryDate: Uint<64>,
  level: Uint<8>,
  issuer: Bytes<32>
}

// Verify credential is valid without revealing details
export circuit verifyCredential(
  cred: Credential,
  requiredLevel: Uint<8>,
  trustedIssuer: Bytes<32>
): Boolean {
  const now = blockTime();

  const isValid = cred.issuedDate <= now &&
                  cred.expiryDate > now &&
                  cred.level >= requiredLevel &&
                  cred.issuer == trustedIssuer;

  return disclose(isValid);
}
```

### Multi-Attribute Proofs

Prove multiple properties at once:

```compact
struct UserProfile {
  age: Uint<8>,
  country: Uint<8>,
  kycLevel: Uint<8>,
  balance: Uint<64>
}

// Prove eligibility without revealing profile
export circuit checkEligibility(
  profile: UserProfile,
  requirements: Requirements
): Boolean {
  const eligible = profile.age >= requirements.minAge &&
                   profile.country == requirements.allowedCountry &&
                   profile.kycLevel >= requirements.minKycLevel &&
                   profile.balance >= requirements.minBalance;

  return disclose(eligible);
}
```

### Aggregate Proofs

Prove facts about aggregates:

```compact
// Prove average without revealing individual values
export circuit proveAverage(
  values: Vector<10, Uint<64>>,
  expectedAverage: Uint<64>
): Boolean {
  let sum: Uint<64> = 0;
  for i in 0..10 {
    sum = sum + values[i];
  }
  return disclose(sum / 10 == expectedAverage);
}

// Prove minimum meets threshold
export circuit proveMinimum(
  values: Vector<10, Uint<64>>,
  threshold: Uint<64>
): Boolean {
  let min = values[0];
  for i in 1..10 {
    if values[i] < min {
      min = values[i];
    }
  }
  return disclose(min >= threshold);
}
```

## Use Cases

### KYC Verification

```compact
// Service can verify KYC without seeing personal data
export circuit verifyKyc(
  birthDate: Uint<64>,
  nationality: Uint<8>,
  sanctionsListHash: Field,
  userDataHash: Field
): Boolean {
  const age = (blockTime() - birthDate) / 31536000;  // Seconds per year

  const isEligible = age >= 18 &&
                     nationality != SANCTIONED_COUNTRY &&
                     userDataHash != sanctionsListHash;

  return disclose(isEligible);
}
```

### Financial Compliance

```compact
// Prove transaction is compliant without revealing amount
export circuit checkCompliance(
  amount: Uint<64>,
  dailyLimit: Uint<64>,
  dailyTotal: Uint<64>
): Boolean {
  // Check single transaction limit
  const singleOk = amount <= 10000;

  // Check daily limit
  const dailyOk = dailyTotal + amount <= dailyLimit;

  return disclose(singleOk && dailyOk);
}
```

### Access Control

```compact
// Prove access rights without revealing identity
export circuit checkAccess(
  userId: Field,
  resourceId: Field,
  accessList: MerkleTree<20, Field>
): Boolean {
  const accessKey = persistentHash(userId, resourceId);

  // Prove key is in access list using Merkle proof
  witness merkleProof: Vector<20, Field>;
  witness proofIndices: Vector<20, Boolean>;

  return disclose(verifyMerkle(accessKey, merkleProof, proofIndices, accessList.root()));
}
```

## Disclosure Levels

```text
┌─────────────────────────────────────────────────────┐
│ FULL DISCLOSURE                                      │
│ disclose(actualValue)                               │
│ → Reveals: The exact value                          │
├─────────────────────────────────────────────────────┤
│ BOOLEAN DISCLOSURE                                   │
│ disclose(value >= threshold)                        │
│ → Reveals: Only true/false                          │
├─────────────────────────────────────────────────────┤
│ AGGREGATE DISCLOSURE                                 │
│ disclose(sum(values))                               │
│ → Reveals: Combined result, not individuals         │
├─────────────────────────────────────────────────────┤
│ ZERO DISCLOSURE                                      │
│ (internal computation only)                         │
│ → Reveals: Nothing                                  │
└─────────────────────────────────────────────────────┘
```

## Best Practices

1. **Minimize disclosure** - Reveal only what's strictly necessary
2. **Prefer booleans** - `disclose(a >= b)` over `disclose(a - b)`
3. **Combine checks** - Single disclosure of multiple conditions
4. **Consider inference** - Multiple disclosures may leak info when combined
5. **Document what's revealed** - Make privacy properties clear
6. **Test disclosure** - Verify only intended data is exposed
