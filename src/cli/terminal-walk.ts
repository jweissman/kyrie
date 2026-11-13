import { Terminal } from './terminal';
import { TerminalScene, type Turned } from './terminal-scene';
import { Sentences } from '../presentation/sentences';
import type { Asking } from './terminal-input';
import type { PlaySession } from '../session/play-session';

// How a walk answers what the terminal asks: given what the terminal printed since it last asked, and the prompt.
export interface Style { answer(said: string[], prompt: string, n: number): string | null }
export interface Presented { turned: Turned; lines: string[]; reference: string[]; sentences: number }
export interface Walked { transcript: string[]; scenes: Presented[] }
// The arrivals' scene prose (the budget's), and apart from it the sentences said for reference on arriving (the aim).
export interface Budget { scenes: number; mean: number; median: number; worst: Presented[]; reference: number }

// The terminal played through as a player would, by a style, in the process: what it printed is kept whole as the
// walk's transcript, and each scene it presented with how its turn was come to, so that what is shown on its own
// (an arrival) can be held to the scene budget apart from what was asked for (a look) or came of an act (the owner,
// 14 November: TM-01). The real output: the terminal's own scene, not example strings.
export class TerminalWalk implements Asking {
  private readonly out: string[] = [];
  private from = 0;
  private n = 0;
  private constructor(private readonly style: Style, private readonly turns: number) {}
  static async run(session: PlaySession, style: Style, turns = 30): Promise<Walked> {
    const walk = new TerminalWalk(style, turns), scene = new TerminalScene(), log = console.log;
    console.log = walk.heard.bind(walk);
    try { await Terminal.play(session, { input: walk, scene }); } finally { console.log = log; }
    return { transcript: walk.out, scenes: scene.told.map(t => ({ ...t, sentences: this.count(t.lines) })) };
  }
  async ask(prompt: string): Promise<string | null> {
    const said = this.out.slice(this.from);
    const answer = this.n++ < this.turns ? this.style.answer(said, prompt, this.n) : null;
    this.out.push(`${prompt}${answer ?? ''}`);
    this.from = this.out.length;
    return answer;
  }
  close() { /* nothing held open */ }
  private heard(...said: unknown[]) { this.out.push(said.join(' ')); }
  static count(lines: string[]): number { return lines.reduce((n, l) => n + Sentences.split(l).length, 0); }
  // What the walk's arrivals told on their own: the mean, the median, and the worst three, so a few long scenes are
  // not lost in the mean.
  static budget(walked: Walked): Budget {
    const arrived = walked.scenes.filter(s => s.turned === 'arrive');
    const counts = arrived.map(s => s.sentences).sort((a, b) => a - b), mid = Math.floor(counts.length / 2);
    const median = !counts.length ? 0 : counts.length % 2 ? counts[mid]! : (counts[mid - 1]! + counts[mid]!) / 2;
    return { scenes: arrived.length, mean: counts.reduce((a, b) => a + b, 0) / Math.max(1, counts.length), median,
      worst: [...arrived].sort((a, b) => b.sentences - a.sentences).slice(0, 3),
      reference: arrived.reduce((n, s) => n + this.count(s.reference), 0) / Math.max(1, arrived.length) };
  }
  // In a fight a walk lets the fight go as the rules would play it (auto), and takes the first target.
  static fighting(prompt: string): string | undefined {
    return /^Action number/.test(prompt) ? 'auto' : /^Target number/.test(prompt) ? '1' : undefined;
  }
  // The number of a choice the terminal drew with a mark, the nth of them (round the list).
  static marked(said: string[], mark: string, n = 0): string | undefined {
    const numbers = said.flatMap(l => new RegExp(`^(\\d+)\\. .*\\[[^\\]]*\\b${mark}\\b`).exec(l)?.[1] ?? []);
    return numbers.length ? numbers[n % numbers.length] : undefined;
  }
}
