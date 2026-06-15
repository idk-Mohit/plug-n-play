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
  activeDashboardIdAtom,
  createDefaultMainDashboard,
  dashboardManifestHydratedAtom,
  findDashboardById,
  persistedDashboardsAtom,
} from "@/state/data/dashboard";
import {
  fetchDashboardManifestFromIdb,
  mergePersistedDashboardsWithIndexedDb,
} from "@/state/data/dashboard-storage";
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
  slimDatasetMetaForPersistence,
} from "@/state/data/dataset-storage";
import {
  createDefaultSampleDatasetMeta,
  DEFAULT_SAMPLE_DATASET_ID,
  isDefaultSampleDatasetId,
} from "@/state/data/defaultSampleDataset";
import { parseViewFromHash, resolveViewFromLocation } from "@/state/ui/view-hash";
import {
  hydrateHistoryFromIdb,
  normalizeSamplerIntervalMs,
  setSamplerInterval,
  startSystemSampler,
  stopSystemSampler,
} from "@/core/system/sampler";
import { samplerIntervalMsAtom } from "@/state/system/atoms";

/** Seed IDB rows from manifest preview when metadata exists but row store is empty. */
async function seedRowsFromManifestPreviews(
  rpc: ReturnType<typeof getEngineRpc>,
  datasets: DatasetMeta[],
): Promise<void> {
  for (const d of datasets) {
    if (isDefaultSampleDatasetId(d.id)) continue;
    const preview = d.preview;
    if (!Array.isArray(preview) || preview.length === 0) continue;
    const meta = await rpc.call<{ rowCount: number }>("Data", "getMeta", [
      d.id,
    ]);
    if (meta.rowCount > 0) continue;
    await rpc.call("Data", "save", [{ datasetId: d.id, data: preview }]);
  }
}

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
  const setPersistedDashboards = useSetAtom(persistedDashboardsAtom);
  const setActiveDashboardId = useSetAtom(activeDashboardIdAtom);
  const setDashboardManifestHydrated = useSetAtom(dashboardManifestHydratedAtom);
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
      await rpc.call("Data", "saveManifest", [
        hydrated.map(slimDatasetMetaForPersistence),
      ]);
      await seedRowsFromManifestPreviews(rpc, hydrated);
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
    let cancelled = false;
    void (async () => {
      try {
        const fromIdb = await fetchDashboardManifestFromIdb();
        if (cancelled) return;
        const prev = store.get(persistedDashboardsAtom);
        const merged = mergePersistedDashboardsWithIndexedDb(prev, fromIdb);
        const list =
          merged.length > 0 ? merged : [createDefaultMainDashboard()];
        setPersistedDashboards(list);
        const storedActiveId = store.get(activeDashboardIdAtom);
        const fromHash = parseViewFromHash(location.hash);
        const hashDashboardId = fromHash?.meta?.dashboardId;
        const storedView = resolveViewFromLocation();
        const metaDashboardId = storedView.meta?.dashboardId;
        const preferredId = hashDashboardId ?? metaDashboardId ?? storedActiveId;

        if (preferredId && findDashboardById(list, preferredId)) {
          setActiveDashboardId(preferredId);
        } else if (
          !storedActiveId ||
          !findDashboardById(list, storedActiveId)
        ) {
          setActiveDashboardId(list[0]!.id);
        }
      } finally {
        if (!cancelled) setDashboardManifestHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setActiveDashboardId, setDashboardManifestHydrated, setPersistedDashboards, store]);

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
