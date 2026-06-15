import { useEffect, useRef } from "react";
import { useAtom } from "jotai";

import { useSidebar } from "@/components/ui/sidebar";
import { activeDatasetAtom } from "@/state/data/dataset";
import {
  activeDashboardIdAtom,
  persistedDashboardsAtom,
  resolveActiveDashboard,
} from "@/state/data/dashboard";

/**
 * Blank-template dashboards get a clean slate: no active dataset and a collapsed sidebar
 * so the canvas uses full width. Runs once per blank dashboard id change.
 */
export function useBlankDashboardChrome() {
  const [dashboards] = useAtom(persistedDashboardsAtom);
  const [activeDashboardId] = useAtom(activeDashboardIdAtom);
  const [, setActiveDataset] = useAtom(activeDatasetAtom);
  const { setOpen, setOpenMobile } = useSidebar();
  const prevBlankIdRef = useRef<string | null>(null);

  const activeDashboard = resolveActiveDashboard(dashboards, activeDashboardId);
  const isBlank = activeDashboard?.templateId === "blank";
  const dashboardId = activeDashboard?.id ?? null;

  useEffect(() => {
    if (!isBlank || !dashboardId) {
      if (!isBlank) prevBlankIdRef.current = null;
      return;
    }

    if (prevBlankIdRef.current !== dashboardId) {
      setActiveDataset(null);
      setOpen(false);
      setOpenMobile(false);
      prevBlankIdRef.current = dashboardId;
    }
  }, [
    dashboardId,
    isBlank,
    setActiveDataset,
    setOpen,
    setOpenMobile,
  ]);
}
