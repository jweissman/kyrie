import { Canon } from '../canon/canon';

// The harm an effect does on an average roll: what it deals at once, and what a condition it lays on does each watch
// it lasts (an hour of agony is six watches of it). Read from the effect's own words ("Deal (3d8) slashing damage",
// "Apply agony to ally for 1 hour"), so a trap or a hazard says how bad it is without being run.
export class Harm {
  static average(effect: string): number {
    const dealt = [...effect.matchAll(/Deal (\(?[\dd]+\)?)/g)].map(([, a]) => this.dice(a!));
    const lasting = [...effect.matchAll(/Apply (\w+) to \w+ for (\d+) hours?/g)]
      .map(([, id, hours]) => 6 * Number(hours) * (Canon.conditions[id!]?.modifiers.onTurnEnd ?? [])
        .filter(p => p.kind === 'damage').reduce((n, p) => n + this.dice(String(p.amount)), 0));
    return [...dealt, ...lasting].reduce((a, b) => a + b, 0);
  }
  private static dice(dice: string): number {
    const [, n, d] = /^\(?(\d+)(?:d(\d+))?\)?$/.exec(dice.trim()) ?? [];
    return !n ? 0 : d ? Number(n) * (Number(d) + 1) / 2 : Number(n);
  }
}
