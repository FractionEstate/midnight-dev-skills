---
name: compact
description: >-
  Write privacy-preserving smart contracts in Compact (Minokawa) for Midnight Network. Use when creating
  contracts, defining types, using standard library functions, or implementing ZK patterns. Triggers on
  Compact language, circuits, ledger state, hashing, or zero-knowledge contract questions.
metadata:
  author: FractionEstate
  version: "0.18"
---

# Compact Smart Contracts

Compact (being renamed to Minokawa) is Midnight's domain-specific language for privacy-preserving smart
contracts. Contracts compile to ZK-SNARKs, enabling selective disclosure of data.

> **Note**: As of compiler v0.26.0, the language is being renamed from "Compact" to "Minokawa" under the
> Linux Foundation Decentralized Trust. The toolchain commands still use `compact`.

## Quick Start

```compact
pragma language_version 0.18;

export ledger message: Opaque<"string">;

export circuit setMessage(input: Opaque<"string">): [] {
  message = disclose(input);  // Makes private input public
}
```

## Contract Structure

Every Compact contract has three parts:

1. **Pragma** - Language version (`pragma language_version 0.18;`)
2. **Ledger** - On-chain state declarations
3. **Circuits** - ZK-proven functions

## Core Concepts

### Privacy Model

| Level | Syntax | Visibility |
| ----- | ------ | ---------- |
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
| ----- | -------- |
| **Type System** | [references/types.md](references/types.md) - Full type reference |
| **Standard Library** | [references/stdlib.md](references/stdlib.md) - Hashing, coins, EC ops |
| **VS Code extension** | [references/vscode-extension.md](references/vscode-extension.md) - Editor setup and tasks |
| **Ledger Patterns** | [references/ledger-patterns.md](references/ledger-patterns.md) - State management |
| **Advanced Patterns** | [references/advanced-patterns.md](references/advanced-patterns.md) - Access control, state machines |

## Templates

| Template | Description |
| -------- | ----------- |
| [assets/basic-contract.compact](assets/basic-contract.compact) | Simple ledger + circuit |
| [assets/token-contract.compact](assets/token-contract.compact) | Token with transfers |
| [assets/private-voting.compact](assets/private-voting.compact) | Anonymous voting |
| [assets/commitment-reveal.compact](assets/commitment-reveal.compact) | Commit-reveal pattern |

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
| ----- | ----- | --- |
| `Type mismatch` | Wrong bit width | Use correct `Uint<N>` size |
| `Cannot assign private to public` | Missing disclose | Add `disclose()` wrapper |
| `Undefined symbol` | Import missing | Check pragma and imports |

## Best Practices

- ✅ Start with `pragma language_version 0.18;`
- ✅ Use `witness` for private inputs that need proofs
- ✅ Choose smallest `Uint<N>` that fits your data
- ✅ Use `persistentHash` for on-chain data, `transientHash` for temp
- ❌ Don't expose secrets via `disclose()` unnecessarily
- ❌ Avoid large state (increases gas costs)

## Resources

- [Compact Reference](https://docs.midnight.network/develop/reference/compact/)
- [Examples Repository](https://github.com/midnightntwrk/midnight-awesome-dapps)
