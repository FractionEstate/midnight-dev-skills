# AGENTS.md

## Project Overview

This repository contains comprehensive GitHub Copilot customizations for building privacy-preserving dApps on the Midnight Network using Next.js and Compact smart contracts.

**Primary Technologies:**
- Midnight Network (privacy-first blockchain with ZK proofs)
- Next.js 16.1.1 (React framework)
- Compact 0.25+ (Smart contract language)
- TypeScript
- Docker (proof server)

## Repository Structure

```
.github/
├── copilot-instructions.md        # Global Copilot instructions
│
├── agents/                        # Custom AI agents (3 total)
│   ├── midnight-smartcontract-developer.agent.md  # Unified dev agent (auto mode-switching)
│   ├── security-auditor.agent.md                  # Security analysis specialist
│   └── security-review.agent.md                   # Systematic security review
│
├── prompts/                       # Reusable prompt templates (10 total)
│   ├── create-compact-contract.prompt.md
│   ├── integrate-wallet.prompt.md
│   ├── deploy-contract.prompt.md
│   ├── implement-privacy-feature.prompt.md
│   ├── audit-security.prompt.md
│   ├── debug-contract.prompt.md
│   ├── add-privacy-feature.prompt.md
│   ├── optimize-contract.prompt.md
│   ├── setup-testing.prompt.md
│   └── create-component.prompt.md
│
├── instructions/                  # Context-aware instructions (5 total)
│   ├── compact.instructions.md
│   ├── midnight-typescript.instructions.md
│   ├── privacy-patterns.instructions.md
│   ├── testing.instructions.md
│   └── memory.instructions.md     # Persistent learnings
│
└── skills/                        # Agent Skills (28 total)
    ├── # Setup & Configuration
    ├── midnight-nextjs-setup/
    ├── vscode-compact-extension/
    ├── network-configuration/
    ├── proof-server-operations/
    ├── lace-wallet-setup/
    ├── create-mn-app/             # Official CLI scaffolding
    │
    ├── # Compact Language
    ├── compact-smart-contracts/
    ├── compact-type-system/
    ├── compact-stdlib/
    ├── ledger-state-patterns/
    ├── advanced-compact-patterns/
    │
    ├── # Privacy & ZK
    ├── zero-knowledge-proofs/
    ├── privacy-data-patterns/
    │
    ├── # APIs & Integration
    ├── dapp-connector-api/
    ├── wallet-sdk-integration/
    ├── browser-wallet-integration/  # Lace + React patterns
    ├── midnight-js-providers/
    ├── midnight-indexer-graphql/
    ├── zswap-transactions/
    ├── address-formats/
    │
    ├── # Development & Deployment
    ├── nextjs-wallet-integration/
    ├── contract-deployment/
    ├── deploy-midnight-dapp/
    ├── testing-compact-contracts/
    ├── ci-cd-pipeline/
    │
    └── # Tutorials & Reference
        ├── build-bulletin-board-dapp/
        ├── midnight-glossary/
        └── troubleshooting/
```

## Copilot Customization Types

### 1. Global Instructions (`copilot-instructions.md`)

Project-wide coding guidelines automatically applied to all Copilot interactions:
- Technology stack versions
- Midnight API patterns
- Privacy-first defaults
- File organization standards

### 2. Custom Agents (`.agent.md`)

Specialized AI personas with deep expertise:

| Agent | Description |
|-------|-------------|
| `midnight-smartcontract-developer` | **Unified agent** with automatic context-aware mode switching for all Midnight development |
| `security-auditor` | Comprehensive ZK and privacy security analysis |
| `security-review` | Systematic security review with checklists |

#### Automatic Mode Detection

The unified `midnight-smartcontract-developer` agent automatically detects context and switches modes:

| Detection Trigger | Activated Mode | Focus |
|-------------------|----------------|-------|
| `.compact` files, circuits, ledger | **Compact Contract** | Compact language, ZK circuits |
| TypeScript, Next.js, wallet, provider | **DApp Integration** | TypeScript, React, wallets |
| deploy, proof server, testnet | **Deployment** | Contract deployment |
| test, vitest, simulator | **Testing** | Testing patterns |
| audit, vulnerability, review | **Security** | Vulnerability analysis |
| debug, error, fix | **Debug** | Troubleshooting |

### 3. Reusable Prompts (`.prompt.md`)

Task-specific workflow templates accessible via `/` command:

| Prompt | Use Case |
|--------|----------|
| `create-compact-contract` | Generate new Compact contracts |
| `integrate-wallet` | Add wallet connection to Next.js |
| `deploy-contract` | Deploy to testnet/mainnet |
| `implement-privacy-feature` | Add ZK privacy patterns |
| `audit-security` | Security review contracts |

### 4. Instructions (`.instructions.md`)

Context-aware guidelines that auto-apply based on file patterns:

| File | Applies To |
|------|-----------|
| `compact.instructions.md` | `**/*.compact` |
| `midnight-typescript.instructions.md` | `**/*.{ts,tsx}` |
| `privacy-patterns.instructions.md` | `**/contracts/**` |
| `testing.instructions.md` | `**/*.test.ts` |

### 5. Agent Skills (`SKILL.md`)

26 comprehensive skills following [agentskills.io](https://agentskills.io/specification):
- Progressive disclosure pattern
- Bundled assets (scripts, references)
- Load-on-demand content

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
pragma compact(">=0.25");

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
