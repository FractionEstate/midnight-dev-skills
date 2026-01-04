---
name: troubleshooting
description: Solutions for common Midnight Network development issues. Use when users encounter errors with environment setup, Compact compilation, wallet connection, proof server, Next.js integration, or deployment. Triggers on error messages, debugging requests, or "not working" issues.
---

# Troubleshooting Midnight Development

Quick solutions for common Midnight Network development issues.

## Environment Setup

### Node.js Version Mismatch
```
Error: The engine "node" is incompatible
```
**Fix**:
```bash
nvm install 20 && nvm use 20
```

### Compact Not Found
```
compact: command not found
```
**Fix**:
```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
export PATH="$HOME/.cargo/bin:$PATH"
```

### Docker Not Running
```
Cannot connect to Docker daemon
```
**Fix**: Start Docker Desktop, or on Linux:
```bash
sudo systemctl start docker
```

## Compact Compiler Errors

### Version Mismatch
```
Error: Version mismatch
```
**Fix**:
```bash
compact update 0.2.0
```

### Type Mismatch
```
Error: Expected type 'Opaque<"number">' but got 'Opaque<"string">'
```
**Fix**: Match types in assignments:
```compact
// Wrong
export ledger count: Opaque<"number">;
count = disclose("5");  // String!

// Correct
count = disclose(5);    // Number
```

### Missing disclose()
```
Error: Cannot assign private value to public ledger
```
**Fix**: Wrap with `disclose()`:
```compact
message = disclose(customMessage);
```

### Syntax Error
```
Error: Unexpected token at line X
```
**Fix**: Check semicolons, brackets, return types:
```compact
export circuit foo(): []   // Need return type
```

## Wallet Connection

### window.midnight undefined
**Cause**: Lace wallet not installed or not Chrome
**Fix**:
1. Use Chrome browser
2. Install Lace: https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg

### TypeScript Error
```
Property 'midnight' does not exist on type 'Window'
```
**Fix**: Add type declaration:
```typescript
// src/types/midnight.d.ts
declare global {
  interface Window {
    midnight?: { mnLace?: { enable: () => Promise<any> } };
  }
}
export {};
```

### Connection Rejected
**Fix**:
1. Click "Authorize" in Lace popup
2. Ensure wallet is unlocked
3. Clear browser cache

## Proof Server

### Cannot Connect to Proof Server
```
Error: Failed to connect to localhost:6300
```
**Fix**:
```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet
```

### Port Already in Use
```
Error: Port 6300 is already in use
```
**Fix**:
```bash
lsof -i :6300
kill -9 <PID>
# Or use different port
docker run -p 6301:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet
```

### Proof Generation Timeout
**Fix**:
1. Increase timeout in config
2. Check Docker has 8GB+ RAM
3. Simplify circuit (fewer constraints)

## Next.js Errors

### useState in Server Component
```
Error: useState can only be used in Client Components
```
**Fix**: Add directive:
```typescript
"use client";
import { useState } from "react";
```

### Module Not Found
```
Error: Cannot find module '@midnight-ntwrk/dapp-connector-api'
```
**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Webpack Fallback Error
```
Error: Can't resolve 'fs'
```
**Fix** in `next.config.js`:
```javascript
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};
```

### Environment Variables Undefined
**Fix**:
1. Prefix with `NEXT_PUBLIC_` for client-side
2. Restart dev server after changing `.env.local`

## Deployment

### Insufficient Funds
```
Error: Insufficient funds
```
**Fix**: Get tDUST from https://midnight.network/test-faucet/

### Contract Not Found
**Fix**: Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

### Network Mismatch
**Fix**: Ensure all use same network:
```bash
# .env.local
NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet

# Proof server
docker run ... --network testnet

# Wallet: Settings → Midnight → Testnet
```

## Quick Reference Commands

```bash
# Check versions
node --version && npm --version && compact --version && docker --version

# Reset environment
rm -rf node_modules .next && npm install && npm run dev

# Restart proof server
docker stop $(docker ps -q --filter ancestor=midnightnetwork/proof-server)
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# Recompile contract
compact compile contracts/my-contract.compact contracts/managed/my-contract

# Clear Next.js cache
rm -rf .next && npm run dev
```

## Getting Help

- Discord: https://discord.com/invite/midnightnetwork (#developer-support)
- GitHub Issues: https://github.com/midnightntwrk/midnight-docs/issues
- Forum: https://forum.midnight.network

**Include when asking**:
- Full error message
- Compact/Node versions
- OS
- Steps to reproduce
