# Plug & Play Dashboard Architecture

## � Vision: Self-Contained Data Visualization Platform
**Offline-first, no-backend, drag-and-drop dashboard builder with D3.js performance**

### Core Features
- 📁 **File Upload**: JSON, CSV, Excel → IndexedDB storage
- 🎨 **Dashboard Builder**: Drag & drop interface, live editing
- 📊 **Visualization Engine**: Modern D3.js charts with performance focus
- 🔧 **Data Processing**: RPC layer → WASM migration path
- 💾 **Multi-Dashboard**: Persistent storage, independent datasets

## 🏗️ Three-Layer Architecture

### 1. D3 Core & Charts (`/src/d3-core/`)
**Core Layer** - Essential rendering foundation
```
src/d3-core/
├── core/                    # Essential D3 utilities
│   ├── renderer/           # Base rendering engine
│   ├── scales/             # Scale generators
│   ├── axes/               # Axis generators  
│   ├── grid/               # Grid generators
│   ├── tooltip/            # Tooltip system
│   ├── interactions/       # Zoom, pan, brush
│   └── transitions/        # Animation system
├── charts/                 # Chart implementations
│   ├── base/              # Base chart class
│   ├── line/              # Line chart
│   ├── area/              # Area chart
│   ├── scatter/           # Scatter plot
│   ├── bar/               # Bar chart
│   └── index.ts           # Chart registry
├── virtualization/         # Future: Infinite data rendering
│   ├── viewport/          # Viewport calculations
│   ├── dataWindow/        # Sliding window logic
│   └── rendering/         # Virtual DOM for charts
└── types/                 # D3-specific types
```

### 2. State Management (`/src/state/`)
**Atomic state layer** - Clean separation of concerns
```
src/state/
├── data/                   # Data-related atoms
│   ├── datasets.atom.ts    # Dataset management
│   ├── activeDataset.atom.ts
│   ├── dataEngine.ts       # IndexedDB interface
│   └── upload.atom.ts      # File upload state
├── dashboards/             # Dashboard management
│   ├── dashboards.atom.ts  # Dashboard definitions
│   ├── activeDashboard.atom.ts
│   └── layout.atom.ts      # Drag & drop layout
├── ui/                     # UI state atoms
│   ├── chartSettings.atom.ts
│   ├── view.atom.ts
│   └── theme.atom.ts
├── derived/               # Computed atoms
│   ├── chartDataSelectors.ts
│   ├── dashboardSelectors.ts
│   └── performanceSelectors.ts
└── index.ts               # State exports
```

### 3. Compute Layer (`/src/compute/`)
**Performance layer** - Heavy computations with RPC abstraction
```
src/compute/
├── rpc/                    # Clean RPC abstraction layer
│   ├── client.ts          # Main thread interface
│   ├── worker.ts          # Worker thread interface
│   ├── protocols/         # Message types
│   └── registry.ts        # Service registry
├── workers/                # Web Workers (current implementation)
│   ├── dataProcessor.worker.ts    # Aggregation, filtering, sorting
│   ├── calculator.worker.ts       # Statistical calculations
│   └── workerPool.ts              # Worker management
├── wasm/                   # WASM modules (future implementation)
│   ├── dataAlgorithms/           # Heavy data processing
│   ├── statistical/              # Statistical functions
│   └── bindings.ts                # JS-WASM interface
├── algorithms/             # Data structures & algorithms
│   ├── dataStructures/           # Trees, heaps, etc.
│   ├── aggregation/              # Group by, sum, avg
│   ├── filtering/                 # Complex filters
│   └── sorting/                   # Efficient sorting
└── types.ts                # Compute types
```

## 🔄 Interaction Patterns

### Data Flow Architecture
```
File Upload → IndexedDB → State Layer → Compute Layer (RPC) → D3 Core Render
     ↓              ↓           ↓              ↓                    ↓
  Parser → Data Engine → Atoms → Workers/WASM → Chart Engine → UI
```

### RPC Abstraction Layer
**Key insight**: RPC layer allows seamless migration from main thread → Workers → WASM
```typescript
// Interface stays the same, implementation changes
interface DataProcessor {
  aggregate(data: Dataset[], operation: AggregationOp): Promise<Dataset>;
  filter(data: Dataset, criteria: FilterCriteria): Promise<Dataset>;
  sort(data: Dataset, comparator: SortComparator): Promise<Dataset>;
}

// Current: Main thread implementation
// Future: Worker implementation  
// Future+: WASM implementation
```

### Performance Strategy
1. **Main Thread**: UI rendering, simple operations
2. **Workers**: Data processing, calculations (1MB+ datasets)
3. **WASM**: Heavy algorithms, infinite data (100MB+ datasets)

## 🎯 Key Technical Decisions

### 1. **Data Structures & Algorithms**
- **Spatial indexing** for fast data lookup
- **Lazy loading** for large datasets
- **Memory-efficient** data windows
- **Progressive rendering** for smooth UX

### 2. **Storage Strategy**
- **IndexedDB** for persistent data storage
- **In-memory caching** for active datasets
- **Data pagination** for large files
- **Compression** for storage efficiency

### 3. **Rendering Performance**
- **Virtualization** for infinite scroll
- **Viewport culling** (render only visible data)
- **Debounced updates** during drag & drop
- **Smart caching** of computed values

## 📦 Migration Strategy

### Phase 1: Foundation (Current Sprint)
- ✅ Restructure folders
- ✅ Basic drag & drop dashboard
- ✅ File upload (JSON, CSV)
- ✅ Simple chart rendering

### Phase 2: Core Features
- 📊 Multiple chart types
- 🎨 Chart customization
- 💾 Dashboard persistence
- 📱 Responsive design

### Phase 3: Performance
- 🧮 Worker-based data processing
- 🔧 RPC layer implementation
- 📈 Large dataset support
- ⚡ Performance optimizations

### Phase 4: Advanced
- 🚀 WASM integration
- 🌊 Real-time data (WebSockets)
- 🔄 Live collaboration
- 🎯 Advanced interactions

## 💡 Design Principles

1. **Offline First**: Everything works without internet
2. **Progressive Enhancement**: Basic features work everywhere
3. **Performance First**: Never block the main thread
4. **Data Privacy**: Everything stays in the browser
5. **Extensible**: Easy to add new chart types and features
