# Tailwind CSS Responsive Design Reference

## Breakpoint System

| Breakpoint | Min Width | CSS                           |
| ---------- | --------- | ----------------------------- |
| `sm`       | 640px     | `@media (min-width: 640px)`   |
| `md`       | 768px     | `@media (min-width: 768px)`   |
| `lg`       | 1024px    | `@media (min-width: 1024px)`  |
| `xl`       | 1280px    | `@media (min-width: 1280px)`  |
| `2xl`      | 1536px    | `@media (min-width: 1536px)`  |

## Mobile-First Approach

```tsx
// Start with mobile, add complexity at larger sizes
<div className="
  text-sm        // Mobile: small text
  md:text-base   // Tablet+: base text
  lg:text-lg     // Desktop+: large text
">
```

## Layout Patterns

### Responsive Columns

```tsx
// 1 → 2 → 3 → 4 columns
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Auto-fit with minimum size
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Responsive Stack to Row

```tsx
// Stack on mobile, row on tablet+
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <h1>Title</h1>
  <div className="flex gap-2">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>
```

### Sidebar Layout

```tsx
// Mobile: stacked, Desktop: sidebar
<div className="flex flex-col lg:flex-row">
  <aside className="w-full shrink-0 lg:w-64">
    <nav>Sidebar</nav>
  </aside>
  <main className="flex-1 lg:ml-8">
    Content
  </main>
</div>
```

## Spacing Patterns

```tsx
// Responsive padding
<section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
  {/* More padding as screen grows */}
</section>

// Responsive gap
<div className="grid gap-4 sm:gap-6 lg:gap-8">
  {/* Larger gaps on larger screens */}
</div>

// Responsive margins
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Standard container pattern */}
</div>
```

## Typography

```tsx
// Responsive headings
<h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl xl:text-5xl">
  Responsive Heading
</h1>

// Responsive line height
<p className="text-base leading-relaxed lg:text-lg lg:leading-loose">
  Longer text content...
</p>

// Responsive text alignment
<div className="text-center md:text-left">
  <h2>Centered on mobile, left on desktop</h2>
</div>
```

## Show/Hide Elements

```tsx
// Mobile only
<button className="md:hidden">Mobile Menu</button>

// Desktop only
<nav className="hidden md:flex">Desktop Nav</nav>

// Tablet and up
<div className="hidden sm:block">Tablet+</div>

// Between breakpoints
<div className="hidden md:block lg:hidden">Tablet only</div>
```

## Container Queries (v4)

```tsx
// Container query classes
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
    {/* Responds to container width, not viewport */}
  </div>
</div>

// Named containers
<div className="@container/card">
  <span className="@lg/card:text-xl">
    Responds to card container
  </span>
</div>
```

## Touch & Hover

```tsx
// Hover only on devices that support it
<button className="hover:bg-gray-100 active:bg-gray-200">
  {/* hover: for mouse, active: for touch */}
</button>

// Using @media (hover: hover)
<div className="@[hover]:hover:scale-105">
  {/* Only scale on hover-capable devices */}
</div>
```

## Common Responsive Components

### Responsive Card Grid

```tsx
<section className="py-12 sm:py-16 lg:py-24">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl font-bold sm:text-3xl">Features</h2>
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">
      {features.map(feature => (
        <div key={feature.id} className="rounded-xl border p-6">
          <h3 className="text-lg font-semibold">{feature.title}</h3>
          <p className="mt-2 text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Responsive Navigation

```tsx
<nav className="sticky top-0 z-50 border-b bg-white">
  <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
    <a href="/" className="text-lg font-bold sm:text-xl">Logo</a>

    {/* Mobile menu button */}
    <button className="p-2 md:hidden">
      <Menu className="size-5" />
    </button>

    {/* Desktop nav */}
    <div className="hidden items-center gap-6 md:flex">
      <a href="#" className="text-sm font-medium">Features</a>
      <a href="#" className="text-sm font-medium">Pricing</a>
      <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
        Get Started
      </button>
    </div>
  </div>
</nav>
```

### Responsive Hero

```tsx
<section className="relative overflow-hidden">
  <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
    <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
        Build faster with modern tools
      </h1>
      <p className="mt-4 text-lg text-gray-600 sm:mt-6 sm:text-xl">
        Description text that adjusts sizing across breakpoints.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
        <button className="w-full rounded-lg bg-primary-600 px-6 py-3 text-white sm:w-auto">
          Get Started
        </button>
        <button className="w-full rounded-lg border px-6 py-3 sm:w-auto">
          Learn More
        </button>
      </div>
    </div>
  </div>
</section>
```
