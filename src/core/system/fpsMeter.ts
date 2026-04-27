/** Rolling FPS estimate from rAF (main thread). */
export class FpsMeter {
  private raf = 0;
  private frames = 0;
  private lastReport = performance.now();
  private fps = 0;

  start(): void {
    if (this.raf) return;
    const loop = (now: number) => {
      this.frames += 1;
      const elapsed = now - this.lastReport;
      if (elapsed >= 1000) {
        this.fps = (this.frames * 1000) / elapsed;
        this.frames = 0;
        this.lastReport = now;
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  getFps(): number {
    return this.fps;
  }
}
