import * as React from "react";

import {
  IconActivity,
  IconChartLine,
  IconDatabase,
  IconLayoutDashboard,
} from "@tabler/icons-react";

import { NavMain, type NavMainItem } from "./main-sidebar";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { computeHealth } from "@/core/system/health";
import { cn } from "@/lib/utils";
import {
  activeDatasetAtom,
  persistedDatasetsAtom,
} from "@/state/data/dataset";
import { useAtomValue, useSetAtom } from "jotai";
import { sidebarTransitionAtom } from "@/state/ui/layout";
import {
  liveSampleAtom,
  samplerEnabledAtom,
} from "@/state/system/atoms";
import { activeViewAtom } from "@/state/ui/view";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const setTransitioning = useSetAtom(sidebarTransitionAtom);

  // const [{view}, setView] = useAtom(activeViewAtom);
  const view = useAtomValue(activeViewAtom).view;
  const setView = useSetAtom(activeViewAtom);
  const samplerOn = useAtomValue(samplerEnabledAtom);
  const setSamplerOn = useSetAtom(samplerEnabledAtom);
  const live = useAtomValue(liveSampleAtom);
  const health = computeHealth(live);
  const activeDataset = useAtomValue(activeDatasetAtom);
  const persistedDatasets = useAtomValue(persistedDatasetsAtom);

  const navMain = React.useMemo((): NavMainItem[] => {
    const datasetSubtitle = activeDataset?.name ?? "No dataset selected";
    const libraryCount = persistedDatasets.length;

    return [
      {
        title: "Dashboards",
        url: "#",
        icon: IconLayoutDashboard,
        description: datasetSubtitle,
        onClick: () => setView({ view: "dashboard", meta: undefined }),
        active: view === "dashboard",
      },
      {
        title: "Datasources",
        url: "#",
        icon: IconDatabase,
        description:
          libraryCount === 1 ? "1 dataset" : `${libraryCount} datasets`,
        onClick: () => setView({ view: "datasources" }),
        active: view === "datasources",
      },
      {
        title: "Visualizations",
        url: "#",
        icon: IconChartLine,
        badge: "Beta",
        description: "Chart gallery",
        onClick: () => setView({ view: "visuals" }),
        active: view === "visuals",
      },
      {
        title: "Activity",
        url: "#",
        icon: IconActivity,
        description: samplerOn
          ? [
              live?.fps != null ? `${Math.round(live.fps)} fps` : "— fps",
              live?.heap?.used != null
                ? `${Math.round(live.heap.used / 1024 / 1024)} MiB heap`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")
          : "Sampling off",
        onClick: () => {
          setSamplerOn(true);
          setView({ view: "activity", meta: undefined });
        },
        active: view === "activity",
        trailing: (
          <SidebarMenuAction
            type="button"
            aria-label={
              samplerOn
                ? "Turn activity tracking off"
                : "Turn activity tracking on"
            }
            title={samplerOn ? "Tracking on" : "Tracking off"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSamplerOn((v) => !v);
            }}
            className="top-2 right-2 flex h-7 w-7 items-center justify-center border-0 bg-transparent hover:bg-sidebar-accent md:opacity-100"
          >
            <span
              className={cn(
                "relative z-0 size-2.5 shrink-0 rounded-full border border-border/60 transition-colors duration-300",
                !samplerOn && "bg-muted-foreground/40",
                samplerOn &&
                  health === "ok" &&
                  "bg-emerald-500 activity-sidebar-dot--live",
                samplerOn &&
                  health === "warn" &&
                  "bg-amber-500 activity-sidebar-dot--live",
                samplerOn &&
                  health === "bad" &&
                  "bg-red-500 activity-sidebar-dot--live",
              )}
            />
          </SidebarMenuAction>
        ),
      },
    ];
  }, [
    activeDataset?.name,
    health,
    live,
    persistedDatasets.length,
    samplerOn,
    setSamplerOn,
    setView,
    view,
  ]);

  React.useEffect(() => {
    const el = sidebarRef.current;
    let timer: ReturnType<typeof setTimeout>;
    if (!el) return;

    const handleStart = (e: TransitionEvent) => {
      if (e.propertyName === "left" || e.propertyName === "transform") {
        setTransitioning(true);
      }
    };

    const handleEnd = (e: TransitionEvent) => {
      if (e.propertyName === "left" || e.propertyName === "transform") {
        timer = setTimeout(() => {
          setTransitioning(false);
        }, 500);
      }
    };

    // el.addEventListener("transitionstart", handleStart);
    el.addEventListener("transitionend", handleEnd);

    return () => {
      if (timer) clearTimeout(timer);
      el.removeEventListener("transitionstart", handleStart);
      el.removeEventListener("transitionend", handleEnd);
    };
  }, []);

  return (
    <Sidebar ref={sidebarRef} collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-pointer"
            >
              <a href="#dashboard">
                <span className="text-base font-semibold">Plug And Play</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 border cursor-pointer"
              onClick={() => setView({ view: "changelogs" })}
            >
              <span className="text-base font-semibold">Change logs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
