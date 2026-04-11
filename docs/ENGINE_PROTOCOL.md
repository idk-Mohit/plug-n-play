# Engine Protocol Specification

This document defines the communication protocol between the UI layer and the compute engine (Workers + WASM) in the Plug & Play Dashboard.

## Implementation status (read this first)

| Surface | Status |
|---------|--------|
| **Engine RPC worker** ([`src/engine/engine.worker.ts`](../src/engine/engine.worker.ts)) | **Implemented** — envelope `{ v, id, svc, method, args? }` in [`src/core/rpc/config/protocol.ts`](../src/core/rpc/config/protocol.ts); client [`src/core/rpc/config/client.ts`](../src/core/rpc/config/client.ts) |
| **LocalStore** routes on main thread | **Partial** — e.g. `listDatasets` via `LocalStore` in `MiniGrpc` |
| **Data worker** (generation) | **Separate protocol** — task/payload messages in [`src/compute/workers/dataWorker.ts`](../src/compute/workers/dataWorker.ts); wrapped by [`src/compute/index.ts`](../src/compute/index.ts) |
| Full protocol in this doc (versioning, retries, streaming, batch) | **Aspirational** — treat detailed sections as **design targets** until wired in code |

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Message Protocol](#message-protocol)
- [Worker Messages](#worker-messages)
- [RPC Messages](#rpc-messages)
- [Engine Guarantees](#engine-guarantees)
- [UI Expectations](#ui-expectations)
- [Versioning Strategy](#versioning-strategy)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)

---

## 🎯 Overview

The Engine Protocol enables **asynchronous communication** between the UI main thread and background compute workers, providing a clean abstraction for heavy computations while maintaining UI responsiveness.

### Key Principles
- **Non-blocking** - All operations are asynchronous
- **Type-safe** - Full TypeScript support for all messages
- **Versioned** - Backward compatibility through protocol versioning
- **Observable** - Progress tracking and status updates
- **Resilient** - Graceful error handling and recovery

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │◄──►│  RPC Layer       │◄──►│  Workers/WASM   │
│                 │    │                  │    │                 │
│ • React UI      │    │ • MiniGrpc       │    │ • DataWorker    │
│ • State Mgmt    │    │ • Message Router │    │ • WASM Modules  │
│ • User Events   │    │ • Type Safety    │    │ • Algorithms    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Communication Flow
1. **UI** sends request via RPC client
2. **RPC Layer** routes to appropriate worker
3. **Worker** processes request (may use WASM)
4. **Response** flows back through RPC to UI

---

## 📨 Message Protocol

All messages follow a standardized structure with type safety and error handling.

### Base Message Structure

```typescript
interface BaseMessage {
  id: string;           // Unique message identifier
  version: string;      // Protocol version
  timestamp: number;    // Unix timestamp
  type: MessageType;    // Message type enum
}
```

### Request Message Structure

```typescript
interface RequestMessage extends BaseMessage {
  type: 'request';
  service: string;      // Service name (e.g., 'Data', 'Analytics')
  method: string;       // Method name (e.g., 'generate', 'aggregate')
  payload: unknown;     // Method parameters
  options?: {
    priority?: 'low' | 'normal' | 'high';
    timeout?: number;   // Timeout in milliseconds
    retries?: number;   // Retry attempts
  };
}
```

### Response Message Structure

```typescript
interface ResponseMessage extends BaseMessage {
  type: 'response';
  status: 'success' | 'error' | 'working';
  result?: unknown;     // Response data (success only)
  error?: {
    code: string;       // Error code
    message: string;    // Human-readable error
    details?: unknown; // Additional error context
  };
  metadata?: {
    processingTime: number;    // Time in milliseconds
    workerId?: string;         // Worker identifier
    memoryUsage?: number;      // Memory used in bytes
    operationCount?: number;   // Operations processed
  };
}
```

### Progress Message Structure

```typescript
interface ProgressMessage extends BaseMessage {
  type: 'progress';
  progress: {
    current: number;     // Current progress (0-100)
    total: number;       // Total items to process
    message?: string;    // Progress description
    estimatedTime?: number; // Estimated remaining time (ms)
  };
}
```

---

## 🤖 Worker Messages

### Data Generation Worker

#### Request: Generate Time Series Data

```typescript
interface GenerateSeriesRequest {
  service: 'Data';
  method: 'generate_series';
  payload: {
    count: number;           // Number of data points
    type?: 'sine' | 'random' | 'linear'; // Generation type
    amplitude?: number;      // Wave amplitude (for sine)
    frequency?: number;      // Wave frequency (for sine)
    noise?: number;          // Noise level (0-1)
  };
}
```

#### Response: Generated Data

```typescript
interface GenerateSeriesResponse {
  status: 'success';
  result: {
    data: Array<{
      x: number;    // Timestamp or index
      y: number;    // Value
    }>;
    metadata: {
      count: number;
      type: string;
      generatedAt: string; // ISO timestamp
      source: 'wasm' | 'worker';
    };
  };
}
```

#### Progress: Generation Status

```typescript
interface GenerateSeriesProgress {
  progress: {
    current: number;     // Points generated so far
    total: number;       // Total points to generate
    message: string;     // "Generating data points..."
  };
}
```

---

## 🔄 RPC Messages

### Dataset Service

#### List Datasets

```typescript
// Request
interface ListDatasetsRequest {
  service: 'Dataset';
  method: 'list';
  payload: {
    filter?: {
      type?: string;
      size?: { min?: number; max?: number };
      dateRange?: { start: string; end: string };
    };
    sort?: {
      field: string;
      direction: 'asc' | 'desc';
    };
    pagination?: {
      offset: number;
      limit: number;
    };
  };
}

// Response
interface ListDatasetsResponse {
  status: 'success';
  result: {
    datasets: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      records: number;
      uploadDate: string;
      preview: unknown;
    }>;
    total: number;
    hasMore: boolean;
  };
}
```

#### Get Dataset

```typescript
// Request
interface GetDatasetRequest {
  service: 'Dataset';
  method: 'get';
  payload: {
    id: string;
    fields?: string[];     // Specific fields to return
    limit?: number;        // Record limit
    offset?: number;       // Record offset
  };
}

// Response
interface GetDatasetResponse {
  status: 'success';
  result: {
    data: unknown[];       // Dataset records
    metadata: {
      id: string;
      name: string;
      totalRecords: number;
      returnedRecords: number;
      fields: string[];
    };
  };
}
```

### Analytics Service

#### Aggregate Data

```typescript
// Request
interface AggregateRequest {
  service: 'Analytics';
  method: 'aggregate';
  payload: {
    datasetId: string;
    operations: Array<{
      type: 'sum' | 'avg' | 'min' | 'max' | 'count';
      field: string;
      groupBy?: string;
      filter?: {
        field: string;
        operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';
        value: unknown;
      };
    }>;
  };
}

// Response
interface AggregateResponse {
  status: 'success';
  result: {
    results: Array<{
      operation: string;
      field: string;
      value: unknown;
      group?: unknown;
    }>;
    metadata: {
      processingTime: number;
      recordsProcessed: number;
    };
  };
}
```

---

## 🛡️ Engine Guarantees

### Performance Guarantees

| Guarantee | Description | Measurement |
|-----------|-------------|-------------|
| **UI Responsiveness** | UI thread never blocks for >16ms | Frame rate monitoring |
| **Memory Safety** | Workers have isolated memory | Memory usage tracking |
| **Error Isolation** | Worker crashes don't affect UI | Error boundary handling |
| **Message Ordering** | Responses match request order | Message ID correlation |
| **Timeout Handling** | Requests timeout gracefully | Timeout enforcement |

### Reliability Guarantees

| Guarantee | Description | Implementation |
|-----------|-------------|----------------|
| **At-Least-Once Delivery** | Requests are processed at least once | Retry mechanism |
| **Exactly-Once Processing** | Idempotent operations prevent duplicates | Operation deduplication |
| **Graceful Degradation** | Fallback to main thread if workers fail | Worker health checks |
| **Resource Cleanup** | Automatic cleanup of completed operations | Garbage collection |

### Data Guarantees

| Guarantee | Description | Validation |
|-----------|-------------|------------|
| **Type Safety** | All messages are type-validated | TypeScript runtime checks |
| **Data Integrity** | Data is not corrupted during transfer | Checksums |
| **Privacy** | Sensitive data is handled securely | Encryption in transit |
| **Audit Trail** | All operations are logged | Operation logging |

---

## 🎯 UI Expectations

### Required UI Behaviors

#### 1. Request Handling
```typescript
// UI must handle all response types
const handleResponse = (response: ResponseMessage) => {
  switch (response.status) {
    case 'success':
      // Handle successful response
      updateUI(response.result);
      break;
    case 'error':
      // Handle errors gracefully
      showError(response.error.message);
      break;
    case 'working':
      // Show progress indication
      updateProgress(response.progress);
      break;
  }
};
```

#### 2. Error Handling
```typescript
// UI must implement error boundaries
const ErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorDisplay />}
      onError={(error) => logError(error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};
```

#### 3. Progress Indication
```typescript
// UI must show progress for long operations
const ProgressIndicator = ({ progress }) => {
  return (
    <div className="progress-bar">
      <div 
        style={{ width: `${progress.current / progress.total * 100}%` }}
      />
      <span>{progress.message}</span>
    </div>
  );
};
```

#### 4. Timeout Management
```typescript
// UI must handle request timeouts
const requestWithTimeout = async (request, timeout = 30000) => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );
  
  return Promise.race([sendRequest(request), timeoutPromise]);
};
```

### Optional UI Enhancements

#### 1. Request Cancellation
```typescript
// UI can cancel ongoing requests
const cancelRequest = (requestId: string) => {
  rpcClient.cancel(requestId);
};
```

#### 2. Request Batching
```typescript
// UI can batch multiple requests
const batchRequests = async (requests: RequestMessage[]) => {
  return rpcClient.batch(requests);
};
```

#### 3. Request Prioritization
```typescript
// UI can set request priorities
const highPriorityRequest = {
  ...request,
  options: { priority: 'high' }
};
```

---

## 📈 Versioning Strategy

### Protocol Versioning

#### Semantic Versioning
```
MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)
```

#### Current Version: **1.0.0**

#### Version Compatibility Matrix

| UI Version | Engine Version | Compatible |
|------------|----------------|-------------|
| 1.0.x      | 1.0.x          | ✅ Full      |
| 1.0.x      | 0.9.x          | ❌ Incompatible |
| 1.1.x      | 1.0.x          | ✅ Partial   |
| 2.0.x      | 1.0.x          | ❌ Breaking  |

### Version Negotiation

#### Handshake Process
```typescript
// Initial handshake
interface HandshakeRequest {
  type: 'handshake';
  version: string;
  capabilities: string[];
}

interface HandshakeResponse {
  type: 'handshake';
  version: string;
  supportedVersions: string[];
  capabilities: string[];
  negotiatedVersion: string;
}
```

#### Backward Compatibility
- **Feature Detection** - UI checks for available features
- **Graceful Degradation** - Fallback for unsupported features
- **Migration Path** - Clear upgrade instructions

### Deprecation Policy

#### Deprecation Timeline
- **Announcement**: 3 months before deprecation
- **Warning Period**: 6 months with deprecation warnings
- **Removal**: 9 months after initial announcement

#### Deprecation Process
```typescript
// Deprecated method with warning
interface DeprecatedRequest {
  method: 'old_method';
  payload: unknown;
  deprecated: {
    version: '1.1.0';
    alternative: 'new_method';
    removalDate: '2024-06-01';
  };
}
```

---

## ⚠️ Error Handling

### Error Classification

#### System Errors
- **Worker Crash** - Worker process terminated
- **Memory Overflow** - Insufficient memory
- **Network Failure** - Communication breakdown
- **Timeout** - Operation exceeded time limit

#### Business Errors
- **Invalid Input** - Malformed request data
- **Permission Denied** - Access control violation
- **Resource Not Found** - Requested resource missing
- **Operation Failed** - Business logic failure

#### Error Response Format
```typescript
interface ErrorResponse {
  status: 'error';
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    category: 'system' | 'business' | 'validation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: {
      field?: string;       // Field with error (validation errors)
      value?: unknown;      // Invalid value
      constraint?: string;   // Violated constraint
    };
    stack?: string;         // Stack trace (development only)
    timestamp: string;      // Error timestamp
    requestId: string;       // Correlated request ID
  };
}
```

### Error Recovery Strategies

#### 1. Automatic Retry
```typescript
const retryConfig = {
  maxRetries: 3,
  backoffStrategy: 'exponential',
  retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'WORKER_CRASH']
};
```

#### 2. Fallback Mechanisms
```typescript
const fallbackChain = [
  'worker',     // Primary: Worker thread
  'main',       // Secondary: Main thread
  'cached'      // Tertiary: Cached results
];
```

#### 3. User Notification
```typescript
const errorNotification = {
  timeout: 'Request timed out. Please try again.',
  network: 'Connection lost. Please check your network.',
  permission: 'You don\'t have permission for this operation.'
};
```

---

## ⚡ Performance Considerations

### Optimization Guidelines

#### 1. Request Batching
```typescript
// Batch multiple small requests
const batched = {
  service: 'Batch',
  method: 'execute',
  payload: {
    requests: [
      { service: 'Data', method: 'get', payload: { id: '1' } },
      { service: 'Data', method: 'get', payload: { id: '2' } }
    ]
  }
};
```

#### 2. Streaming for Large Data
```typescript
// Stream large datasets
const streamRequest = {
  service: 'Data',
  method: 'stream',
  payload: {
    datasetId: 'large-dataset',
    chunkSize: 1000
  }
};
```

#### 3. Caching Strategy
```typescript
// Cache frequently accessed data
const cacheConfig = {
  ttl: 300000,        // 5 minutes
  maxSize: 100,       // Max cached items
  strategy: 'lru'     // Least recently used
};
```

### Performance Metrics

#### Monitoring Points
- **Request Latency** - Time from request to response
- **Throughput** - Requests per second
- **Memory Usage** - Worker memory consumption
- **CPU Usage** - Worker CPU utilization
- **Error Rate** - Failed requests percentage

#### Benchmark Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| UI Response Time | <100ms | User interaction latency |
| Worker Processing | <1s | Average operation time |
| Memory Usage | <100MB | Per worker memory |
| Error Rate | <1% | Failed requests |
| Throughput | >100 req/s | Concurrent requests |

---

## 🔧 Implementation Examples

### Complete Request Flow

```typescript
// 1. UI sends request
const request: RequestMessage = {
  id: generateId(),
  version: '1.0.0',
  timestamp: Date.now(),
  type: 'request',
  service: 'Data',
  method: 'generate_series',
  payload: { count: 1000 },
  options: { priority: 'normal', timeout: 30000 }
};

// 2. Handle response
rpcClient.send(request)
  .then(response => {
    if (response.status === 'success') {
      setChartData(response.result.data);
    } else if (response.status === 'error') {
      showError(response.error.message);
    }
  })
  .catch(error => {
    handleNetworkError(error);
  });
```

### Worker Implementation

```typescript
// Worker message handler
self.onmessage = async (e) => {
  const message: RequestMessage = e.data;
  
  try {
    // Validate message
    validateRequest(message);
    
    // Send working status
    self.postMessage({
      ...createResponse(message.id),
      status: 'working',
      progress: { current: 0, total: 100 }
    });
    
    // Process request
    const result = await processRequest(message);
    
    // Send success response
    self.postMessage({
      ...createResponse(message.id),
      status: 'success',
      result,
      metadata: {
        processingTime: performance.now() - message.timestamp,
        workerId: 'data-worker-1'
      }
    });
    
  } catch (error) {
    // Send error response
    self.postMessage({
      ...createResponse(message.id),
      status: 'error',
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        category: categorizeError(error),
        severity: assessSeverity(error)
      }
    });
  }
};
```

---

## 📚 Additional Resources

### Related Documentation
- [Architecture Overview](../src/README.md)
- [Compute Layer](../src/compute/README.md)
- [State Management](../src/state/README.md)
- [D3 Core Engine](../src/d3-core/README.md)

### Development Guidelines
- [Contributing Guide](CONTRIBUTING.md)
- [Code Style Guide](STYLE_GUIDE.md)
- [Testing Guidelines](TESTING.md)

### API References
- [RPC Client API](RPC_CLIENT_API.md)
- [Worker API](WORKER_API.md)
- [WASM API](WASM_API.md)

---

## 📄 License

This protocol specification is part of the Plug & Play Dashboard project and follows the same license terms.

---

*Version: 1.0.0*  
*Last reviewed: 2026*
