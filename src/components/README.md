# Components Directory

This directory contains all reusable UI components for the dashboard application.

## 📁 Structure

```
components/
├── 📊 charts/         # Chart-specific UI components
├── 🎨 ui/             # Base UI components (buttons, cards, etc.)
├── 📄 footer/         # Footer components
├── 📋 table/          # Data table components
├── 🎣 hooks/          # Component-specific hooks
└── 🧩 misc/           # Miscellaneous components
```

## 🎯 Purpose

Components are **pure, reusable UI elements** that:
- Accept props and render UI
- Have no business logic
- Are fully typed with TypeScript
- Follow atomic design principles
- Use shadcn/ui as the base component library

## 📊 Chart Components (`charts/`)

Chart-specific UI wrappers that:
- Wrap D3-core chart implementations
- Handle user interactions (settings, tooltips)
- Manage chart-specific state
- Provide consistent chart UI patterns

**Key Files:**
- `ChartPanel.tsx` - Main chart wrapper with settings
- `settings/` - Chart configuration components

## 🎨 UI Components (`ui/`)

Base UI components built with shadcn/ui:
- Form controls (buttons, inputs, selects)
- Layout components (cards, dialogs, sheets)
- Navigation components (sidebar, breadcrumbs)
- Data display (tables, badges, separators)

## 🔄 Usage Patterns

```typescript
// Import pattern
import { ChartPanel } from "@/components/charts/ChartPanel";
import { Button } from "@/components/ui/button";

// Props interface
interface ComponentProps {
  id: string;
  data: DataType;
  onAction?: (action: Action) => void;
}

// Usage
<Component id="chart-1" data={chartData} />
```

## 🎨 Design System

- **Colors:** Tailwind CSS color palette
- **Typography:** Inter font family
- **Spacing:** Tailwind spacing scale
- **Components:** shadcn/ui component library
- **Icons:** Lucide React icons

## 📋 Guidelines

1. **Keep components pure** - No side effects
2. **Type all props** - Full TypeScript coverage
3. **Use forwardRef** - When needed for refs
4. **Document props** - JSDoc comments for interfaces
5. **Test components** - Unit tests for complex logic

## 🚀 Performance

- Components are optimized with React.memo
- Lazy loading for heavy components
- Minimal re-renders with proper dependency arrays
