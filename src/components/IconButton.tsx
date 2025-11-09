import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils"; // if you’re using shadcn/ui’s cn helper

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  text?: string;
  iconClassName?: string;
  textLocation?: "before" | "after";
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
  iconSize?: number;
}

/**
 * A reusable button that can show an icon and optional text before or after it.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      text,
      textLocation = "before",
      variant = "secondary",
      size = "sm",
      className,
      iconSize = 14,
      iconClassName,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          "text-primary hover:text-destructive hover:bg-destructive/10",
          className
        )}
        {...props}
      >
        {text && textLocation === "before" && <span>{text}</span>}
        <Icon
          className={cn("h-4 w-4 text-primary", iconClassName)}
          aria-hidden="true"
          size={iconSize}
        />
        {text && textLocation === "after" && <span>{text}</span>}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
