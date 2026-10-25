// How a measured journey is told: a window of steps at a time as it goes, and the whole at the end.
export interface JourneyStep {
  step: number; choice: string; command: string; total: number; engine: number; screen: number; narrative: number;
  save: number; ahead?: number; elapsed: number; facts: number; modules: number; commands: number; saved: number;
  heap: number;
}
export class JourneyReport {
  // The heap in use, in megabytes: after a full collection when asked, so that what is kept is told apart from
  // garbage not yet collected.
  static heap(collect: boolean): number {
    if (collect) { Bun.gc(true); }
    return Math.round(process.memoryUsage().heapUsed / 1e6);
  }
  static pct(xs: number[], p: number): number {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? 0;
  }
  private static median(w: JourneyStep[], k: keyof JourneyStep): number {
    return this.pct(w.map(s => s[k] as number), 0.5);
  }
  // A window of steps: the command's median and worst, its parts' medians, and how big the game is by then.
  static row(w: JourneyStep[]) {
    const last = w.at(-1)!, worst = Math.max(...w.map(s => s.total)), saves = Math.max(...w.map(s => s.save));
    console.log(`steps ${w[0]!.step}-${last.step}: command p50 ${this.median(w, 'total')} max ${worst}`
      + ` | engine ${this.median(w, 'engine')} screen ${this.median(w, 'screen')}`
      + ` narrative ${this.median(w, 'narrative')} save ${this.median(w, 'save')} (max ${saves})`
      + ` | facts ${last.facts} modules ${last.modules} commands ${last.commands}`
      + ` saved ${Math.round(last.saved / 1000)}k heap ${last.heap}MB`);
  }
  static summary(steps: JourneyStep[]) {
    if (!steps.length) { return; }
    for (const k of ['total', 'engine', 'screen', 'narrative', 'save'] as const) {
      const all = steps.map(s => s[k]);
      console.log(`${k}: p50 ${this.pct(all, 0.5)} p90 ${this.pct(all, 0.9)} p99 ${this.pct(all, 0.99)}`
        + ` max ${Math.max(...all)} ms`);
    }
    const worst = [...steps].sort((a, b) => b.total + b.save - a.total - a.save).slice(0, 5);
    for (const s of worst) { console.log(`worst: step ${s.step} ${s.choice} — command ${s.total} save ${s.save} ms`); }
  }
}
