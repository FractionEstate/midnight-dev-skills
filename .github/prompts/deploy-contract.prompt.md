---
description: Deploy a Compact smart contract to Midnight Network
name: Deploy Contract
agent: Midnight Developer
tools:
  - execute/runInTerminal
  - edit/editFiles
  - web/fetch
---

# Deploy Contract to Testnet

Deploy a Compact smart contract to Midnight Network.

## Input Variables

- **Contract Path**: ${input:contractPath:Path to the contract (e.g., ./contracts/MyContract)}
- **Network**: ${input:network:testnet or mainnet}

## Prerequisites Check

1. **Compact developer tools**: Ensure `compact` is installed (`compact --version`)
2. **Proof Server**: Ensure proof server is running on port 6300
3. **Wallet**: Lace wallet with Midnight support installed and funded

## Deployment Steps

### Step 1: Compile Contract

```bash
compact compile --vscode \
  ${contractPath}/main.compact \
  ${contractPath}/managed/main
```

Notes:

- Use `compact compile` from the Compact developer tools (`compact`). The underlying compiler binary is
  typically named `compactc`, but the recommended interface is the `compact` CLI.
- Do not use `--skip-zk` for a real deploy, because you typically need proving keys.

### Step 2: Configure Network Endpoints

**Testnet-02**:

- Indexer: `https://indexer.testnet-02.midnight.network/api/v1/graphql`
- RPC: `https://rpc.testnet-02.midnight.network`
- WebSocket: `wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws`

### Step 3: Create Deployment Script

Create a TypeScript deployment script with:

- Provider configuration (publicDataProvider, proofProvider)
- Wallet connection
- Contract deployment using `deployContract()`
- Transaction confirmation handling

### Step 4: Execute Deployment

Run the deployment script and capture the contract address.

## Output Format

Provide:

1. Deployment script code
2. Terminal commands to execute
3. Contract address after successful deployment
4. Verification steps

Use #tool:execute/runInTerminal to compile contracts. Use #tool:edit/editFiles to create deployment scripts. Use #tool:web/fetch to check network status.
