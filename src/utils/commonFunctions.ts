import * as d3 from "d3";

/**
 * Given a CSS color string (e.g. hex, named color, or modern HSL syntax),
 * returns a string representing the same color with the specified alpha
 * value (default: 0.7). If the input is not a valid HSL color, falls back
 * to using d3.hsl to convert the color to HSL, then applies the alpha value.
 *
 * @param {string} stroke - The CSS color string to convert.
 * @param {number} [alpha=0.7] - The alpha value to use.
 * @returns {string} A string representing the same color with the specified
 * alpha value, in HSLA syntax.
 */
export function getGradientFill(stroke: string, alpha: number = 0.4): string {
  // Convert modern CSS syntax: hsl(210 82% 36%) → hsl(210, 82%, 36%)
  const normalized = stroke.replace(
    /^hsl\(\s*(\d+)\s+(\d+)%\s+(\d+)%\s*\)$/i,
    "hsl($1, $2%, $3%)"
  );

  // Check again after normalizing
  const match = normalized.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }

  // Fallback: named colors or hex values
  const hsl = d3.hsl(stroke); // fallback with original stroke
  return `hsla(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%, ${alpha})`;
}
