import { useAtom } from "jotai";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SAMPLER_INTERVAL_OPTIONS,
  samplerIntervalMsAtom,
} from "@/state/system/atoms";

export function IntervalSelector({
  className,
  size = "sm",
}: {
  className?: string;
  /** `"default"` — roomier controls (e.g. Activity mini panel). */
  size?: "sm" | "default";
}) {
  const [ms, setMs] = useAtom(samplerIntervalMsAtom);

  useEffect(() => {
    if (!(SAMPLER_INTERVAL_OPTIONS as readonly number[]).includes(ms)) {
      setMs(1000);
    }
  }, [ms, setMs]);

  const btnSize = size === "default" ? "default" : "sm";

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="group">
      {SAMPLER_INTERVAL_OPTIONS.map((opt) => (
        <Button
          key={opt}
          type="button"
          size={btnSize}
          variant={ms === opt ? "default" : "outline"}
          className={cn(
            "min-w-14 px-3",
            size === "default" && "text-sm font-medium",
          )}
          onClick={() => setMs(opt)}
        >
          {opt / 1000}s
        </Button>
      ))}
    </div>
  );
}
