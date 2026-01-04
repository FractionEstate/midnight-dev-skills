# Next.js Middleware Reference

Middleware runs before requests are completed, enabling authentication, redirects, rewrites, and header manipulation.

## Basic Structure

```typescript
// middleware.ts (root of project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Your logic here
  return NextResponse.next();
}

// Matching paths
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Common Patterns

### Authentication

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/settings', '/api/protected'];
const authPages = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if path is protected
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPage = authPages.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
```

### Internationalization

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'es', 'fr', 'de'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // Check cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferred)) {
      return preferred;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname has locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!hasLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
```

### Rate Limiting

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (use Redis in production)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const current = rateLimit.get(ip);

  if (!current || current.timestamp < windowStart) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return NextResponse.next();
  }

  if (current.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  current.count++;
  return NextResponse.next();
}
```

### Adding Headers

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers for API
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  }

  // Request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  return response;
}
```

### Rewrites (A/B Testing)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A/B test for homepage
  if (pathname === '/') {
    const bucket = request.cookies.get('ab-bucket')?.value;
    const variant = bucket || (Math.random() < 0.5 ? 'a' : 'b');

    const response = NextResponse.rewrite(
      new URL(`/home-${variant}`, request.url)
    );

    // Set cookie if not present
    if (!bucket) {
      response.cookies.set('ab-bucket', variant, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  }

  return NextResponse.next();
}
```

## Matcher Patterns

```typescript
export const config = {
  matcher: [
    // Match single path
    '/about',

    // Match path with params
    '/blog/:path*',

    // Match API routes
    '/api/:path*',

    // Exclude static files
    '/((?!_next/static|_next/image|favicon.ico).*)',

    // Match specific methods (advanced)
    {
      source: '/api/:path*',
      has: [{ type: 'header', key: 'authorization' }],
    },
  ],
};
```

## Best Practices

1. **Keep it fast** - Middleware runs on every request
2. **Use Edge Runtime** - Middleware runs at the edge
3. **No Node.js APIs** - Limited to Web APIs
4. **Cache when possible** - Use response caching headers
5. **Log sparingly** - Excessive logging impacts performance
