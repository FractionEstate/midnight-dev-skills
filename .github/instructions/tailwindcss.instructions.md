---
description: Tailwind CSS v4 styling guidelines
name: Tailwind CSS Styling
applyTo: "**/*.{css,tsx,jsx},**/tailwind.config.{js,ts}"
---

# Tailwind CSS v4 Instructions

## Configuration

### CSS-First Setup (v4)
```css
@import "tailwindcss";

@theme {
  --color-primary-500: oklch(0.55 0.2 250);
  --font-family-sans: "Inter", system-ui, sans-serif;
}
```

## Class Ordering

Follow consistent ordering:
1. Layout (display, position, flex/grid)
2. Box model (width, height, margin, padding)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Interactive (hover, focus, transition)

```html
<div class="flex items-center gap-4 p-4 text-sm text-gray-900 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
```

## Responsive Design

### Mobile-First
```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on tablet, third on desktop -->
</div>
```

### Container Queries (v4)
```html
<div class="@container">
  <div class="flex flex-col @md:flex-row">
    <!-- Responsive to container, not viewport -->
  </div>
</div>
```

## Component Patterns

### Button
```html
<button class="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white
               hover:bg-primary-600 focus-visible:outline-2
               focus-visible:outline-offset-2 focus-visible:outline-primary-500
               disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
```

### Input
```html
<input class="block w-full rounded-lg border-gray-300
              shadow-sm focus:border-primary-500 focus:ring-primary-500
              invalid:border-red-500" />
```

### Card
```html
<div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5
            dark:bg-gray-900 dark:ring-white/10">
```

## Dark Mode

```html
<!-- System preference -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

<!-- Use semantic tokens -->
<div class="bg-surface text-on-surface">
```

## Animation

```html
<!-- Built-in -->
<div class="animate-spin" />
<div class="animate-pulse" />

<!-- Hover transitions -->
<div class="transition-all hover:scale-105 hover:shadow-lg">

<!-- Respect motion preferences -->
<div class="animate-bounce motion-reduce:animate-none">
```

## Accessibility

1. **Focus visible** - Always style focus-visible, not just focus
2. **Color contrast** - Maintain WCAG AA (4.5:1 for text)
3. **Touch targets** - Minimum 44x44px for interactive elements
4. **Screen reader only** - Use `sr-only` for hidden text

```html
<button class="p-2 min-w-[44px] min-h-[44px] focus-visible:ring-2">
  <span class="sr-only">Close menu</span>
  <XIcon aria-hidden="true" />
</button>
```

## Best Practices

1. **Extract components** - Reuse with React components, not @apply
2. **Use design tokens** - Define colors, spacing in @theme
3. **Avoid arbitrary values** - Extend theme instead of using `[value]`
4. **Group variants** - Use group/peer for related elements
5. **Semantic classes** - Name classes by purpose, not appearance
