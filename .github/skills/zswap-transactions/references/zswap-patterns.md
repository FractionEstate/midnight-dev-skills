# ZSwap Transaction Patterns Reference

## Transaction Structure

```typescript
interface Transaction {
  inputs: Input[];
  outputs: Output[];
  transients: Transient[];
  offers: Offer[];
  proofs: Proof[];
  contractCalls: ContractCall[];
}
```

---

## Input Patterns

### Standard Input (Spending a Coin)

```typescript
import { Input } from '@midnight-ntwrk/zswap';

const input = new Input(
  nullifier,      // Uint8Array - prevents double-spend
  ownershipProof, // Uint8Array - proves right to spend
  value,          // bigint - coin value
  tokenType       // Uint8Array - token identifier
);
```

### Multiple Inputs (Consolidating Coins)

```typescript
// Combine multiple small coins into one transaction
const inputs = coins.map(coin => new Input(
  coin.nullifier,
  coin.proof,
  coin.value,
  coin.tokenType
));
```

---

## Output Patterns

### Standard Output (Creating a Coin)

```typescript
import { Output } from '@midnight-ntwrk/zswap';

const output = new Output(
  recipientCoinPublicKey,  // string - recipient's key
  amount,                   // bigint - value
  tokenType                 // Uint8Array - token type
);
```

### Multiple Outputs (Split Payment)

```typescript
// Pay multiple recipients in one transaction
const outputs = recipients.map(r => new Output(
  r.publicKey,
  r.amount,
  nativeToken()
));
```

### Change Output

```typescript
// Return excess to sender
const totalInput = inputs.reduce((sum, i) => sum + i.value, 0n);
const totalOutput = outputs.reduce((sum, o) => sum + o.value, 0n);
const fee = 1000n;  // Network fee

const change = totalInput - totalOutput - fee;
if (change > 0n) {
  outputs.push(new Output(senderPublicKey, change, nativeToken()));
}
```

---

## Transient Patterns

### Using Transients for Intermediate Values

```typescript
import { Transient } from '@midnight-ntwrk/zswap';

// Transients exist only during transaction execution
// They're consumed and don't create persistent coins
const transient = new Transient(
  intermediateValue,
  tokenType
);
```

### Transient in Contract Call

```typescript
// Contract mints transient that becomes output
const tx = new Transaction(
  [],  // No standard inputs
  [outputFromContract],
  [transientMintedByContract],
  [],
  [],
  [contractCall]
);
```

---

## Offer Patterns (Atomic Swaps)

### Creating an Offer

```typescript
import { Offer, OfferInput, OfferOutput } from '@midnight-ntwrk/zswap';

// Alice wants to trade 100 TokenA for 50 TokenB
const offer = new Offer(
  // What Alice provides
  [new OfferInput(
    aliceNullifier,
    100n,
    tokenTypeA
  )],
  // What Alice wants to receive
  [new OfferOutput(
    aliceCoinPublicKey,
    50n,
    tokenTypeB
  )]
);
```

### Accepting an Offer

```typescript
// Bob accepts Alice's offer
const acceptTx = new Transaction(
  // Bob's inputs + Alice's offer inputs
  [
    new Input(bobNullifier, bobProof, 50n, tokenTypeB),
    ...offer.toInputs()
  ],
  // Bob receives TokenA, Alice receives TokenB (from offer outputs)
  [
    new Output(bobCoinPublicKey, 100n, tokenTypeA),
    ...offer.outputs
  ]
);
```

### Partial Fill Offer

```typescript
// Offer that can be partially filled
const partialOffer = new Offer(
  [new OfferInput(nullifier, 1000n, tokenTypeA)],
  [new OfferOutput(ownerKey, 500n, tokenTypeB)],
  { allowPartialFill: true, minFillAmount: 100n }
);
```

---

## Token Type Patterns

### Native Token (tDUST)

```typescript
import { nativeToken } from '@midnight-ntwrk/zswap';

const dust = nativeToken();  // Returns Uint8Array
```

### Custom Token Type

