---
description: 'Set up wallet connection in a Next.js application with Midnight Network dApp Connector API'
---

# Integrate Wallet Connection

## Configuration Variables
${PROJECT_PATH="."} <!-- Path to the Next.js project -->
${USE_CONTEXT="yes|no"} <!-- Whether to use React Context for wallet state -->
${INCLUDE_HOOK="yes|no"} <!-- Whether to create a custom React hook -->

## Generated Prompt

Set up Midnight wallet connection in a Next.js 16+ application with the following requirements:

### Core Implementation

1. **Type Declarations**:
   - Declare `window.midnight` global for DAppConnectorAPI
   - Import types from `@midnight-ntwrk/dapp-connector-api`

2. **Wallet Connection Logic**:
   - Check if wallet extension is installed
   - Handle enable flow
   - Get WalletAPI instance
   - Handle connection errors gracefully

3. **Client Component Requirements**:
   - Mark components with `'use client'` directive
   - Use React state for wallet instance
   - Handle loading and error states

### Files to Create

#### 1. Type Declaration
Create `types/midnight.d.ts`:
```typescript
import type { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}
```

#### 2. Wallet Utilities
Create `lib/midnight/wallet.ts`:
- `checkWalletInstalled()`: Check if extension exists
- `connectWallet()`: Full connection flow
- `getWalletState()`: Get current state
- `disconnectWallet()`: Clean up (client-side only)

${USE_CONTEXT === "yes" ? `
#### 3. Wallet Context
Create \`contexts/MidnightWalletContext.tsx\`:
- WalletContext with wallet, error, isConnecting state
- WalletProvider component
- Export useMidnightWallet hook
` : ""}

${INCLUDE_HOOK === "yes" ? `
#### 4. Custom Hook
Create \`hooks/useMidnightWallet.ts\`:
- Encapsulate connection logic
- Return wallet, connect, disconnect, isConnected, error
- Handle reconnection on mount
` : ""}

#### 5. UI Component
Create `components/WalletButton.tsx`:
- Show "Install Wallet" if not detected
- Show "Connect" button with loading state
- Show connected address when connected
- Handle errors with user-friendly messages

### Integration Steps

1. Ensure `@midnight-ntwrk/dapp-connector-api` is installed
2. Add type declaration to `tsconfig.json` includes
3. ${USE_CONTEXT === "yes" ? "Wrap app in WalletProvider" : "Import hook/utilities where needed"}
4. Add WalletButton to layout or navbar
5. Test with Lace wallet extension

### Example Usage

```typescript
'use client';

import { WalletButton } from '@/components/WalletButton';
${USE_CONTEXT === "yes" ? "import { useMidnightWallet } from '@/contexts/MidnightWalletContext';" : ""}

export function Header() {
  ${USE_CONTEXT === "yes" ? "const { wallet, isConnected } = useMidnightWallet();" : ""}

  return (
    <header>
      <nav>
        <WalletButton />
      </nav>
    </header>
  );
}
```

### Error Handling

Handle these error scenarios:
- Wallet extension not installed
- User rejected connection
- Network mismatch
- Extension locked/unavailable
- Connection timeout
