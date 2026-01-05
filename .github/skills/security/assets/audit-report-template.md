# Security Audit Report Template

**Project**: [Project Name]
**Version**: [Version]
**Date**: [Date]
**Auditor**: [Auditor Name/Firm]

---

## Executive Summary

Brief overview of the audit findings and overall security posture.

- **Critical Issues**: X
- **High Severity**: X
- **Medium Severity**: X
- **Low Severity**: X
- **Informational**: X

## Scope

### Contracts Reviewed

| File                   | SHA256      |
| ---------------------- | ----------- |
| contracts/main.compact | `abc123...` |

### Out of Scope

- Off-chain components
- Frontend application

## Findings

### CRITICAL: [Finding Title]

**Severity**: Critical
**Location**: `contracts/main.compact:42`
**Status**: Open | Fixed | Acknowledged

**Description**:
Detailed description of the vulnerability.

**Impact**:
What could happen if exploited.

**Recommendation**:
How to fix the issue.

**Code**:

```compact
// Vulnerable code
```

---

### HIGH: [Finding Title]

**Severity**: High
**Location**: `contracts/main.compact:100`
**Status**: Open | Fixed | Acknowledged

**Description**:
[Description]

**Impact**:
[Impact]

**Recommendation**:
[Recommendation]

---

## Gas Optimization Recommendations

| Location | Current   | Recommended | Savings |
| -------- | --------- | ----------- | ------- |
| Line 50  | Uint<256> | Uint<64>    | ~50%    |

## Privacy Analysis

### Data Exposure Review

| Data Type    | Visibility | Recommendation        |
| ------------ | ---------- | --------------------- |
| User balance | On-chain   | Move to private state |

### Witness Usage

- ✅ Proper witness usage in circuit X
- ⚠️ Unnecessary disclosure in circuit Y

## Conclusion

Summary of overall security posture and recommended next steps.

---

_This audit is not a guarantee of security. It represents a point-in-time review based on the information provided._
