# FormWrapper System

A comprehensive, configuration-driven form system built with the latest shadcn/ui Field components. This system allows you to create complex forms with minimal code by defining configurations instead of writing individual form components.

## Features

- **Configuration-driven**: Define forms using simple configuration objects
- **Type-safe**: Full TypeScript support with proper type inference
- **Latest shadcn/ui**: Uses the new Field, FieldGroup, FieldSet components
- **Multiple field types**: Input, Select, Switch, Slider, Textarea, Color
- **Conditional rendering**: Show/hide fields based on form state
- **Validation support**: Built-in validation rules and custom validators
- **Real-time updates**: Perfect for settings panels and configuration forms
- **Extensible**: Custom field renderers and form layouts

## Quick Start

```tsx
import { FormWrapper } from "@/components/form-wrapper";
import type { FormSectionConfig } from "@/components/form-wrapper";

const formConfig: FormSectionConfig[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Name",
        required: true,
        placeholder: "Enter your name",
      },
      {
        name: "email",
        type: "email",
        label: "Email",
        required: true,
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      },
    ],
  },
];

function MyForm() {
  const [values, setValues] = useState({ name: "", email: "" });

  return (
    <FormWrapper
      sections={formConfig}
      values={values}
      onUpdate={setValues}
      onSubmit={(values) => console.log("Form submitted:", values)}
    />
  );
}
```

## Field Types

### Basic Input Fields
```tsx
{
  name: "username",
  type: "text", // "text" | "number" | "email" | "password" | "color"
  label: "Username",
  placeholder: "Enter username",
  required: true,
  validation: {
    minLength: 3,
    maxLength: 20,
  },
}
```

### Select Fields
```tsx
{
  name: "country",
  type: "select",
  label: "Country",
  options: [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
  ],
}
```

### Switch Fields
```tsx
{
  name: "notifications",
  type: "switch",
  label: "Enable Notifications",
  description: "Receive email notifications",
}
```

### Slider Fields
```tsx
{
  name: "fontSize",
  type: "slider",
  label: "Font Size",
  min: 12,
  max: 24,
  step: 1,
  showValue: true,
  formatValue: (value) => `${value}px`,
}
```

### Textarea Fields
```tsx
{
  name: "description",
  type: "textarea",
  label: "Description",
  rows: 4,
  validation: {
    maxLength: 500,
  },
}
```

## Form Sections

Organize your form into logical sections:

```tsx
const sections: FormSectionConfig[] = [
  {
    id: "personal-info",
    title: "Personal Information",
    description: "Tell us about yourself",
    fields: [...],
  },
  {
    id: "preferences",
    title: "Preferences",
    fields: [...],
  },
];
```

## Conditional Rendering

Show/hide fields based on form state:

```tsx
const getConditionalSections = (values: FormValues) => {
  const sections = [...baseSections];
  
  // Hide advanced section for basic users
  if (values.userType === "basic") {
    return sections.filter(s => s.id !== "advanced");
  }
  
  // Add additional fields for premium users
  if (values.userType === "premium") {
    sections.push({
      id: "premium-features",
      title: "Premium Features",
      fields: [...premiumFields],
    });
  }
  
  return sections;
};
```

## Validation

### Built-in Validation Rules
```tsx
{
  name: "age",
  type: "number",
  label: "Age",
  validation: {
    min: 18,
    max: 120,
  },
}
```

### Custom Validation
```tsx
{
  name: "password",
  type: "password",
  label: "Password",
  validation: {
    minLength: 8,
    validate: (value) => {
      if (!/(?=.*[A-Z])/.test(value)) {
        return "Password must contain at least one uppercase letter";
      }
      if (!/(?=.*\d)/.test(value)) {
        return "Password must contain at least one number";
      }
      return true;
    },
  },
}
```

## Custom Field Renderers

Override default field rendering:

```tsx
const customFieldRenderer = (config, value, onChange) => {
  if (config.name === "special-field") {
    return <MyCustomComponent value={value} onChange={onChange} />;
  }
  
  // Fall back to default renderer
  return null;
};

<FormWrapper
  sections={sections}
  values={values}
  onUpdate={setValues}
  renderField={customFieldRenderer}
/>
```

## Real-world Example: Chart Settings

See `./configs/chart-settings.config.ts` for a complete example of how the FormWrapper replaces a complex settings form:

```tsx
// Before: Manual implementation with 300+ lines
// After: Configuration-driven with 100 lines

import { chartSettingsFormConfig } from "@/components/form-wrapper/configs/chart-settings.config";

<FormWrapper
  sections={chartSettingsFormConfig}
  values={chartSettings}
  onUpdate={setChartSettings}
  showActions={false} // Real-time updates
/>
```

## API Reference

### FormWrapper Props

| Prop | Type | Description |
|------|------|-------------|
| `sections` | `FormSectionConfig[]` | Form sections configuration |
| `values` | `T` | Current form values |
| `onUpdate` | `(values: T) => void` | Value update handler |
| `title` | `string` | Form title |
| `description` | `string` | Form description |
| `onSubmit` | `(values: T) => void` | Submit handler |
| `onCancel` | `() => void` | Cancel handler |
| `showActions` | `boolean` | Show submit/cancel buttons |
| `renderField` | `Function` | Custom field renderer |
| `loading` | `boolean` | Loading state |
| `disabled` | `boolean` | Disabled state |

### Field Configuration

All field types support these base properties:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Field identifier (required) |
| `type` | `FieldType` | Field type (required) |
| `label` | `string` | Field label (required) |
| `description` | `string` | Help text |
| `placeholder` | `string` | Placeholder text |
| `required` | `boolean` | Required field |
| `disabled` | `boolean` | Disabled field |
| `className` | `string` | Custom CSS class |
| `validation` | `object` | Validation rules |

## Benefits

1. **Reduced Boilerplate**: 70% less code compared to manual form implementation
2. **Consistency**: All forms use the same styling and behavior
3. **Maintainability**: Easy to add/remove fields without touching component code
4. **Type Safety**: Full TypeScript support with proper type inference
5. **Accessibility**: Built on shadcn/ui's accessible components
6. **Performance**: Optimized re-rendering and state management

## Migration Guide

### From Manual Forms

**Before:**
```tsx
// 300+ lines of manual form code
<div className="space-y-6">
  <div>
    <Label htmlFor="name">Name</Label>
    <Input id="name" value={values.name} onChange={...} />
    {errors.name && <span className="error">{errors.name}</span>}
  </div>
  <!-- Repeat for every field -->
</div>
```

**After:**
```tsx
// 50 lines of configuration
const config: FormSectionConfig[] = [
  {
    id: "basic",
    fields: [
      { name: "name", type: "text", label: "Name" },
      // Add more fields as needed
    ],
  },
];

<FormWrapper sections={config} values={values} onUpdate={setValues} />
```

This FormWrapper system provides a powerful, flexible foundation for building forms throughout your application with minimal code and maximum consistency.
