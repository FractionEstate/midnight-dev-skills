---
description: Build a reusable React component with Tailwind CSS, variants, and accessibility
name: Create UI Component
agent: UI Designer
tools:
  - edit/editFiles
  - search
---

# Create UI Component

Build a reusable UI component following design system best practices.

## Input Variables

- **Component Name**: ${input:componentName:Button}
- **Component Type**: ${input:componentType:interactive} (interactive, display, layout, form)
- **Include Variants**: ${input:variants:default,secondary,outline,ghost}
- **Include Sizes**: ${input:sizes:sm,md,lg}
- **Include Dark Mode**: ${input:darkMode:yes}

## Requirements

1. **File Structure**:
   ```
   components/ui/${componentName.toLowerCase()}.tsx
   ```

2. **Component Features**:
   - TypeScript with proper prop types
   - forwardRef for DOM access
   - Composable with asChild pattern (optional)
   - Proper displayName

3. **Styling with Tailwind**:
   - Use class-variance-authority (cva) for variants
   - Utility function `cn()` for class merging
   - Support className override
   - Tailwind CSS v4 syntax

4. **Variants**:
   - Visual variants (default, secondary, destructive, etc.)
   - Size variants (sm, md, lg)
   - Compound variants if needed
   - Default variants specified

5. **Accessibility**:
   - Proper ARIA attributes
   - Keyboard navigation support
   - Focus states visible
   - Screen reader friendly
   - Color contrast compliant

6. **States**:
   - Default state
   - Hover state
   - Focus state (with ring)
   - Active/pressed state
   - Disabled state
   - Loading state (if applicable)

7. **Dark Mode**:
   - Proper color tokens
   - Using Tailwind dark: prefix or CSS variables

## Component Template

```tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base styles
  'inline-flex items-center justify-center...',
  {
    variants: {
      variant: {
        default: '...',
        secondary: '...',
      },
      size: {
        sm: '...',
        md: '...',
        lg: '...',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Component.displayName = 'Component';

export { Component, componentVariants };
```

## Output

Provide:
1. Complete component code
2. Usage examples
3. Storybook story (optional)
4. Accessibility notes
