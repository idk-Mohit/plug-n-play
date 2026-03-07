import * as React from "react";

import { NavMain } from "./main-sidebar";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAtomValue, useSetAtom } from "jotai";
import { sidebarTransitionAtom } from "@/state/ui/layout";
import { activeViewAtom } from "@/state/ui/view";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const setTransitioning = useSetAtom(sidebarTransitionAtom);

  // const [{view}, setView] = useAtom(activeViewAtom);
  const view = useAtomValue(activeViewAtom).view;
  const setView = useSetAtom(activeViewAtom);

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboards",
        url: "#",
        onClick: () => setView({ view: "dashboard", meta: undefined }),
        active: view === "dashboard",
      },
      {
        title: "Datasources",
        url: "#",
        onClick: () => setView({ view: "datasources" }),
        active: view === "datasources",
      },
      {
        title: "Visualizations",
        url: "#",
        badge: "Soon",
        disabled: true,
        active: view === "visuals",
      },
      {
        title: "Activity",
        url: "#",
        badge: "Soon",
        disabled: true,
        active: view === "activity",
      },
    ],
  };

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
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#dashboard">
                <span className="text-base font-semibold">Plug And Play</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 border"
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
