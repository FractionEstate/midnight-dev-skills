---
description: "Create a React component for Midnight dApp with wallet integration"
---

# Create Midnight Component

Create a React component for a Midnight dApp with proper wallet integration.

## Component Details

${input:component_name:Name of the component (e.g., VotingPanel, TokenTransfer)}

${input:component_purpose:What the component does (e.g., "displays voting options and submits votes")}

## Wallet Interaction Required?

${input:needs_wallet:Does this component need wallet interaction? (yes/no)}

## Implementation Guidelines

### Component Structure

```typescript
'use client';  // Required for wallet interaction

import { useState, useCallback } from 'react';
import type { FC } from 'react';
// Import Midnight types as needed

interface ${component_name}Props {
  // Define props
}

export const ${component_name}: FC<${component_name}Props> = ({ ...props }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet interaction handler
  const handleAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Interact with contract
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [/* dependencies */]);

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* Component UI */}
    </div>
  );
};
```

### Required Patterns

1. **Client Directive**: Use `'use client'` for wallet interactions
2. **Error Handling**: Always catch and display errors gracefully
3. **Loading States**: Show loading indicators during async operations
4. **Type Safety**: Use TypeScript interfaces for all props
5. **Accessibility**: Include proper ARIA labels

### Wallet Integration Pattern

```typescript
import { useMidnightWallet } from '@/hooks/useMidnightWallet';

export const MyComponent = () => {
  const { wallet, isConnected, connect, error } = useMidnightWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  // Component with wallet access
};
```

## Deliverables

1. **Component File**: `components/${component_name}.tsx`
2. **Types**: Any necessary TypeScript interfaces
3. **Hook**: Custom hook if complex wallet logic needed
4. **Test**: Basic test file in `test/components/`
