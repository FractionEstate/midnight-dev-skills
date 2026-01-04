# CI/CD Pipeline Templates

Ready-to-use GitHub Actions workflows for Midnight Network DApp development.

## Basic Build & Test

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Compact Compiler
        run: |
          curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
          echo "$HOME/.cargo/bin" >> $GITHUB_PATH

      - name: Install dependencies
        run: npm ci

      - name: Compile Contracts
        run: |
          for contract in contracts/*.compact; do
            name=$(basename "$contract" .compact)
            compact compile "$contract" "contracts/managed/$name"
          done

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
```

## Deploy to Testnet

```yaml
# .github/workflows/deploy-testnet.yml
name: Deploy to Testnet

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'contracts/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: testnet

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Compact
        run: |
          curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
          echo "$HOME/.cargo/bin" >> $GITHUB_PATH

      - name: Install dependencies
        run: npm ci

      - name: Compile Contracts
        run: npm run contracts:compile

      - name: Deploy
        env:
          MIDNIGHT_NETWORK: testnet
          DEPLOYER_SEED: ${{ secrets.DEPLOYER_SEED }}
        run: npm run deploy

      - name: Save Contract Addresses
        run: |
          echo "Contract deployed at $(date)" >> deployments.log
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add deployments.log
          git commit -m "chore: update deployment log" || true
          git push || true
```

## Security Scan

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Audit dependencies
        run: npm audit --audit-level=high

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
```

## Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Compact
        run: |
          curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
          echo "$HOME/.cargo/bin" >> $GITHUB_PATH

      - name: Build
        run: |
          npm ci
          npm run contracts:compile
          npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            contracts/managed/**/*
            .next/**/*
          generate_release_notes: true
```

## Environment Variables

Required secrets for workflows:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `DEPLOYER_SEED` | Wallet seed phrase for deployments | deploy-testnet |
| `VERCEL_TOKEN` | Vercel deployment token | vercel-deploy |
| `NPM_TOKEN` | NPM publish token | npm-publish |

## Reusable Workflow

```yaml
# .github/workflows/compact-compile.yml
name: Compile Compact Contracts

on:
  workflow_call:
    inputs:
      contracts-path:
        type: string
        default: 'contracts'
      output-path:
        type: string
        default: 'contracts/managed'

jobs:
  compile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Compact
        run: |
          curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
          echo "$HOME/.cargo/bin" >> $GITHUB_PATH

      - name: Compile
        run: |
          mkdir -p ${{ inputs.output-path }}
          for contract in ${{ inputs.contracts-path }}/*.compact; do
            name=$(basename "$contract" .compact)
            compact compile "$contract" "${{ inputs.output-path }}/$name"
          done

      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: compiled-contracts
          path: ${{ inputs.output-path }}
```

Use in other workflows:
```yaml
jobs:
  compile:
    uses: ./.github/workflows/compact-compile.yml
    with:
      contracts-path: 'src/contracts'
```
