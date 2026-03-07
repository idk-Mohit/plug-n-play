// path: src/hooks/useViewSync.ts
import { useAtom } from "jotai";
import { activeViewAtom, type ViewName } from "@/state/ui/view";
import { useEffect } from "react";

export function useViewSync() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);

  // when atom changes → update URL
  useEffect(() => {
    const params = new URLSearchParams(
      activeView.meta as unknown as URLSearchParams
    );
    const hash = `${activeView.view}${params.toString() ? "?" + params : ""}`;
    history.pushState(activeView, "", "#" + hash);
  }, [activeView]);

  // when URL changes → update atom
  useEffect(() => {
    const handlePop = () => {
      const [view, query] = location.hash.slice(1).split("?");
      const meta = Object.fromEntries(new URLSearchParams(query));
      setActiveView({ view: view as ViewName, meta });
    };
    window.addEventListener("popstate", handlePop);
    window.addEventListener("hashchange", handlePop);
    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("hashchange", handlePop);
    };
  }, []);
}
