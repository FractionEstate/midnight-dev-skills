---
name: contract-deployment
description: Deploy Compact smart contracts to Midnight Network. Covers compilation workflow, provider setup, deployment transactions, contract addressing, and post-deployment verification for testnet and mainnet deployments.
---

# Contract Deployment

Complete guide to deploying Compact smart contracts to Midnight Network.

## When to Use

- Deploying a new Compact contract
- Setting up deployment infrastructure
- Automating contract deployment in CI/CD
- Verifying deployed contracts
- Managing contract addresses

## Deployment Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Compact   │    │  Compiled   │    │  Provider   │    │  Deployed   │
│   Source    │───▶│  Artifacts  │───▶│   Setup     │───▶│  Contract   │
│  (.compact) │    │  (managed/) │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Step 1: Compile Contract

```bash
# Install Compact compiler
npm install -g @midnight-ntwrk/compact

# Compile contract
compact compile contracts/mycontract.compact contracts/managed/mycontract

# Output structure:
# contracts/managed/mycontract/
# ├── contract.cjs         # Contract module
# ├── contract.mjs         # ES module version
# ├── contract.d.ts        # TypeScript types
# └── keys/                # Proving/verification keys
```

### Compilation Options

```bash
# Specify output format
compact compile source.compact output/ --format=esm

# Enable debug info
compact compile source.compact output/ --debug

# Check for errors without generating output
compact check source.compact
```

## Step 2: Configure Providers

```typescript
import {
  createProviders,
  NetworkConfig
} from '@midnight-ntwrk/midnight-js';

// Network configuration
const networkConfig: NetworkConfig = {
  network: 'testnet',
  indexerUrl: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWsUrl: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  nodeUrl: 'https://rpc.testnet-02.midnight.network',
  proofServerUrl: 'http://localhost:6300'
};

// Create providers
const providers = await createProviders({
  network: networkConfig,
  wallet: walletInstance
});
```

## Step 3: Load Contract Module

```typescript
import { Contract } from './contracts/managed/mycontract/contract.mjs';

// Load compiled contract
const contractModule = await import('./contracts/managed/mycontract/contract.mjs');

// Get contract factory
const { MyContract } = contractModule;
```

## Step 4: Deploy Contract

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js';

// Prepare initial state (if contract requires)
const initialState = {
  owner: wallet.address,
  counter: 0n
};

// Deploy
const deployment = await deployContract({
  contract: MyContract,
  providers,
  initialState,
  // Optional: custom gas settings
  gasLimit: 1000000n
});

// Get deployed contract instance
const { contract, deploymentTx, address } = deployment;

console.log('Contract deployed at:', address);
console.log('Deployment transaction:', deploymentTx.hash);
```

## Step 5: Wait for Confirmation

```typescript
// Wait for transaction confirmation
const confirmed = await providers.transactionProvider.waitForConfirmation(
  deploymentTx.hash,
  {
    timeout: 120000,  // 2 minutes
    confirmations: 1   // Number of confirmations
  }
);

if (confirmed.status === 'confirmed') {
  console.log('Contract successfully deployed!');
  console.log('Block:', confirmed.blockNumber);
} else {
  console.error('Deployment failed:', confirmed.error);
}
```

## Step 6: Verify Deployment

```typescript
// Query contract state to verify
const state = await contract.getState();
console.log('Initial state:', state);

// Check contract exists at address
const exists = await providers.publicDataProvider.contractExists(address);
console.log('Contract exists:', exists);
```

## Complete Deployment Script

```typescript
// deploy.ts
import {
  WalletBuilder,
  createProviders,
  deployContract
} from '@midnight-ntwrk/midnight-js';

