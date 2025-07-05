import * as d3 from "d3";

// Define the accepted scale types as a union of string literals.
type ScaleType = "linear" | "time" | "utc" | "band" | "ordinal";

// Interface for scale options that specifies the configuration needed to generate a scale.
interface ScaleOptions<T> {
  data: T[]; // The data array from which the domain will be derived.
  key: keyof T; // The key in each data object to use for the domain values.
  scaleType: ScaleType; // The type of scale to generate.
  range: [number, number]; // The output range for the scale.
  padding?: number; // Optional padding for band scales.
  domainOverride?: [unknown, unknown]; // Optional domain override if provided.
}

// Type alias for the possible D3 scales that can be generated.
type D3Scale =
  | d3.ScaleLinear<number, number>
  | d3.ScaleTime<number, number>
  | d3.ScaleBand<string>
  | d3.ScaleOrdinal<string, string>;

/**
 * Generates a D3 scale based on the provided configuration.
 * @param options - An object containing the configuration for the scale.
 * @returns A D3 scale object.
 */
function generateScale<T>({
  data,
  key,
  scaleType,
  range,
  padding = 0.1,
  domainOverride,
}: ScaleOptions<T>): D3Scale {
  const rawValues = data.map((d) => d[key]); // Extract the values associated with the specified key.

  switch (scaleType) {
    case "linear": {
      // Determine the domain, using domainOverride if provided, otherwise calculate from data.
      const domain = domainOverride || [
        d3.min(rawValues as number[]),
        d3.max(rawValues as number[]) || 0,
      ];
      // Create and return a linear scale.
      return d3
        .scaleLinear()
        .domain(domain as [number, number])
        .range(range);
    }

    case "time": {
      // For time scales, calculate the domain using d3.extent or domainOverride.
      const domain = domainOverride || d3.extent(rawValues as Date[]);
      // Create and return a time scale.
      return d3
        .scaleTime()
        .domain(domain as [Date, Date])
        .range(range);
    }

    case "utc": {
      // Similar to time, but uses UTC dates.
      const domain = domainOverride || d3.extent(rawValues as Date[]);
      // Create and return a UTC scale.
      return d3
        .scaleUtc()
        .domain(domain as [Date, Date])
        .range(range);
    }

    case "band": {
      // Use unique values from the data as the domain for band scales.
      const domain =
        domainOverride || (Array.from(new Set(rawValues)) as string[]);
      // Create and return a band scale with optional padding.
      return d3
        .scaleBand()
        .domain(domain as string[])
        .range(range)
        .padding(padding);
    }

    case "ordinal": {
      // Use unique values from the data as the domain for ordinal scales.
      const domain =
        domainOverride || (Array.from(new Set(rawValues)) as string[]);
      const colorRange = d3.schemeCategory10; // Use a predefined color scheme.
      // Create and return an ordinal scale with a color range.
      return d3
        .scaleOrdinal<string, string>()
        .domain(domain as unknown as string[])
        .range(colorRange);
    }

    default:
      // Throw an error if an unsupported scale type is provided.
      throw new Error(`Unsupported scale type: ${scaleType}`);
  }
}

export { generateScale };
export type { ScaleOptions, ScaleType, D3Scale };
