// What a start-up spends its time on, phase by phase. Each phase is said as it begins, on one line overwritten in place
// where someone is watching (a terminal), and the whole is said when it is done; with --profile, each phase's time too.
// The terminal had sat silent for seconds while the world was drawn (the owner, 14 November). The work blocks the
// process while it runs, so the line is said as each phase begins, not animated.
export class Stopwatch {
  readonly phases: { label: string; ms: number }[] = [];
  private readonly began = performance.now();
  constructor(private readonly say?: (text: string) => void, readonly profile = false) {}
  // For a terminal: said on standard error, so a pipe's output is only the game's.
  static forTerminal(profile: boolean): Stopwatch {
    const tty = !!process.stderr.isTTY;
    return new Stopwatch(text => process.stderr.write(tty ? `\r\x1b[2K${text}` : `${text}\n`), profile);
  }
  async time<T>(label: string, run: () => Promise<T> | T): Promise<T> {
    this.say?.(`${label}…`);
    const t = performance.now(), value = await run();
    this.phases.push({ label, ms: performance.now() - t });
    return value;
  }
  // Run timed where there is a watch, else simply run.
  static async in<T>(watch: Stopwatch | undefined, label: string, run: () => Promise<T> | T): Promise<T> {
    return watch ? watch.time(label, run) : run();
  }
  static seconds(ms: number): string { return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`; }
  // Said when it is done: the whole, and with --profile each phase.
  done(what = 'Ready') {
    const total = Stopwatch.seconds(performance.now() - this.began);
    const each = this.profile ? ` (${this.phases.map(p => `${p.label} ${Stopwatch.seconds(p.ms)}`).join(', ')})` : '';
    this.say?.(`${what} in ${total}${each}.\n`);
  }
}
