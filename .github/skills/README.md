# 🌙 Midnight Development Skills

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Specification-blue)](https://agentskills.io/specification)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Compact](https://img.shields.io/badge/Compact-0.25-green)](https://docs.midnight.network)

GitHub Agent Skills for building privacy-preserving dApps on the Midnight Network.

## 🎯 What Are These Skills?

Agent Skills are self-contained folders with instructions and bundled resources that enhance AI capabilities for specialized tasks. Based on the [Agent Skills specification](https://agentskills.io/specification), each skill contains a `SKILL.md` file with detailed instructions that agents load on-demand.

**When to use these skills:**
- Writing Compact smart contracts
- Implementing privacy patterns (commitments, nullifiers, ZK proofs)
- Integrating wallets and deploying dApps
- Testing contracts with simulators
- Configuring network infrastructure

## 📋 Core Skills (Consolidated)

| Skill | Description | Contents |
|-------|-------------|----------|
| [compact](compact/) | Smart contract development in Compact language | `references/`, `templates/` |
| [dapp-integration](dapp-integration/) | TypeScript/React wallet and contract integration | `references/`, `templates/` |
| [midnight-network](midnight-network/) | Network infrastructure, proof server, indexer | `references/` |
| [privacy-patterns](privacy-patterns/) | ZK proofs, commitments, nullifiers, disclosure | `references/` |
| [testing](testing/) | Contract testing with simulators | `references/` |

## 📁 Skill Structure

Each skill follows the progressive disclosure pattern:

```
skill-name/
├── SKILL.md              # Core instructions (lean, <500 lines)
├── references/           # Detailed docs (loaded on demand)
│   ├── topic-a.md
│   └── topic-b.md
└── templates/            # Reusable code templates
    ├── template.ts
    └── template.compact
│   ├── references/       # Optional: additional documentation
│   └── assets/           # Optional: templates, images, data
```

### SKILL.md Format

```yaml
---
name: skill-name          # Lowercase, hyphens, matches folder (max 64 chars)
description: ...          # What it does + when to use (10-1024 chars)
---

# Skill Title

[Markdown instructions loaded when skill activates]
```

## 🚀 Quick Reference

### Compact Contract

```compact
pragma compact(">=0.25");

export ledger counter: Counter;

export circuit increment(): [] {
  counter = counter + 1;
}
```

### Wallet Connection

```typescript
const connector = window.midnight;
await connector.enable();
const walletApi = await connector.walletAPI();
```

### Network Endpoints

| Service | Testnet-02 |
|---------|------------|
| Indexer | `https://indexer.testnet-02.midnight.network/api/v1/graphql` |
| RPC | `https://rpc.testnet-02.midnight.network` |
| Proof Server | `http://localhost:6300` |

## 📚 Resources

- [Midnight Documentation](https://docs.midnight.network)
- [Midnight GitHub](https://github.com/midnightntwrk)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Example dApps](https://github.com/midnightntwrk/midnight-awesome-dapps)

## 🤝 Contributing

1. Fork this repository
2. Create skill folder: `.github/skills/your-skill-name/`
3. Add `SKILL.md` with proper frontmatter
4. Add `references/` and `templates/` as needed
5. Submit pull request

## 📄 License

MIT License
