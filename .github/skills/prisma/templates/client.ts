// Prisma Client Singleton
// Location: lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// ============================================
// Development Singleton Pattern
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// ============================================
// Extended Client with Extensions
// ============================================

/*
import { PrismaClient } from '@prisma/client';

// Soft delete extension
const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async softDelete<T>(this: T, id: string) {
        const context = Prisma.getExtensionContext(this);
        return (context as any).update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      },
    },
  },
});

// Logging extension
const loggingExtension = Prisma.defineExtension({
  name: 'logging',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        console.log(`${model}.${operation} took ${end - start}ms`);
        return result;
      },
    },
  },
});

// Extended client
export const prisma = new PrismaClient()
  .$extends(softDeleteExtension)
  .$extends(loggingExtension);
*/

// ============================================
// Edge Runtime Compatible (Prisma Accelerate)
// ============================================

/*
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient().$extends(withAccelerate());

// Usage with caching
const users = await prisma.user.findMany({
  cacheStrategy: { ttl: 60 }, // Cache for 60 seconds
});
*/
