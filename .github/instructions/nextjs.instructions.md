---
description: Next.js App Router development guidelines
name: Next.js Development
applyTo: "**/app/**/*.{ts,tsx},**/next.config.{js,mjs,ts}"
---

# Next.js App Router Instructions

## File Conventions

### Route Files

- `page.tsx` - Route UI (required for route to be accessible)
- `layout.tsx` - Shared layout (wraps children)
- `loading.tsx` - Loading UI with Suspense
- `error.tsx` - Error boundary (must be 'use client')
- `not-found.tsx` - 404 UI
- `route.ts` - API endpoint (cannot coexist with page.tsx)

### Special Files

- `middleware.ts` - Request middleware (root only)
- `instrumentation.ts` - Monitoring hooks
- `globals.css` - Global styles

## Component Types

### Server Components (default)

```tsx
// Direct data fetching
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components

```tsx
'use client';

import { useState } from 'react';

export default function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Data Fetching

### Caching Strategies

```tsx
// IMPORTANT: fetch is NOT cached by default in Next.js 15+
// Default behavior: fetched on every request (auto no-cache)
fetch('https://api.example.com/data');

// Explicitly cache the response
fetch('https://api.example.com/data', { cache: 'force-cache' });

// Revalidate every 60 seconds (cached with time-based revalidation)
fetch('https://api.example.com/data', { next: { revalidate: 60 } });

// Explicitly no cache (same as default, useful for clarity)
fetch('https://api.example.com/data', { cache: 'no-store' });

// With tags for on-demand revalidation
fetch('https://api.example.com/posts', { next: { tags: ['posts'] } });

// Combine tags with time-based revalidation
fetch('https://api.example.com/data', {
  next: { tags: ['collection'], revalidate: 3600 }
});
```

### Revalidation

```tsx
import { revalidatePath, revalidateTag, updateTag } from 'next/cache';

// In Server Action
revalidatePath('/posts');     // Purges Full Route Cache for path
revalidateTag('posts');       // Invalidates Data Cache entries with tag
updateTag('posts');           // Updates tag timestamp (lighter operation)
```

## Server Actions

```tsx
'use server';

import { redirect } from 'next/navigation';

export async function createItem(formData: FormData) {
  const data = Object.fromEntries(formData);
  await db.item.create({ data });
  revalidatePath('/items');
  redirect('/items');
}
```

## Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## Metadata

```tsx
// Static
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};

// Dynamic
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

## Best Practices

1. **Default to Server Components** - Only use 'use client' when needed
2. **Keep client components small** - Lift state up, push interactivity down
3. **Colocate data fetching** - Fetch where data is used
4. **Use Suspense for streaming** - Progressive loading
5. **Validate with Zod** - Type-safe form handling
6. **Use Route Groups** - Organize without affecting URL

## Performance

- Use `next/image` for optimized images
- Use `next/font` for font optimization
- Implement loading.tsx for better UX
- Use `generateStaticParams` for static generation
- Leverage ISR with revalidate option

## Development & Debugging (16.1+)

```bash
# Debug with Node.js inspector
next dev --inspect

# Analyze bundle sizes (experimental)
next experimental-analyze

# Upgrade Next.js
next upgrade
```

## Turbopack (Default in Dev)

File system caching is now stable and enabled by default for `next dev`:

- Compiler artifacts cached on disk
- ~5-14× faster restarts on large projects
- `serverExternalPackages` now handles transitive dependencies automatically

## MCP Server (16.1+ Coding Agents)

Next.js 16+ includes built-in MCP support at `/_next/mcp` for AI coding agents:

```json
// .mcp.json at project root
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

### Available MCP Tools

- `get_errors` - Retrieve build/runtime/type errors from dev server
- `get_logs` - Get path to dev log file (browser console + server output)
- `get_page_metadata` - Query page routes, components, rendering info
- `get_project_metadata` - Get project structure, config, dev server URL
- `get_server_action_by_id` - Lookup Server Actions by ID

### Agent Capabilities

- Real-time error detection and diagnosis
- Live application state queries
- Page/layout structure analysis
- Server Actions inspection
- Next.js knowledge base queries
- Migration helpers with codemods
- Playwright MCP integration for browser testing
