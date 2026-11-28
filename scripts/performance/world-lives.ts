#!/usr/bin/env bun
// Lives begun one after another in one process, as a spec that begins several worlds in one worker begins them
// (OR-1740): each world begun as the terminal begins one (PlayTool.start), its first frame told (or not: --no-frame),
// and let go, and the heap read after each letting go, collected and swept after a turn of the event loop (see
// world-memory.ts).
// A life let go whole leaves the heap where the process's caches and the code leave it, whatever lives came before.
//   scripts/machine/heavy.sh /usr/bin/time -v bun scripts/performance/world-lives.ts [--worlds s0,iscoed,kite]
//   [--as human/warrior/Wenna] [--no-frame]
import { gcAndSweep, heapStats } from 'bun:jsc';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Stopwatch } from '../../src/stopwatch';

class WorldLives {
  static async mb(): Promise<number> {
    await Bun.sleep(1); gcAndSweep(); return Math.round(heapStats().heapSize / 1024 / 1024);
  }
  static rss(): number { return Math.round(process.memoryUsage().rss / 1024 / 1024); }
  // A life begun and framed, and nothing of it kept but its first frame's length.
  static async live(world: string, as: string, framed: boolean): Promise<{ ms: number; rows: number; held: number }> {
    const t = performance.now(), o = PlayTool.parse(['--world', world, '--as', as]);
    const { journey } = await PlayTool.start(o, new Stopwatch(undefined, true));
    const ms = Math.round(performance.now() - t), rows = framed ? new Runner(journey.session).said().offer.primary
      .length : 0, held = await this.mb();
    return { ms, rows: rows + (journey.session ? 0 : 1), held };
  }
  private static flag(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1]! : fallback;
  }
  static async main(args: string[]): Promise<number> {
    const worlds = this.flag(args, '--worlds', 's0,iscoed,kite').split(','), as = this.flag(args, '--as',
      'human/warrior/Wenna'), framed = !args.includes('--no-frame');
    console.log(`before any life: heap ${await this.mb()} MB, rss ${this.rss()} MB (${framed ? 'framed' : 'unframed'})`);
    for (const world of worlds) {
      const { ms, rows, held } = await this.live(world, as, framed);
      console.log(`${world.padEnd(8)} begun in ${String(ms).padStart(6)} ms, ${rows} rows; heap held ${held} MB, `
        + `let go ${await this.mb()} MB, rss ${this.rss()} MB`);
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(await WorldLives.main(process.argv.slice(2))); }
