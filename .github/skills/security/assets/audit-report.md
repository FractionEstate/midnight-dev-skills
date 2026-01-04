# Security Audit Report Template

Use this template when producing security audit reports.

---

# Security Audit Report

## Contract: [Contract Name]
## Auditor: [Auditor Name/Agent]
## Date: [YYYY-MM-DD]
## Commit: [Git SHA]

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | X |
| 🟠 High | X |
| 🟡 Medium | X |
| 🟢 Low | X |
| ℹ️ Info | X |

**Overall Risk**: [Low / Medium / High / Critical]

**Summary**: [Brief description of the audit scope and key findings]

---

## Scope

### Files Reviewed

| File | Lines | Type |
|------|-------|------|
| `contracts/main.compact` | 150 | Compact |
| `lib/wallet.ts` | 200 | TypeScript |

### Out of Scope

- Third-party dependencies
- Infrastructure configuration

---

## Findings

### [SEVERITY-ID] Finding Title

**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Location**: `file.compact:L42`

**Description**:
Detailed description of the vulnerability and why it's a problem.

**Impact**:
What could happen if this vulnerability is exploited.

**Proof of Concept**:
Steps to reproduce or exploit the vulnerability.

**Recommendation**:
How to fix the vulnerability.

**Code Fix**:

Before:
```compact
// Vulnerable code
```

After:
```compact
// Fixed code
```

**Status**: 🔓 Open / ✅ Fixed / ⚠️ Acknowledged

---

## Gas & Complexity Analysis

### Circuit Complexity

| Circuit | Constraints (est.) | Complexity |
|---------|-------------------|------------|
| `transfer` | ~500 | Low |
| `claim` | ~2000 | Medium |

### State Size

| Ledger Field | Type | Growth Risk |
|--------------|------|-------------|
| `balances` | Map | Medium |
| `nullifiers` | Set | High |

### Recommendations

1. Consider pruning old nullifiers after expiry
2. Batch operations where possible

---

## Checklist Results

### Compact Contract

- [x] All assertions have descriptive messages
- [x] Sensitive data uses witness/secret
- [ ] ⚠️ One commitment missing salt
- [x] Nullifiers include context
- [x] Range checks present

### TypeScript dApp

- [x] Wallet availability checked
- [x] Transactions confirmed
- [x] No secrets logged
- [ ] ⚠️ Missing error boundary on one page

---

## Recommendations Summary

1. **[CRITICAL-1]** Fix witness exposure in `getSecret` circuit
2. **[HIGH-1]** Add salt to commitment scheme
3. **[MEDIUM-1]** Improve error messages in validation
4. **[LOW-1]** Add named constants for magic numbers

---

## Appendix

### Tools Used

- Manual code review
- Static analysis patterns
- Test case review

### References

- [Midnight Security Best Practices](../skills/security/SKILL.md)
- [Privacy Patterns](../skills/privacy-patterns/SKILL.md)

---

## Sign-Off

**Auditor**: [Name]
**Date**: [Date]
**Status**: Draft / Final
