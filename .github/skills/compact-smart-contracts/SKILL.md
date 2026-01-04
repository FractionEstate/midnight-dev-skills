---
name: compact-smart-contracts
description: Guide for writing Compact smart contracts on Midnight Network. Use when users need to create, understand, or debug Compact contracts including pragma directives, ledger declarations, circuits, disclose() operator, or ZK proof compilation. Triggers on requests about Compact language, smart contract development, zero-knowledge circuits, or privacy-preserving contracts.
---

# Compact Smart Contract Development

Write, compile, and deploy Compact smart contracts for Midnight Network's privacy-preserving blockchain.

## Contract Structure

Every Compact contract has three core components:

```compact
pragma compact(">=0.25");              // 1. Version pragma

export ledger myState: Opaque<"string">;   // 2. Ledger declarations

export circuit myFunction(param: Type): [] { // 3. Circuit functions
  myState = disclose(param);
}
```

## Step 1: Pragma Directive

Always start with the language version:

```compact
pragma compact(">=0.25");
```

**Why**: Protects against breaking changes in Compact updates.

## Step 2: Ledger Declarations

Define on-chain state variables:

```compact
ledger privateVar: Opaque<"number">;         // Private (internal only)
export ledger publicVar: Opaque<"string">;   // Public (DApp accessible)
```

**Common Types**:
| Type | Description |
|------|-------------|
| `Opaque<"string">` | Variable-length strings |
| `Opaque<"number">` | Numeric values |
| `Opaque<"boolean">` | Boolean values |
| `Map<K, V>` | Key-value mappings |

## Step 3: Circuit Functions

Create ZK-proven functions:

```compact
// Private circuit (internal only)
circuit helper(): [] { }

// Public circuit (callable from DApp)
export circuit publicAction(input: Opaque<"string">): [] {
  message = disclose(input);
}
```

## Step 4: Privacy Control with disclose()

**Rule**: All user inputs are private by default.

```compact
export circuit storeMessage(msg: Opaque<"string">): [] {
  // msg is PRIVATE input
  message = disclose(msg);  // Now PUBLIC on ledger
}
```

**When to use disclose()**:
- ✅ Data should be visible on public ledger
- ✅ Other users need to see information
- ❌ Sensitive data that should stay private
- ❌ Intermediate calculations

## Step 5: Compile Contracts

```bash
compact compile contracts/my-contract.compact contracts/managed/my-contract
```

**Generated output**:
```
contracts/managed/my-contract/
├── contract/    # Contract artifacts (JSON)
├── keys/        # ZK proving/verifying keys
└── zkir/        # ZK Intermediate Representation
```

## Example: Hello World Contract

```compact
pragma compact(">=0.25");

export ledger message: Opaque<"string">;

export circuit storeMessage(customMessage: Opaque<"string">): [] {
  message = disclose(customMessage);
}
```

## Example: Counter Contract

```compact
pragma compact(">=0.25");

export ledger counter: Opaque<"number">;

export circuit initialize(): [] {
  counter = disclose(0);
}

export circuit increment(): [] {
  let current = counter;
  counter = disclose(current + 1);
}

export circuit decrement(): [] {
  let current = counter;
  counter = disclose(current - 1);
}
```

## Common Compilation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Type mismatch` | Wrong type assignment | Match types in assignments |
| `Cannot assign private to public` | Missing disclose() | Wrap with `disclose()` |
| `Unexpected token` | Syntax error | Check semicolons, brackets |
| `Version mismatch` | Wrong pragma | Update pragma or compiler |

## Project Structure

```
my-midnight-app/
├── contracts/
│   ├── hello-world.compact      # Source files
│   ├── counter.compact
│   └── managed/                 # Compiled (gitignore)
│       └── hello-world/
├── src/app/
└── package.json
```

## Advanced Patterns

### Witness Variables (Private Inputs)
```compact
circuit transfer(amount: Opaque<"number">, witness secret: Opaque<"string">): [] {
  // secret known only to caller, not on chain
}
```

### Constraints
```compact
circuit updateState(newValue: Opaque<"number">): [] {
  require(newValue > 0);  // Enforced by ZK proof
}
```

### Enums
```compact
export enum Status { PENDING, ACTIVE, CLOSED }
export ledger state: Status;
```

## Testing Workflow

1. Start proof server:
   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet
   ```

2. Compile:
   ```bash
   compact compile contracts/my-contract.compact contracts/managed/my-contract
   ```

3. Test with generated TypeScript API

## Resources

- Compact Reference: https://docs.midnight.network/develop/reference/compact/
- Examples: https://github.com/midnightntwrk/midnight-awesome-dapps
