# Engine Directory

This directory contains Web Worker implementations for offloading heavy computations from the main thread.

## 📁 Structure

```
engine/
└── 🤖 engine.worker.ts  # Main web worker for RPC and data processing
```

## 🎯 Purpose

The engine directory provides **Web Worker infrastructure** that:
- Offloads heavy computations from the main thread
- Handles RPC communication between main thread and workers
- Manages data processing in background threads
- Ensures responsive UI during intensive operations
- Provides isolation for compute-intensive tasks

## 🤖 Engine Worker (`engine.worker.ts`)

The main worker handles RPC calls and data processing:

```typescript
// Worker initialization
import { MiniGrpc } from "@/core/rpc/config/client";

// Create RPC server in worker
const rpcServer = new MiniGrpcWorker();

// Register handlers
rpcServer.registerHandler('Datasource', 'list', handleListDatasets);
rpcServer.registerHandler('Datasource', 'get', handleGetDataset);
rpcServer.registerHandler('Analytics', 'aggregate', handleAggregate);
```

### Features
- **RPC server** - Handles gRPC-style communication
- **Data processing** - Processes large datasets efficiently
- **Memory management** - Optimized memory usage in worker
- **Error handling** - Comprehensive error management
- **Performance monitoring** - Operation timing and metrics

## 🔄 Communication Pattern

### Main Thread → Worker
```typescript
// In main thread
const worker = new Worker('/engine.worker.ts', { type: 'module' });
const rpc = new MiniGrpc(worker);

// Make RPC call
const result = await rpc.call('Datasource', 'list', {});
```

### Worker → Main Thread
```typescript
// In worker
self.postMessage({
  type: 'rpc-response',
  id: requestId,
  result: processedData
});
```

## 🚀 Performance Benefits

### ⚡ Main Thread Benefits
- **Responsive UI** - No blocking operations
- **Smooth animations** - 60fps maintained
- **Better UX** - No frozen interface
- **Concurrent operations** - Multiple operations possible

### 📊 Worker Benefits
- **Dedicated thread** - No UI competition
- **Memory isolation** - Separate memory space
- **Background processing** - Long-running operations
- **Parallel processing** - Multiple workers possible

## 📋 Use Cases

### Data Processing
```typescript
// Process large dataset without blocking UI
const result = await rpc.call('Analytics', 'processLargeDataset', {
  data: largeDataset,
  operations: ['aggregate', 'filter', 'transform']
});
```

### File Operations
```typescript
// Handle file I/O in worker
const result = await rpc.call('File', 'processFile', {
  file: largeFile,
  operations: ['parse', 'validate', 'transform']
});
```

### Mathematical Computations
```typescript
// Heavy calculations in background
const result = await rpc.call('Math', 'complexCalculation', {
  data: numericalData,
  algorithm: 'fourier-transform'
});
```

## 🔧 Worker Capabilities

### 📊 Data Operations
- **Aggregation** - Sum, average, min, max operations
- **Filtering** - Complex data filtering
- **Transformation** - Data format conversions
- **Validation** - Data integrity checks

### 🧮 Mathematical Operations
- **Statistical analysis** - Standard deviation, correlation
- **Signal processing** - FFT, filtering
- **Linear algebra** - Matrix operations
- **Optimization** - Minimization algorithms

### 📁 File Operations
- **Parsing** - CSV, JSON, XML parsing
- **Compression** - Data compression/decompression
- **Validation** - File format validation
- **Transformation** - Format conversions

## 🔄 Lifecycle Management

### Worker Initialization
```typescript
// Create worker with error handling
const worker = new Worker('/engine.worker.ts', { 
  type: 'module',
  name: 'compute-worker'
});

worker.onerror = (error) => {
  console.error('Worker error:', error);
  // Handle worker failure
};

worker.onmessage = (event) => {
  // Handle worker messages
};
```

### Worker Termination
```typescript
// Clean shutdown
worker.terminate();
```

## 📊 Performance Monitoring

### Operation Timing
```typescript
// In worker
const startTime = performance.now();
const result = await processData(data);
const endTime = performance.now();

// Send metrics back to main thread
self.postMessage({
  type: 'metrics',
  processingTime: endTime - startTime,
  memoryUsage: performance.memory?.usedJSHeapSize
});
```

### Resource Usage
```typescript
// Monitor worker performance
const metrics = {
  processingTime: 150, // ms
  memoryUsage: 50000000, // bytes
  throughput: 1000, // operations/second
  errorRate: 0.01 // percentage
};
```

## 🔧 Extending the Engine

### Adding New RPC Handlers
```typescript
// In engine.worker.ts
rpcServer.registerHandler('CustomService', 'customMethod', async (params) => {
  // Implementation
  return processCustomData(params);
});
```

### Adding New Workers
```typescript
// Create specialized worker
const analysisWorker = new Worker('/analysis.worker.ts', { type: 'module' });
const analysisRpc = new MiniGrpc(analysisWorker);
```

## 🧪 Testing Workers

### Unit Testing
```typescript
// Test worker functionality
describe('Engine Worker', () => {
  test('processes data correctly', async () => {
    const worker = new Worker('/engine.worker.ts', { type: 'module' });
    const rpc = new MiniGrpc(worker);
    
    const result = await rpc.call('Analytics', 'sum', {
      data: [1, 2, 3, 4, 5]
    });
    
    expect(result).toBe(15);
    worker.terminate();
  });
});
```

### Integration Testing
```typescript
// Test worker integration with main app
describe('Worker Integration', () => {
  test('maintains UI responsiveness', async () => {
    const startTime = performance.now();
    
    // Start heavy computation
    const promise = rpc.call('Analytics', 'heavyComputation', largeData);
    
    // UI should remain responsive
    expect(document.querySelector('.loading-indicator')).toBeTruthy();
    
    await promise;
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // < 5 seconds
  });
});
```

## 🔒 Security Considerations

- **Input validation** - Validate all worker inputs
- **Sandboxing** - Workers run in isolated environment
- **Resource limits** - Prevent infinite loops
- **Error boundaries** - Handle worker errors gracefully
- **Data sanitization** - Clean data before processing

## 📋 Best Practices

1. **Keep workers focused** - Single responsibility per worker
2. **Handle errors** - Comprehensive error management
3. **Monitor performance** - Track worker metrics
4. **Clean up resources** - Proper worker termination
5. **Test thoroughly** - Unit and integration tests
6. **Document interfaces** - Clear RPC contract definitions

## 🚀 Future Enhancements

### Multiple Workers
```typescript
// Worker pool for parallel processing
const workerPool = new WorkerPool('/engine.worker.ts', 4);
const results = await workerPool.executeParallel(dataChunks);
```

### Shared Workers
```typescript
// Shared worker for cross-tab communication
const sharedWorker = new SharedWorker('/shared.worker.ts');
```

### Service Workers
```typescript
// Service worker for offline capabilities
const serviceWorker = navigator.serviceWorker.register('/sw.js');
```
