---
name: wallet-sdk-integration
description: Build programmatic wallet functionality using the Midnight Wallet SDK. Covers WalletBuilder patterns, HD wallet derivation with BIP-32/44, state management, transaction creation, balancing, proving, and submission for backend services and CLI applications.
---

# Wallet SDK Integration

The Midnight Wallet SDK (`@midnight-ntwrk/wallet` v5.0.0) provides comprehensive wallet functionality for programmatic use in Node.js applications, CLI tools, and backend services.

## When to Use

- Building backend services that interact with Midnight
- Creating CLI tools for contract deployment/interaction
- Implementing custom wallet solutions
- Testing and development workflows
- Building transaction pipelines

## Package Overview

| Package | Purpose |
|---------|---------|
| `@midnight-ntwrk/wallet` | Core wallet implementation |
| `@midnight-ntwrk/wallet-api` | High-level interfaces |
| `@midnight-ntwrk/wallet-sdk-hd` | HD wallet derivation (BIP-32/44) |
| `@midnight-ntwrk/wallet-sdk-address-format` | Bech32m address encoding |
| `@midnight-ntwrk/zswap` | Transaction building blocks |

## Installation

```bash
npm install @midnight-ntwrk/wallet @midnight-ntwrk/wallet-api \
  @midnight-ntwrk/wallet-sdk-hd @midnight-ntwrk/zswap
```

## HD Wallet Derivation

### Generate Wallet Seed

```typescript
import {
  generateRandomSeed,
  HDWallet,
  Roles,
} from '@midnight-ntwrk/wallet-sdk-hd';

// Generate random 32-byte seed
const seed = generateRandomSeed();

// Derive Zswap key using BIP-44 path: m/44'/2400'/account'/role/index
function deriveWalletSeed(seed: Uint8Array, account = 0): Uint8Array {
  const hdWallet = HDWallet.fromSeed(seed);

  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HD Wallet');
  }

  const zswapKey = hdWallet.hdWallet
    .selectAccount(account)
    .selectRole(Roles.Zswap)
    .deriveKeyAt(0);

  if (zswapKey.type !== 'keyDerived') {
    throw new Error('Failed to derive key');
  }

  return zswapKey.key;
}

const walletSeed = deriveWalletSeed(seed);
```

### Seed from Mnemonic

```typescript
import * as bip39 from 'bip39';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';

// Convert mnemonic to seed (requires bip39 library)
const mnemonic = 'your twelve word mnemonic phrase here...';
const bip39Seed = bip39.mnemonicToSeedSync(mnemonic);

// Use first 32 bytes as HD wallet seed
const seed = bip39Seed.slice(0, 32);
const hdWallet = HDWallet.fromSeed(seed);
```

## Creating Wallet Instances

### From Seed (Recommended)

```typescript
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId } from '@midnight-ntwrk/zswap';

const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  proofServer: 'http://localhost:6300',
  node: 'https://rpc.testnet-02.midnight.network'
};

const wallet = await WalletBuilder.build(
  TESTNET_CONFIG.indexer,
  TESTNET_CONFIG.indexerWS,
  TESTNET_CONFIG.proofServer,
  TESTNET_CONFIG.node,
  walletSeed,           // 64-character hex string or Uint8Array
  NetworkId.TestNet,
  'info'                // Log level: 'error' | 'warn' | 'info' | 'debug'
);
```

### Random Disposable Wallet

```typescript
import { generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';

const randomSeed = generateRandomSeed();
const randomHex = Array.from(randomSeed, b =>
  b.toString(16).padStart(2, '0')
).join('');

const disposableWallet = await WalletBuilder.build(
  TESTNET_CONFIG.indexer,
  TESTNET_CONFIG.indexerWS,
  TESTNET_CONFIG.proofServer,
  TESTNET_CONFIG.node,
  randomHex,
  NetworkId.TestNet
);
```

## Wallet Lifecycle

```typescript
// Start synchronization with indexer
wallet.start();

// Wait for sync to complete
import * as Rx from 'rxjs';

await Rx.firstValueFrom(
  wallet.state().pipe(
    Rx.filter(state => state.syncProgress?.synced === true)
  )
);

// Use wallet...

// Gracefully close when done
await wallet.close();
```

## Accessing Wallet State

```typescript
import * as Rx from 'rxjs';
import { nativeToken } from '@midnight-ntwrk/zswap';

// Subscribe to state changes
wallet.state().subscribe(state => {
  console.log('Address:', state.address);
  console.log('Balances:', state.balances);
  console.log('Sync progress:', state.syncProgress);
});

// Get current state once
const state = await Rx.firstValueFrom(wallet.state());

// Get native token balance
const tDustBalance = state.balances[nativeToken()] || 0n;
console.log(`Balance: ${tDustBalance} tDUST`);

// Access public keys
const coinPublicKey = state.coinPublicKey;
const encryptionPublicKey = state.encryptionPublicKey;
```

## Working with Transactions

### Creating a Transfer

```typescript
import { nativeToken } from '@midnight-ntwrk/zswap';

const transferRecipe = await wallet.transferTransaction([
  {
    amount: 1000000n,  // Amount in smallest unit
    type: nativeToken(),
    receiverAddress: 'mn_shield-addr_test1...'  // Bech32m address
  }
]);
```

### Proving a Transaction

