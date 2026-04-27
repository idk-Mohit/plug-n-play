import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, type CSSProperties } from "react";
import { getDefaultStore } from "jotai";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity as ActivityIcon,
  ChevronDown,
  Maximize2,
  Pin,
  PinOff,
} from "lucide-react";
import { sliceHistoryForActivityCharts } from "@/core/system/activityChartWindow";
import { computeHealth } from "@/core/system/health";
import CartesianChart from "@/d3-core/charts/cartesian/CartesianChart";
import {
  ChartType,
  GridType,
  InteractionMode,
} from "@/enums/chart.enums";
import { cn } from "@/lib/utils";
import {
  activityMiniPanelPinnedAtom,
  activityWidgetOpenAtom,
  liveSampleAtom,
  sampleHistoryAtom,
  samplerIntervalMsAtom,
} from "@/state/system/atoms";
import { activeViewAtom } from "@/state/ui/view";
import { PathCurveType } from "@/d3-core/core/curves";
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";
import { IntervalSelector } from "@/containers/activity/IntervalSelector";
import { systemSamplesToSeries } from "@/containers/activity/systemSeries";

const CH_FPS_MINI = "activity-sys-fps-mini";

export function ActivityMiniPanel() {
  const open = useAtomValue(activityWidgetOpenAtom);
  const [pinned, setPinned] = useAtom(activityMiniPanelPinnedAtom);
  const live = useAtomValue(liveSampleAtom);
  const history = useAtomValue(sampleHistoryAtom);
  const intervalMs = useAtomValue(samplerIntervalMsAtom);
  const setView = useSetAtom(activeViewAtom);
  const setWidgetOpen = useSetAtom(activityWidgetOpenAtom);

  useEffect(() => {
    const store = getDefaultStore();
    const patch = () => {
      store.set(chartSettingsAtomFamily(CH_FPS_MINI), (prev) => ({
        ...prev,
        id: CH_FPS_MINI,
        title: "FPS",
        type: ChartType.LINE,
        grid: GridType.NONE,
        interaction: InteractionMode.NONE,
        animation: { ...prev.animation, enabled: false },
        pathCurve: PathCurveType.LINEAR,
      }));
    };
    patch();
  }, []);

  const chartHistory = useMemo(
    () => sliceHistoryForActivityCharts(history, intervalMs),
    [history, intervalMs],
  );

  const seriesFps = useMemo(
    () => systemSamplesToSeries(chartHistory, (s) => s.fps),
    [chartHistory],
  );

  const health = computeHealth(live);
  const heapPct =
    live?.heap?.used != null &&
    live.heap.limit != null &&
    live.heap.limit > 0
      ? Math.min(100, Math.round((live.heap.used / live.heap.limit) * 100))
      : 0;

  const dsCount = live?.dataSources?.length ?? 0;

  const onViewFull = useCallback(() => {
    setWidgetOpen(false);
    setView({ view: "activity", meta: undefined });
  }, [setView, setWidgetOpen]);

  return (
    <>
      {open && !pinned ? (
        <div
          className="fixed inset-0 z-[39] cursor-default bg-black/45 backdrop-blur-[1px] transition-opacity motion-reduce:transition-none"
          aria-hidden
          onClick={() => setWidgetOpen(false)}
        />
      ) : null}
      <div
        className={cn(
          "activity-mini-panel pointer-events-none fixed right-4 z-40 w-[300px] max-w-[calc(100vw-2rem)] sm:w-[400px]",
          "origin-bottom-right transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.97] opacity-0",
        )}
        style={{
          bottom: "calc(var(--header-height) + 8px)",
        }}
        aria-hidden={!open}
      >
      <div
        className={cn(
          "flex max-h-[min(520px,calc(100vh-var(--header-height)-2rem))] w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-sm supports-[backdrop-filter]:bg-background/90",
          health === "bad" && "activity-mini-panel--alert-bad",
        )}
      >
        <header className="flex shrink-0 items-center gap-2.5 border-b border-border/70 px-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <ActivityIcon className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold leading-tight tracking-tight text-foreground">
                Activity
              </h2>
              <span className="activity-live-chip inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <span className="activity-live-dot size-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-[11px] leading-tight text-muted-foreground">
              System monitor
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={pinned ? "secondary" : "ghost"}
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => setPinned((p) => !p)}
                  aria-label={
                    pinned
                      ? "Unpin — close by clicking outside"
                      : "Pin — only hide button closes"
                  }
                  aria-pressed={pinned}
                >
                  {pinned ? (
                    <Pin className="h-4 w-4" aria-hidden />
                  ) : (
                    <PinOff className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {pinned
                  ? "Unpin — you can close by clicking outside"
                  : "Pin — only the hide button closes the panel"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={onViewFull}
                  aria-label="Open full Activity page"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Open full Activity</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => setWidgetOpen(false)}
                  aria-label="Hide panel"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Hide panel</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div className="max-h-[min(420px,calc(100vh-var(--header-height)-6rem))] overflow-y-auto p-3 pb-4">
          <div className="space-y-2.5 text-sm">
            <div className="space-y-2">
              <div className="text-sm font-medium leading-none text-foreground">
                Sample every
              </div>
              <IntervalSelector size="default" />
            </div>

            <div className="flex gap-3">
              <div className="relative size-12 shrink-0 sm:size-14">
                <div
                  className="activity-heap-ring text-primary absolute inset-0 rounded-full"
                  style={
                    {
                      "--p": heapPct,
                    } as CSSProperties & { "--p": number }
                  }
                />
                <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-background text-xs font-mono leading-tight tabular-nums">
                  {heapPct ? `${heapPct}%` : "—"}
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm font-semibold leading-tight text-foreground">
                  Main heap
                </div>
                <div className="font-mono text-sm leading-snug text-muted-foreground">
                  {live?.heap?.used != null && live.heap.limit != null
                    ? `${(live.heap.used / 1024 / 1024).toFixed(1)} / ${(live.heap.limit / 1024 / 1024).toFixed(1)} MiB`
                    : "n/a"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">FPS</span>
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {live?.fps != null ? live.fps.toFixed(1) : "—"}
                </span>
              </div>
              {chartHistory.length < 2 ? (
                <div className="bg-muted h-[4.5rem] animate-pulse rounded-md" />
              ) : (
                <div className="chart text-foreground h-[4.5rem]">
                  <CartesianChart
                    id={CH_FPS_MINI}
                    data={seriesFps}
                    height={72}
                    type={ChartType.LINE}
                    gridType={GridType.NONE}
                    preview
                    interactionEnabled={false}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <span className="font-medium text-muted-foreground">
                Worker heap
              </span>
              <span className="text-right font-mono tabular-nums text-foreground">
                {live?.workerHeap
                  ? `${(live.workerHeap.used / 1024 / 1024).toFixed(1)} MiB`
                  : "n/a"}
              </span>
              <span className="font-medium text-muted-foreground">RPC</span>
              <span className="text-right font-mono text-sm tabular-nums text-foreground">
                {live?.rpcInflight ?? "—"} in ·{" "}
                {live?.rpcLastRttMs != null
                  ? `${live.rpcLastRttMs.toFixed(0)} ms`
                  : "—"}
              </span>
              <span className="font-medium text-muted-foreground">
                DataSources
              </span>
              <span className="text-right font-mono tabular-nums text-foreground">
                {dsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
