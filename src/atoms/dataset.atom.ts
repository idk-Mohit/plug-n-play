// src/atoms/dataset.atom.ts
import { atomWithStorage } from "jotai/utils";

export interface DatasetMeta {
  id: number;
  name: string;
  type: "json" | "csv";
  added: string;
}

// Use Jotai’s built-in atomWithStorage for persistence
export const persistedDatasetsAtom = atomWithStorage<DatasetMeta[]>(
  "datasets",
  []
);
