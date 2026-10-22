/** Limit allocation by rendered pixel area, independently of screen DPR. */
export function canvasScale(width: number, height: number, maxPixels: number): number {
  return Math.min(
    window.devicePixelRatio || 1,
    1.5,
    Math.sqrt(maxPixels / Math.max(1, width * height)),
    4096 / Math.max(width, height, 1),
  );
}

/** Downgrade only after sustained render cost / missed frames, not a load spike. */
export class RenderBudget {
  limited = false;
  private previous = 0;
  private samples = 0;
  private slow = 0;
  private cost = 0;
  private warmUntil = performance.now() + 2000;

  sample(now: number, renderCost = 0): boolean {
    const gap = this.previous ? now - this.previous : 0;
    this.previous = now;
    if (this.limited || now < this.warmUntil || document.hidden || gap > 250) return false;
    this.samples += 1;
    this.slow += Number(gap > 40);
    this.cost += renderCost;
    if (this.samples < 60) return false;
    this.limited = this.slow >= 12 || this.cost / this.samples > 5;
    this.samples = this.slow = this.cost = 0;
    return this.limited;
  }
}
