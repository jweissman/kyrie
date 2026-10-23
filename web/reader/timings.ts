import type { Frame } from '../engine/protocol';

// How long the player waits: from the choice to the second frame painted after the engine's answer, with the
// engine's own share (the command, the screen, the telling) as it reports it. Kept for the session, for whoever
// measures (kyrieMono.inspect().timings), never shown.
export interface Timing { said: string; total: number; engine?: number; screen?: number; narrative?: number;
  render: number }
export class Timings {
  static readonly list: Timing[] = [];
  private static started?: { said: string; at: number };
  static chosen(said: string) { this.started = { said, at: performance.now() }; }
  static painted(frame: Frame) {
    const started = this.started;
    if (!started) { return; }
    this.started = undefined;
    const committed = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const end = performance.now();
      this.list.push({ said: started.said, total: Math.round(end - started.at), ...frame.timing ?? {},
        render: Math.round(end - committed) });
      if (this.list.length > 200) { this.list.shift(); }
    }));
  }
}
