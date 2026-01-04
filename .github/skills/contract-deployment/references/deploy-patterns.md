# Official Deployment Patterns

TypeScript patterns from official Midnight Network examples for deploying and joining contracts.

## Source Repositories
- https://github.com/midnightntwrk/example-counter
- https://github.com/midnightntwrk/example-bboard

---

## Provider Configuration

### Required Imports
```typescript
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
```

### Provider Setup (Node.js/CLI)
```typescript
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

export const configureProviders = async (
  wallet: Wallet & Resource,
  config: Config
): Promise<ContractProviders> => {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);

  return {
    privateStateProvider: levelPrivateStateProvider<typeof PrivateStateId>({
      privateStateStoreName: 'my-contract-private-state',
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS
    ),
    zkConfigProvider: new NodeZkConfigProvider<CircuitKeys>(
      config.zkConfigPath
    ),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};
```

### Provider Setup (Browser/React)
```typescript
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

const initializeProviders = async (logger: Logger): Promise<ContractProviders> => {
  const { wallet, uris } = await connectToWallet(logger);
  const walletState = await wallet.state();
  const zkConfigPath = window.location.origin;

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'my-contract-private-state',
    }),
    zkConfigProvider: new FetchZkConfigProvider<CircuitKeys>(
      zkConfigPath,
      fetch.bind(window)
    ),
    proofProvider: httpClientProofProvider(uris.proverServerUri),
    publicDataProvider: indexerPublicDataProvider(
      uris.indexerUri,
      uris.indexerWsUri
    ),
    walletProvider: {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx: async (tx, newCoins) => {
        // Balance and prove transaction
        return wallet.balanceAndProveTransaction(tx, newCoins);
      },
    },
    midnightProvider: {
      submitTx: async (tx) => {
        return wallet.submitTransaction(tx);
      },
    },
  };
};
```

---

## Contract Deployment

### Simple Deployment (Counter Pattern)
```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Counter, type CounterPrivateState, witnesses } from '@midnight-ntwrk/counter-contract';

// Create contract instance
export const counterContractInstance = new Counter.Contract(witnesses);

// Deploy function
export const deploy = async (
  providers: CounterProviders,
  privateState: CounterPrivateState
): Promise<DeployedCounterContract> => {
  console.log('Deploying counter contract...');

  const counterContract = await deployContract(providers, {
    contract: counterContractInstance,
    privateStateId: 'counterPrivateState',
    initialPrivateState: privateState,
  });

  console.log(`Deployed at: ${counterContract.deployTxData.public.contractAddress}`);
  return counterContract;
};

// Usage
const deployedContract = await deploy(providers, { privateCounter: 0 });
```

### Advanced Deployment (BBboard Pattern)
```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract, witnesses } from './contract';
import { type BBoardPrivateState, createBBoardPrivateState } from './witnesses';

// Create contract instance with witnesses
const bboardContractInstance: BBoardContract = new Contract(witnesses);

// Private state key for storage
export const bboardPrivateStateKey = 'bboardPrivateState';

export class BBoardAPI {
  static async deploy(
    providers: BBoardProviders,
    logger?: Logger
  ): Promise<BBoardAPI> {
    logger?.info('deployContract');

    const deployedBBoardContract = await deployContract<typeof bboardContractInstance>(
      providers,
      {
        privateStateId: bboardPrivateStateKey,
        contract: bboardContractInstance,
        initialPrivateState: await BBoardAPI.getPrivateState(providers),
      }
    );

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedBBoardContract.deployTxData.public,
      },
    });

    return new BBoardAPI(deployedBBoardContract, providers, logger);
  }

  private static async getPrivateState(
    providers: BBoardProviders
  ): Promise<BBoardPrivateState> {
    const existingState = await providers.privateStateProvider.get(bboardPrivateStateKey);
    if (existingState !== null) {
      return existingState;
    }
    // Generate new secret key for fresh private state
    const secretKey = crypto.getRandomValues(new Uint8Array(32));
    return createBBoardPrivateState(secretKey);
  }
}
```

---

## Joining Existing Contracts

### Find and Join (Counter Pattern)
```typescript
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

export const joinContract = async (
  providers: CounterProviders,
  contractAddress: string
): Promise<DeployedCounterContract> => {
  const counterContract = await findDeployedContract(providers, {
    contractAddress,
    contract: counterContractInstance,
    privateStateId: 'counterPrivateState',
    initialPrivateState: { privateCounter: 0 },
  });

  console.log(`Joined contract at: ${counterContract.deployTxData.public.contractAddress}`);
  return counterContract;
};
```

