---
name: ci-cd-pipeline
description: Guide for setting up CI/CD pipelines for Midnight Network DApps using GitHub Actions. Use when users need automated testing, contract compilation workflows, deployment automation, or DevOps setup. Triggers on CI/CD, GitHub Actions, automated deployment, testing pipelines, or continuous integration requests.
---

# CI/CD Pipeline for Midnight DApps

Set up automated testing, compilation, and deployment for Midnight DApps using GitHub Actions.

## Quick Start Workflow

```yaml
# .github/workflows/ci.yml
name: Midnight DApp CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

## Install Compact Compiler in CI

```yaml
- name: Cache Compact compiler
  uses: actions/cache@v4
  id: compact-cache
  with:
    path: ~/.cargo/bin
    key: compact-compiler-v0.2.0

- name: Install Compact compiler
  if: steps.compact-cache.outputs.cache-hit != 'true'
  run: |
    curl --proto '=https' --tlsv1.2 -LsSf \
      https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh

- name: Add Compact to PATH
  run: echo "$HOME/.cargo/bin" >> $GITHUB_PATH

- name: Verify
  run: compact --version
```

## Compile Contracts Job

```yaml
compile-contracts:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    # Install Compact (with caching)
    - name: Cache Compact
      uses: actions/cache@v4
      with:
        path: ~/.cargo/bin
        key: compact-v0.2.0

    - name: Install Compact
      run: |
        curl --proto '=https' --tlsv1.2 -LsSf \
          https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
        echo "$HOME/.cargo/bin" >> $GITHUB_PATH

    - name: Compile contracts
      run: |
        for contract in contracts/*.compact; do
          name=$(basename "$contract" .compact)
          compact compile "$contract" "contracts/managed/$name"
        done

    - name: Upload artifacts
      uses: actions/upload-artifact@v4
      with:
        name: compiled-contracts
        path: contracts/managed/
```

## Full CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  COMPACT_VERSION: '0.2.0'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  compile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Compact
        run: |
          curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/midnightntwrk/compact/releases/download/compact-v${{ env.COMPACT_VERSION }}/compact-installer.sh | sh
          echo "$HOME/.cargo/bin" >> $GITHUB_PATH
      - name: Compile
        run: |
          for contract in contracts/*.compact; do
            name=$(basename "$contract" .compact)
            compact compile "$contract" "contracts/managed/$name"
          done
      - uses: actions/upload-artifact@v4
        with:
          name: contracts
          path: contracts/managed/

  test:
    runs-on: ubuntu-latest
    needs: compile
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - uses: actions/download-artifact@v4
        with:
          name: contracts
          path: contracts/managed/
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, compile]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - uses: actions/download-artifact@v4
        with:
          name: contracts
          path: contracts/managed/
      - run: npm ci
      - run: npm run build

  deploy-testnet:
    if: github.ref == 'refs/heads/develop'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: testnet
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy:testnet
        env:
          DEPLOYMENT_KEY: ${{ secrets.TESTNET_DEPLOYMENT_KEY }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy:production
        env:
          DEPLOYMENT_KEY: ${{ secrets.PRODUCTION_DEPLOYMENT_KEY }}
```

## Secrets Configuration

| Secret | Description |
|--------|-------------|
| `TESTNET_DEPLOYMENT_KEY` | Private key for testnet |
| `PRODUCTION_DEPLOYMENT_KEY` | Private key for production |
| `CODECOV_TOKEN` | Code coverage reporting |

**Setup**: Repository → Settings → Secrets and variables → Actions

## Reusable Action

```yaml
# .github/actions/setup-midnight/action.yml
name: Setup Midnight Development
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - name: Install Compact
      shell: bash
      run: |
        curl --proto '=https' --tlsv1.2 -LsSf \
          https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
        echo "$HOME/.cargo/bin" >> $GITHUB_PATH
    - run: npm ci
      shell: bash
```

**Use in workflows**:
```yaml
- uses: ./.github/actions/setup-midnight
```

## Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "build": "next build",
    "deploy:testnet": "ts-node scripts/deploy.ts --network testnet",
    "deploy:production": "ts-node scripts/deploy.ts --network mainnet"
  }
}
```

## Resources

- GitHub Actions: https://docs.github.com/en/actions
- Midnight Docs: https://docs.midnight.network/
