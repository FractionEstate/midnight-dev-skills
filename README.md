# Midnight Network Development Skills

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Specification-blue)](https://agentskills.io/specification)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org)
[![Compact](https://img.shields.io/badge/Compact-0.2.0-green)](https://docs.midnight.network)

GitHub Agent Skills for building privacy-preserving DApps on Midnight Network with Next.js 16.1.1.

## 🌙 About Midnight Network

Midnight is a privacy-first blockchain that combines public verifiability with confidential data handling using zero-knowledge proofs (ZKPs) and selective disclosure. Build applications that:

- ✅ Verify correctness without revealing sensitive data
- ✅ Share only the information users choose to disclose
- ✅ Prove compliance while keeping private records confidential

## 📚 Agent Skills

All skills follow the [Agent Skills specification](https://agentskills.io/specification) and are located in [`.github/skills/`](.github/skills/):

| Skill | Description | Assets |
|-------|-------------|--------|
| [midnight-nextjs-setup](.github/skills/midnight-nextjs-setup/) | Environment setup with Lace wallet, Compact compiler, proof server | `setup.sh` |
| [compact-smart-contracts](.github/skills/compact-smart-contracts/) | Compact language fundamentals, circuits, state management | `compact-cheatsheet.md` |
| [advanced-compact-patterns](.github/skills/advanced-compact-patterns/) | Access control, state machines, optimization patterns | `patterns.md` |
| [nextjs-wallet-integration](.github/skills/nextjs-wallet-integration/) | DApp Connector API and wallet connection flows | — |
| [deploy-midnight-dapp](.github/skills/deploy-midnight-dapp/) | Contract deployment and environment configuration | — |
| [ci-cd-pipeline](.github/skills/ci-cd-pipeline/) | GitHub Actions for automated testing and deployment | `workflow-templates.md` |
| [testing-compact-contracts](.github/skills/testing-compact-contracts/) | Vitest setup and circuit testing strategies | `test-setup.js` |
| [zero-knowledge-proofs](.github/skills/zero-knowledge-proofs/) | ZK-SNARK concepts and selective disclosure | — |
| [build-bulletin-board-dapp](.github/skills/build-bulletin-board-dapp/) | Complete tutorial: bulletin board dApp from scratch | — |
| [troubleshooting](.github/skills/troubleshooting/) | Solutions for common development issues | — |

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
