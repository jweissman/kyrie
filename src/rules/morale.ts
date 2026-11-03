import { Canon } from '../canon/canon';
import type { Fighter } from '../model';

// When a side breaks (the cold review's REV-16: a fight outlived its decision, the last rat fought to the death): a
// band of three or more that has lost half its number runs, the rest of it at once, unless it is of a kind that does
// not know fear (the dead, things made to fight, oozes). A lone foe, or a pair, fights on as it would.
export class Morale {
  static readonly fearless = new Set(['undead', 'construct', 'ooze', 'elemental']);
  static broken(fighters: Fighter[], departed: Fighter[]): Fighter[] {
    const teams = new Set(fighters.filter(f => f.team !== 'fighters').map(f => f.team));
    return [...teams].flatMap(team => {
      const all = [...fighters, ...departed].filter(f => f.team === team && !f.summoner);
      const standing = all.filter(f => fighters.includes(f) && f.hp > 0);
      return all.length >= 3 && standing.length > 0 && standing.length * 2 <= all.length
        && !standing.some(f => this.fearless.has(this.type(f))) ? standing : [];
    });
  }
  private static type(f: Fighter): string {
    return Canon.isSpecies(f.raceId) ? Canon.creature(f.raceId).type ?? '' : '';
  }
}
