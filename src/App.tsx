import { ThemeProvider } from "./components/theme-provider";
import ViewRenderer from "./components/ViewRenderer";
import Dashboard from "./containers/dashboard/Dashboard";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { idbGet, idbListDatasetKeys, idbSave } from "@/core/storage/indexdb";
import { persistedDatasetsAtom, type DatasetMeta } from "@/state/data/dataset";
import {
  DATASETS_MANIFEST_IDB_KEY,
  mergeDatasetManifests,
  mergePlaceholderMetasForIdbDatasetKeys,
  slimDatasetMetaForPersistence,
} from "@/state/data/dataset-storage";
import {
  createDefaultSampleDatasetMeta,
  DEFAULT_SAMPLE_DATASET_ID,
} from "@/state/data/defaultSampleDataset";

/**
 * The main app component.
 *
 * This component wraps the entire app in a {@link ThemeProvider} and
 * a {@link Dashboard} component.
 *
 * The {@link ThemeProvider} component provides a theme to the app, and
 * allows the user to switch between different themes.
 *
 * The {@link Dashboard} component provides the main layout of the app,
 * and contains the navigation sidebar and the main content area.
 *
 * The main content area is rendered by the {@link ViewRenderer} component,
 * which is a wrapper around the {@link Suspense} component from React.
 *
 * The {@link ViewRenderer} component renders the current view based on
 * the value of the `activeViewAtom` atom.
 *
 * @returns The main app component.
 */
function App() {
  const setPersistedDatasets = useSetAtom(persistedDatasetsAtom);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const fromIdb = await idbGet<DatasetMeta[]>(DATASETS_MANIFEST_IDB_KEY);
      const datasetKeys = await idbListDatasetKeys();
      if (cancelled) return;
      setPersistedDatasets((prev) => {
        if (prev.length > 0 && (!fromIdb || fromIdb.length === 0)) {
          void idbSave(
            DATASETS_MANIFEST_IDB_KEY,
            prev.map(slimDatasetMetaForPersistence),
          );
        }
        const mergedManifest = mergeDatasetManifests(prev, fromIdb ?? []);
        const withIdbRows = mergePlaceholderMetasForIdbDatasetKeys(
          mergedManifest,
          datasetKeys,
          DEFAULT_SAMPLE_DATASET_ID,
        );
        if (withIdbRows.some((d) => d.id === DEFAULT_SAMPLE_DATASET_ID)) {
          return withIdbRows;
        }
        return [createDefaultSampleDatasetMeta(), ...withIdbRows];
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [setPersistedDatasets]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Dashboard>
        <ViewRenderer />
      </Dashboard>
    </ThemeProvider>
  );
}

export default App;
