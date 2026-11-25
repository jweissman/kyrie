import { existsSync, readFileSync } from 'node:fs';

// How many test workers the machine can hold now. A `bun test --no-isolate` worker keeps what each spec file it runs
// leaves behind, and a world-level one reaches 3–4 GB: ten of them on a 15 GB WSL had the kernel kill test processes
// for memory and swap thrash the disk until WSL hung (25 November: nine OOM kills in one night, journalctl -b -1).
// So the count asked for is held to what the memory available now allows, at the worst seen per worker, and never
// below one.
export class TestWorkers {
  static readonly perWorkerGb = 4;
  static allowed(asked: number): number {
    const gb = this.availableGb();
    return gb === undefined ? asked : Math.max(1, Math.min(asked, Math.floor(gb / this.perWorkerGb)));
  }
  // MemAvailable, where Linux says it.
  private static availableGb(): number | undefined {
    if (!existsSync('/proc/meminfo')) { return undefined; }
    const kb = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'))?.[1];
    return kb ? Number(kb) / 1024 / 1024 : undefined;
  }
}
