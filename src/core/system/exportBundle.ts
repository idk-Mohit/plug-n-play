import type { SystemSample } from "@/core/system/types";

export type SystemMonitorExport = {
  exportedAt: number;
  env: ReturnType<typeof collectMonitorEnv>;
  samples: SystemSample[];
  /** Last tick’s DataSource rows (redundant with last sample). */
  dataSources: SystemSample["dataSources"];
  longTasksSummary: {
    note: string;
  };
};

export function collectMonitorEnv() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  };
  return {
    href: typeof location !== "undefined" ? location.href : "",
    userAgent: nav.userAgent,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    connection: nav.connection
      ? {
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt,
        }
      : undefined,
    visibility: document.visibilityState,
    wasDiscarded:
      "wasDiscarded" in document
        ? (document as Document & { wasDiscarded?: boolean }).wasDiscarded
        : undefined,
    buildMode: import.meta.env.MODE,
  };
}

export function buildSystemMonitorExport(
  history: SystemSample[],
): SystemMonitorExport {
  const last = history[history.length - 1];
  return {
    exportedAt: Date.now(),
    env: collectMonitorEnv(),
    samples: history,
    dataSources: last?.dataSources ?? [],
    longTasksSummary: {
      note:
        "Each sample includes longTaskMs and longTaskCount for the prior 1s window (visible tab only).",
    },
  };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
