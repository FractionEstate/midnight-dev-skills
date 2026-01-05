# Proof Server Operations

Run and manage the Midnight proof server for ZK proof generation.

## What is the Proof Server?

The proof server generates zero-knowledge proofs for Midnight transactions. It:

- Loads circuit proving keys
- Generates ZK-SNARK proofs
- Runs locally (private data never leaves your machine)

## Quick Start

```bash
# Run with Docker
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  midnight-proof-server --network testnet
```

## Docker Options

### Basic Run

```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  midnight-proof-server --network testnet
```

### With Resource Limits

```bash
docker run -p 6300:6300 \
  --memory=8g \
  --cpus=4 \
  midnightnetwork/proof-server -- \
  midnight-proof-server --network testnet
```

### Background Mode

```bash
docker run -d \
  --name midnight-proof-server \
  -p 6300:6300 \
  --restart unless-stopped \
  midnightnetwork/proof-server -- \
  midnight-proof-server --network testnet
```

### View Logs

```bash
docker logs -f midnight-proof-server
```

## Health Check

```bash
# Simple health check
curl http://localhost:6300/health

# Expected response
{"status":"ok"}
```

## Configuration

### Environment Variables

| Variable               | Default | Description    |
| ---------------------- | ------- | -------------- |
| `PROOF_SERVER_PORT`    | 6300    | Server port    |
| `PROOF_SERVER_THREADS` | auto    | Worker threads |
| `PROOF_SERVER_NETWORK` | testnet | Network to use |

### Command Line Arguments

```bash
midnight-proof-server \
  --network testnet \
  --port 6300 \
  --threads 4 \
  --timeout 300
```

## Proof Generation

### How It Works

1. dApp sends circuit inputs to proof server
2. Server loads proving key for circuit
3. Server generates ZK proof (~1-30 seconds)
4. Proof returned to dApp
5. dApp submits proof with transaction

### Performance Factors

| Factor             | Impact                       |
| ------------------ | ---------------------------- |
| Circuit complexity | More constraints = longer    |
| CPU cores          | More cores = faster          |
| RAM                | Minimum 4GB, 8GB recommended |
| First proof        | Slower (key loading)         |

### Typical Proof Times

| Circuit Size                | Time   |
| --------------------------- | ------ |
| Simple (100 constraints)    | 1-2s   |
| Medium (1000 constraints)   | 5-10s  |
| Complex (10000 constraints) | 20-60s |

## Troubleshooting

### Connection Refused

```bash
# Check if running
docker ps | grep proof-server

# Check port
netstat -an | grep 6300

# Restart
docker restart midnight-proof-server
```

### Proof Generation Timeout

```typescript
// Increase timeout in your code
const proofProvider = httpClientProofProvider(
  'http://localhost:6300',
  { timeout: 120000 } // 2 minutes
);
```

### Out of Memory

```bash
# Increase Docker memory
docker run -p 6300:6300 --memory=16g \
  midnightnetwork/proof-server -- \
  midnight-proof-server --network testnet
```

### Slow First Proof

This is normal - the server loads circuit keys on first use. Subsequent proofs for the same circuit are faster.

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  proof-server:
    image: midnightnetwork/proof-server
    command: midnight-proof-server --network testnet
    ports:
      - '6300:6300'
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:6300/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

## Integration Testing

```typescript
async function waitForProofServer(url: string, timeout = 30000): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return false;
}

// Usage
const isReady = await waitForProofServer('http://localhost:6300');
if (!isReady) {
  throw new Error('Proof server not available');
}
```

## Best Practices

1. **Start before dApp** - Proof server must be running
2. **Resource allocation** - Give Docker enough memory (8GB+)
3. **Background mode** - Use `-d` for persistent running
4. **Health checks** - Verify before transactions
5. **Logging** - Monitor logs for errors
6. **Timeouts** - Configure appropriate timeouts in client
