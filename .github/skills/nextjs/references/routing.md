# Next.js Routing Patterns

## File-System Routing

```
app/
├── page.tsx                    # /
├── about/page.tsx              # /about
├── blog/
│   ├── page.tsx                # /blog
│   └── [slug]/page.tsx         # /blog/:slug
├── shop/
│   └── [...slug]/page.tsx      # /shop/* (catch-all)
└── (marketing)/                # Route group (no URL segment)
    ├── layout.tsx
    └── pricing/page.tsx        # /pricing
```

## Dynamic Routes

### Single Parameter

```tsx
// app/blog/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}

// Static generation at build time
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}
```

### Multiple Parameters

```tsx
// app/products/[category]/[product]/page.tsx
interface Props {
  params: Promise<{ category: string; product: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { category, product } = await params;
  // ...
}

export function generateStaticParams() {
  return [
    { category: 'electronics', product: 'phone' },
    { category: 'clothing', product: 'shirt' },
  ];
}
```

### Catch-All Routes

```tsx
// app/docs/[...slug]/page.tsx
interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // /docs/getting-started/installation -> slug = ['getting-started', 'installation']
}

export function generateStaticParams() {
  return [
    { slug: ['getting-started'] },
    { slug: ['getting-started', 'installation'] },
    { slug: ['api', 'reference'] },
  ];
}
```

### Optional Catch-All Routes

```tsx
// app/docs/[[...slug]]/page.tsx
interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // /docs -> slug = undefined
  // /docs/a/b -> slug = ['a', 'b']
}
```

## Parallel Routes

```
app/
├── layout.tsx
├── page.tsx
├── @modal/
│   ├── default.tsx
│   └── (.)photo/[id]/page.tsx   # Intercepted route
└── @sidebar/
    └── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
  sidebar
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside>{sidebar}</aside>
      <main>{children}</main>
      {modal}
    </div>
  );
}
```

## Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') ?? '1';

  const users = await db.user.findMany({
    skip: (parseInt(page) - 1) * 10,
    take: 10
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check auth
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};
```

## Navigation

```tsx
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Declarative navigation
<Link href="/about">About</Link>
<Link href={{ pathname: '/blog', query: { page: '2' } }}>Blog</Link>

// Programmatic navigation (Client Component)
'use client';
const router = useRouter();
router.push('/dashboard');
router.replace('/login');
router.back();
router.refresh(); // Revalidate current route

// Get current path
const pathname = usePathname(); // '/blog/hello'
const searchParams = useSearchParams(); // URLSearchParams
```
