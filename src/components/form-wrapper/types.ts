import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Field types supported by FormWrapper
 */
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "color"
  | "select"
  | "switch"
  | "slider"
  | "textarea";

/**
 * Base configuration for all form fields
 */
export interface BaseFieldConfig {
  /** Field identifier */
  name: string;
  /** Field type */
  type: FieldType;
  /** Field label */
  label: string;
  /** Field description/help text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Custom className for the field */
  className?: string;
  /** Validation rules */
  validation?: {
    min?: number | string;
    max?: number | string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: unknown) => string | true;
  };
}

/**
 * Configuration for select fields
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  /** Array of options */
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  /** Allow multiple selection */
  multiple?: boolean;
}

/**
 * Configuration for switch fields
 */
export interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
  /** Custom label for checked state */
  checkedLabel?: string;
  /** Custom label for unchecked state */
  uncheckedLabel?: string;
  /** Row: label + control on one line (good for toggles in dense panels) */
  layout?: "stack" | "inline";
}

/**
 * Configuration for slider fields
 */
export interface SliderFieldConfig extends BaseFieldConfig {
  type: "slider";
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step value */
  step?: number;
  /** Show value label */
  showValue?: boolean;
  /** Value format function */
  formatValue?: (value: number) => string;
}

/**
 * Configuration for textarea fields
 */
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: "textarea";
  /** Number of visible text lines */
  rows?: number;
  /** Resize behavior */
  resize?: "none" | "both" | "horizontal" | "vertical";
}

/**
 * Union type for all field configurations
 */
export type FormFieldConfig =
  | BaseFieldConfig
  | SelectFieldConfig
  | SwitchFieldConfig
  | SliderFieldConfig
  | TextareaFieldConfig;

/**
 * Form section configuration
 */
export interface FormSectionConfig {
  /** Section identifier */
  id: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Fields in this section */
  fields: FormFieldConfig[];
  /** Custom className for the section */
  className?: string;
  /** When true, section is wrapped in a collapsible panel */
  collapsible?: boolean;
  /** Initial open state when collapsible (default true) */
  defaultOpen?: boolean;
  /** Optional section icon (e.g. GitBook-style sidebar) */
  icon?: LucideIcon;
}

/**
 * Form wrapper props
 */
export interface FormWrapperProps<T extends object = Record<string, unknown>> {
  /** Form sections configuration */
  sections: FormSectionConfig[];
  /** Current form values */
  values: T;
  /** Function to update form values */
  onUpdate: (values: T) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** On submit callback */
  onSubmit?: (values: T) => void | Promise<void>;
  /** On cancel callback */
  onCancel?: () => void;
  /** Whether to show submit/cancel buttons */
  showActions?: boolean;
  /** Custom className for the form */
  className?: string;
  /** Custom field renderer */
  renderField?: (
    config: FormFieldConfig,
    value: unknown,
    onChange: (value: unknown) => void,
  ) => ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Field renderer props (internal)
 */
export interface FieldRendererProps {
  config: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}
