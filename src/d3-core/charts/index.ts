/**
 * Chart implementations.
 *
 * Prefer importing cartesian vs arc/radial modules directly so Vite can split chunks.
 * The top-level `@/d3-core` entry re-exports core utilities only (not charts).
 */

export { BaseChart } from "./cartesian";
export { chartRegistry } from "./registry";
