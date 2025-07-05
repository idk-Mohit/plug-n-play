import { sidebarTransitionAtom } from "@/atoms/layout";
import { SiteHeader } from "@/components/Header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAtomValue } from "jotai";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const isTransitioning = useAtomValue(sidebarTransitionAtom);
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="position-sticky top-0">
          <SiteHeader />
        </div>
        <div className="flex flex-1 flex-col position-fixed">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 relative">
              {isTransitioning ? (
                <div className="absolute inset-0 backdrop-blur bg-black/10 z-10 flex items-center justify-center">
                  <span>Updating layout…</span>
                </div>
              ) : null}
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
