import { afterEach, beforeEach, vi } from "vitest";

/**
 * Registers before/after hooks that replace `globalThis.localStorage` with an
 * in-memory implementation (Node has no localStorage).
 */
export function stubLocalStorageForTests(): void {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };

  beforeEach(() => {
    map.clear();
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
}
