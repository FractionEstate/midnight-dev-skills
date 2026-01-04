# Midnight Network Development Skills

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Specification-blue)](https://agentskills.io/specification)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org)
[![Compact](https://img.shields.io/badge/Compact-0.2.0-green)](https://docs.midnight.network)

Comprehensive GitHub Copilot customizations for building privacy-preserving DApps on Midnight Network with Next.js 16.1.1.

## ✨ What's Included

This repository provides a complete AI-assisted development environment:

- **📚 26 Agent Skills** - Specialized knowledge for Midnight development tasks
- **🤖 6 Custom Agents** - Expert personas for different development scenarios
- **📝 10 Reusable Prompts** - Workflow templates for common tasks
- **📋 5 Instruction Sets** - Context-aware coding guidelines (including memory)

## 🌙 About Midnight Network

Midnight is a privacy-first blockchain that combines public verifiability with confidential data handling using zero-knowledge proofs (ZKPs) and selective disclosure. Build applications that:

- ✅ Verify correctness without revealing sensitive data
- ✅ Share only the information users choose to disclose
- ✅ Prove compliance while keeping private records confidential

## 📚 Agent Skills

All skills follow the [Agent Skills specification](https://agentskills.io/specification) and are located in [`.github/skills/`](.github/skills/):

### 🔧 Setup & Configuration

| Skill | Description | Assets |
|-------|-------------|--------|
| [midnight-nextjs-setup](.github/skills/midnight-nextjs-setup/) | Environment setup with Lace wallet, Compact compiler, proof server | `setup.sh` |
| [vscode-compact-extension](.github/skills/vscode-compact-extension/) | VS Code extension for Compact: syntax highlighting, snippets, tasks | `tasks.json` |
| [network-configuration](.github/skills/network-configuration/) | Network endpoints, testnet/mainnet config, RPC and WebSocket setup | — |
| [proof-server-operations](.github/skills/proof-server-operations/) | Docker deployment, configuration, monitoring, and troubleshooting | `proof-server-reference.md` |
| [lace-wallet-setup](.github/skills/lace-wallet-setup/) | Lace wallet browser extension integration and connection flows | — |

### 📝 Compact Language

| Skill | Description | Assets |
|-------|-------------|--------|
| [compact-smart-contracts](.github/skills/compact-smart-contracts/) | Compact language fundamentals, circuits, state management | `compact-cheatsheet.md` |
| [compact-type-system](.github/skills/compact-type-system/) | Complete type reference: Boolean, Uint, Field, Bytes, struct, enum | `type-reference.md` |
| [compact-stdlib](.github/skills/compact-stdlib/) | Standard library: hashing, EC operations, coin management, Maybe/Either | `stdlib-functions.md` |
| [ledger-state-patterns](.github/skills/ledger-state-patterns/) | Ledger types: Counter, Set, Map, List, MerkleTree, HistoricMerkleTree | `ledger-types.md` |
| [advanced-compact-patterns](.github/skills/advanced-compact-patterns/) | Access control, state machines, optimization patterns | `patterns.md` |

### 🔐 Privacy & ZK Proofs

| Skill | Description | Assets |
|-------|-------------|--------|
| [zero-knowledge-proofs](.github/skills/zero-knowledge-proofs/) | ZK-SNARK concepts and selective disclosure | — |
| [privacy-data-patterns](.github/skills/privacy-data-patterns/) | Commitment schemes, nullifiers, Merkle proofs, witnesses | `privacy-patterns.md` |

### 🔌 APIs & Integration

| Skill | Description | Assets |
|-------|-------------|--------|
| [dapp-connector-api](.github/skills/dapp-connector-api/) | DApp Connector API for wallet integration | `api-examples.ts` |
| [wallet-sdk-integration](.github/skills/wallet-sdk-integration/) | WalletBuilder, HD derivation, state management, transfers | `wallet-setup.ts` |
| [midnight-js-providers](.github/skills/midnight-js-providers/) | Provider configuration: privateState, publicData, zkConfig | `providers.md` |
| [midnight-indexer-graphql](.github/skills/midnight-indexer-graphql/) | GraphQL queries, subscriptions, and schema reference | `graphql-queries.md` |
| [zswap-transactions](.github/skills/zswap-transactions/) | ZSwap protocol: Transaction, Inputs, Outputs, CoinInfo, Offers | `zswap-patterns.md` |
| [address-formats](.github/skills/address-formats/) | Shielded and transparent addresses, encoding/decoding | — |

### 🚀 Development & Deployment

| Skill | Description | Assets |
|-------|-------------|--------|
| [nextjs-wallet-integration](.github/skills/nextjs-wallet-integration/) | Next.js wallet connection and transaction flows | — |
| [contract-deployment](.github/skills/contract-deployment/) | Complete deployment workflow: compile, deploy, verify | `deploy-template.ts` |
| [deploy-midnight-dapp](.github/skills/deploy-midnight-dapp/) | Environment configuration and deployment guides | — |
| [testing-compact-contracts](.github/skills/testing-compact-contracts/) | Vitest setup and circuit testing strategies | `test-setup.js` |
| [ci-cd-pipeline](.github/skills/ci-cd-pipeline/) | GitHub Actions for automated testing and deployment | `workflow-templates.md` |

### 📖 Tutorials & Reference

| Skill | Description | Assets |
|-------|-------------|--------|
| [build-bulletin-board-dapp](.github/skills/build-bulletin-board-dapp/) | Complete tutorial: bulletin board dApp from scratch | — |
| [midnight-glossary](.github/skills/midnight-glossary/) | Comprehensive glossary of Midnight terminology | — |
| [troubleshooting](.github/skills/troubleshooting/) | Solutions for common development issues | — |

## 🤖 Custom Agents

Specialized AI personas in [`.github/agents/`](.github/agents/):

| Agent | Description | Best For |
|-------|-------------|----------|
| [midnight-developer](.github/agents/midnight-developer.agent.md) | Expert Midnight developer with full-stack knowledge | General dApp development |
| [compact-expert](.github/agents/compact-expert.agent.md) | Compact language specialist | Smart contract design |
| [security-auditor](.github/agents/security-auditor.agent.md) | Security auditor for ZK and privacy patterns | Contract review, vulnerability detection |
| [compact-developer](.github/agents/compact-developer.agent.md) | Focused Compact contract writer | Writing circuits and ledger logic |
| [dapp-builder](.github/agents/dapp-builder.agent.md) | Full-stack DApp builder | Next.js + Midnight integration |
| [security-review](.github/agents/security-review.agent.md) | Systematic security reviewer | Audit reports, vulnerability checklists |

## 📝 Reusable Prompts

Workflow templates in [`.github/prompts/`](.github/prompts/):

| Prompt | Description |
|--------|-------------|
| [create-compact-contract](.github/prompts/create-compact-contract.prompt.md) | Generate complete Compact contracts |
| [integrate-wallet](.github/prompts/integrate-wallet.prompt.md) | Set up wallet connection in Next.js |
| [deploy-contract](.github/prompts/deploy-contract.prompt.md) | Deploy contracts to testnet/mainnet |
| [implement-privacy-feature](.github/prompts/implement-privacy-feature.prompt.md) | Add privacy patterns (commitments, nullifiers, etc.) |
| [audit-security](.github/prompts/audit-security.prompt.md) | Perform security audits on contracts |
| [debug-contract](.github/prompts/debug-contract.prompt.md) | Debug Compact contract compilation or runtime errors |
| [add-privacy-feature](.github/prompts/add-privacy-feature.prompt.md) | Add privacy-preserving features to existing contracts |
| [optimize-contract](.github/prompts/optimize-contract.prompt.md) | Optimize contracts for gas efficiency |
| [setup-testing](.github/prompts/setup-testing.prompt.md) | Configure testing infrastructure |
| [create-component](.github/prompts/create-component.prompt.md) | Create React components with wallet integration |

## 📋 Instruction Sets

Context-aware guidelines in [`.github/instructions/`](.github/instructions/):

| Instructions | Applies To | Description |
|--------------|-----------|-------------|
| [compact](.github/instructions/compact.instructions.md) | `**/*.compact` | Compact language coding standards |
| [midnight-typescript](.github/instructions/midnight-typescript.instructions.md) | `**/*.{ts,tsx}` | TypeScript with Midnight APIs |
| [privacy-patterns](.github/instructions/privacy-patterns.instructions.md) | `**/contracts/**,**/lib/privacy/**` | ZK and privacy patterns |
| [testing](.github/instructions/testing.instructions.md) | `**/test/**,**/*.test.ts` | Contract testing guidelines |
| [memory](.github/instructions/memory.instructions.md) | Global | Persistent learnings and discovered patterns |

## 🚀 Quick Start

```bash
# Use the bundled setup script
bash .github/skills/midnight-nextjs-setup/scripts/setup.sh my-midnight-app

# Or manually:
# 1. Install Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh

# 2. Start the proof server (in separate terminal)
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# 3. Create project
npx create-next-app@16.1.1 my-midnight-dapp --typescript
cd my-midnight-dapp
npm install @midnight-ntwrk/dapp-connector-api

# 4. Develop your DApp
npm run dev
```

Visit http://localhost:3000 to see your app.

## 🎯 Learning Paths

### 🟢 Beginner Path (8-11 hours)
New to Midnight Network? Follow this path:
1. Complete **midnight-nextjs-setup**
2. Learn **compact-smart-contracts** basics
3. Build Hello World DApp
4. Add **nextjs-wallet-integration**
5. **deploy-midnight-dapp** to testnet

### 🟡 Intermediate Path (6-8 hours)
Have blockchain experience? Start here:
1. Quick review of **midnight-nextjs-setup**
2. Deep dive into **compact-smart-contracts**
3. Study **advanced-compact-patterns**
4. Master **nextjs-wallet-integration** patterns
5. **deploy-midnight-dapp** with full testing

### 🔴 Advanced Path (4-6 hours)
Experienced DApp developer? Focus on:
1. Skim **midnight-nextjs-setup** for Midnight-specific tools
2. **advanced-compact-patterns** (privacy, ZK proofs)
3. **zero-knowledge-proofs** concepts
4. **ci-cd-pipeline** for production

## 🛠️ Technology Stack

- **Midnight Network** - Privacy-first blockchain
- **Next.js 16.1.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Compact 0.2.0** - Smart contract language
- **Docker** - Proof server container
- **Lace Wallet** - Browser extension for Midnight

## 📖 Core Concepts

### Zero-Knowledge Proofs (ZKPs)
Prove statements are true without revealing underlying data. Midnight uses ZKPs to verify transactions while maintaining privacy.

### Selective Disclosure
Users choose exactly what information to share. Prove specific claims without revealing full details.

### Privacy by Default
Compact enforces privacy - all user inputs are private unless explicitly disclosed with `disclose()`.

### Proof Server
Service that generates zero-knowledge proofs for transactions. Required for all Midnight interactions.

## 🔗 Resources

- **Documentation**: https://docs.midnight.network/
- **Discord**: https://discord.com/invite/midnightnetwork
- **GitHub**: https://github.com/midnightntwrk
- **Examples**: https://github.com/midnightntwrk/midnight-awesome-dapps
- **Agent Skills Spec**: https://agentskills.io/specification
- **awesome-copilot**: https://github.com/github/awesome-copilot

## 🤝 Contributing

Contributions are welcome! See [AGENTS.md](AGENTS.md) for guidelines on:
- Adding new skills
- Skill format requirements
- Bundled assets guidelines

## 📜 License

MIT License - Educational resources for the Midnight Network developer community.

## 🆘 Support

- **Technical Issues**: Discord #developer-support
- **Bug Reports**: GitHub issues
- **General Questions**: Discord #general

---

**Start your privacy-preserving DApp journey today! 🌙**
