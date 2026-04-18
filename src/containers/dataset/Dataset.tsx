import { persistedDatasetsAtom } from "@/state/data/dataset";
import { useAtomValue } from "jotai";
import { type AnyRecord } from "@/types/data.types";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/header/PageHeader";
import { DataTable } from "@/components/table/SimpleTable";
import { useDatasetPage } from "@/hooks/useDatasetPage";

export default function Dataset() {
  const allDatasets = useAtomValue(persistedDatasetsAtom);
  const [datasetId, setDatasetId] = useState<string | null>(null);

  /** Parse datasetId from hash */
  const readDatasetIdFromHash = (): string | null => {
    const hash = window.location.hash.slice(1);
    const queryString = hash.split("?")[1];
    if (!queryString) return null;
    const params = new URLSearchParams(queryString);
    return params.get("datasetId");
  };

  useEffect(() => {
    const sync = () => setDatasetId(readDatasetIdFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const meta = datasetId
    ? allDatasets.find((d) => d.id === datasetId)
    : undefined;

  const { rows, loading, loadMore, total } = useDatasetPage(datasetId, 50);

  if (!datasetId)
    return (
      <>
        <PageHeader
          title="Loading dataset..."
          badge="Plug & Play"
          subtitle="Please wait while we load your data"
        />
      </>
    );

  return (
    <div className="h-fit bg-background">
      <PageHeader
        title={meta?.name ?? `Dataset ${datasetId.slice(0, 8)}…`}
        subtitle={`Records: ${meta?.records ?? total} | Size: ${
          meta?.size ?? "-"
        }`}
        badge="Plug & Play"
      />

      <main className="mx-auto pt-6">
        <DataTable
          height={"calc(100dvh - 340px)"}
          columns={[]} // you can plug real columns later
          data={rows as AnyRecord[]}
          loading={loading}
          onScrollNearEnd={() => void loadMore()}
        />
      </main>
    </div>
  );
}
