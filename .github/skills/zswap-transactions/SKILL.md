---
name: zswap-transactions
description: Build and manage Midnight transactions using the ZSwap protocol. Covers Transaction structure, Inputs, Outputs, Transients, Offers, coin management, token transfers, and transaction balancing for privacy-preserving value transfers.
---

# ZSwap Transaction Management

ZSwap (`@midnight-ntwrk/zswap` v4.0.0) is Midnight's protocol for privacy-preserving value transfers. It enables shielded transactions using zero-knowledge proofs while supporting atomic swaps and complex transaction patterns.

## When to Use

- Building token transfer functionality
- Creating custom transaction flows
- Understanding Midnight's UTXO model
- Implementing atomic swaps
- Managing coin states and balances

## Core Concepts

### Transaction Structure

A ZSwap transaction consists of:

| Component | Purpose |
|-----------|---------|
| **Inputs** | Coins being spent (with nullifiers) |
| **Outputs** | New coins being created (with commitments) |
| **Transients** | Temporary values within transaction |
| **Offers** | Atomic swap proposals |
| **Proofs** | Zero-knowledge proofs for validity |

### Coin Model

Midnight uses a UTXO (Unspent Transaction Output) model:

```
Coin = {
  commitment: Hash(nonce, owner, value, tokenType)
  nullifier: Hash(secretKey, commitment)
}
```

- **Commitment**: Public identifier for unspent coin
- **Nullifier**: Revealed when spending (prevents double-spend)

## Installation

```bash
npm install @midnight-ntwrk/zswap @midnight-ntwrk/ledger
```

## Network Configuration

```typescript
import { NetworkId, nativeToken, tokenType } from '@midnight-ntwrk/zswap';

// Native token (tDUST on testnet)
const DUST = nativeToken();

// Custom token type
const customToken = tokenType('0x...');  // 32-byte hex
```

## Transaction Building

### Basic Transfer Transaction

```typescript
import { Transaction, Input, Output, nativeToken } from '@midnight-ntwrk/zswap';

// Create a simple transfer
function createTransfer(
  inputCoins: CoinInfo[],
  recipientKey: string,
  amount: bigint
): Transaction {
  const inputs = inputCoins.map(coin =>
    new Input(coin.nullifier, coin.proof)
  );

  const outputs = [
    new Output(
      recipientKey,
      amount,
      nativeToken()
    )
  ];

  return new Transaction(inputs, outputs);
}
```

### Transaction with Change

```typescript
function createTransferWithChange(
  inputCoin: CoinInfo,
  recipientKey: string,
  amount: bigint,
  senderKey: string
): Transaction {
  const change = inputCoin.value - amount;

  const inputs = [new Input(inputCoin.nullifier, inputCoin.proof)];

  const outputs = [
    // Recipient receives amount
    new Output(recipientKey, amount, nativeToken()),
    // Sender receives change
    new Output(senderKey, change, nativeToken())
  ];

  return new Transaction(inputs, outputs);
}
```

## Input Class

Represents coins being spent:

```typescript
import { Input } from '@midnight-ntwrk/zswap';

interface InputParams {
  nullifier: Uint8Array;    // Prevents double-spend
  value: bigint;            // Amount
  tokenType: Uint8Array;    // Token identifier
  proof: Uint8Array;        // ZK proof of ownership
}

const input = new Input(
  nullifier,
  proof,
  value,
  tokenType
);

// Access properties
input.nullifier;  // Uint8Array
input.value;      // bigint
input.tokenType;  // Uint8Array
```

## Output Class

Represents new coins being created:

```typescript
import { Output } from '@midnight-ntwrk/zswap';

interface OutputParams {
  ownerPublicKey: string;   // Recipient's coin public key
  value: bigint;            // Amount
  tokenType: Uint8Array;    // Token identifier
}

const output = new Output(
  ownerPublicKey,
  1000000n,
  nativeToken()
);

// Compute commitment
const commitment = output.commitment;
```

## Transient Class

Temporary values that exist only within a transaction:

```typescript
import { Transient } from '@midnight-ntwrk/zswap';

// Transients are used for intermediate computations
// They don't persist on-chain
const transient = new Transient(
  value,
  tokenType
);
```

## Offers (Atomic Swaps)

Create atomic swap offers:

```typescript
import { Offer, OfferInput, OfferOutput } from '@midnight-ntwrk/zswap';

// Alice offers 100 TokenA for 50 TokenB
const offer = new Offer(
  [new OfferInput(nullifierA, 100n, tokenTypeA)],
  [new OfferOutput(aliceKey, 50n, tokenTypeB)]
);

// Bob accepts by completing the transaction
const acceptTx = new Transaction(
  [
    ...offer.inputs,
    new Input(nullifierB, proofB, 50n, tokenTypeB)
  ],
  [
    ...offer.outputs,
    new Output(bobKey, 100n, tokenTypeA)
  ]
);
```

