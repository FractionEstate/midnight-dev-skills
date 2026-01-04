# Wallet Builder Patterns

Official wallet configuration patterns from Midnight Network example repositories.

## Source Repositories
- https://github.com/midnightntwrk/example-counter
- https://github.com/midnightntwrk/example-bboard

---

## WalletBuilder Overview

The WalletBuilder from `@midnight-ntwrk/wallet` provides a fluent API for constructing wallets with various configurations.

### Basic Build from Seed
```typescript
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";

const wallet = await WalletBuilder.buildFromSeed(
  indexerPublicDataProvider(
    "https://indexer.testnet-02.midnight.network/api/v1/graphql",
    "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws"
  ),
  httpClientProofProvider("http://localhost:6300"),
  "https://rpc.testnet-02.midnight.network",
  "my-app", // mnemonics storage key
  seed,     // Uint8Array seed bytes
  getZswapNetworkId()
);

// Wallet is ready to use
console.log("Wallet address:", wallet.state.address);
```

---

## Complete Wallet Configuration

### CLI Wallet Setup Pattern
```typescript
// from counter-cli/src/api.ts and bboard-cli/src/api.ts
import { WalletBuilder, type Resource } from "@midnight-ntwrk/wallet";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export interface DAppConfig {
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

export const buildWalletFromSeed = async (
  config: DAppConfig,
  seed: Uint8Array
): Promise<Wallet & Resource> => {
  return WalletBuilder.buildFromSeed(
    indexerPublicDataProvider(config.indexer, config.indexerWS),
    httpClientProofProvider(config.proofServer),
    config.node,
    "midnight-app", // mnemonics storage key
    seed,
    getZswapNetworkId()
  );
};
```

### Default Testnet Configuration
```typescript
export const getDefaultDAppConfig = (): DAppConfig => ({
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://localhost:6300"
});
```

---

## Wallet State Management

### Wallet State Interface
```typescript
import { type WalletState } from "@midnight-ntwrk/wallet-api";

interface WalletStateInfo {
  address: string;
  balance: bigint;
  syncProgress: number;
  isReady: boolean;
}

export const getWalletInfo = (wallet: Wallet): WalletStateInfo => {
  const state = wallet.state;
  return {
    address: state.address,
    balance: state.balances?.total ?? 0n,
    syncProgress: state.syncProgress ?? 0,
    isReady: state.syncProgress === 100
  };
};
```

### Watching Wallet Balance
```typescript
import { type Observable } from "rxjs";
import { map, filter, distinctUntilChanged } from "rxjs/operators";

export const watchBalance = (wallet: Wallet): Observable<bigint> => {
  return wallet.state$.pipe(
    map((state) => state.balances?.total ?? 0n),
    distinctUntilChanged()
  );
};

// Usage
const subscription = watchBalance(wallet).subscribe((balance) => {
  console.log(`Balance updated: ${balance}`);
});
```

---

## Wallet as Provider

### Using Wallet in MidnightProviders
```typescript
import {
  type MidnightProviders,
  type WalletProvider
} from "@midnight-ntwrk/midnight-js-types";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { nodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";

// Convert wallet to WalletProvider
export const walletAsProvider = (wallet: Wallet): WalletProvider => ({
  coinPublicKey: wallet.state.coinPublicKey,
  balanceTx: (tx, newCoins) => wallet.balanceTx(tx, newCoins),
  proveTransaction: (tx) => wallet.proveTransaction(tx)
});

// Full provider configuration
export const configureProviders = async <PrivateState>(
  wallet: Wallet,
  config: DAppConfig,
  contractPath: string
): Promise<MidnightProviders<"deploy", PrivateState>> => {
  const publicDataProvider = indexerPublicDataProvider(
    config.indexer,
    config.indexerWS
  );

  const zkConfigProvider = nodeZkConfigProvider(contractPath);
  const privateStateProvider = levelPrivateStateProvider<PrivateState>({
    privateStateStoreName: "midnight-private-state",
  });

  return {
    walletProvider: walletAsProvider(wallet),
    publicDataProvider,
    zkConfigProvider,
    privateStateProvider
  };
};
```

---

## Seed Generation

