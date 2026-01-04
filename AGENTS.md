# AGENTS.md

## Project Overview

This repository contains GitHub Agent Skills for building privacy-preserving dApps on the Midnight Network using Next.js and Compact smart contracts.

**Primary Technologies:**
- Midnight Network (privacy-first blockchain with ZK proofs)
- Next.js 16.1.1 (React framework)
- Compact 0.2.0 (Smart contract language, pragma 0.17)
- TypeScript
- Docker (proof server)

## Repository Structure

```
.github/skills/
├── README.md                      # Skills documentation
│
├── # Setup & Configuration
├── midnight-nextjs-setup/         # Environment setup skill
│   ├── SKILL.md
│   └── scripts/setup.sh
├── vscode-compact-extension/      # VS Code extension skill
│   ├── SKILL.md
│   └── assets/tasks.json
├── network-configuration/         # Network endpoints skill
│   └── SKILL.md
├── proof-server-operations/       # Proof server skill
│   ├── SKILL.md
│   └── references/proof-server-reference.md
├── lace-wallet-setup/             # Lace wallet skill
│   └── SKILL.md
│
├── # Compact Language
├── compact-smart-contracts/       # Compact language skill
│   ├── SKILL.md
│   └── references/compact-cheatsheet.md
├── compact-type-system/           # Type system skill
│   ├── SKILL.md
│   └── references/type-reference.md
├── compact-stdlib/                # Standard library skill
│   ├── SKILL.md
│   └── references/stdlib-functions.md
├── ledger-state-patterns/         # Ledger types skill
│   ├── SKILL.md
│   └── references/ledger-types.md
├── advanced-compact-patterns/     # Advanced patterns skill
│   ├── SKILL.md
│   └── references/patterns.md
│
├── # Privacy & ZK
├── zero-knowledge-proofs/         # ZKP concepts skill
│   └── SKILL.md
├── privacy-data-patterns/         # Privacy patterns skill
│   ├── SKILL.md
│   └── references/privacy-patterns.md
│
├── # APIs & Integration
├── dapp-connector-api/            # DApp Connector skill
│   ├── SKILL.md
│   └── references/api-examples.ts
├── wallet-sdk-integration/        # Wallet SDK skill
│   ├── SKILL.md
│   └── scripts/wallet-setup.ts
├── midnight-js-providers/         # Providers skill
│   ├── SKILL.md
│   └── references/providers.md
├── midnight-indexer-graphql/      # Indexer skill
│   ├── SKILL.md
│   └── references/graphql-queries.md
├── zswap-transactions/            # ZSwap skill
│   ├── SKILL.md
│   └── references/zswap-patterns.md
├── address-formats/               # Address formats skill
│   └── SKILL.md
│
├── # Development & Deployment
├── nextjs-wallet-integration/     # Wallet integration skill
│   └── SKILL.md
├── contract-deployment/           # Deployment skill
│   ├── SKILL.md
│   └── scripts/deploy-template.ts
├── deploy-midnight-dapp/          # Deployment guide skill
│   └── SKILL.md
├── testing-compact-contracts/     # Testing skill
│   ├── SKILL.md
│   └── scripts/test-setup.js
├── ci-cd-pipeline/                # CI/CD skill
│   ├── SKILL.md
│   └── references/workflow-templates.md
│
├── # Tutorials & Reference
├── build-bulletin-board-dapp/     # Tutorial skill
│   └── SKILL.md
├── midnight-glossary/             # Glossary skill
│   └── SKILL.md
└── troubleshooting/               # Troubleshooting skill
    └── SKILL.md
```

## Skills Format

Each skill follows the [Agent Skills specification](https://agentskills.io/specification):

```yaml
---
name: skill-name          # Lowercase, hyphens, matches folder name
description: ...          # 10-1024 characters, describes what/when
---

# Skill Title

[Markdown instructions for the agent]
```

## Development Workflow

### Adding a New Skill

1. Create folder: `.github/skills/skill-name/`
2. Create `SKILL.md` with frontmatter
3. Add optional assets in `scripts/`, `references/`, or `assets/`
4. Update README.md skills table

### Validation

Skills should:
- Have `name` matching folder name (lowercase with hyphens, max 64 chars)
- Have `description` between 10-1024 characters
- Keep `SKILL.md` under 500 lines (progressive disclosure)
- Bundle assets under 5MB per file

### Testing Skills

Test skills by using them in Copilot Chat:
- Open VS Code with GitHub Copilot
- Reference the skill in your prompt
- Verify agent loads correct instructions

## Code Style

### SKILL.md Content

- Start with clear purpose statement
- Include "When to Use" section
- Provide step-by-step instructions
- Include code examples with syntax highlighting
- Add troubleshooting tips for common issues
- Keep main content under 500 lines

### Bundled Assets

- Scripts: Self-contained, clear error messages
- References: Focused, load-on-demand content
- Assets: Templates, schemas, lookup data

## Midnight-Specific Guidelines

### Compact Contracts

```compact
pragma language_version 0.17;

export ledger varName: Opaque<"type">;

export circuit functionName(): [] {
    varName = disclose(value);
}
```

### Environment Variables

```bash
NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
NEXT_PUBLIC_CONTRACT_ADDRESS=...
```

### Key Commands

```bash
# Compile contract
compact compile contracts/name.compact contracts/managed/name

# Start proof server
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# Start Next.js
npm run dev
```

## Resources

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/develop/tutorial/building-your-first-midnight-dapp/compact)
- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub awesome-copilot](https://github.com/github/awesome-copilot)

## Contributing

1. Fork this repository
2. Create a skill folder with SKILL.md
3. Follow the format guidelines above
4. Submit a pull request

## License

MIT License - See LICENSE file
