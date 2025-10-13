import * as React from "react";

import { NavMain } from "./main-sidebar";

import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAtom, useSetAtom } from "jotai";
import { sidebarTransitionAtom } from "@/atoms/layout";
import { activeViewAtom } from "@/atoms/view";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const setTransitioning = useSetAtom(sidebarTransitionAtom);

  const [view, setView] = useAtom(activeViewAtom);

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
        onClick: () => setView("dashboard"),
        active: view === "dashboard",
      },
      {
        title: "Datasets",
        url: "#",
        onClick: () => setView("datasets"),
        active: view === "datasets",
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
              <a href="#">
                <span className="text-base font-semibold">Plug And Play</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter></SidebarFooter> */}
    </Sidebar>
  );
}
