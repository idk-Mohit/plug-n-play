/**
 * Cartesian (X/Y) charts: line, area, scatter, and future bar.
 * `CartesianChart` is the default entry; hooks are available for advanced composition.
 */

export { default as CartesianChart } from "./CartesianChart";
export type { CartesianChartProps } from "./CartesianChart";
export {
  useCartesianSvgMount,
  useCartesianChartPaint,
  type CartesianLastPaint,
} from "./hooks";
