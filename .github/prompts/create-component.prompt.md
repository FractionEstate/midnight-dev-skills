---
description: Create a new React component for Midnight dApp
name: Create Component
agent: Midnight Developer
tools:
  - edit/editFiles
  - search
---

# Create Component

Create a new React component for a Midnight Network dApp.

## Input Variables

- **Component Name**: ${input:componentName:Name of the component (PascalCase)}
- **Component Type**: ${input:componentType:wallet-button, contract-form, transaction-status, or data-display}
- **Uses Wallet**: ${input:usesWallet:yes or no}

## Component Patterns

### Wallet Button Component
```typescript
'use client';

import { useState } from 'react';
import type { DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

export function WalletButton() {
  const [wallet, setWallet] = useState<DAppConnectorWalletAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const connector = window.midnight;
      if (!connector) throw new Error('Wallet not installed');
      await connector.enable();
      setWallet(await connector.walletAPI());
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button onClick={connect} disabled={isConnecting}>
      {wallet ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### Contract Form Component
```typescript
'use client';

import { useState } from 'react';

interface ContractFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export function ContractForm({ onSubmit }: ContractFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(new FormData(e.target as HTMLFormElement));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Requirements

1. Use `'use client'` directive for wallet interactions
2. Handle loading and error states
3. Use TypeScript with proper types from @midnight-ntwrk
4. Follow React 19 best practices
5. Include accessibility attributes

## Output Format

Provide:
1. Complete component code
2. Props interface (if applicable)
3. Usage example
4. Required imports

Use #tool:search to find existing patterns. Use #tool:edit/editFiles to create the component.
