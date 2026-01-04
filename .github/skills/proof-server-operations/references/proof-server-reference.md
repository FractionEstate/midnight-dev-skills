# Proof Server Reference

Complete reference for Midnight proof server operations.

## Docker Commands Cheat Sheet

### Lifecycle Management

```bash
# Pull image
docker pull midnightnetwork/proof-server:latest
docker pull midnightnetwork/proof-server:v1.0.0  # Specific version

# Start
docker run -d --name proof-server -p 6300:6300 \
  midnightnetwork/proof-server:latest \
  -- midnight-proof-server --network testnet

# Stop
docker stop proof-server

# Start existing container
docker start proof-server

# Restart
docker restart proof-server

# Remove
docker rm proof-server
docker rm -f proof-server  # Force remove running

# View logs
docker logs proof-server
docker logs -f proof-server  # Follow
docker logs --tail 100 proof-server  # Last 100 lines

# Execute command in container
docker exec -it proof-server /bin/sh
```

### Resource Management

```bash
# View resource usage
docker stats proof-server

# Update resources
docker update --memory 8g --cpus 4 proof-server

# View container details
docker inspect proof-server
```

## Docker Compose Configurations

### Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  proof-server:
    image: midnightnetwork/proof-server:latest
    ports:
      - "6300:6300"
    environment:
      - RUST_LOG=debug
    command: >
      -- midnight-proof-server
      --network testnet
```

### Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  proof-server:
    image: midnightnetwork/proof-server:latest
    restart: always
    ports:
      - "127.0.0.1:6300:6300"
    volumes:
      - proof-data:/data
    environment:
      - RUST_LOG=info
    command: >
      -- midnight-proof-server
      --network testnet
      --data-dir /data
      --workers 4
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
        reservations:
          memory: 4G
          cpus: '2'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6300/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  proof-data:
```

### With Load Balancer

```yaml
# docker-compose.scaled.yml
version: '3.8'

services:
  proof-server:
    image: midnightnetwork/proof-server:latest
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 8G
          cpus: '4'
    environment:
      - RUST_LOG=info
    command: -- midnight-proof-server --network testnet

  nginx:
    image: nginx:latest
    ports:
      - "6300:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - proof-server
```

## API Reference

### Health Check

```
GET /health

Response 200:
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "workers": 4,
  "pending_proofs": 2
}

Response 503:
{
  "status": "unhealthy",
  "error": "Worker thread crashed"
}
```

### Generate Proof

```
POST /prove
Content-Type: application/json

Request:
{
  "circuit": "<base64 encoded circuit bytecode>",
  "witness": "<base64 encoded witness>",
  "public_inputs": [
    "<hex encoded input 1>",
    "<hex encoded input 2>"
  ]
}

Response 200:
{
  "proof": "<base64 encoded proof>",
  "public_outputs": [
    "<hex encoded output 1>",
    "<hex encoded output 2>"
  ],
  "generation_time_ms": 1500,
  "proof_size_bytes": 2048
}

Response 400:
{
  "error": "InvalidCircuit",
  "message": "Failed to parse circuit bytecode"
}

Response 500:
{
  "error": "ProofGenerationFailed",
  "message": "Witness does not satisfy circuit constraints"
}
```

### Verify Proof

```
POST /verify
Content-Type: application/json

Request:
{
  "circuit": "<base64 encoded circuit bytecode>",
  "proof": "<base64 encoded proof>",
  "public_inputs": [
    "<hex encoded input>"
  ]
}

Response 200:
{
  "valid": true,
  "verification_time_ms": 50
}

Response 200 (invalid proof):
{
  "valid": false,
  "reason": "Proof verification failed"
}
```

### Server Info

```
GET /info

Response 200:
{
  "version": "1.0.0",
  "network": "testnet",
  "supported_circuits": ["compact_v0.18"],
  "max_circuit_size": 1048576,
  "workers": 4
}
```

## TypeScript Client

