// Contract Deployment Template
// Location: lib/midnight/deploy.ts

import type { WalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import type {
  ContractInstance,
  DeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';

// ============================================
// Types
// ============================================

export interface DeploymentConfig {
  /** Compiled contract module */
  contract: unknown;
  /** Initial ledger state */
  initialState: Record<string, unknown>;
  /** Wallet API for signing */
  walletApi: WalletAPI;
  /** Network configuration */
  network: NetworkConfig;
}

export interface NetworkConfig {
  indexer: string;
  indexerWS: string;
  rpc: string;
  proofServer: string;
}

export interface DeploymentResult {
  contractAddress: string;
  deploymentTxId: string;
  instance: ContractInstance;
}

// ============================================
// Deployment Functions
// ============================================

/**
 * Deploy a Compact contract to Midnight network
 */
export async function deployContract(
  config: DeploymentConfig
): Promise<DeploymentResult> {
  const {
    contract,
    initialState,
    walletApi,
    network,
  } = config;

  // 1. Create providers
  const providers = await createProviders(network);

  // 2. Prepare deployment transaction
  const deployTx = await prepareDeployment({
    contract,
    initialState,
    ...providers,
  });

  // 3. Sign with wallet
  const signedTx = await walletApi.signTransaction(deployTx);

  // 4. Submit to network
  const result = await walletApi.submitTransaction(signedTx);

  // 5. Wait for confirmation
  const confirmed = await waitForDeployment(result.txId, network);

  if (!confirmed) {
    throw new DeploymentError('Deployment transaction not confirmed');
  }

  // 6. Create contract instance
  const instance = await createContractInstance({
    address: result.contractAddress,
    contract,
    ...providers,
    walletApi,
  });

  return {
    contractAddress: result.contractAddress,
    deploymentTxId: result.txId,
    instance,
  };
}

/**
 * Connect to an existing deployed contract
 */
export async function connectToContract(
  contractAddress: string,
  contract: unknown,
  network: NetworkConfig,
  walletApi: WalletAPI
): Promise<ContractInstance> {
  const providers = await createProviders(network);

  return createContractInstance({
    address: contractAddress,
    contract,
    ...providers,
    walletApi,
  });
}

// ============================================
// Provider Setup
// ============================================

async function createProviders(network: NetworkConfig) {
  // Import dynamically to avoid SSR issues
  const {
    createPublicDataProvider,
    createPrivateStateProvider,
    createZkConfigProvider,
  } = await import('@midnight-ntwrk/midnight-js-contracts');

  const publicDataProvider = createPublicDataProvider({
    indexerUrl: network.indexer,
    indexerWsUrl: network.indexerWS,
  });

  const privateStateProvider = createPrivateStateProvider({
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  });

  const zkConfigProvider = createZkConfigProvider({
    proofServerUrl: network.proofServer,
  });

  return {
    publicDataProvider,
    privateStateProvider,
    zkConfigProvider,
  };
}

// ============================================
// Helper Functions
// ============================================

async function prepareDeployment(config: {
  contract: unknown;
  initialState: Record<string, unknown>;
  publicDataProvider: unknown;
  privateStateProvider: unknown;
  zkConfigProvider: unknown;
}) {
  // Implementation depends on @midnight-ntwrk/midnight-js-contracts
  // This is a placeholder structure
  const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');

  return deployContract({
    contract: config.contract,
    initialState: config.initialState,
    providers: {
      publicData: config.publicDataProvider,
      privateState: config.privateStateProvider,
      zkConfig: config.zkConfigProvider,
    },
  });
}

async function waitForDeployment(
  txId: string,
  network: NetworkConfig,
  timeoutMs: number = 120000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(network.indexer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetTransaction($hash: String!) {
              transaction(hash: $hash) {
                status
                blockNumber
              }
            }
          `,
          variables: { hash: txId },
        }),
      });

      const data = await response.json();

      if (data.data?.transaction?.status === 'confirmed') {
        return true;
      }

      if (data.data?.transaction?.status === 'failed') {
        throw new DeploymentError('Deployment transaction failed');
      }
    } catch (error) {
      if (error instanceof DeploymentError) throw error;
      // Continue waiting on network errors
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return false;
}

async function createContractInstance(config: {
  address: string;
  contract: unknown;
  publicDataProvider: unknown;
  privateStateProvider: unknown;
  zkConfigProvider: unknown;
  walletApi: WalletAPI;
}): Promise<ContractInstance> {
  const { ContractInstance } = await import('@midnight-ntwrk/midnight-js-contracts');

  return new ContractInstance({
    address: config.address,
    contract: config.contract,
    providers: {
      publicData: config.publicDataProvider,
      privateState: config.privateStateProvider,
      zkConfig: config.zkConfigProvider,
    },
    wallet: config.walletApi,
  });
}

// ============================================
// Error Classes
// ============================================

export class DeploymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeploymentError';
  }
}

// ============================================
// Usage Example
// ============================================

/*
import { MyContract } from '../contracts/dist/index.cjs';
import { deployContract, connectToContract } from './deploy';

// Deploy new contract
const deployment = await deployContract({
  contract: MyContract,
  initialState: {
    counter: 0n,
    owner: walletAddress,
  },
  walletApi,
  network: {
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    rpc: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'http://localhost:6300',
  },
});

console.log('Deployed at:', deployment.contractAddress);

// Or connect to existing
const instance = await connectToContract(
  '0x1234...',
  MyContract,
  network,
  walletApi
);

// Call circuit
await instance.call.increment();
*/
