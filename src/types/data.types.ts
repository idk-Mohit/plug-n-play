export type AnyRecord = Record<string, unknown>;
export type uuid = string;

/** Default/generated dashboard series use `x` as a timestamp (`Date` or ISO string) and `y` as a number. */
export interface timeseriesdata {
  x: string | Date;
  y: number;
}
