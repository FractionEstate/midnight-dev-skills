---
name: proof-server-operations
description: Set up and operate the Midnight proof server for generating zero-knowledge proofs. Covers Docker deployment, configuration, health monitoring, proving operations, error handling, and performance optimization.
---

# Proof Server Operations

The proof server is essential for generating zero-knowledge proofs required by Midnight transactions.

## When to Use

- Setting up local development environment
- Deploying proof server for production
- Troubleshooting proof generation failures
- Optimizing proof generation performance
- Integrating proof server with dApp

## Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Your dApp  │───▶│ Proof Server│───▶│  Midnight   │
│             │    │  (Docker)   │    │  Network    │
└─────────────┘    └─────────────┘    └─────────────┘
                         │
                         ▼
                   ZK Proof Generation
                   - Circuit execution
                   - Witness computation
                   - Proof creation
```

## Quick Start

### Start Proof Server (Testnet)

```bash
docker run -d \
  --name midnight-proof-server \
  -p 6300:6300 \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server --network testnet
```

### Verify Running

```bash
# Check health endpoint
curl http://localhost:6300/health

# Expected response
{"status":"healthy"}
```

## Docker Deployment

### Basic Deployment

```bash
# Pull latest image
docker pull midnightnetwork/proof-server:latest

# Run with default settings
docker run -d \
  --name proof-server \
  -p 6300:6300 \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server --network testnet
```

### Production Deployment

```bash
# Run with resource limits and restart policy
docker run -d \
  --name proof-server \
  --restart unless-stopped \
  -p 6300:6300 \
  --memory 8g \
  --cpus 4 \
  -v proof-server-data:/data \
  -e RUST_LOG=info \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server \
    --network testnet \
    --data-dir /data
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  proof-server:
    image: midnightnetwork/proof-server:latest
    container_name: midnight-proof-server
    restart: unless-stopped
    ports:
      - "6300:6300"
    volumes:
      - proof-server-data:/data
    environment:
      - RUST_LOG=info
    command: >
      -- midnight-proof-server
      --network testnet
      --data-dir /data
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6300/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

volumes:
  proof-server-data:
```

```bash
# Start with compose
docker-compose up -d

# View logs
docker-compose logs -f proof-server

# Stop
docker-compose down
```

## Configuration Options

### Command Line Arguments

```bash
midnight-proof-server [OPTIONS]

Options:
  --network <NETWORK>     Network to connect to (testnet, mainnet)
  --port <PORT>           Port to listen on (default: 6300)
  --host <HOST>           Host to bind to (default: 0.0.0.0)
  --data-dir <DIR>        Data directory for caching
  --log-level <LEVEL>     Log level (trace, debug, info, warn, error)
  --workers <N>           Number of worker threads
```

### Environment Variables

```bash
# Logging
RUST_LOG=info                    # Log level
RUST_BACKTRACE=1                 # Enable backtraces

# Performance
PROOF_SERVER_WORKERS=4           # Parallel proof workers
PROOF_SERVER_CACHE_SIZE=1000     # Proof cache entries
```

## API Endpoints

### Health Check

```bash
GET /health

# Response
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3600
}
```

### Generate Proof

```bash
POST /prove

# Request body
{
  "circuit": "circuit_bytecode_base64",
  "witness": "witness_data_base64",
  "public_inputs": ["input1", "input2"]
}

# Response
{
  "proof": "proof_data_base64",
  "public_outputs": ["output1", "output2"],
  "generation_time_ms": 1500
}
```

### Verify Proof

```bash
POST /verify

# Request body
{
  "circuit": "circuit_bytecode_base64",
  "proof": "proof_data_base64",
  "public_inputs": ["input1", "input2"]
}

# Response
{
  "valid": true
}
```

## Integration with dApp

### TypeScript Configuration

```typescript
import { createProviders } from '@midnight-ntwrk/midnight-js';

const providers = await createProviders({
  network: {
    // Other network config...
    proofServerUrl: 'http://localhost:6300'
  },
  wallet
});
```

### Proof Server Provider

```typescript
import { ProofServerProvider } from '@midnight-ntwrk/midnight-js';

// Create proof provider
const proofProvider = new ProofServerProvider({
  url: 'http://localhost:6300',
  timeout: 60000,  // 60 second timeout
  retries: 3
});

