# Midnight.js Provider Reference

## Provider Types

### PrivateStateProvider<T>

Manages local private state storage for contracts.

```typescript
interface PrivateStateProvider<T> {
  /**
   * Retrieve private state by identifier
   */
  get(id: string): Promise<T | null>;

  /**
   * Store private state
   */
  set(id: string, state: T): Promise<void>;

  /**
   * Remove private state
   */
  clear(id: string): Promise<void>;
}
```

### PublicDataProvider

Queries and subscribes to blockchain data.

```typescript
interface PublicDataProvider {
  /**
   * Query contract state from indexer
   */
  queryContractState(address: string): Promise<ContractState | null>;

  /**
   * Subscribe to contract state updates
   */
  contractStateUpdates(address: string): Observable<ContractState>;

  /**
   * Query transaction by hash
   */
  queryTransaction(hash: string): Promise<Transaction | null>;

  /**
   * Query block information
   */
  queryBlock(heightOrHash: number | string): Promise<Block | null>;
}

interface ContractState {
  address: string;
  data: Uint8Array;
  codeHash: string;
  lastUpdateHeight: number;
}
```

### ZkConfigProvider

Loads zero-knowledge circuit configurations.

```typescript
interface ZkConfigProvider {
  /**
   * Get circuit configuration for a specific circuit
   */
  getCircuitConfig(circuitName: string): Promise<CircuitConfig>;

  /**
   * Get all available circuits
   */
  getAvailableCircuits(): Promise<string[]>;
}

interface CircuitConfig {
  circuitName: string;
  provingKey: Uint8Array;
  verifyingKey: Uint8Array;
  zkir: Uint8Array;
}
```

### ProofProvider

Generates zero-knowledge proofs.

```typescript
interface ProofProvider {
  /**
   * Generate a proof for the given circuit and inputs
   */
  prove(circuitName: string, inputs: CircuitInputs): Promise<Proof>;

  /**
   * Check if proof server is healthy
   */
  health(): Promise<boolean>;
}

interface Proof {
  proof: Uint8Array;
  publicInputs: Uint8Array[];
}
```

### WalletProvider

Handles transaction balancing and submission.

```typescript
interface WalletProvider {
  /**
   * Coin public key for receiving funds
   */
  coinPublicKey: string;

  /**
   * Encryption public key for encrypted communications
   */
  encryptionPublicKey: string;

  /**
   * Balance an unbalanced transaction by adding inputs/outputs
   * @param tx The unbalanced transaction
   * @param newCoins New coins to include (e.g., from contract minting)
   */
  balanceTx(
    tx: UnbalancedTransaction,
    newCoins?: CoinInfo[]
  ): Promise<BalancedTransaction>;

  /**
   * Submit a proven transaction to the network
   */
  submitTx(tx: Transaction): Promise<TransactionResult>;
}

interface CoinInfo {
  nonce: Uint8Array;
  color: Uint8Array;
  value: bigint;
}

interface TransactionResult {
  txId: string;
  blockHeight: number;
}
```

### MidnightProvider

Combined provider interface (typically same as WalletProvider).

```typescript
type MidnightProvider = WalletProvider;
```

---

## Provider Implementations

### LevelPrivateStateProvider

File-based private state using LevelDB.

```typescript
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';

const provider = levelPrivateStateProvider({
  privateStateStoreName: 'my-contract',  // Database name
  dbPath: './data'                       // Optional: custom path
});
```

### IndexerPublicDataProvider

GraphQL-based blockchain data queries.

```typescript
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

const provider = indexerPublicDataProvider(
  'https://indexer.testnet-02.midnight.network/api/v1/graphql',  // HTTP endpoint
  'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws'  // WebSocket endpoint
);
```

### NodeZkConfigProvider

Node.js file-system based circuit config loading.

```typescript
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

const provider = new NodeZkConfigProvider(
  '/path/to/contracts/managed/my-contract'
);
```

### FetchZkConfigProvider

Browser-compatible HTTP-based circuit config loading.

```typescript
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

const provider = new FetchZkConfigProvider(
  window.location.origin,        // Base URL
  fetch.bind(window)            // Fetch function
);
```

### HttpClientProofProvider

HTTP client for proof server communication.

```typescript
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';

const provider = httpClientProofProvider(
  'http://localhost:6300'  // Proof server URL
);
```

---

## Combined Providers Type

```typescript
interface Providers<T = any> {
  privateStateProvider: PrivateStateProvider<T>;
  publicDataProvider: PublicDataProvider;
  zkConfigProvider: ZkConfigProvider;
  proofProvider: ProofProvider;
  walletProvider: WalletProvider;
  midnightProvider: MidnightProvider;
}
```

---

## Network Configuration

```typescript
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId
} from '@midnight-ntwrk/midnight-js-network-id';

// Available networks
enum NetworkId {
  Undeployed = 0,
  DevNet = 1,
  TestNet = 2,
  MainNet = 3
}

// Set network (REQUIRED before using providers)
setNetworkId(NetworkId.TestNet);

// Get network IDs for serialization
const zswapNetworkId = getZswapNetworkId();   // For Zswap transactions
const ledgerNetworkId = getLedgerNetworkId(); // For Ledger transactions
```

---

## Endpoint Configuration

### Testnet

```typescript
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  proofServer: 'http://localhost:6300',
  node: 'https://rpc.testnet-02.midnight.network'
};
```

### DevNet

```typescript
const DEVNET_CONFIG = {
  indexer: 'http://localhost:8080/api/v1/graphql',
  indexerWS: 'ws://localhost:8080/api/v1/graphql/ws',
  proofServer: 'http://localhost:6300',
  node: 'http://localhost:9944'
};
```

---

## Error Types

```typescript
// Provider-related errors
class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

// Common error scenarios
const errors = {
  PROOF_SERVER_UNAVAILABLE: 'Proof server not reachable',
  INDEXER_CONNECTION_FAILED: 'Failed to connect to indexer',
  STATE_NOT_FOUND: 'Private state not found',
  CIRCUIT_NOT_FOUND: 'Circuit configuration not found',
  TRANSACTION_REJECTED: 'Transaction rejected by network'
};
```
