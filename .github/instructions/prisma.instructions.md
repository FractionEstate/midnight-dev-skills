---
description: Prisma ORM development guidelines
name: Prisma Database
applyTo: '**/prisma/**,**/lib/prisma.ts,**/lib/db.ts'
---

# Prisma Instructions

## Schema Conventions

### Model Naming

- Use PascalCase for models
- Use camelCase for fields
- Prefix relations with the related model name

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### ID Strategy

- Use `cuid()` or `uuid()` for IDs
- Avoid autoincrement in distributed systems

### Indexes

```prisma
model Post {
  id       String @id
  authorId String

  @@index([authorId])
  @@index([createdAt(sort: Desc)])
}
```

## Client Setup (Next.js)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## Query Patterns

### Select vs Include

```typescript
// Select specific fields (smaller payload)
const users = await prisma.user.findMany({
  select: { id: true, name: true },
});

// Include relations
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

### Pagination

```typescript
const [items, total] = await Promise.all([
  prisma.post.findMany({
    take: 10,
    skip: (page - 1) * 10,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.post.count(),
]);
```

### Transactions

```typescript
// Sequential
const [user, posts] = await prisma.$transaction([
  prisma.user.findUnique({ where: { id } }),
  prisma.post.findMany({ where: { authorId: id } })
]);

// Interactive
await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({ ... });
  if (user.balance < 0) throw new Error('Insufficient funds');
  await tx.transaction.create({ ... });
});
```

## Migrations

```bash
# Development
npx prisma migrate dev --name feature_name

# Production
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## Best Practices

1. **Use singleton** - Prevent connection exhaustion in Next.js
2. **Index foreign keys** - Always index relationship fields
3. **Select fields** - Avoid over-fetching with select
4. **Soft deletes** - Add deletedAt for important data
5. **Use transactions** - For related operations
6. **Validate early** - Use Zod before Prisma calls
