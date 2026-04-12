import { useAtomValue, useSetAtom } from "jotai";
import {
  AlertTriangle,
  HelpCircle,
  Info,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { confirmDialogAtom, type DialogVariant } from "@/state/ui/dialog";

function variantIcon(variant: DialogVariant) {
  const tile = "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60";
  const icon = "h-4 w-4";
  switch (variant) {
    case "destructive":
      return (
        <div className={tile} aria-hidden>
          <AlertTriangle className={cn(icon, "text-destructive")} />
        </div>
      );
    case "info":
      return (
        <div className={tile} aria-hidden>
          <Info className={cn(icon, "text-muted-foreground")} />
        </div>
      );
    default:
      return (
        <div className={tile} aria-hidden>
          <HelpCircle className={cn(icon, "text-muted-foreground")} />
        </div>
      );
  }
}

/**
 * Singleton confirm / info modal — mount once under the app root. Driven by {@link confirmDialogAtom}.
 */
export function AppConfirmDialog() {
  const config = useAtomValue(confirmDialogAtom);
  const setConfig = useSetAtom(confirmDialogAtom);
  const open = config != null;
  const [busy, setBusy] = useState(false);

  const dismissible = config?.dismissible !== false;

  const close = useCallback(() => {
    setConfig(null);
    setBusy(false);
  }, [setConfig]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return;
      if (!dismissible) return;
      close();
    },
    [dismissible, close],
  );

  const runButton = useCallback(
    async (fn: (() => void | Promise<void>) | undefined) => {
      if (!fn) return;
      setBusy(true);
      try {
        await fn();
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  if (!config) return null;

  const variant: DialogVariant = config.variant ?? "confirm";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        className="gap-3 p-4 sm:max-w-md"
        onEscapeKeyDown={(e) => {
          if (config.dismissible === false) e.preventDefault();
        }}
      >
        <AlertDialogHeader className="space-y-2 text-left sm:text-left">
          <div className="flex gap-3">
            {variantIcon(variant)}
            <div className="min-w-0 flex-1 space-y-1">
              <AlertDialogTitle className="text-sm font-semibold tracking-tight">
                {config.title}
              </AlertDialogTitle>
              {config.subheading ? (
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {config.subheading}
                </p>
              ) : null}
            </div>
          </div>
          {config.description ? (
            <AlertDialogDescription asChild>
              <p className="text-[13px] leading-snug text-muted-foreground">
                {config.description}
              </p>
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription className="sr-only">
              {config.title}
            </AlertDialogDescription>
          )}
          {config.note ? (
            <div className="mt-2 rounded-md border border-border/50 bg-muted/20 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
              {config.note}
            </div>
          ) : null}
        </AlertDialogHeader>
        {(config.primaryButton ?? config.secondaryButton) ? (
          <AlertDialogFooter className="flex flex-row-reverse gap-2 sm:space-x-0">
            {config.primaryButton ? (
              <Button
                type="button"
                variant={config.primaryButton.variant ?? "default"}
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() => void runButton(config.primaryButton?.onClick)}
              >
                {config.primaryButton.label}
              </Button>
            ) : null}
            {config.secondaryButton ? (
              <Button
                type="button"
                variant={config.secondaryButton.variant ?? "outline"}
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() => void runButton(config.secondaryButton?.onClick)}
              >
                {config.secondaryButton.label}
              </Button>
            ) : null}
          </AlertDialogFooter>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}
