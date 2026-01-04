// @ts-nocheck
/**
 * Midnight Contract Deployment Template
 *
 * Usage:
 *   npx ts-node scripts/deploy.ts --contract MyContract --network testnet
 *
 * Environment variables required:
 *   WALLET_SEED - Wallet seed phrase
 *   INDEXER_URL - Midnight indexer URL
 *   INDEXER_WS_URL - Midnight indexer WebSocket URL
 *   NODE_URL - Midnight node RPC URL
 *   PROOF_SERVER_URL - Proof server URL
 */

import * as fs from 'fs';
import * as path from 'path';

// Types for deployment
interface NetworkConfig {
  name: string;
  indexerUrl: string;
  indexerWsUrl: string;
  nodeUrl: string;
  proofServerUrl: string;
}

interface DeploymentResult {
  contractName: string;
  address: string;
  transactionHash: string;
  blockNumber: number;
  network: string;
  deployedAt: string;
  deployer: string;
}

interface DeploymentOptions {
  contractName: string;
  network: string;
  initialState?: Record<string, unknown>;
  gasLimit?: bigint;
  dryRun?: boolean;
}

// Network configurations
const NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    name: 'testnet',
    indexerUrl: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWsUrl: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    nodeUrl: 'https://rpc.testnet-02.midnight.network',
    proofServerUrl: 'http://localhost:6300'
  },
  // Add mainnet configuration when available
  // mainnet: { ... }
};

/**
 * Load environment configuration
 */
