---
name: midnight-indexer-graphql
description: Query and subscribe to Midnight blockchain data using the GraphQL Indexer API. Covers queries for blocks, transactions, contract actions, wallet data, and real-time subscriptions for live updates.
---

# Midnight Indexer GraphQL API

The Midnight Indexer provides a GraphQL API for querying blockchain data and subscribing to real-time updates. Essential for building dApps that need to read chain state, track transactions, and monitor contract activity.

## When to Use

- Querying blocks, transactions, and contract state
- Subscribing to real-time blockchain events
- Building block explorers or analytics dashboards
- Monitoring wallet activity and balances
- Tracking contract deployments and interactions

## Endpoints

### Testnet

| Type | URL |
|------|-----|
| GraphQL | `https://indexer.testnet-02.midnight.network/api/v1/graphql` |
| WebSocket | `wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws` |

## GraphQL Schema Overview

### Query Types

```graphql
type Query {
  # Block queries
  block(hash: String!): Block
  blockByHeight(height: Int!): Block
  blocks(first: Int, after: String): BlockConnection

  # Transaction queries
  transaction(hash: String!): Transaction
  transactions(first: Int, after: String): TransactionConnection

  # Contract queries
  contractAction(txHash: String!, index: Int!): ContractAction
  contractState(address: String!): ContractState

  # Wallet queries
  coins(publicKey: String!): [Coin!]!
}
```

### Subscription Types

```graphql
type Subscription {
  # New blocks
  blocks: Block!

  # Contract activity
  contractActions(address: String): ContractAction!

  # Wallet updates
  wallet(encryptionKey: String!): WalletUpdate!
}
```

## Common Queries

### Query Latest Blocks

```graphql
query GetLatestBlocks($count: Int!) {
  blocks(first: $count) {
    edges {
      node {
        hash
        height
        timestamp
        transactionCount
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Query Block by Height

```graphql
query GetBlockByHeight($height: Int!) {
  blockByHeight(height: $height) {
    hash
    height
    timestamp
    parentHash
    transactions {
      hash
      type
    }
  }
}
```

### Query Transaction Details

```graphql
query GetTransaction($hash: String!) {
  transaction(hash: $hash) {
    hash
    blockHeight
    blockHash
    type
    status
    inputs {
      type
      value
    }
    outputs {
      type
      value
      recipient
    }
    contractCalls {
      address
      entryPoint
    }
  }
}
```

### Query Contract State

```graphql
query GetContractState($address: String!) {
  contractState(address: $address) {
    address
    data
    codeHash
    deploymentTxHash
    lastUpdateHeight
  }
}
```

### Query Wallet Coins

```graphql
query GetWalletCoins($publicKey: String!) {
  coins(publicKey: $publicKey) {
    commitment
    value
    tokenType
    status
  }
}
```

## Subscriptions

### Subscribe to New Blocks

```typescript
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
});

const unsubscribe = client.subscribe(
  {
    query: `
      subscription OnNewBlock {
        blocks {
          hash
          height
          timestamp
          transactionCount
        }
      }
    `,
  },
  {
    next: (data) => {
      console.log('New block:', data.data?.blocks);
    },
    error: (error) => {
      console.error('Subscription error:', error);
    },
    complete: () => {
      console.log('Subscription completed');
    },
  }
);

// Later: unsubscribe()
```

### Subscribe to Contract Actions

```typescript
const contractAddress = '0x...';

client.subscribe(
  {
    query: `
      subscription OnContractAction($address: String!) {
        contractActions(address: $address) {
          txHash
          index
          entryPoint
          inputs
          outputs
          blockHeight
        }
      }
    `,
    variables: { address: contractAddress },
  },
  {
    next: (data) => {
      console.log('Contract action:', data.data?.contractActions);
    },
    error: console.error,
    complete: () => console.log('Done'),
  }
);
```

### Subscribe to Wallet Updates

```typescript
const encryptionKey = 'your-encryption-public-key';

client.subscribe(
  {
    query: `
      subscription OnWalletUpdate($key: String!) {
        wallet(encryptionKey: $key) {
          type
          coin {
            commitment
            value
            tokenType
          }
          transaction {
            hash
            status
          }
        }
      }
    `,
    variables: { key: encryptionKey },
  },
  {
    next: (data) => {
      const update = data.data?.wallet;
      if (update?.type === 'NEW_COIN') {
        console.log('Received coin:', update.coin);
      } else if (update?.type === 'SPENT_COIN') {
        console.log('Spent coin:', update.coin);
      }
    },
    error: console.error,
    complete: () => console.log('Done'),
  }
);
```

## Using with Midnight.js

The `indexerPublicDataProvider` wraps the GraphQL API:

```typescript
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

const publicDataProvider = indexerPublicDataProvider(
  'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws'
);

// Query contract state
const state = await publicDataProvider.queryContractState(contractAddress);
console.log('Contract data:', state?.data);

// Subscribe to updates
publicDataProvider.contractStateUpdates(contractAddress).subscribe(update => {
  console.log('State updated:', update);
});
```

## TypeScript Client Setup

### Using graphql-request

```typescript
import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient(
  'https://indexer.testnet-02.midnight.network/api/v1/graphql'
);

// Query
const query = gql`
  query GetBlock($height: Int!) {
    blockByHeight(height: $height) {
      hash
      height
      timestamp
    }
  }
`;

const data = await client.request(query, { height: 12345 });
console.log(data);
```

### Using Apollo Client

```typescript
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

## Pagination

The API uses cursor-based pagination:

```typescript
async function getAllBlocks(client: GraphQLClient) {
  const allBlocks: Block[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const response = await client.request<BlocksResponse>(
      gql`
        query GetBlocks($after: String) {
          blocks(first: 100, after: $after) {
            edges {
              node {
                hash
                height
                timestamp
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      { after: cursor }
    );

    allBlocks.push(...response.blocks.edges.map(e => e.node));
    hasMore = response.blocks.pageInfo.hasNextPage;
    cursor = response.blocks.pageInfo.endCursor;
  }

  return allBlocks;
}
```

## Error Handling

```typescript
import { ClientError } from 'graphql-request';

try {
  const data = await client.request(query, variables);
} catch (error) {
  if (error instanceof ClientError) {
    console.error('GraphQL errors:', error.response.errors);
    console.error('Status:', error.response.status);
  } else {
    console.error('Network error:', error);
  }
}
```

## Best Practices

1. **Use subscriptions for real-time updates** instead of polling
2. **Paginate large result sets** to avoid timeouts
3. **Cache query results** when appropriate
4. **Handle WebSocket reconnection** gracefully
5. **Use specific field selections** to reduce payload size

## Related Skills

- [midnight-js-providers](../midnight-js-providers/SKILL.md) - Provider patterns
- [contract-interaction](../contract-interaction/SKILL.md) - Contract queries
- [wallet-sdk-integration](../wallet-sdk-integration/SKILL.md) - Wallet data

## References

- [Midnight Indexer API](https://docs.midnight.network/develop/reference/midnight-api/midnight-indexer)
- [GraphQL Documentation](https://graphql.org/learn/)
