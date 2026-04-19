import type { DatasetMeta } from "@/state/data/dataset";
import type { uuid } from "@/types/data.types";

// path: src/core/storage/localStorage.ts
const KEY = "datasources"; // e.g. [{"id":"ds-1","name":"Sales 2024"}, ...]

class LocalStoreUtils {
  public static getDatasources() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const datasources = JSON.parse(raw);
      if (!Array.isArray(datasources)) return null;
      return datasources;
    } catch (e) {
      console.error("localStore.getDatasources error:", e);
      return null;
    }
  }
}

export const listDatasets = () => {
  const datasources = LocalStoreUtils.getDatasources();
  if (!datasources) return [];
  return datasources.map((x) => ({
    id: String(x.id),
    name: String(x.name || x.id),
  }));
};

export const metaDataFromDatasetId = (id: uuid): DatasetMeta | null => {
  const datasources = LocalStoreUtils.getDatasources();
  if (!datasources) return null;
  return datasources.find((x) => String(x.id) === String(id)) ?? null;
};
