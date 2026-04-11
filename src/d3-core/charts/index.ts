/**
 * Chart implementations.
 *
 * Prefer importing cartesian vs arc/radial modules directly so Vite can split chunks.
 * The top-level `@/d3-core` entry re-exports core utilities only (not charts).
 */

export { CartesianChart } from "./cartesian";
export type { CartesianChartProps } from "./cartesian";
export { chartRegistry } from "./registry";
