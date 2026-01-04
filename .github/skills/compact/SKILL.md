---
name: compact
description: Write privacy-preserving smart contracts in Compact for Midnight Network. Use when creating contracts, defining types, using standard library functions, or implementing ZK patterns. Triggers on Compact language, circuits, ledger state, hashing, or zero-knowledge contract questions.
metadata:
  author: FractionEstate
  version: "0.25"
---

# Compact Smart Contracts

Compact is Midnight's domain-specific language for privacy-preserving smart contracts. Contracts compile to ZK-SNARKs, enabling selective disclosure of data.

## Quick Start

```compact
pragma compact(">=0.25");

export ledger message: Opaque<"string">;

export circuit setMessage(input: Opaque<"string">): [] {
  message = disclose(input);  // Makes private input public
}
```

## Contract Structure

Every Compact contract has three parts:

1. **Pragma** - Language version (`pragma compact(">=0.25");`)
2. **Ledger** - On-chain state declarations
3. **Circuits** - ZK-proven functions

## Core Concepts

### Privacy Model

| Level | Syntax | Visibility |
|-------|--------|------------|
| Private | `let x = input;` | Only prover |
| Disclosed | `disclose(value)` | Public on ledger |
| Proven | `disclose(a >= b)` | Boolean only |
| Witness | `witness secret: Field` | Prover-provided private |

### Ledger Types

```compact
ledger counter: Counter;           // Auto-incrementing
ledger balances: Map<Bytes<32>, Uint<64>>;  // Key-value
ledger members: Set<Field>;        // Membership tracking
ledger tree: MerkleTree<20, Field>;  // Cryptographic proofs
```

## Reference Files

| Topic | Resource |
|-------|----------|
| **Type System** | [references/types.md](references/types.md) - Full type reference |
| **Standard Library** | [references/stdlib.md](references/stdlib.md) - Hashing, coins, EC ops |
| **Ledger Patterns** | [references/ledger-patterns.md](references/ledger-patterns.md) - State management |
| **Advanced Patterns** | [references/advanced-patterns.md](references/advanced-patterns.md) - Access control, state machines |

## Templates

| Template | Description |
|----------|-------------|
| [templates/basic-contract.compact](templates/basic-contract.compact) | Simple ledger + circuit |
| [templates/token-contract.compact](templates/token-contract.compact) | Token with transfers |
| [templates/private-voting.compact](templates/private-voting.compact) | Anonymous voting |
| [templates/commitment-reveal.compact](templates/commitment-reveal.compact) | Commit-reveal pattern |

## Compilation

```bash
# Compile contract
compact compile contracts/my-contract.compact contracts/managed/my-contract

# Output structure
contracts/managed/my-contract/
├── contract/    # JSON artifacts
├── keys/        # ZK proving/verifying keys
└── zkir/        # ZK Intermediate Representation
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Type mismatch` | Wrong bit width | Use correct `Uint<N>` size |
| `Cannot assign private to public` | Missing disclose | Add `disclose()` wrapper |
| `Undefined symbol` | Import missing | Check pragma and imports |

## Best Practices

- ✅ Start with `pragma compact(">=0.25");`
- ✅ Use `witness` for private inputs that need proofs
- ✅ Choose smallest `Uint<N>` that fits your data
- ✅ Use `persistentHash` for on-chain data, `transientHash` for temp
- ❌ Don't expose secrets via `disclose()` unnecessarily
- ❌ Avoid large state (increases gas costs)

## Resources

- [Compact Reference](https://docs.midnight.network/develop/reference/compact/)
- [Examples Repository](https://github.com/midnightntwrk/midnight-awesome-dapps)
