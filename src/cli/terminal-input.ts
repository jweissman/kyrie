import { createInterface, type Interface } from 'node:readline';
import type { Menu, Picked } from './terminal-picker';

// What the player types, each line kept until it is asked for. Piped in at once (a headless player's commands, a
// journey written down), every line arrived before the first prompt, and readline's question() took only the one it
// was waiting for: the rest were lost, and at the end of the input the next question threw ERR_USE_AFTER_CLOSE (round
// 12, B: T24-19; the reproducibles' "piping every command at once runs only the first"). The end of the input is
// asked as nothing more to say (null): the game leaves as on q. Lines not typed at a terminal are echoed after their
// prompt, so that a transcript of piped play reads as the game was played.
// What the terminal asks its player through: the keyboard or a pipe (TerminalInput), or a walk that answers as a
// style of player would (TerminalWalk).
export interface Asking { ask(prompt: string): Promise<string | null>; close(): void }
// A player who chooses from a menu by keys rather than typing (TerminalHuman, the human mode: TP-01).
export interface Picking extends Asking { pick(menu: Menu): Promise<Picked> }

export class TerminalInput implements Asking {
  private readonly lines: string[] = [];
  private waiting?: (line: string | null) => void;
  private ended = false;
  private constructor(private readonly reader: Interface, private readonly echo: boolean) {
    reader.on('line', line => this.heard(line));
    reader.on('close', () => { this.ended = true; this.answer(null); });
  }
  // Whether a player chooses by menu.
  static picks(input: Asking): input is Picking { return typeof (input as Partial<Picking>).pick === 'function'; }
  static open(): TerminalInput {
    const typed = !!process.stdin.isTTY;
    const reader = createInterface({ input: process.stdin, output: process.stdout, terminal: typed });
    return new TerminalInput(reader, !typed);
  }
  // The next line said after the prompt, trimmed; null once there is nothing more to read.
  async ask(prompt: string): Promise<string | null> {
    process.stdout.write(prompt);
    const kept = this.lines.shift();
    const line = kept !== undefined ? kept : this.ended ? null
      : await new Promise<string | null>(resolve => { this.waiting = resolve; });
    if (line !== null && this.echo) { process.stdout.write(`${line}\n`); }
    return line?.trim() ?? null;
  }
  close() { this.reader.close(); }
  private heard(line: string) {
    if (this.waiting) { this.answer(line); } else { this.lines.push(line); }
  }
  private answer(line: string | null) {
    const waiting = this.waiting;
    this.waiting = undefined;
    waiting?.(line);
  }
}