```typescript
import { TRANSACTION_TO_PROVE } from '@midnight-ntwrk/wallet-api';

// The transfer recipe is already in the correct format
const provenTransaction = await wallet.proveTransaction(transferRecipe);
```

### Submitting a Transaction

```typescript
const result = await wallet.submitTransaction(provenTransaction);
console.log('Transaction ID:', result.txId);
console.log('Block height:', result.blockHeight);
```

### Complete Transfer Flow

```typescript
async function transfer(
  wallet: Wallet,
  recipient: string,
  amount: bigint
): Promise<{ txId: string; blockHeight: number }> {
  // 1. Create transfer transaction
  const recipe = await wallet.transferTransaction([
    {
      amount,
      type: nativeToken(),
      receiverAddress: recipient
    }
  ]);

  // 2. Generate zero-knowledge proofs
  const proven = await wallet.proveTransaction(recipe);

  // 3. Submit to network
  const result = await wallet.submitTransaction(proven);

  return {
    txId: result.txId,
    blockHeight: result.blockHeight
  };
}
```

## Balancing Contract Transactions

When working with DApps, balance existing transactions:

```typescript
import { Transaction } from '@midnight-ntwrk/zswap';

async function balanceContractTx(
  wallet: Wallet,
  unbalancedTx: Transaction,
  newCoins: CoinInfo[] = []
) {
  // Balance adds inputs/outputs to cover fees
  const balancedRecipe = await wallet.balanceTransaction(
    unbalancedTx,
    newCoins
  );

  // Prove the balanced transaction
  const proven = await wallet.proveTransaction(balancedRecipe);

  // Submit
  return wallet.submitTransaction(proven);
}
```

## State Serialization

Save and restore wallet state:

```typescript
// Serialize current state (keys excluded for security)
const serializedState = await wallet.serialize();

// Save to storage
localStorage.setItem('walletState', serializedState);
localStorage.setItem('walletSeed', walletSeed); // Store securely!

// Later: Restore from state
const savedState = localStorage.getItem('walletState');
const savedSeed = localStorage.getItem('walletSeed');

const restoredWallet = await WalletBuilder.restore(
  TESTNET_CONFIG.indexer,
  TESTNET_CONFIG.indexerWS,
  TESTNET_CONFIG.proofServer,
  TESTNET_CONFIG.node,
  savedSeed!,        // Required since v4.0.0
  savedState!,
  'info'
);
```

## Address Encoding

```typescript
import {
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  MidnightBech32m,
} from '@midnight-ntwrk/wallet-sdk-address-format';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { Buffer } from 'buffer';

// Encode address to Bech32m
function encodeAddress(
  coinPubKey: string,
  encPubKey: string,
  network: NetworkId
): string {
  const coinPublicKey = new ShieldedCoinPublicKey(
    Buffer.from(coinPubKey, 'hex')
  );
  const encryptionPublicKey = new ShieldedEncryptionPublicKey(
    Buffer.from(encPubKey, 'hex')
  );

  const address = new ShieldedAddress(coinPublicKey, encryptionPublicKey);
  return ShieldedAddress.codec.encode(network, address).asString();
}

// Decode Bech32m address
function decodeAddress(
  encodedAddress: string,
  network: NetworkId
): { coinPubKey: string; encPubKey: string } {
  const parsed = MidnightBech32m.parse(encodedAddress);
  const decoded = ShieldedAddress.codec.decode(network, parsed);

  return {
    coinPubKey: decoded.coinPublicKeyString(),
    encPubKey: decoded.encryptionPublicKeyString()
  };
}
```

## Waiting for Funds

```typescript
async function waitForFunds(wallet: Wallet, minBalance = 1n): Promise<bigint> {
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap(state => {
        if (state.syncProgress) {
          console.log(`Sync: ${state.syncProgress.synced ? 'Complete' : 'In progress'}`);
        }
      }),
      Rx.filter(state => state.syncProgress?.synced === true),
      Rx.map(state => state.balances[nativeToken()] ?? 0n),
      Rx.filter(balance => balance >= minBalance),
      Rx.tap(balance => console.log(`Funded with: ${balance}`))
    )
  );
}

// Usage
console.log('Waiting for funds...');
console.log('Send tDUST to:', state.address);
const balance = await waitForFunds(wallet);
```

## Error Handling

```typescript
try {
  const recipe = await wallet.transferTransaction([...]);
  const proven = await wallet.proveTransaction(recipe);
  const result = await wallet.submitTransaction(proven);
} catch (error) {
  if (error.message.includes('insufficient')) {
    console.error('Insufficient balance for transfer');
  } else if (error.message.includes('sync')) {
    console.error('Wallet not synced, please wait');
  } else if (error.message.includes('proof')) {
    console.error('Proof generation failed - check proof server');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Best Practices

1. **Always wait for sync** before creating transactions
2. **Store seeds securely** - never in plain text
3. **Use HD derivation** for production wallets
4. **Handle proof generation time** - can take 30-60 seconds
5. **Close wallet properly** to release resources

## Related Skills

- [dapp-connector-api](../dapp-connector-api/SKILL.md) - Browser wallet connection
- [zswap-transactions](../zswap-transactions/SKILL.md) - Low-level transaction building
- [network-configuration](../network-configuration/SKILL.md) - Network setup

## References

- [Wallet Developer Guide](https://docs.midnight.network/develop/guides/wallet-dev-guide)
- [Wallet API Reference](https://docs.midnight.network/develop/reference/midnight-api/wallet-api)
