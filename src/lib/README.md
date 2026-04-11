# Lib Directory

This directory contains utility libraries and configurations for third-party integrations.

## 📁 Structure

```
lib/
└── 🛠️ utils.ts    # shadcn/ui utility functions
```

## 🎯 Purpose

The lib directory contains **third-party library utilities** that:
- Provide helper functions for external libraries
- Configure library integrations
- Offer commonly used utility patterns
- Maintain compatibility with popular frameworks

## 🛠️ shadcn/ui Utilities (`utils.ts`)

This file contains the essential utility function for shadcn/ui components:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### What is `cn()`?
The `cn()` function is a **utility for combining CSS classes** that:
- **Merges Tailwind classes** intelligently
- **Resolves class conflicts** (e.g., `p-4 p-2` becomes `p-2`)
- **Supports conditional classes** (e.g., `cn('btn', isActive && 'btn-active')`)
- **Handles clsx syntax** (arrays, objects, strings)

### Usage Examples
```typescript
// Basic class merging
cn('px-4 py-2', 'bg-blue-500') // => 'px-4 py-2 bg-blue-500'

// Conflict resolution
cn('p-4 p-2') // => 'p-2' (p-2 overrides p-4)

// Conditional classes
cn('btn', isActive && 'btn-active', disabled && 'btn-disabled')
// => 'btn btn-active' (when isActive=true, disabled=false)

// Object syntax
cn({ 'btn-primary': isPrimary, 'btn-secondary': !isPrimary })

// Array syntax
cn(['btn', isPrimary ? 'btn-primary' : 'btn-secondary'])
```

## 🎨 shadcn/ui Integration

This utility is **essential for shadcn/ui components**:
- Used by all shadcn/ui component variants
- Enables dynamic styling based on props
- Maintains consistent class handling
- Supports component customization

### Example in shadcn/ui Component
```typescript
// Button component using cn()
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }), // shadcn variant classes
          className // user-provided classes
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

## 📋 Dependencies

This utility requires:
- **`clsx`** - Conditional class name utility
- **`tailwind-merge`** - Tailwind CSS class merging

## 🔧 Why Keep This File?

**DO NOT DELETE** - This file is actively used by:
- All shadcn/ui components in `src/components/ui/`
- Custom components that need class merging
- Dynamic styling throughout the application

### Files Using `cn()`:
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sidebar.tsx`
- And many more shadcn/ui components...

## 🚀 Extending the Lib

### Adding New Utilities
```typescript
// lib/formatters.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// lib/validators.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### Adding Library Configurations
```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 }
  }
});
```

## 📚 Best Practices

1. **Keep utilities focused** - Single responsibility per file
2. **Type everything** - Full TypeScript support
3. **Document functions** - JSDoc comments for clarity
4. **Test utilities** - Unit tests for complex logic
5. **Avoid dependencies** - Prefer pure functions when possible

## 🔍 Related Files

- **`src/components/ui/`** - shadcn/ui components using `cn()`
- **`tailwind.config.js`** - Tailwind configuration
- **`components.json`** - shadcn/ui configuration
