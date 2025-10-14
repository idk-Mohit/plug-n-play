// path: src/components/PageHeader.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  gradientFrom = "from-blue-500",
  gradientTo = "to-black",
  className,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 overflow-hidden bg-gradient-to-br p-6 text-center text-white shadow-md sm:p-10",
        gradientFrom,
        gradientTo,
        className
      )}
    >
      <div className="mx-auto max-w-4xl space-y-3">
        {badge && (
          <div className="inline-flex items-center gap-2">
            <Badge className="bg-white/10 text-white hover:bg-white/20">
              {badge}
            </Badge>
            <span className="opacity-80 text-sm">Visualization System</span>
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-balance text-sm opacity-85 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
};
