import { useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  APP_UPDATE_POLL_MS,
  checkForAppUpdate,
} from "@/lib/app-version";
import { updateBannerAtom } from "@/state/ui/update";

/**
 * Polls the live version manifest on an interval and when the tab refocuses.
 * Mount once via {@link AppUpdateBanner}.
 */
export function useAppUpdateCheck() {
  const setUpdateBanner = useSetAtom(updateBannerAtom);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runCheck = async () => {
      const result = await checkForAppUpdate();
      if (cancelled) return;
      setUpdateBanner(result ? { serverVersion: result.serverVersion } : null);
    };

    void runCheck();

    intervalId = setInterval(() => {
      void runCheck();
    }, APP_UPDATE_POLL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runCheck();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      if (intervalId !== null) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [setUpdateBanner]);
}
