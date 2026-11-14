import type { Act, Screen, TargetRow } from '../ui/screen-types';

// What a screen promises that the game does not keep: someone shown at the place with nothing at all to be done
// toward them (the cold playtest's road pedlar, "someone is here", who could not be spoken to: CO-07), a way shown
// open with no act to take it, a treasure lying there that cannot be taken. One class of fault, met through many
// channels and fixed one channel at a time in M20 (its retrospective's first systemic cause): asked of the screen
// itself, by what its rows carry, never by their words. For any client and for the runner's walks (Gate 1).
export class Promises {
  static broken(screen: Screen): string[] {
    return [...this.people(screen), ...this.ways(screen), ...this.valuables(screen)];
  }
  // Someone there, alive and not of the company, with no act toward them that can be taken or is told why not.
  private static people(screen: Screen): string[] {
    return screen.people.filter(p => p.kind === 'person' && !p.state && !p.companion && !this.answered(p))
      .map(p => `${p.name} is here, and nothing can be done toward them`);
  }
  private static ways(screen: Screen): string[] {
    return screen.exits.filter(e => !e.blocked && !this.acted(e.acts))
      .map(e => `the way to ${e.destination.name} is shown open, and nothing takes it`);
  }
  private static valuables(screen: Screen): string[] {
    return screen.things.filter(t => t.valuable && !this.acted(t.acts))
      .map(t => `${t.name} lies here to be taken, and nothing takes it`);
  }
  private static answered(row: TargetRow): boolean { return this.acted(row.acts, true); }
  // An act that can be taken, or one that says why not (a promise told as unkept is kept honestly).
  private static acted(acts: Act[], why = false): boolean {
    return acts.some(a => (!a.disabled || why) || this.acted(a.children ?? [], why));
  }
}