## Serialization

```typescript
import { Transaction, NetworkId } from '@midnight-ntwrk/zswap';

// Serialize for network transmission
const serialized = transaction.serialize(NetworkId.TestNet);

// Deserialize received transaction
const deserialized = Transaction.deserialize(
  serialized,
  NetworkId.TestNet
);
```

## Converting Between Ledger and ZSwap

```typescript
import { Transaction as ZswapTx } from '@midnight-ntwrk/zswap';
import { Transaction as LedgerTx } from '@midnight-ntwrk/ledger';
import { getZswapNetworkId, getLedgerNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Ledger → ZSwap
function ledgerToZswap(ledgerTx: LedgerTx): ZswapTx {
  return ZswapTx.deserialize(
    ledgerTx.serialize(getLedgerNetworkId()),
    getZswapNetworkId()
  );
}

// ZSwap → Ledger
function zswapToLedger(zswapTx: ZswapTx): LedgerTx {
  return LedgerTx.deserialize(
    zswapTx.serialize(getZswapNetworkId()),
    getLedgerNetworkId()
  );
}
```

## Transaction Balancing

Ensure inputs cover outputs plus fees:

```typescript
import { nativeToken } from '@midnight-ntwrk/zswap';

interface BalanceCheck {
  isBalanced: boolean;
  inputTotal: bigint;
  outputTotal: bigint;
  fee: bigint;
}

function checkBalance(tx: Transaction): BalanceCheck {
  const inputTotal = tx.inputs.reduce(
    (sum, input) => sum + input.value,
    0n
  );

  const outputTotal = tx.outputs.reduce(
    (sum, output) => sum + output.value,
    0n
  );

  // Fee = inputs - outputs (must be positive)
  const fee = inputTotal - outputTotal;

  return {
    isBalanced: fee >= 0n,
    inputTotal,
    outputTotal,
    fee
  };
}
```

## Token Types

```typescript
import { nativeToken, tokenType } from '@midnight-ntwrk/zswap';

// Native token (tDUST)
const native = nativeToken();

// Custom token from 32-byte identifier
const custom = tokenType('0xabcdef...');

// Compare token types
function isSameToken(a: Uint8Array, b: Uint8Array): boolean {
  return a.every((byte, i) => byte === b[i]);
}

// Check if native token
function isNativeToken(tt: Uint8Array): boolean {
  return isSameToken(tt, nativeToken());
}
```

## Wallet Integration

Using ZSwap with the wallet SDK:

```typescript
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { nativeToken } from '@midnight-ntwrk/zswap';

const wallet = await WalletBuilder.build(...);
wallet.start();

// Create transfer using wallet
const recipe = await wallet.transferTransaction([
  {
    amount: 1000000n,
    type: nativeToken(),
    receiverAddress: 'mn_shield-addr_test1...'
  }
]);

// Prove and submit
const proven = await wallet.proveTransaction(recipe);
const result = await wallet.submitTransaction(proven);
```

## Balance DApp Transactions

When working with contracts:

```typescript
async function balanceContractTransaction(
  wallet: Wallet,
  unbalancedTx: Transaction,
  newCoins: CoinInfo[] = []
) {
  // Wallet adds inputs to cover outputs + fees
  const balanceRecipe = await wallet.balanceTransaction(
    unbalancedTx,
    newCoins  // Include coins minted by contract
  );

  return wallet.proveTransaction(balanceRecipe);
}
```

## Error Handling

```typescript
enum TransactionError {
  INSUFFICIENT_FUNDS = 'Insufficient balance for transaction',
  INVALID_NULLIFIER = 'Coin already spent (nullifier exists)',
  PROOF_FAILED = 'Zero-knowledge proof verification failed',
  NETWORK_MISMATCH = 'Transaction serialized for wrong network'
}

function validateTransaction(tx: Transaction): TransactionError | null {
  const balance = checkBalance(tx);

  if (!balance.isBalanced) {
    return TransactionError.INSUFFICIENT_FUNDS;
  }

  // Additional validation...
  return null;
}
```

## Best Practices

1. **Always check balance** before submitting transactions
2. **Include sufficient fee** for network processing
3. **Handle new coins** when contracts mint tokens
4. **Verify network ID** matches serialization format
5. **Wait for confirmation** before considering funds spent

## Related Skills

- [wallet-sdk-integration](../wallet-sdk-integration/SKILL.md) - Wallet operations
- [compact-stdlib](../compact-stdlib/SKILL.md) - Coin management in Compact
- [ledger-state-patterns](../ledger-state-patterns/SKILL.md) - On-chain state

## References

- [ZSwap API Reference](https://docs.midnight.network/develop/reference/midnight-api/zswap)
- [Ledger API Reference](https://docs.midnight.network/develop/reference/midnight-api/ledger)
- [Transaction Semantics](https://docs.midnight.network/learn/understanding-midnights-technology/zswap)
