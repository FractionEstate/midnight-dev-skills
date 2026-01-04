---
description: Debug a Midnight Network contract or dApp issue
name: Debug Contract
agent: Midnight Developer
tools:
  - search
  - read/problems
  - execute/runInTerminal
  - execute/testFailure
---

# Debug Contract

Debug an issue with a Midnight Network contract or dApp.

## Input Variables

- **Error Message**: ${input:errorMessage:The error message you're seeing}
- **Context**: ${input:context:What operation were you performing?}
- **File Path**: ${input:filePath:Path to the file with the issue (optional)}

## Common Issues and Solutions

### Compact Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Type mismatch` | Wrong Uint width | Match expected type exactly |
| `Undefined symbol` | Missing import | Check pragma and imports |
| `Assertion failed` | Validation error | Read assertion message |
| `Expected impure` | Ledger in pure circuit | Circuit is impure, not pure |

### TypeScript Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Wallet not found` | Extension missing | Install Lace wallet |
| `Network error` | Wrong endpoints | Use testnet-02 URLs |
| `Proof generation failed` | Server not running | Start proof server |
| `Transaction rejected` | Insufficient funds | Get tDUST from faucet |

### Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection refused :6300` | Proof server down | `docker run -p 6300:6300 midnightnetwork/proof-server` |
| `Invalid signature` | Wallet mismatch | Reconnect wallet |
| `Out of gas` | Complex circuit | Optimize or split operations |

## Debug Workflow

1. **Reproduce**: Get exact error message
2. **Locate**: Find source file and line
3. **Analyze**: Match against common issues
4. **Fix**: Apply targeted solution
5. **Verify**: Confirm fix works

## Output Format

Provide:

1. Root cause analysis
2. Specific fix with code changes
3. Prevention tips for future
4. Related issues to check

Use #tool:read/problems to check compile errors. Use #tool:search to find the source of the issue. Use #tool:execute/testFailure to analyze test failures. Use #tool:execute/runInTerminal to run diagnostic commands.
