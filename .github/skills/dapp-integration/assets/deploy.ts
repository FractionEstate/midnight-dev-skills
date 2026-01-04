// @ts-nocheck
// Midnight Contract Deployment Template
// Location: lib/midnight/deploy.ts
// Deploy Compact contracts to testnet

import {
  deployContract,
  ContractInstance,
  createPrivateStateProvider,
  createPublicDataProvider,
  createZkConfigProvider,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { WalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import { NetworkId } from '@midnight-ntwrk/midnight-js-types';

// Contract imports (generated from compiled Compact)
// import { Contract, Ledger } from '@/contracts/my-contract';

// Network configuration
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://localhost:6300',
};

export interface DeployResult<TContract, TLedger> {
  contractAddress: string;
  instance: ContractInstance<TContract, TLedger>;
}

export async function deployMyContract<TContract, TLedger>(
  Contract: TContract,
  walletApi: WalletAPI,
  initialState: Partial<TLedger>
): Promise<DeployResult<TContract, TLedger>> {
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
export async function connectToContract<TContract, TLedger>(
  Contract: { connect: Function },
  walletApi: WalletAPI,
  contractAddress: string
): Promise<ContractInstance<TContract, TLedger>> {
  const providers = {
    privateStateProvider: createPrivateStateProvider(),
    publicDataProvider: createPublicDataProvider(TESTNET_CONFIG),
    zkConfigProvider: createZkConfigProvider(TESTNET_CONFIG),
    wallet: walletApi,
  };

  return Contract.connect(contractAddress, providers);
}
