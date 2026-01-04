---
description: "Debug a Compact contract compilation or runtime error"
---

# Debug Compact Contract

Help me debug this Compact contract issue.

## Context

${input:error_message:Paste the error message or describe the problem}

${input:contract_file:Path to the contract file (e.g., contracts/voting.compact)}

## Your Task

1. **Analyze the Error**
   - Parse the error message to identify the root cause
   - Check if it's a syntax, type, or logic error

2. **Investigate the Contract**
   - Read the contract file and surrounding code
   - Identify the problematic line or pattern

3. **Common Compact Issues to Check**
   - Missing imports from "std"
   - Type mismatches (Uint<N> vs Field)
   - Invalid ledger operations (reading non-existent keys)
   - Missing `impure` modifier on state-changing circuits
   - Incorrect assertion syntax
   - Witness/secret modifier placement

4. **Fix the Issue**
   - Provide the corrected code
   - Explain why the fix works

5. **Verify**
   - Run `compact compile ${contract_file}` to confirm it compiles

## Output Format

```
**Error Analysis**: [What went wrong]
**Root Cause**: [Why it happened]
**Fix**: [Code changes needed]
**Prevention**: [How to avoid this in future]
```
