import { createInterface } from 'node:readline';

// The runner's lines from stdin, one at a time, blank lines passed over.
export class RunnerLines {
  private readonly lines = createInterface({ input: process.stdin })[Symbol.asyncIterator]();
  async next(): Promise<string | null> {
    for (;;) {
      const n = await this.lines.next();
      if (n.done) { return null; }
      if (String(n.value).trim()) { return String(n.value).trim(); }
    }
  }
}
