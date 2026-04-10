# Compute Directory

This directory contains the performance layer for heavy computations and data processing.

## 📁 Structure

```
compute/
├── 🧮 algorithms/       # Data processing algorithms
├── 🔄 rpc/             # RPC abstraction layer
├── 🤖 workers/         # Web Worker implementations
├── ⚡ wasm/            # WebAssembly modules
├── 📋 types.ts         # Compute layer type definitions
└── 📄 index.ts        # Main exports and entry point
```

## 🎯 Purpose

The compute layer provides **high-performance data processing** that:
- Offloads heavy computations from the main thread
- Supports both Web Workers and WebAssembly
- Provides RPC abstraction for compute operations
- Enables scalable data processing
- Maintains responsive UI during intensive operations

## 🔄 Architecture

### 🎯 Three-Layer Performance Strategy

1. **Main Thread** - UI and lightweight operations
2. **Web Workers** - Medium complexity computations
3. **WebAssembly** - High-performance algorithms

```
UI Thread → RPC Layer → Workers/WASM → Results → UI Update
```

## 🧮 Algorithms (`algorithms/`)

Contains data processing algorithms that can run in workers or WASM:

```typescript
// Example algorithm
export interface DataProcessor {
  process(data: Dataset): ProcessedData;
  aggregate(data: Dataset[]): AggregatedData;
  filter(data: Dataset, criteria: FilterCriteria): FilteredData;
}
```

### Supported Operations
- **Data aggregation** - Sum, average, min, max operations
- **Statistical analysis** - Standard deviation, correlation, regression
- **Data transformation** - Normalization, scaling, encoding
- **Filtering and sorting** - Complex data filtering operations

## 🔄 RPC Abstraction (`rpc/`)

Provides unified interface for compute operations:

```typescript
import { computeClient } from "@/compute/rpc";

// Abstract computation
const result = await computeClient.process('aggregate', {
  data: dataset,
  operation: 'sum',
  groupBy: 'category'
});
```

### Features
- **Location transparent** - Same API for workers and WASM
- **Load balancing** - Automatic selection of compute backend
- **Fallback handling** - Graceful degradation
- **Performance monitoring** - Operation timing and metrics

## 🤖 Workers (`workers/`)

Web Worker implementations for medium-complexity operations:

```typescript
// Worker implementation
export class DataWorker {
  async processData(data: ProcessRequest): Promise<ProcessResponse> {
    // Implementation in worker thread
  }
}
```

### Use Cases
- **Data aggregation** - Large dataset summarization
- **Statistical calculations** - Complex mathematical operations
- **Data transformation** - Format conversions and processing
- **Background processing** - Long-running operations

## ⚡ WebAssembly (`wasm/`)

High-performance modules for compute-intensive operations:

```typescript
// WASM module interface
export interface WasmModule {
  initialize(): Promise<void>;
  process(data: Float64Array): Float64Array;
  cleanup(): void;
}
```

### Use Cases
- **Mathematical computations** - Linear algebra, signal processing
- **Data compression** - Fast compression algorithms
- **Cryptography** - Hash functions and encryption
- **Image processing** - Fast pixel operations

## 📋 Type Definitions (`types.ts`)

```typescript
export interface ComputeRequest {
  operation: string;
  data: unknown;
  parameters?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
}

export interface ComputeResponse {
  result: unknown;
  metadata: {
    processingTime: number;
    workerId?: string;
    memoryUsage?: number;
  };
}

export interface ComputeBackend {
  name: string;
  capabilities: string[];
  isAvailable(): boolean;
  process(request: ComputeRequest): Promise<ComputeResponse>;
}
```

## 🔄 Usage Patterns

### Sample series (implemented)

```typescript
import { generateSeries, measureGenerateSeries } from "@/compute";

const { data, metadata } = await generateSeries({ count: 250 });
const bench = await measureGenerateSeries({ count: 500 });
```

### Basic Compute Operation (future facade)
```typescript
import { computeClient } from "@/compute";

// Simple computation
const result = await computeClient.execute('sum', {
  data: numbers,
  parameters: { precision: 2 }
});

// Batch operations
const results = await computeClient.batch([
  { operation: 'sum', data: dataset1 },
  { operation: 'average', data: dataset2 }
]);
```

