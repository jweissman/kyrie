import type { Act, Screen } from './screen-types';

// A fight as good as won before it begins (its reckoning: easily won). It is one act, not a page of rounds: begun, it
// is fought through by the company's own tactics, each turn, unless it turns against it (one of the company brought
// low), when the fight is handed back to the player (the first blind playtest, 14 November: six rounds of a fight the
// game had called easily won, "clerical work"; BP-01). The one rule the host, the terminal and the choices read.
export class Foregone {
  // The reckonings a fight is foregone at.
  static readonly dangers: ReadonlySet<string> = new Set(['slight']);
  // Whether a command begins a foregone fight: an attack on someone the company reckons it would easily beat.
  static is(screen: Screen | undefined, command: string): boolean {
    return !!screen?.people.some(p => p.reckoning && this.dangers.has(p.reckoning.danger)
      && this.attacks(p.acts).some(a => a.command === command));
  }
  private static attacks(acts: Act[]): Act[] {
    return acts.flatMap(a => [...a.does === 'attack' ? [a] : [], ...this.attacks(a.children ?? [])]);
  }
}
