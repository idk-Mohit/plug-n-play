# Core Directory

This directory contains the essential application infrastructure and core utilities.

## 📁 Structure

```
core/
├── ⚙️ data-engine.ts    # Data storage and retrieval interface
├── 📅 date.utils.ts     # Date formatting and manipulation utilities
├── 🌐 rpc/              # gRPC client and server infrastructure
│   ├── 📡 config/       # RPC configuration and client setup
│   └── 🎮 controllers/  # RPC service controllers
└── 🗄️ storage/          # Data persistence utilities
    ├── 💾 localStorage.ts # Browser localStorage management
    └── 🗃️ indexdb.ts      # IndexedDB for large data storage
```

## 🎯 Purpose

The core directory provides **essential application infrastructure** that:
- Manages data persistence and retrieval
- Handles RPC communication between main thread and workers
- Provides utility functions for common operations
- Ensures data integrity and performance
- Abstracts storage mechanisms

## ⚙️ Data Engine (`data-engine.ts`)

The data engine provides a unified interface for data operations:

```typescript
import { dataEngine } from "@/core/data-engine";

// Save dataset
await dataEngine.saveDataset('dataset-1', rawData);

// Retrieve dataset
const data = await dataEngine.getDataset('dataset-1');

// Get preview (limited records)
const preview = await dataEngine.getDatasetPreview('dataset-1', 100);

// Delete dataset
await dataEngine.deleteDataset('dataset-1');
```

### Features
- **Unified API** - Single interface for all data operations
- **Storage abstraction** - Switch between localStorage and IndexedDB
- **Type safety** - Full TypeScript support
- **Error handling** - Comprehensive error management
- **Performance** - Optimized for large datasets

## 📅 Date Utilities (`date.utils.ts`)

Provides date formatting and manipulation functions:

```typescript
import { safeFormatDate, parseDate, isValidDate } from "@/core/date.utils";

// Format dates safely
const formatted = safeFormatDate(new Date(), 'MMM dd, yyyy');

// Parse various date formats
const parsed = parseDate('2024-01-15');

// Validate dates
const isValid = isValidDate(dateString);
```

### Features
- **Safe formatting** - Handles invalid dates gracefully
- **Multiple formats** - Support for various date patterns
- **Timezone aware** - Proper timezone handling
- **Validation** - Robust date checking

## 🌐 RPC Infrastructure (`rpc/`)

### 📡 Configuration (`config/`)
```typescript
import { MiniGrpc } from "@/core/rpc/config/client";

// Create RPC client
const client = new MiniGrpc(worker);

// Make RPC calls
const result = await client.call('Service', 'Method', params);
```

### 🎮 Controllers (`controllers/`)
RPC service controllers for different data operations:
- **Datasources** - Dataset management operations
- **Analytics** - Data analysis and aggregation
- **Export** - Data export functionality

## 🗄️ Storage Layer (`storage/`)

### 💾 Local Storage (`localStorage.ts`)
```typescript
import { 
  saveToLocalStorage, 
  getFromLocalStorage, 
  deleteFromLocalStorage 
} from "@/core/storage/localStorage";

// Simple key-value storage
saveToLocalStorage('user-preferences', preferences);
const prefs = getFromLocalStorage('user-preferences');
```

**Use Cases:**
- User preferences and settings
- UI state persistence
- Small configuration data
- Session management

### 🗃️ IndexedDB (`indexdb.ts`)
```typescript
import { 
  idbSave, 
  idbGet, 
  idbDelete, 
  idbList 
} from "@/core/storage/indexdb";

// Large data storage
await idbSave('datasets', datasetId, largeDataset);
const data = await idbGet('datasets', datasetId);
```

**Use Cases:**
- Large datasets
- Binary data (files, blobs)
- Complex objects
- Performance-critical data

## 🔄 Usage Patterns

### Data Operations
```typescript
// High-level data operations
import { dataEngine } from "@/core/data-engine";

// Low-level storage operations
import { idbSave } from "@/core/storage/indexdb";
import { saveToLocalStorage } from "@/core/storage/localStorage";
```

### RPC Communication
```typescript
import { rpcClientAtom } from "@/state/ui/rpcClient";

// In component
const rpc = useAtomValue(rpcClientAtom);
const result = await rpc.call('Datasource', 'list', {});
```

## 🚀 Performance Considerations

### ⚡ Optimizations
- **Lazy loading** - Load data only when needed
- **Caching** - Cache frequently accessed data
- **Batching** - Group storage operations
- **Compression** - Compress large datasets
- **Indexing** - Optimize IndexedDB queries

### 📊 Storage Strategy
| Data Type | Storage Method | Size Limit | Use Case |
|-----------|----------------|------------|----------|
| User Settings | localStorage | ~5MB | Preferences, UI state |
| Datasets | IndexedDB | ~50MB+ | Large data objects |
| Cache | Memory | Limited | Session data |
| Files | IndexedDB | Large | Binary data |

## 🔧 Extending the Core

### Adding New Storage Backends
```typescript
// Create new storage adapter
export class CustomStorage {
  async save(key: string, data: any): Promise<void> {
    // Implementation
  }
  
  async get(key: string): Promise<any> {
    // Implementation
  }
}

// Register with data engine
dataEngine.registerStorage('custom', new CustomStorage());
```

### Adding RPC Services
```typescript
// Create new controller in rpc/controllers/
export class CustomController {
  async customMethod(params: CustomParams): Promise<CustomResult> {
    // Implementation
  }
}

// Register with RPC server
rpcServer.registerController('Custom', new CustomController());
```

## 📋 Best Practices

1. **Use data engine** - Don't access storage directly
2. **Handle errors** - Always wrap storage operations in try-catch
3. **Validate data** - Check data before storage
4. **Clean up** - Remove unused data to prevent bloat
5. **Test storage** - Verify data integrity

## 🧪 Testing Core Utilities

```typescript
import { dataEngine } from "@/core/data-engine";

describe('Data Engine', () => {
  test('saves and retrieves data', async () => {
    const testData = { id: 'test', value: 'data' };
    
    await dataEngine.saveDataset('test', testData);
    const retrieved = await dataEngine.getDataset('test');
    
    expect(retrieved).toEqual(testData);
  });
});
```

## 🔒 Security Considerations

- **Data validation** - Validate all incoming data
- **Sanitization** - Clean data before storage
- **Access control** - Restrict data access by user
- **Encryption** - Sensitive data should be encrypted
- **Audit logging** - Log data operations for debugging
