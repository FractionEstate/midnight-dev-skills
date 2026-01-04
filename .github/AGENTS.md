# AGENTS.md

## What this repo is

This repository is a curated set of GitHub Copilot customizations for building
privacy-preserving dApps on the Midnight Network (Compact + TypeScript/Next.js).

It includes:

- **Agents**: reusable “personas” for different roles (security, UI, DevOps, etc.)
- **Prompts**: task templates you can invoke from Copilot Chat
- **Instructions**: context-aware rules (file-pattern based)
- **Skills**: structured long-form knowledge per the Agent Skills spec

## Current structure (source: repository tree)

```text
.github/
├── AGENTS.md
├── copilot-instructions.md
├── agents/                        # 8 agents
│   ├── api-developer.agent.md
│   ├── devops-engineer.agent.md
│   ├── e2e-testing-engineer.agent.md
│   ├── fullstack-developer.agent.md
│   ├── midnight-smartcontract-developer.agent.md
│   ├── security-auditor.agent.md
│   ├── security-review.agent.md
│   └── ui-designer.agent.md
├── prompts/                       # 18 prompts
│   ├── add-privacy-feature.prompt.md
│   ├── audit-security.prompt.md
│   ├── create-compact-contract.prompt.md
│   ├── create-component.prompt.md
│   ├── create-docker-setup.prompt.md
│   ├── create-e2e-tests.prompt.md
│   ├── create-rest-api.prompt.md
│   ├── create-turborepo.prompt.md
│   ├── create-ui-component.prompt.md
│   ├── debug-contract.prompt.md
│   ├── deploy-contract.prompt.md
│   ├── design-database-schema.prompt.md
│   ├── implement-privacy-feature.prompt.md
│   ├── integrate-wallet.prompt.md
│   ├── optimize-contract.prompt.md
│   ├── setup-authentication.prompt.md
│   ├── setup-cicd.prompt.md
│   └── setup-testing.prompt.md
├── instructions/                  # 10 instruction sets
│   ├── compact.instructions.md
│   ├── memory.instructions.md
│   ├── midnight-typescript.instructions.md
│   ├── nextjs.instructions.md
│   ├── playwright.instructions.md
│   ├── prisma.instructions.md
│   ├── privacy-patterns.instructions.md
│   ├── tailwindcss.instructions.md
│   ├── testing.instructions.md
│   └── turborepo.instructions.md
├── scripts/
│   └── generate-skills-xml.sh
└── skills/                        # 11 skills
    ├── README.md
    ├── compact/
    ├── dapp-integration/
    ├── midnight-network/
    ├── nextjs/
    ├── playwright/
    ├── prisma/
    ├── privacy-patterns/
    ├── security/
    ├── tailwindcss/
    ├── testing/
    └── turborepo/
```

## Notes for contributors

- Skills live under `.github/skills/<skill-name>/`.
- Each skill should have a `SKILL.md` plus optional `assets/` and `references/`.
- Prefer keeping public guidance aligned with the official Midnight docs.
- For “what versions work together”, treat the Network Support Matrix as the primary source of truth:
  <https://docs.midnight.network/relnotes/support-matrix>
- The Release Overview page is a convenient index, but it has known version-number inconsistencies; when
  in doubt, defer to the component release note pages linked from it.

## Resources

- Midnight docs: <https://docs.midnight.network/>
- Release notes (index): <https://docs.midnight.network/relnotes/overview>
- Network Support Matrix (compatibility): <https://docs.midnight.network/relnotes/support-matrix>
- Agent Skills spec: <https://agentskills.io/specification>
