# Source Code Architecture

This directory contains the complete source code for the Plug & Play Dashboard visualization platform.

## 📁 Folder Structure

```
src/
├── 📦 components/     # Reusable UI components
├── 🏗️ containers/     # Page-level containers and views  
├── 🧠 core/          # Application core infrastructure
├── 📊 d3-core/       # D3.js visualization engine
├── ⚡ compute/       # Performance layer (workers, WASM, algorithms)
├── 🗄️ state/         # Jotai state management
├── 🎣 hooks/         # Custom React hooks
├── 🛠️ utils/         # Utility functions
├── 📄 types/         # TypeScript type definitions
├── 🚀 engine/        # Web Workers for performance
├── 🎨 assets/        # Static assets
├── 📚 lib/           # Third-party library configurations
└── 🧪 wasm/          # WebAssembly modules (future)
```

## 🎯 Architecture Principles

1. **Separation of Concerns** - Each folder has a clear, single responsibility
2. **Performance First** - Compute layer ready for workers and WASM optimization  
3. **Type Safety** - Comprehensive TypeScript throughout
4. **Modular Design** - Easy to test, maintain, and extend
5. **Offline-First** - Local storage and IndexedDB for data persistence

## 🔄 Data Flow

```
User Input → State (Jotai) → Components → D3-Core → Render
                ↓
            Compute Layer (Workers/WASM) ← Performance
```

## 📖 Key Folders Explained

- **`components/`** - Pure UI components (buttons, cards, etc.)
- **`containers/`** - Page components that combine UI with business logic
- **`core/`** - Essential app infrastructure (RPC, storage, data engine)
- **`d3-core/`** - All D3.js visualization logic and chart implementations
- **`state/`** - Jotai atoms for application state management
- **`compute/`** - Heavy computations, algorithms, and performance optimizations

## 🚀 Getting Started

1. All imports use `@/` alias for clean paths
2. State management through Jotai atoms in `state/`
3. Charts built with `d3-core/` utilities
4. Performance handled by `compute/` layer

## 📚 Documentation

Each folder has its own README.md with detailed explanations of:
- Purpose and responsibilities
- Key files and their roles
- Usage patterns and examples
- Performance considerations
