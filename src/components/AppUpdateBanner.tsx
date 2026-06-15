import { useAtomValue, useSetAtom } from "jotai";
import { Info, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppUpdateCheck } from "@/hooks/useAppUpdateCheck";
import {
  dismissUpdateForVersion,
  reloadForAppUpdate,
} from "@/lib/app-version";
import { updateBannerAtom } from "@/state/ui/update";

/**
 * Persistent update banner — mount once under the app root.
 * GitBook-style callout with a title row and an action row.
 */
export function AppUpdateBanner() {
  useAppUpdateCheck();

  const updateBanner = useAtomValue(updateBannerAtom);
  const setUpdateBanner = useSetAtom(updateBannerAtom);

  if (!updateBanner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-2 slide-in-from-right-4 duration-300",
        "fixed bottom-6 right-6 z-[59]",
        "w-[min(calc(100vw-2rem),28rem)]",
        "rounded-xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur-md",
        "supports-[backdrop-filter]:bg-card/90",
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            "border border-border/60 bg-muted/25",
          )}
          aria-hidden
        >
          <Info className="size-4 text-foreground/85" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug text-foreground">
              New version available.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="-mt-1 -mr-1 shrink-0 text-muted-foreground opacity-70 hover:opacity-100"
              aria-label="Dismiss update notification"
              onClick={() => {
                dismissUpdateForVersion(updateBanner.serverVersion);
                setUpdateBanner(null);
              }}
            >
              <XIcon />
            </Button>
          </div>

          <div className="flex items-end justify-between gap-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              A new version of Plug &amp; Play is available. Please reload to
              update.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => {
                void reloadForAppUpdate();
              }}
            >
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
