import { type Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export type NavMainItem = {
  title: string;
  url: string;
  icon?: Icon;
  badge?: string;
  /** Muted secondary line (e.g. counts, status). */
  description?: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
  /**
   * Extra control rendered after the main button (e.g. Activity sampling toggle).
   * Use `SidebarMenuAction` so layout matches shadcn sidebar patterns.
   */
  trailing?: ReactNode;
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                disabled={item.disabled}
                tooltip={item.title}
                onClick={item?.onClick ?? undefined}
                className={cn(
                  item?.active
                    ? "border cursor-pointer"
                    : "border-transparent cursor-pointer",
                  (item.description || item.trailing) &&
                    "h-auto min-h-8 items-start py-1.5",
                )}
              >
                {item.icon ? (
                  <item.icon
                    className={cn("size-4 shrink-0", item.description && "mt-0.5")}
                    aria-hidden
                  />
                ) : null}
                <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium leading-tight">
                      {item.title}
                    </span>
                    {item.badge ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 px-1.5 py-0 text-[10px] font-medium"
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </div>
                  {item.description ? (
                    <span className="mt-0.5 block truncate text-[11px] leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </div>
              </SidebarMenuButton>
              {item.trailing}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
