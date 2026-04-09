import type React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { FieldRenderer } from "./FieldRenderer";
import type { FormWrapperProps, FormSectionConfig } from "./types";

/**
 * A comprehensive form wrapper that renders forms based on configuration
 * Uses the latest shadcn Field components for consistent styling
 */
export function FormWrapper<T extends Record<string, unknown> = Record<string, unknown>>({
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
    const newValues = { ...values, [fieldName]: fieldValue };
    onUpdate(newValues);
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

  const renderSection = (section: FormSectionConfig) => (
    <FieldSet key={section.id} className={section.className}>
      {section.title && <FieldLegend>{section.title}</FieldLegend>}
      {section.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {section.description}
        </p>
      )}
      
      <FieldGroup>
        {section.fields.map((fieldConfig) => {
          const fieldValue = values[fieldConfig.name];
          const fieldError = undefined; // TODO: Add validation logic

          if (renderField) {
            return (
              <div key={fieldConfig.name} className="space-y-2">
                {renderField(fieldConfig, fieldValue, (value) => 
                  updateField(fieldConfig.name, value)
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
        })}
      </FieldGroup>

      {section !== sections[sections.length - 1] && <Separator />}
    </FieldSet>
  );

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {title && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-8">
        {sections.map(renderSection)}
      </div>

      {showActions && (
        <>
          <Separator />
          <div className="flex justify-end gap-3 pt-4">
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
              <Button
                type="submit"
                disabled={loading || disabled}
              >
                {loading ? "Submitting..." : submitText}
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  );
}
