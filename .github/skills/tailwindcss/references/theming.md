# Tailwind CSS Theming

## CSS-First Configuration (v4)

Tailwind v4 introduces CSS-first configuration using `@theme` directive:

```css
/* app/globals.css */
@import 'tailwindcss';

@theme {
  /* Color Palette using OKLCH */
  --color-primary-50: oklch(0.97 0.01 250);
  --color-primary-100: oklch(0.93 0.03 250);
  --color-primary-200: oklch(0.87 0.06 250);
  --color-primary-300: oklch(0.78 0.1 250);
  --color-primary-400: oklch(0.67 0.15 250);
  --color-primary-500: oklch(0.55 0.2 250);
  --color-primary-600: oklch(0.47 0.18 250);
  --color-primary-700: oklch(0.39 0.15 250);
  --color-primary-800: oklch(0.32 0.12 250);
  --color-primary-900: oklch(0.25 0.08 250);
  --color-primary-950: oklch(0.18 0.05 250);

  /* Semantic Colors */
  --color-success: oklch(0.72 0.18 142);
  --color-warning: oklch(0.8 0.15 85);
  --color-error: oklch(0.63 0.24 27);

  /* Typography */
  --font-family-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', ui-monospace, monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Spacing */
  --spacing-px: 1px;
  --spacing-0: 0;
  --spacing-0\.5: 0.125rem;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;

  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1);

  /* Animations */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## Dark Mode

### System Preference

```css
@theme {
  --color-surface: white;
  --color-on-surface: oklch(0.15 0 0);
  --color-surface-dim: oklch(0.97 0 0);
  --color-border: oklch(0.9 0 0);
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-surface: oklch(0.15 0 0);
    --color-on-surface: oklch(0.95 0 0);
    --color-surface-dim: oklch(0.12 0 0);
    --color-border: oklch(0.25 0 0);
  }
}
```

### Manual Toggle

```html
<html class="dark">
  <body class="bg-surface text-on-surface">
    <!-- Content adapts to dark mode -->
  </body>
</html>
```

```css
.dark {
  --color-surface: oklch(0.15 0 0);
  --color-on-surface: oklch(0.95 0 0);
}
```

## OKLCH Color System

OKLCH provides perceptually uniform colors:

```text
oklch(L C H / alpha)
- L: Lightness (0-1)
- C: Chroma (0-0.4, higher = more saturated)
- H: Hue angle (0-360)
```

### Color Palette Generator

```css
/* Generate consistent palette from single hue */
@theme {
  /* Blue palette (H=250) */
  --color-blue-50: oklch(0.97 0.01 250);
  --color-blue-500: oklch(0.55 0.2 250);
  --color-blue-900: oklch(0.25 0.08 250);

  /* Green palette (H=142) */
  --color-green-50: oklch(0.97 0.01 142);
  --color-green-500: oklch(0.72 0.18 142);
  --color-green-900: oklch(0.3 0.08 142);
}
```

## Custom Utilities

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .text-pretty {
    text-wrap: pretty;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

## Plugin Patterns

```css
/* Custom variants */
@custom-variant hocus (&:hover, &:focus);
@custom-variant group-hocus (:merge(.group):hover &, :merge(.group):focus &);

/* Usage */
<button class="hocus:bg-primary-600">Hover or Focus</button>
```
