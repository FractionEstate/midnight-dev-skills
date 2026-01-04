# Tailwind CSS v4 Components Reference

Modern component patterns using Tailwind CSS v4 utilities.

## Buttons

```tsx
// Primary Button
<button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:opacity-50">
  <Icon className="size-4" />
  Button
</button>

// Secondary Button
<button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
  Secondary
</button>

// Ghost Button
<button className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100">
  Ghost
</button>

// Icon Button
<button className="inline-flex size-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800">
  <Icon className="size-5" />
</button>
```

## Cards

```tsx
// Basic Card
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    Card Title
  </h3>
  <p className="mt-2 text-gray-600 dark:text-gray-400">
    Card content goes here.
  </p>
</div>

// Interactive Card
<a href="#" className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700">
  <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
    Interactive Card
  </h3>
  <p className="mt-2 text-gray-600 dark:text-gray-400">
    Hover to see the effect.
  </p>
</a>

// Glass Card
<div className="rounded-xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/70">
  <h3 className="text-lg font-semibold">Glass Effect</h3>
</div>
```

## Form Inputs

```tsx
// Text Input
<div className="space-y-1.5">
  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Email
  </label>
  <input
    type="email"
    id="email"
    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    placeholder="you@example.com"
  />
</div>

// Textarea
<textarea className="min-h-32 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />

// Select
<select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Checkbox
<label className="flex items-center gap-2">
  <input type="checkbox" className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
  <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
</label>
```

## Navigation

```tsx
// Navbar
<nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
  <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <a href="/" className="text-xl font-bold">Logo</a>
    <div className="hidden items-center gap-6 md:flex">
      <a href="#" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
        Features
      </a>
      <a href="#" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
        Pricing
      </a>
    </div>
  </div>
</nav>

// Tabs
<div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
  <button className="rounded-md bg-white px-3 py-1.5 text-sm font-medium shadow-sm dark:bg-gray-700">
    Tab 1
  </button>
  <button className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
    Tab 2
  </button>
</div>
```

## Badges & Tags

```tsx
// Badge
<span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
  Badge
</span>

// Status Indicator
<span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
  <span className="size-1.5 rounded-full bg-green-500" />
  Active
</span>

// Tag with remove
<span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">
  Tag
  <button className="ml-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
    <X className="size-3" />
  </button>
</span>
```

## Loading States

```tsx
// Spinner
<div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />

// Skeleton
<div className="animate-pulse space-y-3">
  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
</div>

// Skeleton Card
<div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
  <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
  <div className="mt-4 space-y-2">
    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
</div>
```

## Responsive Patterns

```tsx
// Responsive Grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Container with padding
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Hide/Show at breakpoints
<div className="hidden lg:block">{/* Desktop only */}</div>
<div className="lg:hidden">{/* Mobile/Tablet only */}</div>
```

## Dark Mode Patterns

```tsx
// Consistent dark mode approach
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-800
">
  <p className="text-gray-600 dark:text-gray-400">Muted text</p>
</div>

// Inverted for interactive elements
<button className="
  bg-gray-900 dark:bg-white
  text-white dark:text-gray-900
  hover:bg-gray-800 dark:hover:bg-gray-100
">
  Inverted Button
</button>
```
