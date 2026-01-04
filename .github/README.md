# Midnight Network Development Skills

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Specification-blue)](https://agentskills.io/specification)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org)
[![Compact](https://img.shields.io/badge/Compact-0.25+-green)](https://docs.midnight.network)

Comprehensive GitHub Copilot customizations for building privacy-preserving DApps on Midnight Network with Next.js 16.1.1.

## ✨ What's Included

This repository provides a complete AI-assisted development environment:

- **📚 11 Agent Skills** - Specialized knowledge for Midnight and web development
- **🤖 8 Custom Agents** - Expert personas for different development scenarios
- **📝 10 Reusable Prompts** - Workflow templates for common tasks
- **📋 10 Instruction Sets** - Context-aware coding guidelines

## 🌙 About Midnight Network

Midnight is a privacy-first blockchain that combines public verifiability with confidential data handling using zero-knowledge proofs (ZKPs) and selective disclosure.

## 📚 Agent Skills

All skills follow the [Agent Skills specification](https://agentskills.io/specification) with the structure:

```tree
skill-name/
├── SKILL.md          # Required: Main skill definition
├── assets/           # Static resources (templates, configs)
└── references/       # Additional documentation
```

### Available Skills

| Skill | Description | Location |
| ----- | ----------- | -------- |
| **compact** | Compact smart contract language for Midnight Network | [skills/compact/](skills/compact/) |
| **dapp-integration** | Wallet connection, providers, and contract deployment | [skills/dapp-integration/](skills/dapp-integration/) |
| **midnight-network** | Network infrastructure, proof servers, indexers | [skills/midnight-network/](skills/midnight-network/) |
| **nextjs** | Next.js 16.1+ App Router, Server Components, MCP | [skills/nextjs/](skills/nextjs/) |
| **playwright** | End-to-end testing with Playwright | [skills/playwright/](skills/playwright/) |
| **prisma** | Type-safe database access with Prisma ORM | [skills/prisma/](skills/prisma/) |
| **privacy-patterns** | ZK proofs, commitments, nullifiers, selective disclosure | [skills/privacy-patterns/](skills/privacy-patterns/) |
| **security** | Security auditing for Midnight contracts and dApps | [skills/security/](skills/security/) |
| **tailwindcss** | Tailwind CSS v4 styling patterns | [skills/tailwindcss/](skills/tailwindcss/) |
| **testing** | Contract testing with simulators and Vitest | [skills/testing/](skills/testing/) |
| **turborepo** | Monorepo build system configuration | [skills/turborepo/](skills/turborepo/) |

## 🤖 Custom Agents

Specialized AI personas in [agents/](agents/):

| Agent | Description | Best For |
| ----- | ----------- | -------- |
| [fullstack-developer](agents/fullstack-developer.agent.md) | Full-stack Next.js + Midnight developer | General dApp development |
| [midnight-smartcontract-developer](agents/midnight-smartcontract-developer.agent.md) | Compact contract specialist | Smart contract design |
| [security-auditor](agents/security-auditor.agent.md) | Security auditor for ZK and privacy patterns | Vulnerability detection |
| [security-review](agents/security-review.agent.md) | Systematic security reviewer | Audit reports |
| [api-developer](agents/api-developer.agent.md) | API and backend specialist | REST APIs, Server Actions |
| [devops-engineer](agents/devops-engineer.agent.md) | DevOps and infrastructure | CI/CD, Docker, Vercel |
| [e2e-testing-engineer](agents/e2e-testing-engineer.agent.md) | E2E testing specialist | Playwright, testing |
| [ui-designer](agents/ui-designer.agent.md) | UI/UX designer | Tailwind CSS, components |

## 📝 Reusable Prompts

Workflow templates in [prompts/](prompts/):

| Prompt | Description |
| ------ | ----------- |
| create-compact-contract | Generate complete Compact contracts |
| integrate-wallet | Set up wallet connection in Next.js |
| deploy-contract | Deploy contracts to testnet/mainnet |
| implement-privacy-feature | Add privacy patterns |
| audit-security | Perform security audits |
| debug-contract | Debug compilation or runtime errors |
| add-privacy-feature | Add privacy features to existing contracts |
| optimize-contract | Optimize for gas efficiency |
| setup-testing | Configure testing infrastructure |
| create-component | Create React components with wallet integration |

## 📋 Instruction Sets

Context-aware guidelines in [instructions/](instructions/):

| Instructions | Applies To | Description |
| ------------ | ---------- | ----------- |
| compact | `**/*.compact` | Compact language coding standards |
| midnight-typescript | `**/*.{ts,tsx}` | TypeScript with Midnight APIs |
| privacy-patterns | `**/contracts/**` | ZK and privacy patterns |
| testing | `**/test/**` | Contract testing guidelines |
| nextjs | `**/app/**` | Next.js App Router patterns |
| playwright | `**/e2e/**` | Playwright testing patterns |
| prisma | `**/prisma/**` | Prisma ORM patterns |
| tailwindcss | `**/*.{css,tsx}` | Tailwind CSS patterns |
| turborepo | `**/turbo.json` | Monorepo configuration |
| memory | Global | Persistent learnings |

## 🚀 Quick Start

```bash
# 1. Install Compact developer tools (v0.3.0)
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/download/compact-v0.3.0/compact-installer.sh | sh

# 2. Install the latest compiler
compact update

# 3. Start the proof server (in separate terminal)
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# 3. Create project
npx create-next-app@16.1.1 my-midnight-dapp --typescript
cd my-midnight-dapp
npm install @midnight-ntwrk/dapp-connector-api

# 4. Develop your DApp
npm run dev
```

## 🛠️ Technology Stack

- **Midnight Network** - Privacy-first blockchain
- **Next.js 16.1.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Compact 0.25+** - Smart contract language
- **Docker** - Proof server container
- **Lace Wallet** - Browser extension for Midnight

## 🔗 Resources

- **Documentation**: <https://docs.midnight.network/>
- **Discord**: <https://discord.com/invite/midnightnetwork>
- **GitHub**: <https://github.com/midnightntwrk>
- **Agent Skills Spec**: <https://agentskills.io/specification>

## 📜 License

MIT License - Educational resources for the Midnight Network developer community.

---

Start your privacy-preserving DApp journey today! 🌙
