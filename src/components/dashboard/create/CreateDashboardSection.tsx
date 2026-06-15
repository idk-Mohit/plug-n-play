import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CreateDashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function CreateDashboardSection({
  title,
  description,
  children,
  className,
}: CreateDashboardSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
