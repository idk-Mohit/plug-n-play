# D3 Core Directory

This directory contains the complete D3.js visualization engine for the dashboard platform.

## 📁 Structure

```
d3-core/
├── 🎯 core/           # Core D3 utilities and functions
│   ├── 📏 scales/     # Scale generation and management
│   ├── 📊 axes/       # Axis rendering and configuration
│   ├── 🎨 renderer/  # Series rendering (lines, areas, scatter)
│   ├── 🌐 grid/       # Grid generation utilities
│   ├── 💬 tooltip/    # Tooltip implementations
│   ├── 🎮 interactions/ # Zoom, pan, and other interactions
│   └── 🎭 transitions/ # Animation and transition utilities
├── 📈 charts/         # Chart implementations
│   ├── 📊 base/      # Base chart component
│   ├── 📈 line/       # Line chart implementation
│   ├── 📊 area/       # Area chart implementation
│   ├── 🔵 scatter/    # Scatter plot implementation
│   └── 📊 bar/        # Bar chart implementation
└── 📋 types/         # D3-specific type definitions
```

## 🎯 Purpose

D3-Core provides a **unified, performant visualization engine** that:
- Abstracts D3.js complexity into reusable utilities
- Provides consistent chart implementations
- Handles scales, axes, and rendering automatically
- Supports animations and interactions
- Optimized for large datasets

## 🧠 Core Utilities (`core/`)

### 📏 Scales (`scales/`)
```typescript
import { generateScale } from "@/d3-core/core/scales";

const scale = generateScale({
  data: chartData,
  key: 'value',
  scaleType: 'linear',
  range: [0, chartWidth]
});
```

**Features:**
- Automatic domain calculation
- Support for linear, time, band, ordinal scales
- Type-safe scale generation
- Custom domain overrides

### 📊 Axes (`axes/`)
```typescript
import { renderAxes } from "@/d3-core/core/axes";

renderAxes({
  svg: chartGroup,
  scales: { x: xScale, y: yScale },
  height: chartHeight,
  format: { x: dateFormatter, y: valueFormatter }
});
```

**Features:**
- Automatic axis generation
- Custom formatting and styling
- Animation support
- Visibility controls

### 🎨 Renderer (`renderer/`)
```typescript
import { renderSeries } from "@/d3-core/core/renderer";

renderSeries({
  type: 'line',
  data: chartData,
  svg: chartGroup,
  scales: { x: xScale, y: yScale },
  style: { stroke: 'blue', strokeWidth: 2 }
});
```

**Features:**
- Line, area, and scatter plot rendering
- Smooth curve interpolation
- Animation support
- Data point rendering

## 📈 Chart Implementations (`charts/`)

### 📊 Base Chart (`base/BaseChart.tsx`)
The foundation for all chart implementations:
- Manages SVG container and resizing
- Handles scale generation and axis rendering
- Coordinates rendering pipeline
- Provides consistent chart API

### 📈 Chart Types
Each chart type extends BaseChart:
- **Line Chart** - Time series and line data
- **Area Chart** - Filled area visualizations  
- **Scatter Plot** - Point-based data
- **Bar Chart** - Categorical comparisons

## 🔄 Usage Patterns

```typescript
// Basic chart usage
import { LineChart } from "@/d3-core/charts";

<LineChart 
  data={timeSeriesData}
  height={300}
  settings={chartSettings}
/>

// Advanced usage with BaseChart
import { BaseChart } from "@/d3-core/charts/base";

<BaseChart
  id="my-chart"
  data={data}
  type="line"
  height={400}
  gridType="both"
/>
```

## 🚀 Performance Features

### 🎯 Optimizations
- **Virtual rendering** for large datasets
- **Debounced updates** to prevent excessive re-renders
- **Spatial indexing** for fast data point lookup
- **Memory management** for data cleanup

### 🎭 Animations
- Smooth transitions between data states
- Configurable animation types (fade, draw, grow)
- Performance-aware animation scheduling
- Hardware acceleration support

## 🎮 Interactions

### 🔄 Built-in Interactions
- **Zoom** - Mouse wheel and pinch zoom
- **Pan** - Click and drag navigation
- **Hover** - Tooltip and highlighting
- **Selection** - Data point selection

### 🎛️ Configuration
```typescript
const interactionConfig = {
  mode: 'zoom', // 'none' | 'pan' | 'zoom' | 'both'
  sensitivity: 1.0,
  minZoom: 0.5,
  maxZoom: 10.0
};
```

## 📋 Best Practices

1. **Use scales utility** - Don't create scales manually
2. **Leverage BaseChart** - Extend for custom charts
3. **Optimize data** - Pre-process large datasets
4. **Configure animations** - Disable for real-time data
5. **Memory management** - Clean up event listeners

## 🔧 Extending the Engine

### Adding New Chart Types
```typescript
// Create new chart in charts/custom/
import { BaseChart } from '../base/BaseChart';

export function CustomChart({ data, ...props }) {
  return (
    <BaseChart
      {...props}
      data={data}
      type="custom"
      renderCustomSeries={customRenderer}
    />
  );
}
```

### Adding Core Utilities
```typescript
// Add to appropriate core/ directory
export function customUtility(params) {
  // Implementation
}
```

## 🎨 Theming

Charts support consistent theming through:
- CSS variables for colors
- Configurable stroke and fill styles
- Custom font settings
- Responsive breakpoints