```typescript
import { tokenType } from '@midnight-ntwrk/zswap';

// From 32-byte hex string
const customToken = tokenType('0x' + '00'.repeat(32));

// From contract-minted token
const mintedToken = tokenType(contractMintedTypeId);
```

### Token Comparison

```typescript
function tokensEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return a.every((byte, i) => byte === b[i]);
}

function isNative(token: Uint8Array): boolean {
  return tokensEqual(token, nativeToken());
}
```

---

## Serialization Patterns

### Serialize for Network

```typescript
import { Transaction, NetworkId } from '@midnight-ntwrk/zswap';

// Serialize for testnet
const bytes = transaction.serialize(NetworkId.TestNet);

// Convert to hex for storage/transmission
const hex = Array.from(bytes, b =>
  b.toString(16).padStart(2, '0')
).join('');
```

### Deserialize from Network

```typescript
// From bytes
const tx = Transaction.deserialize(bytes, NetworkId.TestNet);

// From hex string
const bytesFromHex = new Uint8Array(
  hex.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
);
const txFromHex = Transaction.deserialize(bytesFromHex, NetworkId.TestNet);
```

### Cross-format Conversion

```typescript
import { Transaction as ZswapTx } from '@midnight-ntwrk/zswap';
import { Transaction as LedgerTx } from '@midnight-ntwrk/ledger';
import { getZswapNetworkId, getLedgerNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// ZSwap ↔ Ledger conversion
function convertToLedger(zswapTx: ZswapTx): LedgerTx {
  return LedgerTx.deserialize(
    zswapTx.serialize(getZswapNetworkId()),
    getLedgerNetworkId()
  );
}

function convertToZswap(ledgerTx: LedgerTx): ZswapTx {
  return ZswapTx.deserialize(
    ledgerTx.serialize(getLedgerNetworkId()),
    getZswapNetworkId()
  );
}
```

---

## Balance Calculation

```typescript
interface TokenBalance {
  tokenType: Uint8Array;
  amount: bigint;
}

function calculateBalance(tx: Transaction): Map<string, bigint> {
  const balance = new Map<string, bigint>();

  // Sum inputs
  for (const input of tx.inputs) {
    const key = toHex(input.tokenType);
    const current = balance.get(key) || 0n;
    balance.set(key, current + input.value);
  }

  // Subtract outputs
  for (const output of tx.outputs) {
    const key = toHex(output.tokenType);
    const current = balance.get(key) || 0n;
    balance.set(key, current - output.value);
  }

  return balance;  // Positive = fee paid, Negative = unbalanced
}

function isBalanced(tx: Transaction, minFee = 0n): boolean {
  const balance = calculateBalance(tx);
  const nativeBalance = balance.get(toHex(nativeToken())) || 0n;

  // All non-native tokens must be zero
  // Native token must be >= minFee
  for (const [token, amount] of balance) {
    if (token === toHex(nativeToken())) {
      if (amount < minFee) return false;
    } else {
      if (amount !== 0n) return false;
    }
  }

  return true;
}
```

---

## Error Codes

```typescript
enum ZswapError {
  // Input errors
  NULLIFIER_ALREADY_USED = 'E001',
  INVALID_OWNERSHIP_PROOF = 'E002',
  INPUT_NOT_FOUND = 'E003',

  // Output errors
  INVALID_RECIPIENT_KEY = 'E101',
  ZERO_VALUE_OUTPUT = 'E102',

  // Balance errors
  UNBALANCED_TRANSACTION = 'E201',
  INSUFFICIENT_FEE = 'E202',

  // Offer errors
  OFFER_EXPIRED = 'E301',
  PARTIAL_FILL_TOO_SMALL = 'E302',

  // Serialization errors
  WRONG_NETWORK_ID = 'E401',
  INVALID_FORMAT = 'E402'
}
```

---

## Network IDs

```typescript
import { NetworkId } from '@midnight-ntwrk/zswap';

enum NetworkId {
  Undeployed = 0,  // Development/testing
  DevNet = 1,      // Local development network
  TestNet = 2,     // Public testnet
  MainNet = 3      // Production mainnet
}
```
