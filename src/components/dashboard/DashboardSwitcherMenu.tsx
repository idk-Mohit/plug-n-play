import { Check, ChevronsUpDown } from "lucide-react";

import { AddDashboardButton } from "@/components/dashboard/CreateDashboardDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import type { DashboardRecord } from "@/core/rpc/data-contract";

type DashboardSwitcherMenuProps = {
  dashboards: DashboardRecord[];
  activeId: string | null;
  onSwitch: (id: string) => void;
};

/** Hover-revealed switcher control; pairs with a NavMain row for the main click target. */
export function DashboardSwitcherMenu({
  dashboards,
  activeId,
  onSwitch,
}: DashboardSwitcherMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          showOnHover
          aria-label="Switch dashboard"
          title="Switch dashboard"
          className="top-2 right-2 flex h-7 w-7 items-center justify-center border-0 bg-transparent hover:bg-sidebar-accent"
        >
          <ChevronsUpDown className="size-4" aria-hidden />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-56 p-1">
        <ScrollArea className="max-h-40">
          <div className="p-1">
            {dashboards.map((d) => (
              <DropdownMenuItem
                key={d.id}
                className="flex cursor-pointer items-center justify-between gap-2"
                onClick={() => onSwitch(d.id)}
              >
                <span className="min-w-0 flex-1 truncate">{d.name}</span>
                {d.id === activeId ? (
                  <Check className="size-4 shrink-0 text-muted-foreground" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator />
        <AddDashboardButton variant="menuItem" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
