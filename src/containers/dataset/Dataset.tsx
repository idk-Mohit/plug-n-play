import { dataEngine } from "@/core/data-engine";
import { persistedDatasetsAtom } from "@/atoms/dataset.atom";
import { useAtomValue } from "jotai";
import { type AnyRecord } from "@/types/data.types";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/header/PageHeader";
import { DataTable } from "@/components/table/SimpleTable";

export default function Dataset() {
  const [rows, setRows] = useState<AnyRecord[] | null>(null);
  const allDatasets = useAtomValue(persistedDatasetsAtom);

  /** Parse datasetId from hash */
  const getDatasetId = (): string | null => {
    const hash = window.location.hash.slice(1);
    const queryString = hash.split("?")[1];
    if (!queryString) return null;
    const params = new URLSearchParams(queryString);
    return params.get("datasetId");
  };

  useEffect(() => {
    const datasetId = getDatasetId();
    if (!datasetId) return;

    const meta = allDatasets.find((d) => d.id === datasetId);
    if (!meta) return;

    (async () => {
      const data = await dataEngine.getDataset(datasetId);
      setRows(Array.isArray(data) ? data : [data]);
    })();
  }, [allDatasets]);

  if (!rows)
    return (
      <>
        <PageHeader
          title="Loading dataset..."
          badge="Plug & Play"
          subtitle="Please wait while we load your data"
        />
      </>
    );

  // meta info for header
  const datasetId = getDatasetId();
  const meta = allDatasets.find((d) => d.id === datasetId);

  return (
    <div className="h-fit bg-background">
      <PageHeader
        title={meta?.name ?? "Dataset Preview"}
        subtitle={`Records: ${meta?.records ?? rows.length} | Size: ${
          meta?.size ?? "-"
        }`}
        badge="Plug & Play"
      />

      <main className="mx-auto pt-6">
        <DataTable
          height={"calc(100dvh - 300px)"}
          columns={[]} // you can plug real columns later
          data={rows as AnyRecord[]}
        />
      </main>
    </div>
  );
}
