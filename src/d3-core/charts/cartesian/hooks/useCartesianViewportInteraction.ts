import { type RefObject, useEffect, useRef } from "react";
import { useAtom } from "jotai";

import { InteractionMode } from "@/enums/chart.enums";
import { chartViewportAtomFamily } from "@/state/ui/viewport";

const MIN_SPAN_MS = 60_000;
const MAX_SPAN_MS = 366 * 86400_000;

export function useCartesianViewportInteraction({
  containerRef,
  chartId,
  preview,
  interaction,
  enabled,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  chartId: string;
  preview: boolean;
  interaction: (typeof InteractionMode)[keyof typeof InteractionMode];
  enabled: boolean;
}) {
  const [, setViewport] = useAtom(chartViewportAtomFamily(chartId));
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || preview || !enabled) return;
    if (
      interaction !== InteractionMode.PAN &&
      interaction !== InteractionMode.ZOOM &&
      interaction !== InteractionMode.BOTH
    ) {
      return;
    }

    const allowZoom =
      interaction === InteractionMode.ZOOM ||
      interaction === InteractionMode.BOTH;
    const allowPan =
      interaction === InteractionMode.PAN ||
      interaction === InteractionMode.BOTH;

    const onWheel = (ev: WheelEvent) => {
      if (!allowZoom) return;
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      if (w <= 0) return;
      const mx = ev.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, mx / w));
      const zoom = ev.deltaY > 0 ? 1.12 : 0.88;
      setViewport((v) => {
        if (!v) return v;
        const span = v.toMs - v.fromMs;
        const tCenter = v.fromMs + ratio * span;
        let newSpan = span * zoom;
        newSpan = Math.max(MIN_SPAN_MS, Math.min(newSpan, MAX_SPAN_MS));
        const newFrom = tCenter - ratio * newSpan;
        const newTo = newFrom + newSpan;
        return { ...v, fromMs: newFrom, toMs: newTo };
      });
    };

    const onPointerDown = (ev: PointerEvent) => {
      if (!allowPan) return;
      draggingRef.current = true;
      lastXRef.current = ev.clientX;
      el.setPointerCapture(ev.pointerId);
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!draggingRef.current || !allowPan) return;
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      if (w <= 0) return;
      const dx = ev.clientX - lastXRef.current;
      lastXRef.current = ev.clientX;
      setViewport((v) => {
        if (!v) return v;
        const span = v.toMs - v.fromMs;
        const dt = -(dx / w) * span;
        return {
          ...v,
          fromMs: v.fromMs + dt,
          toMs: v.toMs + dt,
        };
      });
    };

    const onPointerUp = (ev: PointerEvent) => {
      draggingRef.current = false;
      try {
        el.releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [containerRef, chartId, preview, interaction, enabled, setViewport]);
}
