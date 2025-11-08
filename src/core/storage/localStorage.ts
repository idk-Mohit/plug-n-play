// path: src/core/storage/localStorage.ts
const KEY = "datasources"; // e.g. [{"id":"ds-1","name":"Sales 2024"}, ...]

export function listDatasets() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // optional: normalize
    return arr.map((x) => ({ id: String(x.id), name: String(x.name || x.id) }));
  } catch (e) {
    console.error("localStore.listDatasets error:", e);
    return [];
  }
}
