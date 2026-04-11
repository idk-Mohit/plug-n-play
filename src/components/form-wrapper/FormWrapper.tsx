import type React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { getNested, setNested } from "@/utils/object-path";
import { FieldRenderer } from "./FieldRenderer";
import type { FormWrapperProps, FormSectionConfig } from "./types";

/**
 * Renders forms from configuration. Supports dotted field names (`animation.type`)
 * and optional collapsible sections.
 */
export function FormWrapper<T extends object = Record<string, unknown>>({
  sections,
  values,
  onUpdate,
  title,
  description,
  submitText = "Submit",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  showActions = true,
  className = "",
  renderField,
  loading = false,
  disabled = false,
}: FormWrapperProps<T>) {
  const updateField = (fieldName: string, fieldValue: unknown) => {
    onUpdate(setNested(values, fieldName, fieldValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !loading && !disabled) {
      await onSubmit(values);
    }
  };

  const handleCancel = () => {
    if (onCancel && !loading && !disabled) {
      onCancel();
    }
  };

  const renderSectionField = (fieldConfig: FormSectionConfig["fields"][number]) => {
    const fieldValue = getNested(values, fieldConfig.name);
    const fieldError = undefined;

    if (renderField) {
      return (
        <div key={fieldConfig.name} className="space-y-2">
          {renderField(fieldConfig, fieldValue, (value) =>
            updateField(fieldConfig.name, value),
          )}
        </div>
      );
    }

    return (
      <FieldRenderer
        key={fieldConfig.name}
        config={fieldConfig}
        value={fieldValue}
        onChange={(value) => updateField(fieldConfig.name, value)}
        error={fieldError}
      />
    );
  };

  const renderSectionBody = (section: FormSectionConfig) => (
    <>
      {section.description && (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {section.description}
        </p>
      )}
      <FieldGroup className="space-y-2.5">
        {section.fields.map(renderSectionField)}
      </FieldGroup>
    </>
  );

  const renderSection = (section: FormSectionConfig, index: number) => {
    const isLast = index === sections.length - 1;

    if (section.collapsible) {
      const SectionIcon = section.icon;
      return (
        <Collapsible
          key={section.id}
          defaultOpen={section.defaultOpen ?? true}
          className={cn(
            "overflow-hidden rounded-lg border border-border/70 bg-muted/15 shadow-sm",
            section.className,
          )}
        >
          <CollapsibleTrigger className="group flex w-full items-center gap-2.5 px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background data-[state=open]:border-b data-[state=open]:border-border/60">
            {SectionIcon ? (
              <SectionIcon
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            ) : null}
            <span className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-border/40 bg-background/40 px-3 pb-3 pt-2.5">
            {renderSectionBody(section)}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <FieldSet key={section.id} className={cn("space-y-3", section.className)}>
        {section.title && <FieldLegend>{section.title}</FieldLegend>}
        {renderSectionBody(section)}
        {!isLast && <Separator className="mt-6" />}
      </FieldSet>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {title && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-2">{sections.map(renderSection)}</div>

      {showActions && (
        <>
          <Separator />
          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading || disabled}
              >
                {cancelText}
              </Button>
            )}

            {onSubmit && (
              <Button type="submit" disabled={loading || disabled}>
                {loading ? "Submitting..." : submitText}
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  );
}
