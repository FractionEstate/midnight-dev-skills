# Common Vulnerability Patterns

Security vulnerabilities in Midnight Network contracts and dApps.

## 🔴 Critical Vulnerabilities

### Witness Exposure

**Risk**: Secret data leaked to public observers

**Vulnerable Pattern**:
```compact
// ❌ VULNERABLE: Witness returned as public output
export circuit getSecret(witness secret: Field): Field {
  return secret;  // Exposes the witness!
}
```

**Secure Pattern**:
```compact
// ✅ SECURE: Return hash instead
export circuit getCommitment(witness secret: Field): Field {
  return hash(secret);  // Only hash visible
}
```

---

### Predictable Nullifier

**Risk**: Replay attacks, double-spend possible

**Vulnerable Pattern**:
```compact
// ❌ VULNERABLE: Nullifier from public data only
export circuit claim(userId: Uint<32>): [] {
  const nullifier = hash(userId);  // Anyone can compute!
  ledger.nullifiers.insert(nullifier);
}
```

**Secure Pattern**:
```compact
// ✅ SECURE: Include secret in nullifier
export circuit claim(witness secret: Field, userId: Uint<32>): [] {
  const nullifier = hash2(secret, userId);  // Requires secret
  ledger.nullifiers.insert(nullifier);
}
```

---

### Weak Commitment (No Salt)

**Risk**: Brute force or rainbow table attacks

**Vulnerable Pattern**:
```compact
// ❌ VULNERABLE: Low entropy, rainbow table possible
export circuit commit(witness value: Uint<64>): Field {
  return hash(value);
}
```

**Secure Pattern**:
```compact
// ✅ SECURE: Include random salt
export circuit commit(witness value: Uint<64>, witness salt: Field): Field {
  return hash2(value, salt);  // Unique and unpredictable
}
```

---

## 🟠 High Vulnerabilities

### Missing Range Checks

**Risk**: Arithmetic underflow/overflow, invalid state

**Vulnerable Pattern**:
```compact
// ❌ VULNERABLE: No validation before operation
export circuit transfer(amount: Uint<64>): [] {
  ledger.balance = ledger.balance - amount;  // Underflow possible!
}
```

**Secure Pattern**:
```compact
// ✅ SECURE: Validate first
export circuit transfer(amount: Uint<64>): [] {
  assert(ledger.balance >= amount, "Insufficient balance");
  ledger.balance = ledger.balance - amount;
}
```

---

### Access Control Bypass

**Risk**: Unauthorized operations

**Vulnerable Pattern**:
```compact
// ❌ VULNERABLE: No permission check
export circuit setAdmin(newAdmin: Bytes<32>): [] {
  ledger.admin = newAdmin;  // Anyone can become admin!
}
```

**Secure Pattern**:
```compact
// ✅ SECURE: Check caller authorization
export circuit setAdmin(caller: Bytes<32>, newAdmin: Bytes<32>): [] {
  assert(caller == ledger.admin, "Only admin can set new admin");
  ledger.admin = newAdmin;
}
```

---

## 🟡 Medium Vulnerabilities

### Insufficient Error Messages

**Risk**: Hard to debug, unclear failure reasons

**Vulnerable Pattern**:
```compact
// ❌ POOR: No context for debugging
assert balance >= amount;
```

**Secure Pattern**:
```compact
// ✅ BETTER: Descriptive message
assert(balance >= amount, "Insufficient balance for transfer");
```

---

### Exposed Private State Key

**Risk**: Data theft, state manipulation

**Vulnerable Pattern**:
```typescript
// ❌ VULNERABLE: Key in source
const PRIVATE_STATE_KEY = 'user-secrets';  // Predictable!
```

**Secure Pattern**:
```typescript
// ✅ SECURE: Derived or encrypted key
const key = deriveStateKey(userAddress, salt);
```

---

### Unvalidated Circuit Inputs

**Risk**: Unexpected behavior, logic bypass

**Vulnerable Pattern**:
```compact
// ❌ VULNERABLE: No input validation
export circuit setAge(age: Uint<8>): [] {
  ledger.age = age;  // Age 255 accepted!
}
```

**Secure Pattern**:
```compact
// ✅ SECURE: Validate input range
export circuit setAge(age: Uint<8>): [] {
  assert(age <= 150, "Invalid age value");
  ledger.age = age;
}
```

---

## 🟢 Low Vulnerabilities

### Magic Numbers

**Risk**: Unclear code, maintenance burden

**Vulnerable Pattern**:
```compact
// ❌ POOR: Magic number
assert(count < 100);
```

**Secure Pattern**:
```compact
// ✅ BETTER: Named constant
const MAX_COUNT: Uint<32> = 100;
assert(count < MAX_COUNT, "Count exceeds maximum");
```

---

### Missing Events

**Risk**: Poor observability, hard to track actions

**Pattern**: Add events/logs for important state changes

---

## TypeScript dApp Vulnerabilities

### Client-Side Secret Storage

**Risk**: Secrets exposed via browser devtools

**Vulnerable Pattern**:
```typescript
// ❌ VULNERABLE: Secret in localStorage
localStorage.setItem('privateKey', key);
```

**Secure Pattern**:
```typescript
// ✅ SECURE: Use encrypted storage or session-only
sessionStorage.setItem('encryptedKey', encrypt(key, userPassword));
```

---

### Logging Sensitive Data

**Risk**: Secrets exposed in logs/console

**Vulnerable Pattern**:
```typescript
// ❌ VULNERABLE: Witness logged
console.log('Witness:', witness);
```

**Secure Pattern**:
```typescript
// ✅ SECURE: Only log non-sensitive data
console.log('Action completed for user:', userId);
```
