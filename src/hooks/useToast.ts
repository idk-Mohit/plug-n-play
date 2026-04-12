import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { toastAtom, type ToastConfig } from "@/state/ui/toast";

export function useToast() {
  const setToast = useSetAtom(toastAtom);

  const show = useCallback(
    (config: ToastConfig) => {
      setToast(config);
    },
    [setToast],
  );

  const dismiss = useCallback(() => {
    setToast(null);
  }, [setToast]);

  return { show, dismiss };
}
