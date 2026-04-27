import { useAtom, useAtomValue } from "jotai";
import { getDefaultStore } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

import { DataTable } from "@/components/table/SimpleTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildSystemMonitorExport,
  collectMonitorEnv,
  downloadJson,
} from "@/core/system/exportBundle";
import { sliceHistoryForActivityCharts } from "@/core/system/activityChartWindow";
import { clearMonitorHistory } from "@/core/system/sampler";
import CartesianChart from "@/d3-core/charts/cartesian/CartesianChart";
import { IntervalSelector } from "@/containers/activity/IntervalSelector";
import { systemSamplesToSeries } from "@/containers/activity/systemSeries";
import {
  ChartType,
  GridType,
  InteractionMode,
} from "@/enums/chart.enums";
import {
  liveSampleAtom,
  sampleHistoryAtom,
  samplerEnabledAtom,
  samplerIntervalMsAtom,
} from "@/state/system/atoms";
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";
import type { AnyRecord } from "@/types/data.types";

const CH_MAIN = "activity-sys-main-heap";
const CH_WORKER = "activity-sys-worker-heap";
const CH_FPS = "activity-sys-fps";
const CH_LONG = "activity-sys-longtask";
const CH_RPC = "activity-sys-rpc";

function fmtBytes(n?: number): string {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} KB`;
  return `${n} B`;
}

function fmtMbFromBytes(n?: number): string {
  if (n == null) return "—";
  return `${(n / 1024 / 1024).toFixed(1)} MiB`;
}

export default function Activity() {
  const live = useAtomValue(liveSampleAtom);
  const history = useAtomValue(sampleHistoryAtom);
  const intervalMs = useAtomValue(samplerIntervalMsAtom);
  const [samplerOn, setSamplerOn] = useAtom(samplerEnabledAtom);

  const chartHistory = useMemo(
    () => sliceHistoryForActivityCharts(history, intervalMs),
    [history, intervalMs],
  );

  useEffect(() => {
    const store = getDefaultStore();
    const patch = (id: string, title: string) => {
      store.set(chartSettingsAtomFamily(id), (prev) => ({
        ...prev,
        id,
        title,
        type: ChartType.LINE,
        grid: GridType.NONE,
        interaction: InteractionMode.NONE,
        animation: { ...prev.animation, enabled: false },
      }));
    };
    patch(CH_MAIN, "Main thread heap (used bytes)");
    patch(CH_WORKER, "Worker heap (used bytes)");
    patch(CH_FPS, "FPS (main thread rAF)");
    patch(CH_LONG, "Long tasks (ms per 1s window)");
    patch(CH_RPC, "RPC inflight count");
  }, []);

  const seriesMainHeap = useMemo(
    () => systemSamplesToSeries(chartHistory, (s) => s.heap?.used),
    [chartHistory],
  );
  const seriesWorkerHeap = useMemo(
    () => systemSamplesToSeries(chartHistory, (s) => s.workerHeap?.used),
    [chartHistory],
  );
  const seriesFps = useMemo(
    () => systemSamplesToSeries(chartHistory, (s) => s.fps),
    [chartHistory],
  );
  const seriesLong = useMemo(
    () => systemSamplesToSeries(chartHistory, (s) => s.longTaskMs),
    [chartHistory],
  );
  const seriesRpc = useMemo(
    () => systemSamplesToSeries(chartHistory, (s) => s.rpcInflight),
    [chartHistory],
  );

  const env = useMemo(() => collectMonitorEnv(), []);

  const dsRows: AnyRecord[] = useMemo(
    () =>
      (live?.dataSources ?? []).map((d) => ({
        vizId: d.vizId,
        pages: d.pages,
        hot: d.hot,
        total: d.total,
        inflight: d.inflight,
      })),
    [live],
  );

  const onExport = useCallback(() => {
    const payload = buildSystemMonitorExport(history);
    downloadJson(`system-monitor-${Date.now()}.json`, payload);
  }, [history]);

  const onCopy = useCallback(async () => {
    const payload = buildSystemMonitorExport(history);
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch {
      /* ignore */
    }
  }, [history]);

  const onClear = useCallback(() => {
    void clearMonitorHistory();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Activity — system monitor
          </h1>
          <p className="text-sm text-muted-foreground">
            Live tab metrics and a rolling buffer (saved to IndexedDB) for
            debugging prod crashes and stalls.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Sample every</span>
            <IntervalSelector />
          </div>
          <Button
            variant={samplerOn ? "secondary" : "default"}
            onClick={() => setSamplerOn(!samplerOn)}
          >
            {samplerOn ? "Pause sampler" : "Resume sampler"}
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear history
          </Button>
          <Button variant="outline" onClick={onExport}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => void onCopy()}>
            Copy snapshot
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Main heap</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-mono">
            {fmtMbFromBytes(live?.heap?.used)} /{" "}
            {fmtMbFromBytes(live?.heap?.total)}
            <div className="text-xs text-muted-foreground">
              limit {fmtMbFromBytes(live?.heap?.limit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Worker heap</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-mono">
            {live?.workerHeap
              ? `${fmtMbFromBytes(live.workerHeap.used)} / ${fmtMbFromBytes(live.workerHeap.total)}`
              : "n/a (non-Chrome or restricted)"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">FPS / long tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-mono">
            {live?.fps != null ? live.fps.toFixed(1) : "—"} fps
            <div className="text-xs text-muted-foreground">
              long {live?.longTaskCount ?? 0} ×{" "}
              {(live?.longTaskMs ?? 0).toFixed(0)} ms (last tick)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">RPC</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-mono">
            inflight {live?.rpcInflight ?? "—"}
            <div className="text-xs text-muted-foreground">
              last RTT{" "}
              {live?.rpcLastRttMs != null
                ? `${live.rpcLastRttMs.toFixed(0)} ms`
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Main heap</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <CartesianChart
              id={CH_MAIN}
              data={seriesMainHeap}
              height={140}
              type={ChartType.LINE}
              gridType={GridType.NONE}
              preview
              interactionEnabled={false}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Worker heap</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <CartesianChart
              id={CH_WORKER}
              data={seriesWorkerHeap}
              height={140}
              type={ChartType.LINE}
              gridType={GridType.NONE}
              preview
              interactionEnabled={false}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">FPS</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <CartesianChart
              id={CH_FPS}
              data={seriesFps}
              height={140}
              type={ChartType.LINE}
              gridType={GridType.NONE}
              preview
              interactionEnabled={false}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Long tasks (ms)</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <CartesianChart
              id={CH_LONG}
              data={seriesLong}
              height={140}
              type={ChartType.LINE}
              gridType={GridType.NONE}
              preview
              interactionEnabled={false}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-base">RPC inflight</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <CartesianChart
              id={CH_RPC}
              data={seriesRpc}
              height={140}
              type={ChartType.LINE}
              gridType={GridType.NONE}
              preview
              interactionEnabled={false}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DataSources (paged tables)</CardTitle>
          <CardDescription>
            Resident pages, hot interest set size, row total, in-flight page
            fetches per visualization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dsRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active DataSource instances (open a dataset table to populate).
            </p>
          ) : (
            <DataTable data={dsRows} height={220} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment & storage</CardTitle>
          <CardDescription>
            Snapshot at page load; refresh the page to update URL / UA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground">URL</div>
              <div className="break-all font-mono text-xs">{env.href}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Build</div>
              <div className="font-mono">{env.buildMode}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Hardware</div>
              <div>
                cores {env.hardwareConcurrency ?? "—"}
                {env.deviceMemory != null
                  ? ` • deviceMemory ~${env.deviceMemory} GiB`
                  : ""}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Network (hint)</div>
              <div>
                {env.connection
                  ? `${env.connection.effectiveType ?? "?"} • ↓${env.connection.downlink ?? "?"} Mbps • rtt ${env.connection.rtt ?? "?"} ms`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Visibility / discarded</div>
              <div>
                {live?.visibility ?? env.visibility}
                {live?.wasDiscarded ? " • wasDiscarded" : ""}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Storage estimate</div>
              <div>
                {live?.storage
                  ? `${fmtBytes(live.storage.usage)} / ${fmtBytes(live.storage.quota)}`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">localStorage (approx)</div>
              <div>{fmtBytes(live?.localStorageBytes)}</div>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">IndexedDB databases</div>
            {live?.idbDatabases && live.idbDatabases.length > 0 ? (
              <ul className="list-inside list-disc font-mono text-xs">
                {live.idbDatabases.map((db, i) => (
                  <li key={`${db.name ?? "unnamed"}-${i}`}>
                    {db.name ?? "(unnamed)"} v{db.version ?? "?"}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground text-xs">
                — (or API unsupported)
              </span>
            )}
          </div>
          <div>
            <div className="text-muted-foreground mb-1">User agent</div>
            <div className="break-all font-mono text-xs">{env.userAgent}</div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Charts show a recent window only (15s at 1s sampling, 1m at 5s, 2m at 10s,
        5m at 30s). History: {history.length} samples in memory (max 300),
        mirrored to IndexedDB key{" "}
        <code className="rounded bg-muted px-1">system:samples</code>.
      </p>
    </div>
  );
}
