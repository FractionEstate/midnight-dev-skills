# Midnight Contract Deployment Template

Deploy Compact contracts to testnet.

## Location

`lib/midnight/deploy.ts`

## Template

```typescript
import {
  deployContract,
  ContractInstance,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { WalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import { NetworkId } from '@midnight-ntwrk/midnight-js-types';

// Contract imports (generated from compiled Compact)
import { Contract, Ledger } from '@/contracts/my-contract';

// Network configuration
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://localhost:6300',
};

export interface DeployResult {
  contractAddress: string;
  instance: ContractInstance<Contract, Ledger>;
}

export async function deployMyContract(
  walletApi: WalletAPI,
  initialState: Partial<Ledger>
): Promise<DeployResult> {
  // Configure providers
  const providers = {
    privateStateProvider: createPrivateStateProvider(),
    publicDataProvider: createPublicDataProvider(TESTNET_CONFIG),
    zkConfigProvider: createZkConfigProvider(TESTNET_CONFIG),
    wallet: walletApi,
  };

  // Deploy contract
  const instance = await deployContract({
    contract: Contract,
    initialState,
    ...providers,
  });

  // Wait for deployment confirmation
  const receipt = await instance.deploymentReceipt;

  return {
    contractAddress: receipt.contractAddress,
    instance,
  };
}

// Helper: Connect to existing contract
export async function connectToContract(
  walletApi: WalletAPI,
  contractAddress: string
): Promise<ContractInstance<Contract, Ledger>> {
  const providers = {
    privateStateProvider: createPrivateStateProvider(),
    publicDataProvider: createPublicDataProvider(TESTNET_CONFIG),
    zkConfigProvider: createZkConfigProvider(TESTNET_CONFIG),
    wallet: walletApi,
  };

  return Contract.connect(contractAddress, providers);
}
```

## Usage

```typescript
import { deployMyContract, connectToContract } from '@/lib/midnight/deploy';
import { useMidnightWallet } from '@/hooks/useMidnightWallet';

// Deploy new contract
async function handleDeploy() {
  const { walletApi } = useMidnightWallet();

  if (!walletApi) {
    throw new Error('Wallet not connected');
  }

  const { contractAddress, instance } = await deployMyContract(walletApi, {
    counter: 0n,
    owner: await walletApi.address(),
  });

  console.log('Deployed to:', contractAddress);

  // Call circuit
  const tx = await instance.callCircuit.increment(1n);
  await tx.wait();
}

// Connect to existing contract
async function handleConnect(address: string) {
  const { walletApi } = useMidnightWallet();

  const instance = await connectToContract(walletApi!, address);

  // Read ledger state
  const counter = await instance.ledger.counter;
  console.log('Counter:', counter);
}
```

## Key Patterns

| Pattern | Description |
|---------|-------------|
| Provider setup | Private state, public data, ZK config |
| Deployment | `deployContract()` with initial state |
| Connection | `Contract.connect()` to existing |
| Circuit calls | `instance.callCircuit.[name]()` |
| Ledger access | `instance.ledger.[field]` |
