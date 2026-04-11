import * as React from "react";
import * as SlotPrimitive from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Field = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive.Slot>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive.Slot>
>(({ className, ...props }, ref) => {
  return (
    <SlotPrimitive.Slot
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  );
});
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

const FieldError = React.forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    />
  );
});
FieldError.displayName = "FieldError";

const FieldGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-4", className)} {...props} />;
});
FieldGroup.displayName = "FieldGroup";

const FieldSet = React.forwardRef<
  React.ElementRef<"fieldset">,
  React.ComponentPropsWithoutRef<"fieldset">
>(({ className, ...props }, ref) => {
  return (
    <fieldset ref={ref} className={cn("space-y-4", className)} {...props} />
  );
});
FieldSet.displayName = "FieldSet";

const FieldLegend = React.forwardRef<
  React.ElementRef<"legend">,
  React.ComponentPropsWithoutRef<"legend">
>(({ className, ...props }, ref) => {
  return (
    <legend
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
});
FieldLegend.displayName = "FieldLegend";

const FieldContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
FieldContent.displayName = "FieldContent";

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
};
