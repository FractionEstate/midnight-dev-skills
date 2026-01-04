---
description: 'Deploy a Compact smart contract to Midnight Network testnet with full configuration'
---

# Deploy Contract to Testnet

## Configuration Variables
${CONTRACT_PATH} <!-- Path to the compiled contract (e.g., ./contracts/MyContract) -->
${NETWORK="testnet"} <!-- Network to deploy to (testnet/mainnet) -->

## Generated Prompt

Deploy a Compact smart contract to Midnight Network with the following deployment workflow:

### Prerequisites Check

1. **Compact Compiler**: Ensure `compactc` is installed
   ```bash
   compactc --version
   ```

2. **Proof Server**: Ensure proof server is running
   ```bash
   docker ps | grep proof-server
   # If not running:
   docker run -d -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network ${NETWORK}
   ```

3. **Wallet**: Lace wallet with Midnight support installed and funded

### Deployment Steps

#### Step 1: Compile Contract

```bash
compactc ${CONTRACT_PATH}/main.compact --output ${CONTRACT_PATH}/build
```

This generates:
- `contract.cjs` - Contract code
- `contract.d.ts` - TypeScript types
- `contract_keys.json` - Circuit keys

#### Step 2: Create Deployment Script

Create `scripts/deploy.ts`:

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import {
  createPublicDataProvider,
  createPrivateStateProvider,
  createZKConfigProvider
} from '@midnight-ntwrk/midnight-js-providers';
import type { WalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import { contract } from '${CONTRACT_PATH}/build/contract.cjs';

const ${NETWORK.toUpperCase()}_CONFIG = {
  indexer: 'https://indexer.${NETWORK}.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.${NETWORK}.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.${NETWORK}.midnight.network',
  proofServer: 'http://localhost:6300'
};

export async function deployMyContract(wallet: WalletAPI) {
  // Create providers
  const providers = {
    publicData: createPublicDataProvider({
      indexerUrl: ${NETWORK.toUpperCase()}_CONFIG.indexer,
      indexerWsUrl: ${NETWORK.toUpperCase()}_CONFIG.indexerWS
    }),
    privateState: createPrivateStateProvider(),
    zkConfig: createZKConfigProvider({
      proofServerUrl: ${NETWORK.toUpperCase()}_CONFIG.proofServer
    })
  };

  // Deploy
  console.log('Deploying contract...');
  const instance = await deployContract({
    contract,
    providers,
    wallet,
    initialState: {
      // Initial ledger state values
    }
  });

  console.log('Contract deployed!');
  console.log('Address:', instance.address);

  return instance;
}
```

#### Step 3: Run Deployment

```typescript
// In your dApp or CLI
import { deployMyContract } from './scripts/deploy';

// After wallet connection:
const contractInstance = await deployMyContract(walletApi);

// Save contract address for future reference
console.log('Save this address:', contractInstance.address);
```

### Post-Deployment

1. **Verify Deployment**: Query indexer for contract
   ```graphql
   query {
     contract(address: "<contract-address>") {
       address
       state
       deployedAt
     }
   }
   ```

2. **Test Interaction**: Call a read circuit
   ```typescript
   const result = await contractInstance.queryFunction();
   console.log('Query result:', result);
   ```

3. **Save Configuration**: Store deployment info
   ```json
   {
     "network": "${NETWORK}",
     "address": "<deployed-address>",
     "deployedAt": "<timestamp>",
     "deployer": "<wallet-address>"
   }
   ```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Proof server error | Restart Docker container |
| Insufficient funds | Get tDUST from faucet |
| Compilation error | Check Compact syntax |
| Network timeout | Check RPC endpoint |
| Transaction failed | Check wallet balance |

### Network Configuration

| Network | Indexer | Node RPC |
|---------|---------|----------|
| Testnet | indexer.testnet-02.midnight.network | rpc.testnet-02.midnight.network |
| Mainnet | indexer.midnight.network | rpc.midnight.network |
