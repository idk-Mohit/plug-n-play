// path: src/atoms/dataset.atom.ts
import type { uuid } from "@/types/data.types";
import { atomWithStorage } from "jotai/utils";

export type DatasetType = "json" | "csv";

export interface Dataset {
  id: string;
  name: string;
  type: DatasetType;
  size: string; // e.g., "12.3 KB"
  records?: number; // number of rows/items if array-like
  uploadDate: string; // ISO string
  preview: unknown;
  storageKey: uuid;
}

export const persistedDatasetsAtom = atomWithStorage<Dataset[]>(
  "datasources",
  []
);
