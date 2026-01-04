---
name: address-formats
description: Understand and work with Midnight Network address formats. Covers shielded and transparent addresses, encoding/decoding, address validation, and address derivation from keys for building dApps and wallets.
---

# Address Formats

Midnight uses different address formats for privacy-preserving and public transactions.

## When to Use

- Building wallet functionality
- Validating user-provided addresses
- Deriving addresses from keys
- Understanding transaction visibility
- Working with shielded transfers

## Address Types Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Midnight Addresses                        │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │  Shielded Address   │    │ Transparent Address │        │
│  │                     │    │                     │        │
│  │  • Private txs      │    │  • Public txs       │        │
│  │  • ZK protected     │    │  • Visible on chain │        │
│  │  • Longer format    │    │  • Standard format  │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Shielded Addresses

Used for private transactions where sender, receiver, and amount are hidden.

### Format

```
shielded1<bech32m encoded data>

Example:
shielded1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs...
```

### Components

```typescript
interface ShieldedAddress {
  prefix: 'shielded1';
  diversifier: Uint8Array;     // 11 bytes
  pkd: Uint8Array;             // 32 bytes - diversified public key
  checksum: Uint8Array;        // Bech32m checksum
}
```

### Derivation

```typescript
import { deriveShieldedAddress } from '@midnight-ntwrk/wallet';

// From spending key
const shieldedAddress = deriveShieldedAddress({
  spendingKey: wallet.spendingKey,
  diversifierIndex: 0  // Can generate multiple addresses
});

// Multiple addresses from same key
const addresses = [];
for (let i = 0; i < 10; i++) {
  addresses.push(deriveShieldedAddress({
    spendingKey: wallet.spendingKey,
    diversifierIndex: i
  }));
}
```

### Privacy Properties

| Property | Shielded |
|----------|----------|
| Sender hidden | ✅ |
| Receiver hidden | ✅ |
| Amount hidden | ✅ |
| Memo hidden | ✅ |
| Unlinkable | ✅ (with diversifiers) |

## Transparent Addresses

Used for public transactions visible on-chain.

### Format

```
midnight1<bech32m encoded data>

Example:
midnight1qvk8v9j6e7u3pxhsf4yzj2qwert...
```

### Components

```typescript
interface TransparentAddress {
  prefix: 'midnight1';
  publicKey: Uint8Array;       // 32 bytes
  checksum: Uint8Array;        // Bech32m checksum
}
```

### Derivation

```typescript
import { deriveTransparentAddress } from '@midnight-ntwrk/wallet';

// From public key
const transparentAddress = deriveTransparentAddress({
  publicKey: wallet.publicKey
});
```

## Address Encoding/Decoding

### Bech32m Encoding

```typescript
import { bech32m } from 'bech32';

// Encode address
function encodeAddress(
  prefix: string,
  data: Uint8Array
): string {
  const words = bech32m.toWords(data);
  return bech32m.encode(prefix, words, 1000);  // Long addresses allowed
}

// Decode address
function decodeAddress(
  address: string
): { prefix: string; data: Uint8Array } {
  const decoded = bech32m.decode(address, 1000);
  return {
    prefix: decoded.prefix,
    data: new Uint8Array(bech32m.fromWords(decoded.words))
  };
}
```

### Using SDK Functions

```typescript
import {
  encodeShieldedAddress,
  decodeShieldedAddress,
  encodeTransparentAddress,
  decodeTransparentAddress
} from '@midnight-ntwrk/wallet';

// Shielded
const encoded = encodeShieldedAddress(shieldedData);
const decoded = decodeShieldedAddress(encoded);

// Transparent
const tEncoded = encodeTransparentAddress(publicKey);
const tDecoded = decodeTransparentAddress(tEncoded);
```

## Address Validation

### Basic Validation

```typescript
function isValidMidnightAddress(address: string): boolean {
  if (!address) return false;

  // Check prefix
  if (!address.startsWith('midnight1') &&
      !address.startsWith('shielded1')) {
    return false;
  }

  try {
    const decoded = bech32m.decode(address, 1000);

    // Validate prefix
    if (decoded.prefix !== 'midnight1' &&
        decoded.prefix !== 'shielded1') {
      return false;
    }

    // Validate data length
    const data = bech32m.fromWords(decoded.words);
    if (decoded.prefix === 'shielded1' && data.length !== 43) {
      return false;
    }
    if (decoded.prefix === 'midnight1' && data.length !== 32) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

### Detailed Validation

```typescript
interface AddressValidation {
  valid: boolean;
  type?: 'shielded' | 'transparent';
  error?: string;
}

