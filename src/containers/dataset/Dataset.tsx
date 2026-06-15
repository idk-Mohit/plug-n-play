import { persistedDatasetsAtom } from "@/state/data/dataset";
import { useAtomValue } from "jotai";
import { PageHeader } from "@/components/header/PageHeader";
import { DataTable } from "@/components/table/SimpleTable";
import { useDataSource } from "@/hooks/useDataSource";
import { activeViewAtom } from "@/state/ui/view";

export default function Dataset() {
  const allDatasets = useAtomValue(persistedDatasetsAtom);
  const activeView = useAtomValue(activeViewAtom);
  const datasetId = activeView.meta?.datasetId ?? null;

  const meta = datasetId
    ? allDatasets.find((d) => d.id === datasetId)
    : undefined;

  const vizId = datasetId ? `dataset-table:${datasetId}` : "dataset-table:pending";
  const { getRow, total, loading, revision } = useDataSource(vizId, {
    datasetId,
    policy: { pageSize: 50, bandPages: 10 },
  });

  if (!datasetId) {
    return (
      <PageHeader
        title="Loading dataset..."
        badge="Plug & Play"
        subtitle="Please wait while we load your data"
      />
    );
  }

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