### Generate New Seed
```typescript
import { randomBytes } from "crypto";
import * as bip39 from "bip39";

// Generate random seed (32 bytes)
export const generateRandomSeed = (): Uint8Array => {
  return randomBytes(32);
};

// Generate seed from mnemonic
export const seedFromMnemonic = (mnemonic: string): Uint8Array => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  // Use first 32 bytes
  return new Uint8Array(seedBuffer.slice(0, 32));
};

// Generate new mnemonic and seed
export const generateMnemonicAndSeed = (): { mnemonic: string; seed: Uint8Array } => {
  const mnemonic = bip39.generateMnemonic(256); // 24 words
  const seed = seedFromMnemonic(mnemonic);
  return { mnemonic, seed };
};
```

### Seed from Environment
```typescript
export const getSeedFromEnv = (): Uint8Array => {
  const seedHex = process.env.MIDNIGHT_WALLET_SEED;
  if (!seedHex) {
    throw new Error("MIDNIGHT_WALLET_SEED environment variable not set");
  }
  return Buffer.from(seedHex, "hex");
};
```

---

## Complete Wallet Setup Example

```typescript
// Full example: wallet-setup.ts
import { WalletBuilder, type Resource } from "@midnight-ntwrk/wallet";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { getZswapNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { firstValueFrom, filter } from "rxjs";

interface WalletConfig {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  seed: Uint8Array;
  storageKey?: string;
}

export class MidnightWallet {
  private wallet: Wallet & Resource;
  private ready: boolean = false;

  private constructor(wallet: Wallet & Resource) {
    this.wallet = wallet;
  }

  static async create(config: WalletConfig): Promise<MidnightWallet> {
    const wallet = await WalletBuilder.buildFromSeed(
      indexerPublicDataProvider(config.indexer, config.indexerWS),
      httpClientProofProvider(config.proofServer),
      config.node,
      config.storageKey ?? "midnight-wallet",
      config.seed,
      getZswapNetworkId()
    );

    const instance = new MidnightWallet(wallet);
    await instance.waitForSync();
    return instance;
  }

  private async waitForSync(): Promise<void> {
    // Wait for initial sync to complete
    await firstValueFrom(
      this.wallet.state$.pipe(
        filter((state) => state.syncProgress === 100)
      )
    );
    this.ready = true;
  }

  get address(): string {
    return this.wallet.state.address;
  }

  get balance(): bigint {
    return this.wallet.state.balances?.total ?? 0n;
  }

  get isReady(): boolean {
    return this.ready;
  }

  getProvider(): Wallet {
    return this.wallet;
  }

  async close(): Promise<void> {
    await this.wallet.close();
  }
}

// Usage
async function main() {
  const wallet = await MidnightWallet.create({
    indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
    indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
    node: "https://rpc.testnet-02.midnight.network",
    proofServer: "http://localhost:6300",
    seed: Buffer.from(process.env.SEED!, "hex")
  });

  console.log("Wallet ready!");
  console.log("Address:", wallet.address);
  console.log("Balance:", wallet.balance);
}
```

---

## Transaction Submission

### Balance and Submit Transaction
```typescript
import { type Transaction } from "@midnight-ntwrk/ledger";

export const submitTransaction = async (
  wallet: Wallet,
  tx: Transaction
): Promise<{ txHash: string; blockHeight: bigint }> => {
  // Balance the transaction (add inputs/outputs for fees)
  const balancedTx = await wallet.balanceTx(tx);

  // Prove the transaction (generate ZK proofs)
  const provenTx = await wallet.proveTransaction(balancedTx);

  // Submit to network
  const result = await wallet.submitTransaction(provenTx);

  return {
    txHash: result.txHash,
    blockHeight: result.blockHeight
  };
};
```

---

## Error Handling

```typescript
import { WalletError } from "@midnight-ntwrk/wallet";

export const safeWalletOperation = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof WalletError) {
      switch (error.code) {
        case "INSUFFICIENT_BALANCE":
          throw new Error(`${context}: Not enough balance`);
        case "SYNC_IN_PROGRESS":
          throw new Error(`${context}: Wallet still syncing`);
        case "NETWORK_ERROR":
          throw new Error(`${context}: Network connection failed`);
        default:
          throw new Error(`${context}: Wallet error - ${error.message}`);
      }
    }
    throw error;
  }
};
```