```typescript
interface ProofServerConfig {
  url: string;
  timeout?: number;
  retries?: number;
}

class ProofServerClient {
  private config: ProofServerConfig;

  constructor(config: ProofServerConfig) {
    this.config = {
      timeout: 60000,
      retries: 3,
      ...config
    };
  }

  async health(): Promise<HealthResponse> {
    const response = await fetch(`${this.config.url}/health`);
    if (!response.ok) {
      throw new Error('Proof server unhealthy');
    }
    return response.json();
  }

  async prove(request: ProveRequest): Promise<ProveResponse> {
    const response = await fetch(`${this.config.url}/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout!)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Proof generation failed');
    }

    return response.json();
  }

  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const response = await fetch(`${this.config.url}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    return response.json();
  }
}

// Usage
const client = new ProofServerClient({
  url: 'http://localhost:6300',
  timeout: 120000
});

const health = await client.health();
console.log('Proof server status:', health.status);
```

## Error Codes

| Code | Error | Description | Solution |
|------|-------|-------------|----------|
| 400 | InvalidCircuit | Malformed circuit bytecode | Check compilation |
| 400 | InvalidWitness | Malformed witness data | Check witness format |
| 400 | InvalidPublicInputs | Wrong number/format of inputs | Verify inputs |
| 408 | Timeout | Proof took too long | Increase timeout |
| 500 | ConstraintError | Witness doesn't satisfy circuit | Fix witness data |
| 500 | MemoryError | Out of memory | Increase container memory |
| 503 | ServerOverloaded | Too many pending proofs | Retry later |

## Performance Tuning

### Circuit Complexity vs Time

| Circuit Constraints | Approx Time | Memory |
|---------------------|-------------|--------|
| < 10,000 | < 1s | 1 GB |
| 10,000 - 100,000 | 1-10s | 2 GB |
| 100,000 - 1,000,000 | 10-60s | 4 GB |
| > 1,000,000 | > 60s | 8+ GB |

### Optimization Checklist

- [ ] Use SSD storage for data directory
- [ ] Allocate sufficient RAM (8GB+ recommended)
- [ ] Use multiple CPU cores (4+ recommended)
- [ ] Enable proof caching for repeated circuits
- [ ] Set appropriate timeouts in client code
- [ ] Implement retry logic with backoff
- [ ] Monitor resource usage

## Monitoring Scripts

### Health Check Script

```bash
#!/bin/bash
# check-health.sh

URL="${PROOF_SERVER_URL:-http://localhost:6300}"

response=$(curl -s -w "\n%{http_code}" "$URL/health")
body=$(echo "$response" | head -n 1)
status=$(echo "$response" | tail -n 1)

if [ "$status" = "200" ]; then
  echo "✅ Proof server healthy"
  echo "$body" | jq .
  exit 0
else
  echo "❌ Proof server unhealthy (HTTP $status)"
  exit 1
fi
```

### Benchmark Script

```bash
#!/bin/bash
# benchmark.sh

URL="${PROOF_SERVER_URL:-http://localhost:6300}"
ITERATIONS=10

echo "Benchmarking proof server at $URL"
echo "Running $ITERATIONS iterations..."

total_time=0

for i in $(seq 1 $ITERATIONS); do
  start=$(date +%s%N)

  # Simple proof request (replace with actual circuit/witness)
  curl -s -X POST "$URL/prove" \
    -H "Content-Type: application/json" \
    -d '{"circuit":"...", "witness":"..."}' > /dev/null

  end=$(date +%s%N)
  duration=$(( (end - start) / 1000000 ))
  total_time=$((total_time + duration))

  echo "Iteration $i: ${duration}ms"
done

avg=$((total_time / ITERATIONS))
echo "Average: ${avg}ms"
```

## Troubleshooting Quick Reference

### Problem: Connection Refused

```bash
# Check if running
docker ps | grep proof-server

# If not running, check why it stopped
docker logs proof-server

# Restart
docker start proof-server
```

### Problem: Timeout

```bash
# Increase timeout in client
# Check proof server load
docker stats proof-server

# Add more resources
docker update --memory 16g --cpus 8 proof-server
```

### Problem: Out of Memory

```bash
# Check memory usage
docker stats proof-server

# Increase memory limit
docker update --memory 16g proof-server

# Or restart with more memory
docker rm -f proof-server
docker run -d --memory 16g ...
```

### Problem: Proof Invalid

```bash
# Check proof server version matches compiler
docker exec proof-server --version

# Recompile contract with matching version
compact --version
```
