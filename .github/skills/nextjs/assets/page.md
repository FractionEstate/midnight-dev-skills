# Next.js Page Template

Server Component page with data fetching, metadata, and Suspense.

## Location

`app/[route]/page.tsx`

## Template

```tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

// Types
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Metadata (optional)
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Item ${id}`,
    description: `Details for item ${id}`,
  };
}

// Static params for SSG (optional)
export async function generateStaticParams() {
  // Fetch list of IDs to pre-render
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

// Data fetching function
async function getData(id: string) {
  const res = await fetch(`https://api.example.com/items/${id}`, {
    next: { tags: ['item', `item-${id}`] },
  });

  if (!res.ok) return null;
  return res.json();
}

// Loading component for Suspense
function ItemSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

// Async component with data
async function ItemDetails({ id }: { id: string }) {
  const data = await getData(id);

  if (!data) {
    notFound();
  }

  return (
    <article>
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="text-gray-600 mt-2">{data.description}</p>
    </article>
  );
}

// Page component
export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<ItemSkeleton />}>
        <ItemDetails id={id} />
      </Suspense>
    </main>
  );
}
```

## Key Features

| Feature | Description |
|---------|-------------|
| `generateMetadata` | Dynamic SEO metadata |
| `generateStaticParams` | Pre-render pages at build time |
| `Suspense` | Streaming with loading state |
| `notFound()` | 404 handling |
| `next.tags` | Cache tags for revalidation |

## Usage Notes

1. **Server Components**: Pages are Server Components by default
2. **Async/Await**: Use `await params` for route parameters (Next.js 15+)
3. **Data Fetching**: Fetch data directly in components
4. **Caching**: Use `next` options for cache control
