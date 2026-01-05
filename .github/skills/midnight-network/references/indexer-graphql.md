# Midnight Indexer GraphQL

Query blockchain state using the Midnight Indexer GraphQL API.

## Endpoint

```text
https://indexer.testnet-02.midnight.network/api/v1/graphql
wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
```

## Common Queries

### Get Contract State

```graphql
query GetContractState($address: String!) {
  contractState(address: $address) {
    address
    state
    blockHeight
  }
}
```

### Get Transaction

```graphql
query GetTransaction($txId: String!) {
  transaction(id: $txId) {
    id
    blockHeight
    blockHash
    status
    timestamp
  }
}
```

### Get Block Info

```graphql
query GetBlock($height: Int!) {
  block(height: $height) {
    height
    hash
    timestamp
    transactions {
      id
      status
    }
  }
}
```

### Latest Block

```graphql
query LatestBlock {
  latestBlock {
    height
    hash
    timestamp
  }
}
```

## TypeScript Client

```typescript
async function queryIndexer<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch('https://indexer.testnet-02.midnight.network/api/v1/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data as T;
}

// Usage
const { contractState } = await queryIndexer<{ contractState: ContractState }>(
  `query GetContract($address: String!) {
    contractState(address: $address) {
      address
      state
      blockHeight
    }
  }`,
  { address: '0x...' }
);
```

## WebSocket Subscriptions

```typescript
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
});

// Subscribe to contract state changes
const unsubscribe = client.subscribe(
  {
    query: `subscription WatchContract($address: String!) {
      contractStateChanged(address: $address) {
        address
        state
        blockHeight
      }
    }`,
    variables: { address: '0x...' },
  },
  {
    next: (data) => {
      console.log('State updated:', data);
    },
    error: (err) => {
      console.error('Subscription error:', err);
    },
    complete: () => {
      console.log('Subscription complete');
    },
  }
);

// Later: unsubscribe()
```

## Using with Midnight.js

```typescript
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

const publicDataProvider = indexerPublicDataProvider(
  'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws'
);

// Get contract state
const state = await publicDataProvider.contractState(contractAddress);

// Watch for changes
const subscription = publicDataProvider.watchContractState(contractAddress, (newState) => {
  console.log('State changed:', newState);
});

// Cleanup
subscription.unsubscribe();
```

## Error Handling

```typescript
async function safeQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  try {
    return await queryIndexer<T>(query, variables);
  } catch (error) {
    if (error.message.includes('not found')) {
      return null;
    }
    if (error.message.includes('rate limit')) {
      // Wait and retry
      await new Promise((r) => setTimeout(r, 1000));
      return await queryIndexer<T>(query, variables);
    }
    throw error;
  }
}
```

## Pagination

```graphql
query GetTransactions($first: Int!, $after: String) {
  transactions(first: $first, after: $after) {
    edges {
      node {
        id
        blockHeight
        status
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

```typescript
async function getAllTransactions() {
  const transactions = [];
  let cursor = null;

  do {
    const result = await queryIndexer<TransactionsResult>(TRANSACTIONS_QUERY, {
      first: 100,
      after: cursor,
    });

    transactions.push(...result.transactions.edges.map((e) => e.node));
    cursor = result.transactions.pageInfo.hasNextPage
      ? result.transactions.pageInfo.endCursor
      : null;
  } while (cursor);

  return transactions;
}
```

## Best Practices

1. **Use variables** - Don't interpolate strings into queries
2. **Handle errors** - Check for GraphQL errors in response
3. **Paginate** - Use cursor-based pagination for large results
4. **Cache** - Cache frequently-accessed data
5. **Subscriptions** - Use WebSocket for real-time updates
6. **Cleanup** - Always unsubscribe when done
