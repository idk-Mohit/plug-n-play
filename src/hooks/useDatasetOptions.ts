import { useMemo } from "react";
import { useAtomValue } from "jotai";

import type { DatasetRef } from "@/core/rpc/controllers/datasources";
import { persistedDatasetsAtom } from "@/state/data/dataset";
import {
  DEFAULT_SAMPLE_DATASET_ID,
  createDefaultSampleDatasetMeta,
} from "@/state/data/defaultSampleDataset";

/** Footer + drawer dataset combobox options (sample default + persisted uploads). */
export function useDatasetOptions(): DatasetRef[] {
  const persistedDatasets = useAtomValue(persistedDatasetsAtom);

  return useMemo((): DatasetRef[] => {
    const defaultRef: DatasetRef = {
      id: DEFAULT_SAMPLE_DATASET_ID,
      name: createDefaultSampleDatasetMeta().name,
    };
    const fromPersisted = persistedDatasets.map((d) => ({
      id: d.id,
      name: d.name,
    }));
    const hasDefault = fromPersisted.some(
      (d) => d.id === DEFAULT_SAMPLE_DATASET_ID,
    );
    if (hasDefault) return fromPersisted;
    return [defaultRef, ...fromPersisted];
  }, [persistedDatasets]);
}
