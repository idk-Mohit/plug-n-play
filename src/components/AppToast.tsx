import { useAtomValue, useSetAtom } from "jotai";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  XIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toastAtom, type ToastVariant } from "@/state/ui/toast";

const DEFAULT_DURATION_MS = 4000;

function variantIcon(variant: ToastVariant) {
  const common = "h-4 w-4 shrink-0";
  switch (variant) {
    case "success":
      return <CheckCircle2 className={cn(common, "text-emerald-600 dark:text-emerald-500")} aria-hidden />;
    case "warning":
      return <AlertTriangle className={cn(common, "text-amber-600 dark:text-amber-500")} aria-hidden />;
    case "error":
      return <AlertCircle className={cn(common, "text-destructive")} aria-hidden />;
    default:
      return <Info className={cn(common, "text-muted-foreground")} aria-hidden />;
  }
}

/**
 * Singleton toast host — mount once under the app root. Driven by {@link toastAtom}.
 */
export function AppToast() {
  const toast = useAtomValue(toastAtom);
  const setToast = useSetAtom(toastAtom);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration ?? DEFAULT_DURATION_MS;
    if (duration === 0) return;
    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [toast, setToast]);

  if (!toast) return null;

  const variant: ToastVariant = toast.variant ?? "info";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-in fade-in-0 slide-in-from-right-2 duration-200",
        "fixed bottom-4 right-4 z-[60] max-w-sm",
        "rounded-lg border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-sm supports-[backdrop-filter]:bg-background/90",
      )}
    >
      <div className="flex gap-2.5">
        {variantIcon(variant)}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium leading-snug text-foreground">
              {toast.title}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="-m-1 shrink-0 opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          {toast.description ? (
            <p className="text-[11px] leading-snug text-muted-foreground">
              {toast.description}
            </p>
          ) : null}
          {toast.action ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                toast.action?.onClick();
              }}
            >
              {toast.action.label}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