function loadConfig(): {
  walletSeed: string;
  network: NetworkConfig;
} {
  const walletSeed = process.env.WALLET_SEED;
  if (!walletSeed) {
    throw new Error('WALLET_SEED environment variable is required');
  }

  const networkName = process.env.NETWORK || 'testnet';
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Unknown network: ${networkName}`);
  }

  // Allow environment overrides
  return {
    walletSeed,
    network: {
      ...network,
      indexerUrl: process.env.INDEXER_URL || network.indexerUrl,
      indexerWsUrl: process.env.INDEXER_WS_URL || network.indexerWsUrl,
      nodeUrl: process.env.NODE_URL || network.nodeUrl,
      proofServerUrl: process.env.PROOF_SERVER_URL || network.proofServerUrl
    }
  };
}

/**
 * Check if proof server is running
 */
async function checkProofServer(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Pre-deployment validation
 */
async function validatePreDeployment(
  providers: any,
  wallet: any,
  config: NetworkConfig
): Promise<void> {
  console.log('Running pre-deployment checks...');

  // Check proof server
  const proofServerOk = await checkProofServer(config.proofServerUrl);
  if (!proofServerOk) {
    throw new Error(
      `Proof server not available at ${config.proofServerUrl}\n` +
      'Start it with: docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet'
    );
  }
  console.log('✓ Proof server is running');

  // Check wallet balance
  const balance = await wallet.getBalance();
  console.log(`✓ Wallet balance: ${balance}`);

  // Check network connectivity
  try {
    await providers.publicDataProvider.healthCheck();
    console.log('✓ Network connectivity OK');
  } catch (error) {
    throw new Error(`Network check failed: ${error}`);
  }

  console.log('All pre-deployment checks passed!\n');
}

/**
 * Load contract module
 */
async function loadContract(contractName: string): Promise<any> {
  const contractPath = path.join(
    process.cwd(),
    'contracts',
    'managed',
    contractName,
    'contract.mjs'
  );

  if (!fs.existsSync(contractPath)) {
    throw new Error(
      `Contract not found at ${contractPath}\n` +
      `Did you run: compact compile contracts/${contractName}.compact contracts/managed/${contractName}`
    );
  }

  const contractModule = await import(contractPath);
  return contractModule;
}

/**
 * Save deployment artifacts
 */
function saveDeploymentArtifacts(
  result: DeploymentResult,
  contractModule: any
): string {
  const deploymentsDir = path.join(process.cwd(), 'deployments', result.network);

  // Create directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const artifacts = {
    ...result,
    abi: contractModule.abi || null,
    bytecodeHash: contractModule.bytecodeHash || null
  };

  const artifactPath = path.join(
    deploymentsDir,
    `${result.contractName}.json`
  );

  fs.writeFileSync(artifactPath, JSON.stringify(artifacts, null, 2));

  return artifactPath;
}

/**
 * Main deployment function
 */
async function deploy(options: DeploymentOptions): Promise<DeploymentResult> {
  const { contractName, network: networkName, initialState, gasLimit, dryRun } = options;

  console.log(`\n🚀 Deploying ${contractName} to ${networkName}\n`);

  // Load configuration
  const { walletSeed, network } = loadConfig();

  // Initialize wallet (pseudo-code - replace with actual SDK calls)
  // const wallet = await WalletBuilder.build({
  //   seed: walletSeed,
  //   network: networkName
  // });
  console.log('Wallet initialized');

  // Create providers (pseudo-code - replace with actual SDK calls)
  // const providers = await createProviders({
  //   network,
  //   wallet
  // });
  console.log('Providers created');

  // Validate
  // await validatePreDeployment(providers, wallet, network);

  // Load contract
  const contractModule = await loadContract(contractName);
  console.log(`Contract module loaded: ${contractName}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Skipping actual deployment');
    return {
      contractName,
      address: '0x' + '0'.repeat(40),
      transactionHash: '0x' + '0'.repeat(64),
      blockNumber: 0,
      network: networkName,
      deployedAt: new Date().toISOString(),
      deployer: '0x' + '0'.repeat(40)
    };
  }

  // Deploy contract (pseudo-code - replace with actual SDK calls)
  console.log('Deploying contract...');
  // const { contract, deploymentTx, address } = await deployContract({
  //   contract: contractModule[contractName],
  //   providers,
  //   initialState,
  //   gasLimit
  // });

  // Wait for confirmation
  console.log('Waiting for confirmation...');
  // const confirmation = await providers.transactionProvider.waitForConfirmation(
  //   deploymentTx.hash,
  //   { timeout: 120000 }
  // );

  // Placeholder result (replace with actual deployment result)
  const result: DeploymentResult = {
    contractName,
    address: '<deployed-address>',
    transactionHash: '<tx-hash>',
    blockNumber: 0,
    network: networkName,
    deployedAt: new Date().toISOString(),
    deployer: '<deployer-address>'
  };

  // Save artifacts
  const artifactPath = saveDeploymentArtifacts(result, contractModule);
  console.log(`\nArtifacts saved to: ${artifactPath}`);

  return result;
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let contractName = '';
  let network = 'testnet';
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--contract':
      case '-c':
        contractName = args[++i];
        break;
      case '--network':
      case '-n':
        network = args[++i];
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Midnight Contract Deployment

Usage:
  npx ts-node deploy.ts --contract <name> [options]

Options:
  --contract, -c    Contract name (required)
  --network, -n     Network (default: testnet)
  --dry-run         Validate without deploying
  --help, -h        Show this help

Environment:
  WALLET_SEED       Wallet seed phrase (required)
  INDEXER_URL       Override indexer URL
  NODE_URL          Override node URL
  PROOF_SERVER_URL  Override proof server URL

Example:
  WALLET_SEED="your seed phrase" npx ts-node deploy.ts --contract MyContract --network testnet
        `);
        process.exit(0);
    }
  }

  if (!contractName) {
    console.error('Error: --contract is required');
    process.exit(1);
  }

  try {
    const result = await deploy({
      contractName,
      network,
      dryRun
    });

    console.log('\n✅ Deployment successful!\n');
    console.log('Contract Address:', result.address);
    console.log('Transaction Hash:', result.transactionHash);
    console.log('Block Number:', result.blockNumber);
    console.log('Network:', result.network);
    console.log('Deployed At:', result.deployedAt);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
main();

export { deploy, DeploymentOptions, DeploymentResult };
