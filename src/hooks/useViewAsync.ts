// path: src/hooks/useViewSync.ts
import { useAtom } from "jotai";
import { activeViewAtom, type ViewState } from "@/state/ui/view";
import { parseViewFromHash } from "@/state/ui/view-hash";
import { useEffect, useRef } from "react";

function buildHash(activeView: ViewState): string {
  const params = new URLSearchParams();
  if (activeView.meta) {
    for (const [key, value] of Object.entries(activeView.meta)) {
      if (value === undefined || value === null) continue;
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return `#${activeView.view}${query ? `?${query}` : ""}`;
}

export function useViewSync() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const skipNextPush = useRef(false);
  const lastPushedView = useRef<ViewState["view"] | null>(null);

  useEffect(() => {
    const fromHash = parseViewFromHash(location.hash);
    if (!fromHash) return;
    skipNextPush.current = true;
    setActiveView(fromHash);
  }, [setActiveView]);

  useEffect(() => {
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const next = buildHash(activeView);
    if (location.hash === next) return;

    const viewChanged =
      lastPushedView.current !== null &&
      lastPushedView.current !== activeView.view;
    lastPushedView.current = activeView.view;

    if (viewChanged) {
      history.pushState(activeView, "", next);
    } else {
      history.replaceState(activeView, "", next);
    }
  }, [activeView]);

  useEffect(() => {
    const handlePop = () => {
      const fromHash = parseViewFromHash(location.hash);
      if (!fromHash) return;
      skipNextPush.current = true;
      lastPushedView.current = fromHash.view;
      setActiveView(fromHash);
    };
    window.addEventListener("popstate", handlePop);
    window.addEventListener("hashchange", handlePop);
    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("hashchange", handlePop);
    };
  }, [setActiveView]);
}
