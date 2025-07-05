"use client";

import * as React from "react";
// import {
//   IconCamera,
//   IconChartBar,
//   IconDashboard,
//   IconDatabase,
//   IconFileAi,
//   IconFileDescription,
//   IconFileWord,
//   IconHelp,
//   IconInnerShadowTop,
//   IconReport,
//   IconSearch,
//   IconSettings,
// } from "@tabler/icons-react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "./main-sidebar";
// import { NavSecondary } from "@/components/nav-secondary";
// import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavDocuments } from "./nav-document";
import { useSetAtom } from "jotai";
import { sidebarTransitionAtom } from "@/atoms/layout";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      // icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "#",
      // icon: IconChartBar,
    },
    {
      title: "API Connector",
      url: "#",
      // icon: IconDatabase,
      badge: "Soon",
      disabled: true,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      // icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      // icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      // icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      // icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      // icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      // icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      // icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      // icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      // icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const setTransitioning = useSetAtom(sidebarTransitionAtom);

  React.useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const handleStart = (e: TransitionEvent) => {
      if (e.propertyName === "left" || e.propertyName === "transform") {
        // setTransitioning(true);
      }
    };

    const handleEnd = (e: TransitionEvent) => {
      if (e.propertyName === "left" || e.propertyName === "transform") {
        setTransitioning(false);
      }
    };

    el.addEventListener("transitionstart", handleStart);
    el.addEventListener("transitionend", handleEnd);

    return () => {
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
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">Plug And Play</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
