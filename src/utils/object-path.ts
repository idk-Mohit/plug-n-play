/**
 * Immutable get/set for dotted paths like "animation.duration".
 */

export function getNested(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function setNested<T extends object>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split(".");
  if (parts.length === 1) {
    return { ...obj, [path]: value } as T;
  }
  const [head, ...rest] = parts;
  const key = head as keyof T;
  const raw = (obj as Record<string, unknown>)[head];
  const nested =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as object)
      : {};
  const updatedNested = setNested(nested as object, rest.join("."), value);
  return { ...obj, [key]: updatedNested } as T;
}
