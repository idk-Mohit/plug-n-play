import { Separator } from "@/components/ui/separator";
import { PanelBottomOpen } from "lucide-react";
import IconButton from "../IconButton";
import { Combobox } from "../ui/combobox";
import {
  datasetsController,
  type DatasetRef,
} from "@/core/rpc/controllers/datasources";
import { useRpc } from "@/hooks/useRPC";
import { useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { activeDatasetAtom, type DatasetMeta } from "@/state/data/dataset";
import { activeViewAtom } from "@/state/ui/view";
import { dataEngine } from "@/core/data-engine";
import type { uuid } from "@/types/data.types";
import { FooterRowCount, UploadDate } from "./FooterAtoms";
import {
  DEFAULT_SAMPLE_DATASET_ID,
  createDefaultSampleDatasetMeta,
} from "@/state/data/defaultSampleDataset";

export function SiteFooter() {
  const rpc = useRpc();
  // atoms
  const activeView = useAtomValue(activeViewAtom);
  const [activeDatasetRef, setActiveDatasetRef] = useAtom(activeDatasetAtom);

  // local-states
  // get all data-sets if active view is dashboard
  const [dataSetRef, setDataSetRef] = useState<DatasetRef[] | []>([]);
  // get meta-data for active data-set
  const [activeDataSetMeta, setActiveDataSetMeta] =
    useState<DatasetMeta | null>(null);

  // const getListDatasets = async () => {};
  const getListDatasetsCallback = useCallback(async () => {
    try {
      const listDatasets: DatasetRef[] = await datasetsController.getList(rpc);
      const defaultRef: DatasetRef = {
        id: DEFAULT_SAMPLE_DATASET_ID,
        name: createDefaultSampleDatasetMeta().name,
      };
      const merged = listDatasets.some(
        (d) => d.id === DEFAULT_SAMPLE_DATASET_ID
      )
        ? listDatasets
        : [defaultRef, ...listDatasets];
      setDataSetRef(merged);
    } catch (e) {
      console.error(e);
    }
  }, [rpc]);

  const getActiveDataSet = useCallback(
    (id: uuid) => {
      if (!activeDatasetRef) return;
      const activeDataSetMetaResponse = dataEngine.getDatasetMetaById(
        id ?? activeDatasetRef?.id
      );
      setActiveDataSetMeta(activeDataSetMetaResponse);
    },
    [activeDatasetRef]
  );

  useEffect(() => {
    // if active view is dashboard and active data set reference is null.
    // No active data set selected.
    if (activeView.view === "dashboard" && !activeDatasetRef)
      getListDatasetsCallback();

    // if active view is dashboard and active data set reference is not null.
    // Fetch the meta-data for the active data set
    if (activeView.view === "dashboard" && activeDatasetRef) {
      getActiveDataSet(activeDatasetRef.id);
    }
  }, [
    getListDatasetsCallback,
    activeView.view,
    getActiveDataSet,
    activeDatasetRef,
  ]);

  if (!rpc) return <div>initing…</div>;

  const dataSetMetaHandler = (dataset: DatasetRef | null) => {
    if (dataset) {
      setActiveDatasetRef(dataset);
      getActiveDataSet(dataset?.id);
    }
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <IconButton icon={PanelBottomOpen} variant="ghost" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <FooterRowCount rowCount={activeDataSetMeta?.records} />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <UploadDate date={activeDataSetMeta?.uploadDate} />

        {/* data-set selector */}
        {activeView.view === "dashboard" ? (
          <div className="ml-auto flex items-center gap-2">
            <Combobox
              options={dataSetRef}
              getOptionLabel={(s) => s.name}
              getOptionValue={(s) => s.id}
              placeholder="Pick a dataset - default selected"
              defaultValue={activeDatasetRef}
              triggerWidthClass="w-64" // easy width control
              onValueChange={(v) => dataSetMetaHandler(v)} // v is string | null
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
