# 🌙 Midnight Development Skills

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Specification-blue)](https://agentskills.io/specification)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org)
[![Compact](https://img.shields.io/badge/Compact-0.2.0-green)](https://docs.midnight.network)

GitHub Agent Skills for building privacy-preserving dApps on the Midnight Network using Next.js 16.1.1 and Compact 0.2.0.

## 🎯 What Are These Skills?

Agent Skills are self-contained folders with instructions and bundled resources that enhance AI capabilities for specialized tasks. Based on the [Agent Skills specification](https://agentskills.io/specification), each skill contains a `SKILL.md` file with detailed instructions that agents load on-demand.

**When to use these skills:**
- Setting up Midnight development environment
- Writing Compact smart contracts
- Integrating wallets with Next.js
- Deploying privacy-preserving dApps
- Debugging common Midnight issues

## 📋 Skills Overview

| Skill | Description | Bundled Assets |
|-------|-------------|----------------|
| [midnight-nextjs-setup](midnight-nextjs-setup/) | Environment setup with Lace wallet, Compact compiler, and proof server | `scripts/setup.sh` |
| [vscode-compact-extension](vscode-compact-extension/) | VS Code extension for Compact: syntax highlighting, snippets, tasks | `assets/tasks.json` |
| [compact-smart-contracts](compact-smart-contracts/) | Compact language fundamentals, circuits, and state management | `references/compact-cheatsheet.md` |
| [advanced-compact-patterns](advanced-compact-patterns/) | Access control, state machines, and optimization patterns | `references/patterns.md` |
| [nextjs-wallet-integration](nextjs-wallet-integration/) | DApp Connector API and wallet connection flows | — |
| [deploy-midnight-dapp](deploy-midnight-dapp/) | Contract deployment scripts and environment configuration | — |
| [ci-cd-pipeline](ci-cd-pipeline/) | GitHub Actions for automated testing and deployment | `references/workflow-templates.md` |
| [testing-compact-contracts](testing-compact-contracts/) | Vitest setup and circuit testing strategies | `scripts/test-setup.js` |
| [zero-knowledge-proofs](zero-knowledge-proofs/) | ZK-SNARK concepts and selective disclosure | — |
| [build-bulletin-board-dapp](build-bulletin-board-dapp/) | Complete tutorial: bulletin board dApp from scratch | — |
| [troubleshooting](troubleshooting/) | Solutions for common development issues | — |

## 📁 Structure

Each skill follows the [Agent Skills specification](https://agentskills.io/specification):

```
.github/skills/
├── README.md
├── skill-name/
│   ├── SKILL.md          # Required: frontmatter + instructions
│   ├── scripts/          # Optional: executable scripts
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

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- Google Chrome
- VS Code with GitHub Copilot

### Setup Environment

```bash
# Option 1: Use bundled setup script
bash .github/skills/midnight-nextjs-setup/scripts/setup.sh my-midnight-app

# Option 2: Manual setup
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh

# Start proof server
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# Create project
npx create-next-app@16.1.1 my-midnight-dapp --typescript
cd my-midnight-dapp
npm install @midnight-ntwrk/dapp-connector-api
```

### Install Lace Wallet

1. Install from [Chrome Web Store](https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg)
2. Create wallet and save seed phrase
3. Get test tokens from [Midnight Faucet](https://midnight.network/test-faucet/)

## 🔧 Using These Skills

### In VS Code with Copilot

Reference skills naturally in your prompts:

```
"Help me set up a Midnight development environment"
→ Activates: midnight-nextjs-setup

"Write a Compact voting contract"
→ Activates: compact-smart-contracts, advanced-compact-patterns

"My wallet won't connect"
→ Activates: troubleshooting, nextjs-wallet-integration
```

### Copy to Your Project

```bash
# Copy all skills
cp -r .github/skills/ /path/to/your-project/.github/skills/

# Or copy specific skill
cp -r .github/skills/compact-smart-contracts/ /path/to/your-project/.github/skills/
```

## 📚 Resources

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/develop/tutorial/building-your-first-midnight-dapp/compact)
- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub awesome-copilot](https://github.com/github/awesome-copilot)
- [Midnight GitHub](https://github.com/midnightntwrk)
- [Discord Community](https://discord.com/invite/midnightnetwork)

## 🤝 Contributing

1. Fork this repository
2. Create skill folder: `.github/skills/your-skill-name/`
3. Add `SKILL.md` with proper frontmatter
4. Add bundled assets if needed
5. Submit pull request

See [AGENTS.md](../../AGENTS.md) for detailed guidelines.

## 📄 License

MIT License
