# D3 Core Directory

This directory contains the D3 visualization engine for the dashboard: shared **core** utilities (scales, axes, curves, grid, tooltip, series renderer) and **chart** components grouped by layout family.

## Structure

```
d3-core/
├── index.ts              # Re-exports core/ only (charts are imported by path)
├── core/
│   ├── curves.ts         # D3 line/area curve factories + PathCurveType (not in enums/)
│   ├── scales/
│   ├── axes/
│   ├── renderer/         # Cartesian line / area / scatter series
│   ├── grid/
│   └── tooltip/
└── charts/
    ├── cartesian/        # X/Y charts sharing axes (BaseChart: line, area, scatter; bar planned)
    ├── registry.ts       # Scaffold for lazy-loaded chart families (donut, radial, …)
    └── index.ts          # Re-exports cartesian + registry (for explicit chart imports)
```

## Import strategy (bundle size)

- Use `@/d3-core` or `@/d3-core/core` for **kernel** utilities (scales, axes, tooltip, `curveMap`, `renderSeries`).
- Import chart components from **`@/d3-core/charts/cartesian/...`** (or `@/d3-core/charts`) so future arc/radial modules can stay in separate chunks.
- `charts/registry.ts` is the intended place to register `import()`-based loaders for non-Cartesian charts.

## Core utilities

### Scales (`core/scales/`)

```typescript
import { generateScale } from "@/d3-core/core/scales";

const scale = generateScale({
  data: chartData,
  key: "value",
  scaleType: "linear",
  range: [0, chartWidth],
});
```

### Axes (`core/axes/`)

```typescript
import { renderAxes } from "@/d3-core/core/axes";

renderAxes({
  svg: chartGroup,
  scales: { x: xScale, y: yScale },
  height: chartHeight,
});
```

### Curves (`core/curves.ts`)

Line and area paths use D3 curve factories keyed by persisted settings. Import `curveMap` and `PathCurveType` from here (or re-exported via `@/state/ui/chart-setting` in UI code).

### Renderer (`core/renderer/`)

```typescript
import { renderSeries } from "@/d3-core/core/renderer";

renderSeries({
  type: "line",
  data: chartData,
  xKey: "x",
  yKey: "y",
  svg: chartGroup,
  scales: { x: xScale, y: yScale },
});
```

Supports line, area, and scatter. `ChartType.BAR` uses a future bar renderer; `renderSeries` typing excludes `bar` until implemented.

### Tooltip (`core/tooltip/`)

HTML and SVG tooltip helpers for Cartesian (time × value) series. They assume sorted `x` data for bisector hover.

## Cartesian charts (`charts/cartesian/`)

`BaseChart` owns the SVG shell, `ResizeObserver`, margins, scales, grid, axes, series rendering, and tooltip wiring for line / area / scatter. Selecting **Bar** in settings shows axes only until the bar series is implemented.

```typescript
import BaseChart from "@/d3-core/charts/cartesian/BaseChart";

<BaseChart
  id="my-chart"
  data={data}
  type="line"
  height={400}
  gridType="both"
/>
```

## Extending

1. **New Cartesian type** (e.g. bar): implement rendering in `core/renderer/` or a dedicated module, then branch inside `BaseChart` or compose a thin wrapper.
2. **New non-Cartesian type** (e.g. donut): add `charts/donut/`, register a lazy loader in `charts/registry.ts`, and render from the view layer with `React.lazy`.

## Performance notes

- Debounced resize handling in `BaseChart` limits layout thrash.
- Keep heavy transforms out of React render; mutate D3 selections in effects.
- Prefer explicit imports over a single mega-barrel that re-exports every chart.
