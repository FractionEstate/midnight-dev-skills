# Next.js Data Fetching

## Next.js Caching Architecture

Next.js has 4 caching mechanisms working together:

| Mechanism | Location | Purpose | Duration |
|-----------|----------|---------|----------|
| Request Memoization | Server | Dedupe same-request fetches | Per request |
| Data Cache | Server | Persist fetch results | Persistent (revalidatable) |
| Full Route Cache | Server | Cache rendered HTML/RSC | Persistent (revalidatable) |
| Router Cache | Client | Cache RSC payloads | Session (or revalidate) |

## Server Component Data Fetching

### Direct Database Access

```tsx
// app/posts/page.tsx
import { prisma } from '@/lib/prisma';

export default async function PostsPage() {
  // Direct database call - runs on server only
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <span>By {post.author.name}</span>
        </li>
      ))}
    </ul>
  );
}
```

### Fetch with Caching

```tsx
// IMPORTANT: fetch is NOT cached by default in Next.js 15+
// Use 'force-cache' to explicitly opt into caching
const cachedData = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});

// Default behavior (auto no-cache) - fetched on every request
// Data is NOT cached unless you specify cache options
const dynamicData = await fetch('https://api.example.com/data');

// Explicitly disable caching (same as default, but explicit)
const uncachedData = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});

// Revalidate every 60 seconds (ISR)
const revalidatedData = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
});

// Cache with tags for on-demand revalidation
const taggedData = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
});

// Combine tags with revalidation
const data = await fetch('https://api.example.com/data', {
  next: {
    tags: ['collection'],
    revalidate: 3600
  }
});
```

### Dynamic APIs That Opt Out of Caching

Using these APIs makes the route dynamic (uncached):

```tsx
import { cookies, headers } from 'next/headers';

export default async function Page() {
  // These opt out of static rendering/caching
  const cookieStore = await cookies();
  const headersList = await headers();

  // searchParams also opts out
  // export default function Page({ searchParams }) { ... }
}
```

## Caching & Revalidation

### Time-Based Revalidation

```tsx
// Page-level revalidation
export const revalidate = 60; // seconds

export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### On-Demand Revalidation

```tsx
// app/actions.ts
'use server';

import { revalidatePath, revalidateTag, updateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.post.create({ ... });

  // Revalidate specific path - purges Full Route Cache
  revalidatePath('/posts');

  // Revalidate by tag - invalidates ALL fetch requests with this tag
  revalidateTag('posts');
}

export async function updatePost(id: string, formData: FormData) {
  await db.post.update({ where: { id }, ... });

  // updateTag - updates the tag timestamp without full revalidation
  // More efficient for large-scale cache updates
  updateTag('posts');
}

// Tag your fetch requests for granular revalidation
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog', {
    next: { tags: ['posts'] },
  });
  const posts = await data.json();
  // When createPost() calls revalidateTag('posts'),
  // this data will be refetched
}
```

### Revalidation APIs

| API | Purpose |
|-----|---------|
| `revalidatePath(path)` | Purges route from Full Route Cache |
| `revalidateTag(tag)` | Invalidates Data Cache entries with tag |
| `updateTag(tag)` | Updates tag timestamp (lighter than revalidateTag) |

### Route Segment Config

```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Force static rendering
export const dynamic = 'force-static';

// Control runtime
export const runtime = 'edge'; // or 'nodejs'

// Revalidation period
export const revalidate = 3600;
```

## Parallel Data Fetching

```tsx
export default async function Page() {
  // Sequential (slow) ❌
  const user = await getUser();
  const posts = await getPosts();

  // Parallel (fast) ✅
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts()
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
    </div>
  );
}
```

## Streaming with Suspense

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Shows loading while fetching */}
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowComponent />
      </Suspense>

      {/* Multiple independent streams */}
      <Suspense fallback={<ChartSkeleton />}>
        <Analytics />
      </Suspense>
    </div>
  );
}

// Async Server Component
async function SlowComponent() {
  const data = await slowFetch(); // 3 seconds
  return <div>{data}</div>;
}
```

## Loading UI

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

## Error Handling

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Client-Side Data Fetching

For client-side fetching (mutations, real-time), use React Query or SWR:

```tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return <div>{data.name}</div>;
}
```
