import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UpdateMode = "live" | "normal" | "auto";

type ResourceStats = {
  jsHeapUsed: number;
  jsHeapTotal: number;
  deviceMemory: number | null;
  cpuCores: number;
  workerDuration: number | null;
  workerDataSize: number | null;
};

interface Navigator {
  deviceMemory?: number;
}

interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

export function ResourceStatsPanel() {
  const [updateMode, setUpdateMode] = useState<UpdateMode>("normal");
  const [stats, setStats] = useState<ResourceStats>({
    jsHeapUsed: 0,
    jsHeapTotal: 0,
    deviceMemory: (navigator as Navigator)?.deviceMemory ?? null,
    cpuCores: navigator.hardwareConcurrency,
    workerDuration: null,
    workerDataSize: null,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let idleCallbackId: number | null = null;
    let lastUpdate = 0;

    const updateMemoryStats = () => {
      const performanceWithMemory = performance as PerformanceWithMemory;
      if (performanceWithMemory?.memory) {
        setStats((prev) => ({
          ...prev,
          jsHeapUsed: performanceWithMemory?.memory.usedJSHeapSize,
          jsHeapTotal: performanceWithMemory?.memory.totalJSHeapSize,
        }));
      }
    };

    const poll = () => {
      if (updateMode === "live") {
        intervalId = setInterval(updateMemoryStats, 1000);
      } else if (updateMode === "normal") {
        intervalId = setInterval(updateMemoryStats, 5000);
      } else if (updateMode === "auto") {
        const idleLoop = () => {
          const now = Date.now();
          if (now - lastUpdate >= 1000) {
            updateMemoryStats();
            lastUpdate = now;
          }
          idleCallbackId = requestIdleCallback(idleLoop);
        };
        idleCallbackId = requestIdleCallback(idleLoop);
      }
    };

    poll();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (idleCallbackId) cancelIdleCallback(idleCallbackId);
    };
  }, [updateMode]);

  useEffect(() => {
    const worker = new Worker(
      new URL("@/worker/dataWorker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    worker.onmessage = (e) => {
      const { duration, dataSize } = e.data;
      setStats((prev) => ({
        ...prev,
        workerDuration: duration,
        workerDataSize: dataSize,
      }));
    };

    worker.postMessage("start");

    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <Card className="w-[340px] shadow-lg mx-6">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Resource Stats</CardTitle>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Update Mode</Label>
          <Select
            value={updateMode}
            onValueChange={(val) => setUpdateMode(val as UpdateMode)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live (1s)</SelectItem>
              <SelectItem value="normal">Normal (5s)</SelectItem>
              <SelectItem value="eco">Eco (idle)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3 text-sm pt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">CPU Cores</span>
          <span>{stats.cpuCores}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Device Memory</span>
          <span>{stats.deviceMemory ?? "N/A"} GB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Used JS Heap</span>
          <span>{(stats.jsHeapUsed / 1024 ** 2).toFixed(2)} MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total JS Heap</span>
          <span>{(stats.jsHeapTotal / 1024 ** 2).toFixed(2)} MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Worker Time</span>
          <span>{stats.workerDuration?.toFixed(2) ?? "N/A"} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Worker Data Size</span>
          <span>
            {stats.workerDataSize
              ? (stats.workerDataSize / 1024 ** 2).toFixed(2) + " MB"
              : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