function validateAddress(address: string): AddressValidation {
  if (!address) {
    return { valid: false, error: 'Address is empty' };
  }

  // Check prefix
  let type: 'shielded' | 'transparent';
  if (address.startsWith('shielded1')) {
    type = 'shielded';
  } else if (address.startsWith('midnight1')) {
    type = 'transparent';
  } else {
    return { valid: false, error: 'Invalid address prefix' };
  }

  try {
    const decoded = bech32m.decode(address, 1000);
    const data = bech32m.fromWords(decoded.words);

    // Check expected length
    const expectedLength = type === 'shielded' ? 43 : 32;
    if (data.length !== expectedLength) {
      return {
        valid: false,
        error: `Invalid data length: expected ${expectedLength}, got ${data.length}`
      };
    }

    return { valid: true, type };
  } catch (error) {
    return { valid: false, error: `Decode error: ${error.message}` };
  }
}
```

### React Validation Component

```typescript
// components/AddressInput.tsx
import { useState, useEffect } from 'react';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function AddressInput({ value, onChange, required }: AddressInputProps) {
  const [validation, setValidation] = useState<AddressValidation | null>(null);

  useEffect(() => {
    if (value) {
      setValidation(validateAddress(value));
    } else {
      setValidation(null);
    }
  }, [value]);

  return (
    <div className="address-input">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="shielded1... or midnight1..."
        required={required}
        className={validation?.valid === false ? 'invalid' : ''}
      />
      {validation && (
        <div className={`validation ${validation.valid ? 'valid' : 'invalid'}`}>
          {validation.valid ? (
            <span>✅ Valid {validation.type} address</span>
          ) : (
            <span>❌ {validation.error}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

## Address Usage in Contracts

### Receiving to Addresses

```compact
pragma language_version 0.17;

// Receive tokens to contract
export circuit receiveTokens(amount: Uint<64>): [] {
  receive(nativeToken(), amount);
}

// Send to external address (handled by SDK)
export circuit withdraw(amount: Uint<64>): [] {
  // Address handling is done in TypeScript
  send(nativeToken(), amount, recipientAddress);
}
```

### TypeScript Contract Call

```typescript
// Sending to shielded address
const tx = await contract.withdraw({
  amount: 100n,
  recipient: 'shielded1qyqszqg...'
});

// Sending to transparent address
const tx = await contract.withdraw({
  amount: 100n,
  recipient: 'midnight1qvk8v9j...'
});
```

## Diversified Addresses

Generate multiple unlinkable addresses from one key:

```typescript
import { generateDiversifiedAddress } from '@midnight-ntwrk/wallet';

// Each diversifier creates a unique address
// that can't be linked to others without the viewing key

const addresses: string[] = [];
for (let index = 0; index < 100; index++) {
  const addr = generateDiversifiedAddress({
    fullViewingKey: wallet.viewingKey,
    diversifierIndex: index
  });
  addresses.push(addr);
}

// All addresses controlled by same wallet
// But appear unrelated to observers
```

### Diversifier Best Practices

```typescript
// Use sequential diversifiers for invoices
function generateInvoiceAddress(invoiceId: number): string {
  return generateDiversifiedAddress({
    fullViewingKey: viewingKey,
    diversifierIndex: invoiceId
  });
}

// Random diversifiers for one-time addresses
function generateOneTimeAddress(): string {
  const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0];
  return generateDiversifiedAddress({
    fullViewingKey: viewingKey,
    diversifierIndex: randomIndex
  });
}
```

## Address Comparison

```typescript
// Normalize for comparison
function normalizeAddress(address: string): string {
  return address.toLowerCase().trim();
}

// Compare addresses
function addressesEqual(a: string, b: string): boolean {
  return normalizeAddress(a) === normalizeAddress(b);
}

// Check if same underlying key (for your own addresses)
function isSameWallet(
  address1: string,
  address2: string,
  viewingKey: ViewingKey
): boolean {
  const decoded1 = decodeShieldedAddress(address1);
  const decoded2 = decodeShieldedAddress(address2);

  // Re-derive pkd from viewing key and diversifier
  // to check if both belong to same wallet
  const expected1 = derivePaymentKey(viewingKey, decoded1.diversifier);
  const expected2 = derivePaymentKey(viewingKey, decoded2.diversifier);

  return arraysEqual(decoded1.pkd, expected1) &&
         arraysEqual(decoded2.pkd, expected2);
}
```

## Network-Specific Prefixes

| Network | Shielded | Transparent |
|---------|----------|-------------|
| Mainnet | `shielded1` | `midnight1` |
| Testnet | `shielded1test` | `midnight1test` |

```typescript
function getAddressPrefixes(network: 'mainnet' | 'testnet') {
  if (network === 'testnet') {
    return {
      shielded: 'shielded1test',
      transparent: 'midnight1test'
    };
  }
  return {
    shielded: 'shielded1',
    transparent: 'midnight1'
  };
}
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Invalid checksum | Corrupted address | Check for typos |
| Wrong network | Testnet/mainnet mismatch | Use correct prefix |
| Decoding fails | Malformed address | Validate before use |
| Wrong length | Incomplete copy | Verify full address |

## Related Skills

- [wallet-sdk-integration](../wallet-sdk-integration/SKILL.md) - Key derivation
- [zswap-transactions](../zswap-transactions/SKILL.md) - Transaction types
- [privacy-data-patterns](../privacy-data-patterns/SKILL.md) - Privacy concepts

## References

- [Midnight Documentation](https://docs.midnight.network)
- [Bech32m Specification](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki)
