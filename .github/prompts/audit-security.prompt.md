---
description: Perform a security audit on Midnight Network smart contracts
name: Audit Security
agent: Security Auditor
tools:
  - search
  - read/problems
  - search/usages
---

# Audit Contract Security

Perform a security audit on the Midnight Network contract.

## Input Variables

- **Contract Path**: ${input:contractPath:Path to the contract file(s) to audit}
- **Audit Depth**: ${input:auditDepth:quick, standard, or comprehensive}

## Audit Checklist

### 1. Input Validation
- [ ] All public inputs have range checks
- [ ] No unchecked arithmetic operations
- [ ] Vector/array bounds validated
- [ ] Null/undefined handling for Maybe types

### 2. Privacy Protection
- [ ] Sensitive data uses `witness` or `secret` modifier
- [ ] No plaintext secrets in ledger state
- [ ] Commitments include randomness (salt)
- [ ] Nullifiers are context-specific
- [ ] No witness values returned as outputs

### 3. Access Control
- [ ] Admin functions properly protected
- [ ] Role checks before sensitive operations
- [ ] No privilege escalation paths
- [ ] Ownership transfers secured

### 4. State Management
- [ ] State transitions are atomic
- [ ] No reentrancy vulnerabilities
- [ ] Counter/nonce prevents replay
- [ ] Map/Set operations validated

### 5. Cryptographic Patterns
- [ ] Hash functions used correctly
- [ ] Merkle proofs verified properly
- [ ] Signature schemes implemented correctly
- [ ] Key derivation secure

## Severity Levels

- 🔴 **Critical**: Funds at risk, privacy completely broken
- 🟠 **High**: Significant privacy leak, access control bypass
- 🟡 **Medium**: Logic errors, incomplete validation
- 🟢 **Low**: Best practice violations, gas inefficiency
- ℹ️ **Info**: Suggestions for improvement

## Output Format

Provide an audit report with:
1. Executive summary
2. Findings sorted by severity
3. Code snippets showing issues
4. Recommended fixes
5. Security score (0-100)

Use #tool:search to find contract files and patterns. Use #tool:search/usages to trace function calls. Use #tool:read/problems to check for compile-time issues.
