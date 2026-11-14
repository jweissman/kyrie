import type { RunnerLines } from './runner-lines';
import { EngineHost } from '../../web/engine/engine-host';
import type { PlaySession } from '../session/play-session';
import { TerminalCreation } from './terminal-creation';
import type { Asking } from './terminal-input';

// A life made from the real entry point, for an agent playing blind (Gate 1, the owner, 14 November): the engine's own
// requests (world, creation, set-out) through EngineHost, as the page's worker answers them and as the terminal's
// --create asks them. Each step is said as one JSON line ({ moment: 'create', scene: { lines }, prompt }); the agent
// answers { answer: "2" } as a player at the terminal would type it (a number, "more", a name, or nothing).
export class RunnerCreation implements Asking {
  private readonly said: string[] = [];
  constructor(private readonly lines: RunnerLines, private readonly say: (out: unknown) => Promise<void>) {}
  async ask(prompt: string): Promise<string | null> {
    await this.say({ moment: 'create', scene: { lines: this.said.splice(0) }, prompt });
    const line = await this.lines.next();
    if (line === null) { return null; }
    try {
      const asked = JSON.parse(line) as { answer?: unknown };
      return typeof asked.answer === 'string' ? asked.answer : '';
    } catch { return line; }
  }
  close() { /* the lines are the runner's */ }
  heard(line: string) { this.said.push(line); }
  async begin(seed: string): Promise<PlaySession> {
    const host = new EngineHost(() => undefined);
    await new TerminalCreation(this, this.heard.bind(this)).choose(host, seed);
    await host.handle({ kind: 'set-out' });
    return host.played!;
  }
}
