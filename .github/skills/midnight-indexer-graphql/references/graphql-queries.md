# Midnight Indexer GraphQL Queries Reference

## Block Queries

### Get Block by Hash
```graphql
query GetBlockByHash($hash: String!) {
  block(hash: $hash) {
    hash
    height
    timestamp
    parentHash
    stateRoot
    transactionRoot
    transactionCount
    transactions {
      hash
      type
      status
    }
  }
}
```

### Get Block by Height
```graphql
query GetBlockByHeight($height: Int!) {
  blockByHeight(height: $height) {
    hash
    height
    timestamp
    parentHash
    transactionCount
  }
}
```

### Get Latest Blocks (Paginated)
```graphql
query GetLatestBlocks($first: Int!, $after: String) {
  blocks(first: $first, after: $after) {
    edges {
      node {
        hash
        height
        timestamp
        transactionCount
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

### Get Chain Info
```graphql
query GetChainInfo {
  chainInfo {
    latestBlockHeight
    latestBlockHash
    networkId
    syncStatus {
      isSynced
      currentHeight
      targetHeight
    }
  }
}
```

---

## Transaction Queries

### Get Transaction by Hash
```graphql
query GetTransaction($hash: String!) {
  transaction(hash: $hash) {
    hash
    blockHeight
    blockHash
    type
    status
    timestamp
    fee
    inputs {
      index
      type
      nullifier
      value
    }
    outputs {
      index
      type
      commitment
      value
      recipient
    }
    contractCalls {
      address
      entryPoint
      inputData
    }
  }
}
```

### Get Transactions (Paginated)
```graphql
query GetTransactions($first: Int!, $after: String) {
  transactions(first: $first, after: $after) {
    edges {
      node {
        hash
        blockHeight
        type
        status
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
```

### Get Transactions by Block
```graphql
query GetBlockTransactions($blockHeight: Int!) {
  blockByHeight(height: $blockHeight) {
    hash
    height
    transactions {
      hash
      type
      status
      contractCalls {
        address
        entryPoint
      }
    }
  }
}
```

---

## Contract Queries

### Get Contract State
```graphql
query GetContractState($address: String!) {
  contractState(address: $address) {
    address
    data
    codeHash
    deploymentTxHash
    deploymentBlockHeight
    lastUpdateTxHash
    lastUpdateBlockHeight
  }
}
```

### Get Contract Action
```graphql
query GetContractAction($txHash: String!, $index: Int!) {
  contractAction(txHash: $txHash, index: $index) {
    txHash
    index
    contractAddress
    entryPoint
    inputs
    outputs
    blockHeight
    timestamp
  }
}
```

### Get Contract Actions by Address
```graphql
query GetContractActions($address: String!, $first: Int!, $after: String) {
  contractActions(address: $address, first: $first, after: $after) {
    edges {
      node {
        txHash
        index
        entryPoint
        blockHeight
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
```

### Get Contract Deployment
```graphql
query GetContractDeployment($address: String!) {
  contractState(address: $address) {
    address
    deploymentTxHash
    deploymentBlockHeight
    codeHash
  }
}
```

---

## Wallet/Coin Queries

### Get Coins by Public Key
```graphql
query GetCoins($publicKey: String!) {
  coins(publicKey: $publicKey) {
    commitment
    value
    tokenType
    status
    createdTxHash
    createdBlockHeight
    spentTxHash
    spentBlockHeight
  }
}
```

### Get Unspent Coins
```graphql
query GetUnspentCoins($publicKey: String!) {
  coins(publicKey: $publicKey, status: UNSPENT) {
    commitment
    value
    tokenType
  }
}
```

### Get Coin by Commitment
```graphql
query GetCoin($commitment: String!) {
  coin(commitment: $commitment) {
    commitment
    value
    tokenType
    status
    createdTxHash
    spentTxHash
  }
}
```

---

## Subscription Queries

### Subscribe to New Blocks
```graphql
subscription OnNewBlock {
  blocks {
    hash
    height
    timestamp
    transactionCount
    parentHash
  }
}
```

### Subscribe to Contract Actions
```graphql
subscription OnContractAction($address: String) {
  contractActions(address: $address) {
    txHash
    index
    contractAddress
    entryPoint
    inputs
    outputs
    blockHeight
    timestamp
  }
}
```

### Subscribe to Wallet Updates
```graphql
subscription OnWalletUpdate($encryptionKey: String!) {
  wallet(encryptionKey: $encryptionKey) {
    type
    coin {
      commitment
      value
      tokenType
      status
    }
    transaction {
      hash
      status
      blockHeight
    }
  }
}
```

### Subscribe to Transaction Confirmations
```graphql
subscription OnTransactionConfirmation($txHash: String!) {
  transactionConfirmation(hash: $txHash) {
    hash
    status
    confirmations
    blockHeight
    blockHash
  }
}
```

---

## Mutations

### Connect Wallet (for subscriptions)
```graphql
mutation ConnectWallet($encryptionKey: String!) {
  connect(encryptionKey: $encryptionKey) {
    sessionId
    status
  }
}
```

### Disconnect Wallet
```graphql
mutation DisconnectWallet($sessionId: String!) {
  disconnect(sessionId: $sessionId) {
    status
  }
}
```

---

## Variables Examples

### Block Query Variables
```json
{
  "hash": "0x1234567890abcdef...",
  "height": 12345,
  "first": 10,
  "after": "cursor123"
}
```

### Transaction Query Variables
```json
{
  "hash": "0xabcdef1234567890...",
  "first": 25,
  "after": null
}
```

### Contract Query Variables
```json
{
  "address": "contract_address_here",
  "txHash": "0x...",
  "index": 0,
  "first": 50
}
```

### Wallet Query Variables
```json
{
  "publicKey": "064e092a80b33bee...",
  "encryptionKey": "0300063c7753854aea...",
  "status": "UNSPENT"
}
```
