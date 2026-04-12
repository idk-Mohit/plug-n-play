import { useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  confirmDialogAtom,
  type ConfirmDialogConfig,
} from "@/state/ui/dialog";

export function useConfirmDialog() {
  const setDialog = useSetAtom(confirmDialogAtom);

  const open = useCallback(
    (config: ConfirmDialogConfig) => {
      setDialog(config);
    },
    [setDialog],
  );

  const close = useCallback(() => {
    setDialog(null);
  }, [setDialog]);

  return { open, close };
}