async function deployMyContract() {
  // 1. Setup wallet
  const wallet = await WalletBuilder.build({
    seed: process.env.WALLET_SEED!,
    network: 'testnet'
  });

  // 2. Create providers
  const providers = await createProviders({
    network: {
      indexerUrl: process.env.INDEXER_URL!,
      indexerWsUrl: process.env.INDEXER_WS_URL!,
      nodeUrl: process.env.NODE_URL!,
      proofServerUrl: process.env.PROOF_SERVER_URL!
    },
    wallet
  });

  // 3. Load contract
  const { MyContract } = await import('./contracts/managed/mycontract/contract.mjs');

  // 4. Deploy
  console.log('Deploying contract...');
  const { contract, deploymentTx, address } = await deployContract({
    contract: MyContract,
    providers,
    initialState: {
      owner: wallet.address
    }
  });

  // 5. Wait for confirmation
  console.log('Waiting for confirmation...');
  const result = await providers.transactionProvider.waitForConfirmation(
    deploymentTx.hash,
    { timeout: 120000 }
  );

  if (result.status !== 'confirmed') {
    throw new Error(`Deployment failed: ${result.error}`);
  }

  // 6. Save deployment info
  const deploymentInfo = {
    address,
    transactionHash: deploymentTx.hash,
    blockNumber: result.blockNumber,
    deployedAt: new Date().toISOString(),
    network: 'testnet'
  };

  console.log('Deployment successful!');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

deployMyContract()
  .then(console.log)
  .catch(console.error);
```

## Environment Configuration

```bash
# .env.local
WALLET_SEED=your-wallet-seed-phrase

# Testnet
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300

# Contract addresses (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-address>
```

## Deployment with Proof Server

```bash
# 1. Start proof server (required for ZK proofs)
docker run -d \
  --name midnight-proof-server \
  -p 6300:6300 \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server --network testnet

# 2. Verify proof server is running
curl http://localhost:6300/health

# 3. Run deployment
npx ts-node deploy.ts
```

## Contract Addressing

```typescript
// Contract addresses are deterministic based on:
// - Deployer address
// - Contract bytecode hash
// - Nonce

// Get address before deployment
const expectedAddress = computeContractAddress({
  deployer: wallet.address,
  bytecodeHash: contractModule.bytecodeHash,
  nonce: await wallet.getNonce()
});
```

## Deployment Best Practices

### 1. Pre-Deployment Checks

```typescript
async function preDeploymentChecks(wallet: Wallet, providers: Providers) {
  // Check wallet balance
  const balance = await wallet.getBalance();
  if (balance < minimumDeploymentCost) {
    throw new Error('Insufficient balance for deployment');
  }

  // Check proof server
  const proofServerHealthy = await checkProofServer(providers.proofServerUrl);
  if (!proofServerHealthy) {
    throw new Error('Proof server not available');
  }

  // Check network connectivity
  const networkHealthy = await providers.publicDataProvider.healthCheck();
  if (!networkHealthy) {
    throw new Error('Network not available');
  }

  console.log('All pre-deployment checks passed');
}
```

### 2. Error Handling

```typescript
try {
  const deployment = await deployContract({ /* ... */ });
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough tokens for gas');
  } else if (error.code === 'PROOF_GENERATION_FAILED') {
    console.error('Failed to generate ZK proof');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network connectivity issue');
  } else {
    console.error('Deployment error:', error);
  }
}
```

### 3. Deployment Artifacts

```typescript
// Save deployment artifacts for future reference
const artifacts = {
  contractName: 'MyContract',
  address: deployment.address,
  abi: contractModule.abi,
  bytecodeHash: contractModule.bytecodeHash,
  deploymentTx: deployment.deploymentTx.hash,
  network: 'testnet',
  deployedAt: Date.now(),
  deployer: wallet.address
};

// Save to file
import fs from 'fs';
fs.writeFileSync(
  `deployments/${artifacts.network}/${artifacts.contractName}.json`,
  JSON.stringify(artifacts, null, 2)
);
```

## Multi-Contract Deployment

```typescript
// Deploy multiple related contracts
async function deploySystem() {
  // 1. Deploy token contract
  const tokenDeployment = await deployContract({
    contract: TokenContract,
    providers,
    initialState: { totalSupply: 1000000n }
  });

  // 2. Deploy registry with token address
  const registryDeployment = await deployContract({
    contract: RegistryContract,
    providers,
    initialState: {
      tokenAddress: tokenDeployment.address
    }
  });

  // 3. Deploy main contract with both addresses
  const mainDeployment = await deployContract({
    contract: MainContract,
    providers,
    initialState: {
      tokenAddress: tokenDeployment.address,
      registryAddress: registryDeployment.address
    }
  });

  return {
    token: tokenDeployment,
    registry: registryDeployment,
    main: mainDeployment
  };
}
```

## Upgrading Contracts

Midnight contracts are immutable once deployed. For upgrades:

```typescript
// Deploy new version
const newContract = await deployContract({
  contract: MyContractV2,
  providers,
  initialState: { /* migrated state */ }
});

// Update application configuration
config.contractAddress = newContract.address;

// Optionally migrate data from old contract
await migrateData(oldContract, newContract);
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `INSUFFICIENT_FUNDS` | Not enough tokens | Fund wallet with testnet tokens |
| `PROOF_FAILED` | Proof server issue | Check proof server logs |
| `TIMEOUT` | Network congestion | Increase timeout, retry |
| `INVALID_STATE` | Wrong initial state | Check contract requirements |

## Related Skills

- [midnight-js-providers](../midnight-js-providers/SKILL.md) - Provider setup
- [proof-server-operations](../proof-server-operations/SKILL.md) - Proof server
- [network-configuration](../network-configuration/SKILL.md) - Network setup

## References

- [Deploy a Contract](https://docs.midnight.network/develop/tutorial/building-your-first-midnight-dapp/deploy)
- [Midnight.js Documentation](https://docs.midnight.network/develop/reference/midnight-js)
