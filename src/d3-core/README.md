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
│   ├── renderer/         # `line.ts`, `area.ts`, `scatter.ts`, `shared.ts`
│   ├── grid/
│   └── tooltip/
└── charts/
    ├── cartesian/        # X/Y charts sharing axes (CartesianChart: line, area, scatter; bar planned)
    ├── registry.ts       # Scaffold for lazy-loaded chart families (donut, radial, …)
    └── index.ts          # Re-exports cartesian + registry (for explicit chart imports)
```

## Import strategy (bundle size)

- Use `@/d3-core` or `@/d3-core/core` for **kernel** utilities (scales, axes, tooltip, `curveMap`, series renderers).
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

Import the series you need (keeps call sites explicit as you add more chart types):

```typescript
import { renderLineSeries } from "@/d3-core/core/renderer/line";
import { renderAreaSeries } from "@/d3-core/core/renderer/area";
import { renderScatterSeries } from "@/d3-core/core/renderer/scatter";

renderLineSeries({
  data: chartData,
  xKey: "x",
  yKey: "y",
  svg: chartGroup,
  scales: { x: xScale, y: yScale },
  curve: pathCurve,
  style: { stroke: "#333" },
  animation: { enabled: true, duration: 500 },
});
```

Shared coordinate helpers: `shared.ts` (`cartesianX`, `cartesianY`, `clearCartesianSeriesPaths`). Bar and histogram will add their own modules alongside these.

### Tooltip (`core/tooltip/`)

HTML and SVG tooltip helpers for Cartesian (time × value) series. They assume sorted `x` data for bisector hover.

## Cartesian charts (`charts/cartesian/`)

`CartesianChart` is a thin component. Imperative D3 work runs in `hooks/useCartesianSvgMount` (SVG + resize) and `hooks/useCartesianChartPaint` (scales, grid, axes, line/area/scatter dispatch, tooltip). Selecting **Bar** in settings shows axes only until a bar renderer exists.

```typescript
import CartesianChart from "@/d3-core/charts/cartesian/CartesianChart";

<CartesianChart
  id="my-chart"
  data={data}
  type="line"
  height={400}
  gridType="both"
/>
```

## Extending

1. **New Cartesian type** (e.g. bar): implement rendering in `core/renderer/` or a dedicated module, then branch inside `useCartesianChartPaint` or compose a thin wrapper.
2. **New non-Cartesian type** (e.g. donut): add `charts/donut/`, register a lazy loader in `charts/registry.ts`, and render from the view layer with `React.lazy`.

## Performance notes

- Debounced resize handling in `useCartesianSvgMount` limits layout thrash.
- Keep heavy transforms out of React render; mutate D3 selections in effects.
- Prefer explicit imports over a single mega-barrel that re-exports every chart.
