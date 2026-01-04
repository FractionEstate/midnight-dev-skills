---
description: 'Perform a security audit on Midnight Network smart contracts checking for common vulnerabilities and privacy leaks'
---

# Audit Contract Security

## Configuration Variables
${CONTRACT_PATH} <!-- Path to the contract file(s) to audit -->
${AUDIT_DEPTH="quick|standard|comprehensive"} <!-- Depth of audit -->

## Generated Prompt

Perform a ${AUDIT_DEPTH} security audit on the Midnight Network contract at `${CONTRACT_PATH}`.

### Audit Scope

${AUDIT_DEPTH === "quick" ? `
**Quick Audit** - Basic security checks:
1. Input validation
2. Obvious privacy leaks
3. Missing assertions
4. Basic access control
` : ""}

${AUDIT_DEPTH === "standard" ? `
**Standard Audit** - Full vulnerability scan:
1. All Quick Audit checks
2. Cryptographic pattern review
3. State management analysis
4. Type safety verification
5. Nullifier uniqueness
6. Commitment security
` : ""}

${AUDIT_DEPTH === "comprehensive" ? `
**Comprehensive Audit** - Deep security analysis:
1. All Standard Audit checks
2. Complex flow analysis
3. Economic attack vectors
4. Front-running analysis
5. Cross-circuit interactions
6. Integration security
7. Gas/complexity analysis
` : ""}

### Security Checklist

#### 1. Input Validation
- [ ] All public inputs have range checks
- [ ] No unchecked arithmetic operations
- [ ] Vector/array bounds validated
- [ ] Null/undefined handling for Maybe types

#### 2. Privacy Protection
- [ ] Sensitive data uses `witness` or `secret` modifier
- [ ] No plaintext secrets in ledger state
- [ ] Commitments include randomness (salt)
- [ ] Nullifiers are context-specific
- [ ] No witness values returned as outputs

#### 3. Access Control
- [ ] Admin functions properly protected
- [ ] Role checks before sensitive operations
- [ ] No privilege escalation paths
- [ ] Ownership transfers secured

#### 4. State Management
- [ ] State transitions are atomic
- [ ] No reentrancy vulnerabilities
- [ ] Counter/nonce prevents replay
- [ ] Map/Set operations validated

#### 5. Cryptographic Patterns
- [ ] Hash functions used correctly
- [ ] Merkle proofs verified properly
- [ ] Signature schemes implemented correctly
- [ ] Key derivation secure

### Vulnerability Categories

#### 🔴 Critical
- Witness exposure (private data leaked)
- Missing nullifier checks (double-spend)
- Broken access control
- State corruption

#### 🟠 High
- Insufficient input validation
- Predictable nullifiers
- Commitment without salt
- Integer overflow/underflow

#### 🟡 Medium
- Missing error messages
- Gas optimization issues
- Incomplete access control
- Weak randomness

#### 🟢 Low
- Code style issues
- Documentation gaps
- Non-optimal patterns
- Minor gas waste

### Report Format

Please provide findings in this format:

```markdown
## Security Audit Report

### Contract: [Name]
### Path: ${CONTRACT_PATH}
### Audit Level: ${AUDIT_DEPTH}
### Date: [Date]

---

### Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | X |
| 🟠 High | X |
| 🟡 Medium | X |
| 🟢 Low | X |

---

### Findings

#### [SEVERITY-ID] Finding Title

**Location**: file.compact:L##
**Severity**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**Description**:
What the vulnerability is and why it's a problem.

**Impact**:
What could happen if exploited.

**Proof of Concept**:
\`\`\`compact
// Code showing the issue
\`\`\`

**Recommendation**:
\`\`\`compact
// Fixed code
\`\`\`

---

### Recommendations Summary

1. ...
2. ...

### Gas/Complexity Analysis

- Overall complexity: [Low/Medium/High]
- Recommended optimizations: ...
```

### Common Patterns to Check

1. **Commitment Scheme**:
   ```compact
   // Should use salt
   hash2(value, salt)  // ✅
   hash(value)         // ⚠️ Vulnerable to rainbow tables
   ```

2. **Nullifier Generation**:
   ```compact
   // Should include context
   hash2(secret, context)  // ✅ Unique per use case
   hash(secret)            // ⚠️ Same for all uses
   ```

3. **Input Validation**:
   ```compact
   // Should validate before use
   assert(amount > 0, "Amount must be positive");  // ✅
   ledger.balance = amount;  // ⚠️ No validation
   ```

4. **Privacy Leak**:
   ```compact
   // Never return witness
   export circuit bad(witness s: Field): Field { return s; }  // ❌
   export circuit good(witness s: Field): Field { return hash(s); }  // ✅
   ```
