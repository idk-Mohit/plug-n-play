import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { FieldRendererProps } from "./types";

/**
 * Renders a single form field based on its configuration
 */
export function FieldRenderer({
  config,
  value,
  onChange,
  error,
}: FieldRendererProps) {
  const renderFieldInput = () => {
    switch (config.type) {
      case "text":
      case "number":
      case "email":
      case "password":
      case "color":
        return (
          <Input
            id={config.name}
            type={config.type}
            value={String(value || "")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            placeholder={config.placeholder}
            disabled={config.disabled}
            className={config.className}
            min={config.type === "number" ? config.validation?.min : undefined}
            max={config.type === "number" ? config.validation?.max : undefined}
            minLength={config.validation?.minLength}
            maxLength={config.validation?.maxLength}
            pattern={config.validation?.pattern?.source}
          />
        );

      case "textarea": {
        const textareaConfig = config as Extract<
          typeof config,
          { type: "textarea" }
        >;
        return (
          <Textarea
            id={config.name}
            value={String(value || "")}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onChange(e.target.value)
            }
            placeholder={config.placeholder}
            disabled={config.disabled}
            className={config.className}
            rows={textareaConfig.rows}
            minLength={config.validation?.minLength}
            maxLength={config.validation?.maxLength}
          />
        );
      }

      case "select": {
        const selectConfig = config as Extract<
          typeof config,
          { type: "select" }
        >;
        return (
          <Select
            value={String(value || "")}
            onValueChange={onChange}
            disabled={config.disabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={config.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {selectConfig.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "switch": {
        return (
          <Switch
            id={config.name}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            disabled={config.disabled}
            className={config.className}
          />
        );
      }

      case "slider": {
        const sliderConfig = config as Extract<
          typeof config,
          { type: "slider" }
        >;
        const displayValue = sliderConfig.formatValue
          ? sliderConfig.formatValue(Number(value) || sliderConfig.min)
          : String(value || sliderConfig.min);

        return (
          <div className="space-y-3">
            {sliderConfig.showValue && (
              <div className="text-sm text-muted-foreground">
                {displayValue}
              </div>
            )}
            <Slider
              value={[Number(value) || sliderConfig.min]}
              onValueChange={([newValue]: [number]) => onChange(newValue)}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step || 1}
              disabled={config.disabled}
              className={config.className}
            />
          </div>
        );
      }

      default: {
        // Default case for unknown field types - use base field properties
        const baseConfig = config as {
          name: string;
          placeholder?: string;
          disabled?: boolean;
          className?: string;
        };
        return (
          <Input
            id={baseConfig.name}
            value={String(value || "")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            placeholder={baseConfig.placeholder}
            disabled={baseConfig.disabled}
            className={baseConfig.className}
          />
        );
      }
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={config.name}>
        {config.label}
        {config.required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>

      <FieldContent>{renderFieldInput()}</FieldContent>

      {config.description && (
        <FieldDescription>{config.description}</FieldDescription>
      )}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
