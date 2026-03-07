# State Management Directory

This directory contains all Jotai atoms for application state management.

## 📁 Structure

```
state/
├── 🎨 ui/              # UI-related state atoms
│   ├── 📊 chart-setting.ts    # Chart configuration
│   ├── 📐 layout.ts           # Layout and transitions
│   ├── 🧭 view.ts             # Navigation state
│   ├── 🔄 rpcClient.ts        # RPC client connection
│   ├── ⚡ rpcActions.ts       # RPC action atoms
│   └── 🍞 breadcrumbs.ts      # Navigation breadcrumbs
├── 📊 data/            # Data-related state atoms
│   └── 📋 dataset.ts          # Dataset management
└── 🧮 derived/         # Computed/derived atoms (future)
```

## 🎯 Purpose

The state layer provides **reactive, persistent state management** using Jotai that:
- Stores application state in atoms
- Persists data to localStorage/IndexedDB
- Provides reactive updates to components
- Separates UI state from data state
- Supports derived/computed state

## 🎨 UI State (`ui/`)

### 📊 Chart Settings (`chart-setting.ts`)
```typescript
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";

// Get chart settings
const [settings, setSettings] = useAtom(chartSettingsAtomFamily(chartId));

// Update settings
setSettings({...settings, stroke: 'red'});
```

**Features:**
- Per-chart configuration using atomFamily
- Chart type, colors, animations, interactions
- Persistent storage of chart preferences
- Type-safe settings interface

### 📐 Layout (`layout.ts`)
```typescript
import { sidebarTransitionAtom } from "@/state/ui/layout";

const isTransitioning = useAtomValue(sidebarTransitionAtom);
```

**Purpose:**
- Sidebar transition states
- Layout animation coordination
- UI responsiveness during transitions

### 🧭 View (`view.ts`)
```typescript
import { activeViewAtom } from "@/state/ui/view";

const [currentView, setView] = useAtom(activeViewAtom);
```

**Features:**
- Current page/view management
- Navigation state persistence
- View-specific metadata storage
- URL synchronization

### 🔄 RPC Client (`rpcClient.ts`)
```typescript
import { rpcClientAtom } from "@/state/ui/rpcClient";

const rpcClient = useAtomValue(rpcClientAtom);
```

**Purpose:**
- Singleton gRPC client instance
- Web worker management
- Connection state management

## 📊 Data State (`data/`)

### 📋 Dataset (`dataset.ts`)
```typescript
import { persistedDatasetsAtom, activeDatasetAtom } from "@/state/data/dataset";

const datasets = useAtomValue(persistedDatasetsAtom);
const [activeDataset, setActiveDataset] = useAtom(activeDatasetAtom);
```

**Features:**
- Dataset metadata management
- Active dataset tracking
- IndexedDB persistence
- Dataset type definitions

## 🔄 Usage Patterns

### Creating New Atoms
```typescript
// Simple atom
export const myAtom = atom(initialValue);

// Atom with storage
export const persistentAtom = atomWithStorage('key', defaultValue);

// Atom family (per-instance)
export const myAtomFamily = atomFamily((param: string) => 
  atom(getValue(param))
);

// Async atom
export const asyncAtom = atom(null, async (get) => {
  const data = await fetchData();
  return data;
});
```

### Best Practices
1. **Separate concerns** - UI vs data state
2. **Use atomFamily** for per-instance state
3. **Persist when needed** - Use atomWithStorage
4. **Type everything** - Full TypeScript coverage
5. **Document atoms** - JSDoc comments for purpose

## 🗄️ Persistence Strategy

### localStorage (UI State)
- User preferences and settings
- Navigation state
- Layout preferences
- **Fast access, limited size**

### IndexedDB (Data State)
- Dataset metadata
- Large data objects
- Binary data
- **Larger capacity, async access**

## 🧮 Derived State (Future)

The `derived/` directory will contain:
- Computed values from other atoms
- Aggregated data calculations
- Filtered/transformed state
- Performance-optimized selectors

```typescript
// Example derived atom
export const filteredDataAtom = atom((get) => {
  const data = get(rawDataAtom);
  const filters = get(filterAtom);
  return applyFilters(data, filters);
});
```

## 🚀 Performance Considerations

### ⚡ Optimizations
- **Atom suspension** - Only subscribe to needed atoms
- **Selective updates** - Minimize re-renders
- **Batch updates** - Group state changes
- **Memory management** - Clean up unused atoms

### 📊 Monitoring
```typescript
// Debug atom subscriptions
import { useAtomDebugValue } from 'jotai-devtools';

useAtomDebugValue(myAtom);
```

## 🔧 State Architecture

### 🎯 Design Principles
1. **Single source of truth** - Each piece of data lives in one atom
2. **Minimal state** - Store only what's necessary
3. **Derived when needed** - Compute values from base state
4. **Persistent by default** - User data should persist
5. **Reactive updates** - Components update automatically

### 🔄 Data Flow
```
User Action → Atom Update → Component Re-render → UI Update
                ↓
            Persistence (localStorage/IndexedDB)
```

## 📋 Migration Guide

### From Old State
```typescript
// Old way
const [state, setState] = useState(initialState);

// New way
const [state, setState] = useAtom(myAtom);
```

### Adding Persistence
```typescript
// Before
export const myAtom = atom(initialValue);

// After  
export const myAtom = atomWithStorage('my-key', initialValue);
```

## 🧪 Testing State

```typescript
import { useAtom } from 'jotai';
import { renderHook } from '@testing-library/react';

test('atom updates correctly', () => {
  const { result } = renderHook(() => useAtom(myAtom));
  const [value, setValue] = result.current;
  
  act(() => setValue('new value'));
  expect(result.current[0]).toBe('new value');
});
```
