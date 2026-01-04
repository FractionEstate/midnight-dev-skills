# GitHub Actions Workflow Templates for Midnight Network

## Official Setup Compact Action

Use the official `setup-compact-action` to install the Compact compiler in CI/CD pipelines.

### Repository
https://github.com/midnightntwrk/setup-compact-action

## Basic Workflow

```yaml
name: Build and Test Midnight Contract

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Setup Compact Compiler
        uses: midnightntwrk/setup-compact-action@v1
        with:
          compact-version: '0.25.0'  # Optional: defaults to latest
          cache-enabled: true         # Optional: caches compiler (default: true)

      - name: Install dependencies
        run: npm ci

      - name: Compile Compact contracts
        run: npm run compact
        working-directory: ./contract

      - name: Build TypeScript
        run: npm run build

      - name: Run tests
        run: npm run test
```

## Action Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `compact-version` | Version of Compact compiler to install | `latest` |
| `cache-enabled` | Whether to cache the compiler installation | `true` |

## Action Outputs

| Output | Description |
|--------|-------------|
| `compact-version` | The actual version of Compact that was installed |
| `cache-hit` | Whether the compiler was restored from cache |

## Performance

- **First run**: ~30-60 seconds (downloads compiler)
- **Cached runs**: ~2-5 seconds

## Complete CI/CD Workflow

```yaml
name: Midnight DApp CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '22'
  COMPACT_VERSION: '0.25.0'

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

  test-contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Compact
        uses: midnightntwrk/setup-compact-action@v1
        with:
          compact-version: ${{ env.COMPACT_VERSION }}

      - name: Install contract dependencies
        run: npm ci
        working-directory: ./contract

      - name: Compile contract
        run: npm run compact
        working-directory: ./contract

      - name: Build contract
        run: npm run build
        working-directory: ./contract

      - name: Test contract
        run: npm run test
        working-directory: ./contract

  test-cli:
    runs-on: ubuntu-latest
    needs: test-contract
    services:
      proof-server:
        image: midnightnetwork/proof-server
        ports:
          - 6300:6300
        options: >-
          --health-cmd "curl -f http://localhost:6300/health || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Compact
        uses: midnightntwrk/setup-compact-action@v1
        with:
          compact-version: ${{ env.COMPACT_VERSION }}

      - name: Install all dependencies
        run: npm ci

      - name: Compile contract
        run: npm run compact
        working-directory: ./contract

      - name: Build contract
        run: npm run build
        working-directory: ./contract

      - name: Build CLI
        run: npm run build
        working-directory: ./counter-cli

      - name: Run integration tests
        run: npm run test
        working-directory: ./counter-cli
        env:
          PROOF_SERVER_URL: http://localhost:6300

  build:
    runs-on: ubuntu-latest
    needs: [lint, test-contract]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Compact
        uses: midnightntwrk/setup-compact-action@v1
        with:
          compact-version: ${{ env.COMPACT_VERSION }}

      - run: npm ci
      - run: npm run compact --workspaces --if-present
      - run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            dist/
            contract/dist/

  deploy-testnet:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: testnet

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build

      - run: npm ci --production

      - name: Deploy to Testnet
        run: npm run deploy
        env:
          MIDNIGHT_NETWORK: testnet
          WALLET_SEED: ${{ secrets.TESTNET_WALLET_SEED }}
          PROOF_SERVER_URL: ${{ secrets.PROOF_SERVER_URL }}
```

## Next.js Web UI Workflow

```yaml
name: Build and Deploy Web UI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-ui:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Setup Compact
        uses: midnightntwrk/setup-compact-action@v1

      - name: Install dependencies
        run: npm ci
        working-directory: ./bboard-ui

      - name: Compile contract (for type bindings)
        run: npm run compact
        working-directory: ./contract

      - name: Build UI
        run: npm run build
        working-directory: ./bboard-ui
        env:
          VITE_NETWORK_ID: TestNet
          VITE_LOGGING_LEVEL: info

      - name: Upload UI artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ui-dist
          path: bboard-ui/dist/
```

## Matrix Testing

```yaml
name: Matrix Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node: ['22']
        compact: ['0.24.0', '0.25.0']

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - uses: midnightntwrk/setup-compact-action@v1
        with:
          compact-version: ${{ matrix.compact }}

      - run: npm ci
      - run: npm run compact
        working-directory: ./contract
      - run: npm run test
```

## Secrets Required

| Secret | Description |
|--------|-------------|
| `TESTNET_WALLET_SEED` | 64-character hex wallet seed for testnet deployment |
| `PROOF_SERVER_URL` | URL of proof server (or use local Docker service) |

## Best Practices

1. **Cache Compact compiler** - Use `cache-enabled: true` to speed up builds
2. **Pin versions** - Specify `compact-version` to ensure reproducible builds
3. **Use Docker services** - Run proof server as a GitHub Actions service
4. **Separate jobs** - Split lint, test, and deploy for parallel execution
5. **Use environments** - Protect deployment secrets with GitHub environments
6. **Artifact sharing** - Build once, deploy multiple times using artifacts
