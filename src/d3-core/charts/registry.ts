/**
 * Chart type registry (scaffolding for code-splitting).
 *
 * When you add non-Cartesian charts (donut, radial, etc.), register lazy loaders here
 * and have the view layer `React.lazy` the matching entry so those modules are not
 * pulled into the initial bundle.
 *
 * Example (future):
 *   export const chartRegistry = {
 *     donut: () => import("./donut/DonutChart"),
 *   } as const;
 */

import type { ChartType } from "@/enums/chart.enums";

/** Placeholder map; extend with lazy `import()` factories as new chart families ship. */
export const chartRegistry: Partial<
  Record<ChartType, () => Promise<unknown>>
> = {};
