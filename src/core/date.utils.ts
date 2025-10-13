// date-utils.ts (or inside your component file)
import { timeParse, utcParse, timeFormat } from "d3-time-format";

type DateLike = string | number | Date | null | undefined;

// Display: Oct 13, 2025 12:34 PM
const formatDisplay = timeFormat("%b %d, %Y %I:%M %p");

// D3 parsers for common inputs (local)
const localParsers = [
  timeParse("%Y-%m-%d %H:%M:%S"),
  timeParse("%Y-%m-%d %H:%M"),
  timeParse("%Y/%m/%d %H:%M:%S"),
  timeParse("%m/%d/%Y %H:%M:%S"),
  timeParse("%m/%d/%Y %I:%M:%S %p"),
  timeParse("%Y-%m-%d"), // date-only, treated as local midnight
];

// D3 parsers for ISO with Z (UTC)
const utcParsers = [
  utcParse("%Y-%m-%dT%H:%M:%S.%LZ"),
  utcParse("%Y-%m-%dT%H:%M:%SZ"),
  utcParse("%Y-%m-%dT%H:%MZ"),
];

/** Normalize and parse almost anything into a Date (or null) without throwing. */
export function toSafeDate(raw: DateLike): Date | null {
  if (raw == null) return null;

  // Already a Date
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }

  // Numbers: UNIX seconds or milliseconds
  if (typeof raw === "number") {
    const ms = raw < 1e12 ? raw * 1000 : raw;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof raw === "string") {
    let s = raw.trim();
    if (!s) return null;

    // `/Date(1697200000000)/` style
    const msMatch = s.match(/\/Date\((\d+)\)\//);
    if (msMatch) {
      const d = new Date(Number(msMatch[1]));
      return isNaN(d.getTime()) ? null : d;
    }

    // If it's 10 or 13 digits only → seconds/ms
    if (/^\d{10,13}$/.test(s)) {
      const n = Number(s);
      const ms = s.length === 10 ? n * 1000 : n;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }

    // ISO-ish without 'T' → add 'T'
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(s)) {
      s = s.replace(" ", "T");
    }

    // Try UTC parsers (strings with trailing Z)
    if (/[zZ]$/.test(s)) {
      for (const p of utcParsers) {
        const d = p(s);
        if (d) return d;
      }
    }

    // Try local parsers (no timezone)
    for (const p of localParsers) {
      const d = p(s);
      if (d) return d;
    }

    // If no timezone and looks ISO, try assuming UTC by appending Z
    const looksIsoNoTz =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(s) &&
      !/[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
    if (looksIsoNoTz) {
      const withZ = s + "Z";
      for (const p of utcParsers) {
        const d = p(withZ);
        if (d) return d;
      }
      const d = new Date(withZ);
      if (!isNaN(d.getTime())) return d;
    }

    // Final fallback: built-in Date (can parse TZ offsets like +05:30)
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/** Safe formatter: never throws. Returns "—" if invalid. */
export function safeFormatDate(raw: DateLike): string {
  const d = toSafeDate(raw);
  if (!d) return "—";
  try {
    return formatDisplay(d);
  } catch {
    return "—";
  }
}
