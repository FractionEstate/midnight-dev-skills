---
description: Design a complete database schema with Prisma including relations, indexes, and queries
name: Design Database Schema
agent: Fullstack Developer
tools:
  - edit/editFiles
  - search
---

# Design Database Schema

Create a complete Prisma database schema for the specified domain.

## Input Variables

- **Domain**: ${input:domain:e-commerce}
- **Database Provider**: ${input:provider:postgresql}
- **Include Auth Tables**: ${input:includeAuth:yes}
- **Include Soft Delete**: ${input:softDelete:yes}
- **Include Audit Fields**: ${input:auditFields:yes}

## Requirements

1. **Schema Location**:

   ```
   prisma/schema.prisma
   # or for monorepo:
   packages/database/prisma/schema.prisma
   ```

2. **Generator Configuration**:

   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "${provider}"
     url      = env("DATABASE_URL")
   }
   ```

3. **Model Requirements**:
   - Use `cuid()` or `uuid()` for IDs
   - Include `createdAt` and `updatedAt` fields
   - Add `deletedAt` for soft delete (if enabled)
   - Proper field types and constraints
   - Enum types for fixed values

4. **Relations**:
   - One-to-one relations
   - One-to-many relations
   - Many-to-many relations (explicit or implicit)
   - Proper `onDelete` and `onUpdate` actions
   - Reference naming conventions

5. **Indexes**:
   - Primary keys (automatic)
   - Foreign key indexes
   - Composite indexes for common queries
   - Unique constraints where needed
   - Full-text search indexes (if needed)

6. **Auth Tables** (if included):
   - User model with email/password
   - Account model for OAuth
   - Session model
   - VerificationToken model
   - Compatible with NextAuth.js

7. **Documentation**:
   - Comment each model
   - Document complex relations
   - Note any constraints

## Example Models

```prisma
// User management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?

  // Relations
  accounts      Account[]
  sessions      Session[]
  posts         Post[]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // Soft delete

  @@index([email])
  @@index([role])
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

## Output

Provide:

1. Complete schema.prisma file
2. Migration commands
3. Seed file example
4. Common query patterns for each model
5. Type exports for TypeScript
