/**
 * Minimal CSV parsing for browser uploads (simple comma-separated, optional quotes).
 * Produces an array of row objects keyed by header names.
 */
export function parseCsvToRecords(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const splitRow = (line: string): string[] =>
    line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

  const header = splitRow(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    const row: Record<string, string> = {};
    header.forEach((key, idx) => {
      row[key] = cells[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}
