import { persistedDatasetsAtom } from "@/state/data/dataset";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/header/PageHeader";
import { DataTable } from "@/components/table/SimpleTable";
import { useDataSource } from "@/hooks/useDataSource";

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

  const vizId = `dataset-table:${datasetId}`;
  const { getRow, total, loading, revision } = useDataSource(vizId, {
    datasetId,
    policy: { pageSize: 50, bandPages: 10 },
  });

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
          key={vizId}
          height={"calc(100dvh - 340px)"}
          dataSource={{ getRow, total, revision }}
          loading={loading}
        />
      </main>
    </div>
  );
}
