# Next.js Layout Template

Root layout with metadata, fonts, and accessible structure.

## Location

`app/layout.tsx`

## Template

```tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App',
  },
  description: 'A modern Next.js application',
  metadataBase: new URL('https://example.com'),
  openGraph: {
    title: 'My App',
    description: 'A modern Next.js application',
    url: 'https://example.com',
    siteName: 'My App',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Skip to content
        </a>

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <nav className="container flex h-14 items-center">
            {/* Navigation content */}
          </nav>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} My App. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

## Key Features

| Feature | Description |
|---------|-------------|
| `Metadata` | SEO and social sharing |
| `Viewport` | Responsive and theme colors |
| Font loading | Next.js optimized fonts |
| Skip link | Accessibility navigation |
| Layout structure | Header, main, footer |

## Usage Notes

1. **Single Root Layout**: Only one root layout per app
2. **Nested Layouts**: Create `layout.tsx` in route folders
3. **Metadata Inheritance**: Child layouts inherit and override
4. **No Client State**: Root layout is always a Server Component
