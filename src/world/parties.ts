import { Canon } from '../canon/canon';
import { Counted } from '../presentation/counted';
import { Challenge } from './challenge';
import { CreatureVariants } from '../creature-variants';
import type { Draw } from './land/draw';

// One kind of a party: how many, at what level, and how it is called and meets a company.
export interface Member {
  species: string; count: number; level: number; label: string; role: string; temperament: string;
  // What it is always made of or descended from, drawn where its record does not say (a golem's material).
  variations?: string[];
}
// Who is met together: a first kind, and perhaps a second beside it (a hound pack with the ghoul it follows); one
// beyond what the place's danger would give is overwhelming, met rarely, and warns before it comes on.
export interface Party { members: Member[]; overwhelming?: boolean }

// What composes an encounter from the canon (the owner, 6 November: the restored bestiary met in ordinary generated
// places), as Orsino composed its parties: a budget of twice the place's challenge, spent on its members, two to five
// of them, each at the highest level its share allows; a second kind beside the first one time in three, with a third
// of the budget. The kinds are those whose records say they live in the place's habitats, by how common they are,
// drawn by that, and within the budget by their measured challenge (src/world/challenge.ts); one time in twelve the
// draw is of a kind beyond it (up to four times the budget), alone: the OSR's rare danger to be gone round, never
// scaled down to the company. Nothing here names a kind: a record with its habitats and abundance takes part.
export class Parties {
  static readonly overwhelming = 1 / 12;
  static readonly beside = 1 / 3;
  // The kinds whose records say they live in any of these habitats, by how common they are (one that does not say, as
  // common as any): none tame, none a device, none met only with what it requires (an elemental, but not the
  // elemental bare).
  static eligible(habitats: readonly string[]): [string, number][] {
    return Object.keys(Canon.species).map(id => [id, Canon.creature(id)] as const)
      .filter(([id, s]) => s.habitats?.some(h => habitats.includes(h)) && !CreatureVariants.wanting(id)
        && Canon.temperament(id) !== 'tame').map(([id, s]) => [id, s.abundance ?? 1]);
  }
  static compose(at: { habitats: readonly string[]; challenge: number; draw: Draw; most?: number }): Party | undefined {
    const budget = 2 * at.challenge, kinds = this.eligible(at.habitats), draw = at.draw;
    const within = kinds.filter(([id]) => Challenge.of(id) <= budget);
    const beyond = kinds.filter(([id]) => Challenge.of(id) > budget && Challenge.of(id) <= budget * 4);
    if (beyond.length && draw.chance(this.overwhelming)) {
      return { members: [this.member(draw.weighted(beyond), 1, 1, draw)], overwhelming: true };
    }
    if (!within.length) { return undefined; }
    const first = draw.weighted(within);
    const others = within.filter(([id]) => id !== first && Challenge.of(id) <= budget / 3);
    if (others.length && draw.chance(this.beside)) {
      const second = draw.weighted(others);
      return { members: [this.group(first, budget * 2 / 3, at), this.group(second, budget / 3, { ...at, most: 3 })] };
    }
    return { members: [this.group(first, budget, at)] };
  }
  // So many of a kind within a budget: Orsino's two to five (one of a kind met alone), fewer where each would be beyond
  // its share, each at the highest level its share allows.
  static group(kind: string, budget: number, at: { draw: Draw; most?: number }): Member {
    let n = Canon.creature(kind).alone ? 1 : Math.min(at.most ?? 5, 2 + at.draw.int(4));
    while (n > 1 && Challenge.of(kind) > budget / n) { n--; }
    // Each no higher than its share of the budget, as Orsino gave its members levels (a pair of bats is not of the
    // eighteenth level for being slight).
    const share = budget / n;
    return this.member(kind, n, Challenge.level(kind, share, Math.max(1, Math.ceil(share))) ?? 1, at.draw);
  }
  static member(kind: string, count: number, level: number, draw: Draw): Member {
    const name = Canon.creature(kind).name.toLowerCase(), variations = CreatureVariants.structural(kind, draw);
    const role = CreatureVariants.called(`${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`, variations);
    const called = role.replace(/^(a|an) /, '');
    return { species: kind, count, level, label: `the ${count > 1 ? Counted.plural(called) : called}`, role,
      temperament: Canon.temperament(kind) ?? 'territorial', ...variations.length ? { variations } : {} };
  }
}