### Find and Join (BBoard Pattern)
```typescript
export class BBoardAPI {
  static async join(
    providers: BBoardProviders,
    contractAddress: ContractAddress,
    logger?: Logger
  ): Promise<BBoardAPI> {
    logger?.info({
      joinContract: { contractAddress },
    });

    const deployedBBoardContract = await findDeployedContract<BBoardContract>(
      providers,
      {
        contractAddress,
        contract: bboardContractInstance,
        privateStateId: bboardPrivateStateKey,
        initialPrivateState: await BBoardAPI.getPrivateState(providers),
      }
    );

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedBBoardContract.deployTxData.public,
      },
    });

    return new BBoardAPI(deployedBBoardContract, providers, logger);
  }
}
```

---

## Calling Contract Circuits

### Simple Circuit Call
```typescript
export const increment = async (
  counterContract: DeployedCounterContract
): Promise<FinalizedTxData> => {
  console.log('Incrementing...');

  const finalizedTxData = await counterContract.callTx.increment();

  console.log(`Transaction ${finalizedTxData.public.txId} in block ${finalizedTxData.public.blockHeight}`);
  return finalizedTxData.public;
};
```

### Circuit with Parameters
```typescript
export class BBoardAPI {
  async post(message: string): Promise<void> {
    this.logger?.info(`postingMessage: ${message}`);

    const txData = await this.deployedContract.callTx.post(message);

    this.logger?.trace({
      transactionAdded: {
        circuit: 'post',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async takeDown(): Promise<void> {
    this.logger?.info('takingDownMessage');

    const txData = await this.deployedContract.callTx.takeDown();

    this.logger?.trace({
      transactionAdded: {
        circuit: 'takeDown',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }
}
```

---

## Querying Ledger State

### Query Contract State
```typescript
import { assertIsContractAddress } from '@midnight-ntwrk/midnight-js-utils';

export const getCounterLedgerState = async (
  providers: CounterProviders,
  contractAddress: ContractAddress
): Promise<bigint | null> => {
  assertIsContractAddress(contractAddress);
  console.log('Checking contract ledger state...');

  const state = await providers.publicDataProvider
    .queryContractState(contractAddress)
    .then((contractState) =>
      contractState != null
        ? Counter.ledger(contractState.data).round
        : null
    );

  console.log(`Ledger state: ${state}`);
  return state;
};
```

### Observable State with RxJS
```typescript
import { combineLatest, map, tap, from, type Observable } from 'rxjs';

export class BBoardAPI {
  readonly state$: Observable<BBoardDerivedState>;

  constructor(
    public readonly deployedContract: DeployedBBoardContract,
    providers: BBoardProviders,
    private readonly logger?: Logger
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;

    this.state$ = combineLatest([
      // Combine public (ledger) state...
      providers.publicDataProvider
        .contractStateObservable(this.deployedContractAddress, { type: 'latest' })
        .pipe(
          map((contractState) => ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                state: ledgerState.state === State.OCCUPIED ? 'occupied' : 'vacant',
                owner: toHex(ledgerState.owner),
              },
            })
          )
        ),
      // ...with private state
      from(providers.privateStateProvider.get(bboardPrivateStateKey) as Promise<BBoardPrivateState>),
    ]).pipe(
      // Produce derived state
      map(([ledgerState, privateState]) => {
        const hashedSecretKey = pureCircuits.publicKey(
          privateState.secretKey,
          convert_bigint_to_Uint8Array(32, ledgerState.sequence)
        );

        return {
          state: ledgerState.state,
          message: ledgerState.message.value,
          sequence: ledgerState.sequence,
          isOwner: toHex(ledgerState.owner) === toHex(hashedSecretKey),
        };
      })
    );
  }
}

// Usage in React component
useEffect(() => {
  const subscription = bbboardApi.state$.subscribe((state) => {
    setBoardState(state);
  });
  return () => subscription.unsubscribe();
}, [bbboardApi]);
```

---

## Type Definitions

### Contract Types Pattern
```typescript
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract, type DeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Counter, type CounterPrivateState } from '@midnight-ntwrk/counter-contract';

// Circuit type extraction
export type CounterCircuits = ImpureCircuitId<Counter.Contract<CounterPrivateState>>;

// Private state ID
export const CounterPrivateStateId = 'counterPrivateState';

// Providers type
export type CounterProviders = MidnightProviders<
  CounterCircuits,
  typeof CounterPrivateStateId,
  CounterPrivateState
>;

// Contract type
export type CounterContract = Counter.Contract<CounterPrivateState>;

// Deployed contract type (either deployed or found)
export type DeployedCounterContract =
  | DeployedContract<CounterContract>
  | FoundContract<CounterContract>;
```

---

## Error Handling

```typescript
try {
  const contract = await deployContract(providers, config);
} catch (error) {
  if (error instanceof Error) {
    console.error(`Deployment failed: ${error.message}`);

    if (error.message.includes('insufficient balance')) {
      console.log('Fund your wallet at https://midnight.network/test-faucet');
    } else if (error.message.includes('proof generation')) {
      console.log('Ensure proof server is running on port 6300');
    }
  }
  throw error;
}
```
