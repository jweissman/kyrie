import type { Choice } from '../ui/choice-list';

// What a choice asks before it is done (GRAMMAR.md: a grave act asks once): what it cannot undo, or how a fight would
// go; and what it says when chosen once. One rule for every client: the page and the terminal had each read the same
// fields their own way (the page's Act.asks, the terminal's own copy).
export class Grave {
  static asks(c: Pick<Choice, 'grave' | 'marks'>): string | undefined {
    return c.grave ?? c.marks?.find(m => m.ask)?.said;
  }
  static asked(said: string, grave: boolean): string {
    const whole = `${said.charAt(0).toUpperCase()}${said.slice(1)}${/[.!?]$/.test(said) ? '' : '.'}`;
    return `${whole}${grave ? ' It cannot be undone.' : ''} Choose it again to do it.`;
  }
}