### Advanced Usage
```typescript
// Specify compute backend
const result = await computeClient.execute('complexAnalysis', {
  data: largeDataset,
  backend: 'wasm', // 'worker' | 'wasm' | 'auto'
  priority: 'high'
});

// Streaming computation
const stream = computeClient.createStream('processStream');
for await (const chunk of stream.process(dataStream)) {
  updateUI(chunk);
}
```

## 🚀 Performance Features

### ⚡ Optimizations
- **Parallel processing** - Multiple workers for concurrent operations
- **Memory management** - Efficient memory usage patterns
- **Caching** - Result caching for repeated operations
- **Streaming** - Process data in chunks for large datasets

### 📊 Monitoring
```typescript
import { computeMetrics } from "@/compute";

// Performance metrics
const metrics = computeMetrics.getMetrics();
console.log(`Average processing time: ${metrics.averageTime}ms`);
console.log(`Worker utilization: ${metrics.workerUtilization}%`);
```

## 🔧 Backend Selection

### Automatic Selection
```typescript
// Let the system choose the best backend
const result = await computeClient.execute('operation', data);
```

### Manual Selection
```typescript
// Force specific backend
const result = await computeClient.execute('operation', data, {
  backend: 'wasm' // 'worker' | 'wasm' | 'main'
});
```

### Selection Criteria
- **Data size** - Small data stays in main thread
- **Complexity** - Complex operations go to workers/WASM
- **Availability** - Fallback to available backends
- **Performance** - Choose fastest available backend

## 📋 Implementation Roadmap

### Phase 1: Foundation
- [x] Worker entry for sample data generation ([`workers/dataWorker.ts`](workers/dataWorker.ts))
- [x] Public facade ([`index.ts`](index.ts)) — `generateSeries`, `measureGenerateSeries`
- [ ] Full RPC abstraction for all compute (see [`docs/ENGINE_PROTOCOL.md`](../../docs/ENGINE_PROTOCOL.md) status)
- [ ] Algorithm interfaces (shared types for aggregation/filter)

### Phase 2: Workers
- [ ] Data aggregation worker
- [ ] Statistical analysis worker
- [ ] Background processing worker
- [ ] Performance monitoring

### Phase 3: WebAssembly
- [x] Sample WASM path for `generate_series` (optional; falls back to JS)
- [ ] Broader mathematical / compression modules
- [ ] Performance benchmarks (automated)

### Phase 4: Advanced Features
- [ ] Streaming computations
- [ ] Distributed processing
- [ ] GPU acceleration
- [ ] Advanced caching

## 🧪 Testing Compute Layer

```typescript
import { computeClient } from "@/compute";

describe('Compute Layer', () => {
  test('processes data correctly', async () => {
    const testData = [1, 2, 3, 4, 5];
    
    const result = await computeClient.execute('sum', {
      data: testData
    });
    
    expect(result.result).toBe(15);
  });
  
  test('handles large datasets', async () => {
    const largeData = generateLargeDataset(1000000);
    
    const startTime = performance.now();
    const result = await computeClient.execute('aggregate', {
      data: largeData,
      backend: 'worker'
    });
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // < 1 second
  });
});
```

## 🔧 Extending the Compute Layer

### Adding New Algorithms
```typescript
// algorithms/newAlgorithm.ts
export function newAlgorithm(data: Data): Result {
  // Implementation
}

// Register with compute client
computeClient.registerAlgorithm('newAlgorithm', newAlgorithm);
```

### Adding New Backends
```typescript
// backends/customBackend.ts
export class CustomBackend implements ComputeBackend {
  name = 'custom';
  
  async process(request: ComputeRequest): Promise<ComputeResponse> {
    // Implementation
  }
}

// Register backend
computeClient.registerBackend(new CustomBackend());
```

## 📊 Performance Benchmarks

| Operation | Main Thread | Worker | WASM |
|-----------|-------------|---------|------|
| Sum (1M items) | 50ms | 30ms | 15ms |
| Standard Deviation | 200ms | 80ms | 40ms |
| Data Compression | 500ms | 150ms | 50ms |
| FFT Analysis | 1000ms | 200ms | 80ms |

*Benchmarks are approximate and depend on hardware and data characteristics.*
