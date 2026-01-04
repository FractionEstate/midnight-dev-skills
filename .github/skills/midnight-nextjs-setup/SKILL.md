---
name: midnight-nextjs-setup
description: Guide for setting up a complete Midnight Network development environment with Next.js 16.1.1. Use when users need to install Lace wallet, Compact compiler, Docker proof server, or create new Midnight DApp projects. Triggers on requests about Midnight setup, development environment, wallet installation, proof server configuration, or scaffolding new Midnight projects.
---

# Midnight Next.js Development Setup

Set up a complete development environment for building privacy-preserving Midnight Network DApps with Next.js 16.1.1.

## Prerequisites

- Node.js 20.x or higher
- Google Chrome browser
- Docker Desktop
- Basic command-line knowledge
- VS Code or similar IDE

## Quick Start

```bash
# Install Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh

# Create new Midnight project
npx create-mn-app@latest my-midnight-app
cd my-midnight-app
npm run setup

# Start proof server (keep running)
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet
```

## Step 1: Install Lace Midnight Preview Wallet

1. Open Google Chrome browser
2. Install Lace wallet: https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg
3. Click "Add to Chrome" and confirm
4. Create new wallet with strong password
5. **CRITICAL**: Write down seed phrase on paper, store offline
6. Confirm seed phrase to complete setup

**Verify**: Lace icon appears in Chrome toolbar

## Step 2: Get Test Tokens (tDUST)

1. Open Lace wallet → Click "Receive"
2. Copy your wallet address
3. Visit: https://midnight.network/test-faucet/
4. Paste address and request tDUST
5. Wait 2-3 minutes for tokens

**Verify**: Lace wallet displays tDUST balance

## Step 3: Install Compact Compiler

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
```

Update PATH as instructed, then restart terminal.

**Verify**:
```bash
compact --version
which compact
```

## Step 4: Set Up Docker Proof Server

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop
3. Run proof server:

```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet
```

4. Keep terminal open (runs in foreground)

**Verify**: Logs show server at http://localhost:6300

**Configure Lace**: Settings → Midnight → Select `Local (http://localhost:6300)`

## Step 5: Install Compact VS Code Extension

Download and install the VSIX package for syntax highlighting, code snippets, and error highlighting.

### Option A: Command Line
```bash
# Download VSIX
curl -LO https://raw.githubusercontent.com/midnight-ntwrk/releases/gh-pages/artifacts/vscode-extension/compact-0.2.13/compact-0.2.13.vsix

# Install extension
code --install-extension compact-0.2.13.vsix
```

### Option B: VS Code UI
1. Download VSIX from: https://docs.midnight.network/relnotes/vs-code-extension
2. VS Code → `Cmd/Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select downloaded `compact-0.2.13.vsix` file
4. Reload VS Code when prompted

**Verify**:
- Open a `.compact` file
- Syntax highlighting appears
- Type `circuit` and press Tab for snippet expansion

### Extension Features
- Syntax highlighting for Compact keywords
- Code snippets (`ledger`, `circuit`, `witness`, `pragma`, etc.)
- Problem matchers for compiler errors
- File templates for new contracts

## Step 6: Create Next.js Project

```bash
npx create-mn-app@latest my-midnight-app
cd my-midnight-app
npm run setup
```

Select Next.js template when prompted.

**Project Structure**:
```
my-midnight-app/
├── contracts/          # Compact smart contracts
│   └── managed/        # Compiled artifacts
├── src/
│   ├── app/            # Next.js 16 app directory
│   └── components/     # React components
├── package.json
└── next.config.js
```

## Step 7: Install DApp Connector API

```bash
npm install @midnight-ntwrk/dapp-connector-api
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **ZK Proofs** | Verify correctness without revealing data |
| **Selective Disclosure** | Users choose what to share |
| **Compact** | Privacy-preserving smart contract language |
| **Proof Server** | Generates ZK proofs for transactions |

## Common Patterns

### Wallet Connection
```typescript
"use client";
import "@midnight-ntwrk/dapp-connector-api";

const api = await window.midnight.mnLace.enable();
```

### Privacy by Default
```compact
export circuit storeMessage(customMessage: Opaque<"string">): [] {
  message = disclose(customMessage);  // Explicitly make public
}
```

## Next Steps

1. Create first Compact smart contract
2. Implement wallet connect button
3. Deploy to Midnight Testnet
4. Build Next.js frontend
5. Test end-to-end

## Resources

- Docs: https://docs.midnight.network/
- Discord: https://discord.com/invite/midnightnetwork
- Examples: https://github.com/midnightntwrk/midnight-awesome-dapps
