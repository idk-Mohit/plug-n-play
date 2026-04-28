/**
 * Aggregates main-thread long tasks (Chrome). Safe no-op if unsupported.
 */
export function createLongTaskObserver() {
  let totalMs = 0;
  let count = 0;
  let obs: PerformanceObserver | null = null;

  return {
    start() {
      if (obs) return;
      try {
        obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            totalMs += e.duration;
            count += 1;
          }
        });
        obs.observe({ entryTypes: ["longtask"] });
      } catch {
        obs = null;
      }
    },
    stop() {
      obs?.disconnect();
      obs = null;
    },
    drain(): { ms: number; count: number } {
      const out = { ms: totalMs, count };
      totalMs = 0;
      count = 0;
      return out;
    },
  };
}