// Generate proof
const proof = await proofProvider.prove({
  circuit: compiledCircuit,
  witness: witnessData,
  publicInputs: inputs
});

// Verify proof
const isValid = await proofProvider.verify({
  circuit: compiledCircuit,
  proof: proof,
  publicInputs: inputs
});
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

function useProofServer(url: string) {
  const [status, setStatus] = useState<'idle' | 'proving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${url}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }, [url]);

  const generateProof = useCallback(async (
    circuit: string,
    witness: string
  ) => {
    setStatus('proving');
    setError(null);

    try {
      const response = await fetch(`${url}/prove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit, witness })
      });

      if (!response.ok) {
        throw new Error(`Proof generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setStatus('idle');
      return result;
    } catch (e) {
      setError(e.message);
      setStatus('error');
      throw e;
    }
  }, [url]);

  return { status, error, checkHealth, generateProof };
}
```

## Performance Optimization

### Resource Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 1 GB | 10 GB (with caching) |

### Optimization Tips

```bash
# 1. Increase worker threads for parallel proving
docker run -d \
  -e PROOF_SERVER_WORKERS=8 \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server --workers 8

# 2. Enable proof caching
docker run -d \
  -v proof-cache:/data \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server --data-dir /data

# 3. Use SSD storage for faster I/O
# Mount fast storage for data directory

# 4. Pin to specific CPU cores (Linux)
docker run -d \
  --cpuset-cpus="0-3" \
  midnightnetwork/proof-server:latest
```

### Proof Generation Timeouts

```typescript
// Configure appropriate timeouts based on circuit complexity
const proofProvider = new ProofServerProvider({
  url: 'http://localhost:6300',
  timeout: 120000,  // 2 minutes for complex circuits
});
```

## Monitoring

### Docker Logs

```bash
# View logs
docker logs -f midnight-proof-server

# Filter by level
docker logs midnight-proof-server 2>&1 | grep -i error
```

### Health Monitoring Script

```bash
#!/bin/bash
# monitor-proof-server.sh

PROOF_SERVER_URL="${PROOF_SERVER_URL:-http://localhost:6300}"
CHECK_INTERVAL=30

while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$PROOF_SERVER_URL/health")

  if [ "$response" = "200" ]; then
    echo "$(date): Proof server healthy"
  else
    echo "$(date): Proof server unhealthy (HTTP $response)"
    # Send alert, restart container, etc.
  fi

  sleep $CHECK_INTERVAL
done
```

### Prometheus Metrics (if available)

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'proof-server'
    static_configs:
      - targets: ['localhost:6300']
    metrics_path: '/metrics'
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection refused | Server not running | Start Docker container |
| Timeout | Complex circuit | Increase timeout, add resources |
| Out of memory | Large witness | Increase container memory |
| Proof invalid | Version mismatch | Update proof server version |

### Debug Commands

```bash
# Check if container is running
docker ps | grep proof-server

# Check container resource usage
docker stats midnight-proof-server

# Inspect container
docker inspect midnight-proof-server

# Check for OOM kills
docker events --filter container=midnight-proof-server

# Enter container for debugging
docker exec -it midnight-proof-server /bin/sh
```

### Error Recovery

```typescript
async function proveWithRetry(
  proofProvider: ProofServerProvider,
  circuit: Circuit,
  witness: Witness,
  maxRetries = 3
): Promise<Proof> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await proofProvider.prove({ circuit, witness });
    } catch (error) {
      lastError = error;
      console.warn(`Proof attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(`Proof generation failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

## Security Considerations

### Network Access

```bash
# Only allow local access (development)
docker run -p 127.0.0.1:6300:6300 ...

# For production, use reverse proxy with auth
# Never expose proof server directly to internet
```

### Secrets Management

```bash
# Don't include secrets in proof server config
# Proof server doesn't need wallet keys
# It only processes circuit/witness data
```

## Related Skills

- [contract-deployment](../contract-deployment/SKILL.md) - Using proofs in deployment
- [network-configuration](../network-configuration/SKILL.md) - Network setup
- [troubleshooting](../troubleshooting/SKILL.md) - General troubleshooting

## References

- [Midnight Documentation](https://docs.midnight.network)
- [Docker Hub - Proof Server](https://hub.docker.com/r/midnightnetwork/proof-server)
