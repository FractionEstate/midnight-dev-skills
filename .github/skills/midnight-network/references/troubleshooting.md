# Midnight Network Troubleshooting

Common issues and solutions for Midnight dApp development.

## Wallet Issues

### Wallet Not Detected

**Symptom:** `window.midnight` is undefined

**Solutions:**

1. Check Lace wallet is installed
2. Ensure Midnight mode is enabled in Lace
3. Wait for wallet injection (may load after page):

```typescript
await new Promise(r => setTimeout(r, 1000));
const hasWallet = !!window.midnight;
```

### Wallet Connection Rejected

**Symptom:** `enable()` throws error

**Solutions:**

1. User may have declined - show retry option
2. Check if already connected: `await connector.state()`
3. Clear wallet cache and reconnect

### Balance Shows Zero

**Symptom:** `balanceAndProveOwnership()` returns 0

**Solutions:**

1. Visit faucet: <https://faucet.testnet-02.midnight.network>
2. Wait for faucet transaction to confirm (~1 minute)
3. Ensure correct network (testnet vs mainnet)

## Proof Server Issues

### Connection Refused

**Symptom:** Cannot connect to localhost:6300

**Solutions:**

```bash
# Check if proof server is running
docker ps | grep proof-server

# Start proof server
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  midnight-proof-server --network testnet

# Check logs
docker logs midnight-proof-server
```

### Proof Generation Timeout

**Symptom:** Proof takes too long, times out

**Solutions:**

- Increase timeout:

```typescript
const proofProvider = httpClientProofProvider(url, { timeout: 120000 });
```

- Allocate more Docker resources:

```bash
docker run --memory=8g --cpus=4 ...
```

- Check circuit complexity (reduce constraints)

### Out of Memory

**Symptom:** Proof server crashes or returns error

**Solutions:**

```bash
# Increase memory limit
docker run --memory=16g ...

# Check available memory
docker stats midnight-proof-server
```

## Contract Issues

### Compilation Errors

#### Type Mismatch

```text
Error: Type mismatch: expected Uint<64>, got Uint<32>
```

Solution: Use consistent bit widths

#### Missing Disclose

```text
Error: Cannot assign private value to public ledger
```

Solution: Wrap with `disclose()`:

```compact
ledger.value = disclose(privateInput);
```

### Deployment Fails

#### Insufficient Funds

```text
Error: Insufficient funds for deployment
```

Solution: Get more tDUST from faucet

#### Proof Server Error

```text
Error: Failed to generate deployment proof
```

Solution: Ensure proof server is running and healthy

### Circuit Call Fails

#### Assertion Error

```text
Error: Assertion failed: condition
```

Solution: Check circuit preconditions are met

#### State Mismatch

```text
Error: Contract state mismatch
```

Solution: Refresh contract state before calling

## Network Issues

### Indexer Connection Failed

**Symptom:** Cannot query blockchain state

**Solutions:**

1. Check indexer URL is correct
2. Test with curl:

```bash
curl -X POST https://indexer.testnet-02.midnight.network/api/v1/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
```

1. Check network connectivity

### Network ID Mismatch

**Symptom:** Transactions rejected, state queries fail

**Solution:**

```typescript
// Always set NetworkId first
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
setNetworkId(NetworkId.TestNet);
```

### Transaction Not Confirming

**Symptom:** Transaction submitted but never confirms

**Solutions:**

1. Check transaction status via indexer
2. Verify sufficient funds for gas
3. Check if network is congested
4. Wait longer (testnet can be slow)

## TypeScript Issues

### Type Errors with Midnight Packages

**Symptom:** TypeScript compilation errors

**Solutions:**

1. Ensure compatible package versions
2. Add to tsconfig.json:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Import Errors

**Symptom:** Cannot find module '@midnight-ntwrk/...'

**Solutions:**

```bash
# Reinstall packages
npm install @midnight-ntwrk/midnight-js-contracts \
  @midnight-ntwrk/dapp-connector-api \
  @midnight-ntwrk/midnight-js-types
```

## Debug Checklist

- ☐ Proof server running on port 6300
- ☐ Lace wallet installed and Midnight mode enabled
- ☐ Wallet connected to correct network (testnet)
- ☐ Sufficient tDUST balance
- ☐ NetworkId set before provider initialization
- ☐ Contract compiled with compatible Compact version
- ☐ All providers properly configured
- ☐ Correct contract address

## Getting Help

- [Midnight Discord](https://discord.gg/midnight)
- [Midnight Docs](https://docs.midnight.network)
- [GitHub Issues](https://github.com/midnightntwrk)
