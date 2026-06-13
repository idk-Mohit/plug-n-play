import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Copy } from "lucide-react";

import { CreateDashboardSection } from "@/components/dashboard/create/CreateDashboardSection";
import { QuickActionCard } from "@/components/dashboard/create/QuickActionCard";
import { TemplateCard } from "@/components/dashboard/create/TemplateCard";
import { TemplatePreviewIllustration } from "@/components/dashboard/create/TemplatePreviewIllustration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardTemplateId } from "@/core/rpc/data-contract";
import { cn } from "@/lib/utils";
import {
  isCopyTemplate,
  nextDashboardName,
  type CreateDashboardInput,
} from "@/state/data/dashboard";
import { PREDEFINED_DASHBOARD_TEMPLATES } from "@/state/data/dashboard-templates";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";

type CreateDashboardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Full-page create flow: template grid, copy-existing quick action, name + submit. */
export function CreateDashboardDialog({
  open,
  onOpenChange,
}: CreateDashboardDialogProps) {
  const { dashboards, createDashboard } = useDashboardMutations();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<DashboardTemplateId>("blank");
  const [copyFromId, setCopyFromId] = useState<string>("");

  const copyDisabled = dashboards.length < 2;
  const showCopySelect = isCopyTemplate(templateId);
  const trimmedName = name.trim();
  const canCreate =
    trimmedName.length > 0 && (!showCopySelect || Boolean(copyFromId));

  useEffect(() => {
    if (!open) return;
    setName(nextDashboardName(dashboards));
    setTemplateId("blank");
    setCopyFromId(dashboards[0]?.id ?? "");
  }, [open, dashboards]);

  useEffect(() => {
    if (copyDisabled && isCopyTemplate(templateId)) {
      setTemplateId("blank");
    }
  }, [copyDisabled, templateId]);

  const handleCreate = () => {
    if (!canCreate) return;
    const input: CreateDashboardInput = {
      name: trimmedName,
      templateId,
      copiedFromId: showCopySelect ? copyFromId : undefined,
    };
    createDashboard(input);
    onOpenChange(false);
  };

  const selectTemplate = (id: DashboardTemplateId) => {
    setTemplateId(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[min(92vh,720px)] max-h-[92vh] w-[min(96vw,56rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/70 px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Create dashboard
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-xs leading-relaxed">
            Dashboards are where your charts and tables live. Choose a starting
            template or duplicate an existing dashboard to get going quickly.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-8 px-6 py-6">
            <CreateDashboardSection title="Start with a template">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PREDEFINED_DASHBOARD_TEMPLATES.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    label={tpl.label}
                    description={tpl.description}
                    selected={templateId === tpl.id}
                    onSelect={() => selectTemplate(tpl.id)}
                    preview={
                      <TemplatePreviewIllustration variant={tpl.id} />
                    }
                  />
                ))}
              </div>
            </CreateDashboardSection>

            <CreateDashboardSection
              title="Quick actions"
              description="Shortcuts for workflows that don't fit a blank template."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <QuickActionCard
                  label="Copy existing"
                  icon={<Copy className="size-4" aria-hidden />}
                  selected={showCopySelect}
                  disabled={copyDisabled}
                  onSelect={() => selectTemplate("copy")}
                />
              </div>

              {showCopySelect ? (
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="copy-from-dashboard" className="text-xs font-medium">
                    Copy from
                  </Label>
                  <Select value={copyFromId} onValueChange={setCopyFromId}>
                    <SelectTrigger
                      id="copy-from-dashboard"
                      className="h-8 w-full max-w-sm text-xs"
                    >
                      <SelectValue placeholder="Select dashboard" />
                    </SelectTrigger>
                    <SelectContent>
                      {dashboards.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </CreateDashboardSection>
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border/70 px-6 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full space-y-1.5 sm:max-w-xs">
            <Label htmlFor="dashboard-name" className="text-xs font-medium">
              Dashboard name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dashboard-name"
              className="h-8 text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={nextDashboardName(dashboards)}
              required
              aria-required
            />
          </div>
          <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreate}
              disabled={!canCreate}
            >
              Create dashboard
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AddDashboardButtonProps = {
  variant?: "header" | "menuItem";
  className?: string;
};

/** Opens {@link CreateDashboardDialog}; use in header or sidebar menu footer. */
export function AddDashboardButton({
  variant = "header",
  className,
}: AddDashboardButtonProps) {
  const [open, setOpen] = useState(false);

  if (variant === "menuItem") {
    return (
      <>
        <button
          type="button"
          className={cn(
            "focus:bg-accent focus:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden",
            className,
          )}
          onClick={() => setOpen(true)}
        >
          <IconPlus className="size-4 shrink-0" aria-hidden />
          Add Dashboard
        </button>
        <CreateDashboardDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("hidden gap-1.5 sm:flex", className)}
        onClick={() => setOpen(true)}
      >
        <IconPlus className="size-4" aria-hidden />
        Add Dashboard
      </Button>
      <CreateDashboardDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
