import { TerminalHuman } from './terminal-human';
import { TerminalInput, type Asking } from './terminal-input';

// Which terminal a game is played in (the owner, 14 November: TP-01). A person at an interactive terminal gets the
// human mode, a picker on raw keys; anything else (a pipe, a runner, a blind agent) gets the headless mode, plain lines
// in and out. `--interactive` and `--headless` say so either way. Both play one workflow (see Terminal.play).
export class TerminalMode {
  static readonly flags = ['--interactive', '--headless', '--save-as'];
  static human(args: string[], tty = !!process.stdin.isTTY && !!process.stdout.isTTY): boolean {
    if (args.includes('--headless')) { return false; }
    return args.includes('--interactive') || tty;
  }
  static input(args: string[]): Asking { return this.human(args) ? TerminalHuman.open() : TerminalInput.open(); }
  // How a game is played in it: whether a save asks for a path (--save-as), else is kept in the one slot.
  static play(args: string[]): { input: Asking; saveAs?: boolean } {
    return { input: this.input(args), ...args.includes('--save-as') ? { saveAs: true } : {} };
  }
  // The arguments without the mode's flags, for a command that reads the rest.
  static rest(args: string[]): string[] { return args.filter(a => !this.flags.includes(a)); }
}
