import { ThemeProvider } from "./components/theme-provider";
import { AppConfirmDialog } from "./components/AppConfirmDialog";
import { AppToast } from "./components/AppToast";
import ViewRenderer from "./components/ViewRenderer";
import Dashboard from "./containers/dashboard/Dashboard";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useAtomValue, useSetAtom } from "jotai";
import { useStore } from "jotai/react";
import { useCallback, useEffect, useRef } from "react";
import { getEngineRpc } from "@/core/rpc/engineSingleton";
import {
  activeDatasetAtom,
  persistedDatasetsAtom,
  type DatasetMeta,
} from "@/state/data/dataset";
import {
  clearAllIndexedDbDatasetStorage,
  countRecoverableDatasetIds,
  hasIndexedDbRecoverableDatasets,
  hydrateMissingPreviewsFromIdb,
  isPersistedDatasourcesListEmptyInLs,
  mergePersistedDatasetsWithIndexedDbSources,
} from "@/state/data/dataset-storage";
import {
  createDefaultSampleDatasetMeta,
  DEFAULT_SAMPLE_DATASET_ID,
} from "@/state/data/defaultSampleDataset";
import {
  hydrateHistoryFromIdb,
  normalizeSamplerIntervalMs,
  setSamplerInterval,
  startSystemSampler,
  stopSystemSampler,
} from "@/core/system/sampler";
import { samplerIntervalMsAtom } from "@/state/system/atoms";

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
function SamplerIntervalBridge() {
  const ms = useAtomValue(samplerIntervalMsAtom);
  useEffect(() => {
    setSamplerInterval(ms);
  }, [ms]);
  return null;
}

function App() {
  const store = useStore();
  const setPersistedDatasets = useSetAtom(persistedDatasetsAtom);
  const setActiveDataset = useSetAtom(activeDatasetAtom);
  const { open: openConfirmDialog, close: closeConfirmDialog } =
    useConfirmDialog();
  const recoveryPromptedRef = useRef(false);

  const applyMergedAndHydrated = useCallback(
    async (cancelled: () => boolean) => {
      const rpc = getEngineRpc();
      const fromIdb = await rpc.call<DatasetMeta[]>("Data", "getManifest", []);
      const datasetKeys = await rpc.call<string[]>(
        "Data",
        "listDatasetKeys",
        [],
      );
      if (cancelled()) return;
      const prev = store.get(persistedDatasetsAtom);
      const merged = mergePersistedDatasetsWithIndexedDbSources(
        prev,
        fromIdb,
        datasetKeys,
        DEFAULT_SAMPLE_DATASET_ID,
      );
      const hydrated = await hydrateMissingPreviewsFromIdb(merged);
      if (cancelled()) return;
      setPersistedDatasets(hydrated);
    },
    [setPersistedDatasets, store],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rpc = getEngineRpc();
      const fromIdb = await rpc.call<DatasetMeta[]>("Data", "getManifest", []);
      const datasetKeys = await rpc.call<string[]>(
        "Data",
        "listDatasetKeys",
        [],
      );
      if (cancelled) return;

      if (
        isPersistedDatasourcesListEmptyInLs() &&
        hasIndexedDbRecoverableDatasets(
          fromIdb,
          datasetKeys,
          DEFAULT_SAMPLE_DATASET_ID,
        )
      ) {
        if (recoveryPromptedRef.current) return;
        recoveryPromptedRef.current = true;
        const count = Math.max(
          1,
          countRecoverableDatasetIds(
            fromIdb,
            datasetKeys,
            DEFAULT_SAMPLE_DATASET_ID,
          ),
        );
        const countLabel =
          count === 1 ? "one stored dataset" : `${count} stored datasets`;
        openConfirmDialog({
          title: "Stored data found",
          subheading: `${countLabel} found in IndexedDB`,
          description:
            "Your dataset list was cleared (for example after a hard reload or clearing site data), but stored data remains. Restore them to the list with a short preview, or remove that stored data permanently.",
          dismissible: false,
          variant: "confirm",
          primaryButton: {
            label: "Restore datasets",
            onClick: () => {
              closeConfirmDialog();
              void applyMergedAndHydrated(() => false);
            },
          },
          secondaryButton: {
            label: "Delete stored data",
            variant: "destructive",
            onClick: async () => {
              closeConfirmDialog();
              await clearAllIndexedDbDatasetStorage();
              setActiveDataset(null);
              setPersistedDatasets([createDefaultSampleDatasetMeta()]);
            },
          },
        });
        return;
      }

      await applyMergedAndHydrated(() => cancelled);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    applyMergedAndHydrated,
    closeConfirmDialog,
    openConfirmDialog,
    setActiveDataset,
    setPersistedDatasets,
  ]);

  useEffect(() => {
    startSystemSampler(
      normalizeSamplerIntervalMs(store.get(samplerIntervalMsAtom)),
    );
    void hydrateHistoryFromIdb();
    return () => {
      stopSystemSampler();
    };
  }, [store]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SamplerIntervalBridge />
      <AppToast />
      <AppConfirmDialog />
      <Dashboard>
        <ViewRenderer />
      </Dashboard>
    </ThemeProvider>
  );
}

export default App;
