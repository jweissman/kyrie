import { TerminalWalk, type Style } from './terminal-walk';

// Styles of player a walk can be: the commands given in order and then nothing more; straight at the aim (the choice
// drawn gold, else the first); or looking about (now and then a deliberate look, else a way not drawn gold, else the
// first). In a fight each lets the fight go as the rules would play it (TerminalWalk.fighting).
export class WalkStyle implements Style {
  private constructor(private readonly kind: 'scripted' | 'straight' | 'wandering', private readonly commands: string[]) {}
  static scripted(commands: string[]): WalkStyle { return new WalkStyle('scripted', commands); }
  static readonly straight = new WalkStyle('straight', []);
  static readonly wandering = new WalkStyle('wandering', []);
  answer(said: string[], prompt: string, n: number): string | null {
    const fight = TerminalWalk.fighting(prompt);
    if (fight) { return fight; }
    if (this.kind === 'scripted') { return this.commands[n - 1] ?? null; }
    if (this.kind === 'straight') { return TerminalWalk.marked(said, 'your aim') ?? '1'; }
    return n % 6 === 0 ? 'look' : TerminalWalk.marked(said, 'worth a look', n) ?? '1';
  }
}
