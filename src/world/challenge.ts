import table from '../../data/catalog/challenge.json';
import { Canon } from '../canon/canon';

// How dangerous one creature of a kind is, as levels of a lone warrior (data/catalog/challenge.json, measured by
// `bin/kyrie bestiary challenge`: the kind fought by the game's own fights against a standard warrior): a rat is a
// sixth of a first-level warrior, a wolf half of one, a bear one, a golem a fifth-level warrior's match, a drake beyond
// any (24). Measured at the kind's first level and its fifth; between and beyond, by how it grows. What composes an
// encounter spends a budget of these (see Parties), as Orsino spent its levels.
export class Challenge {
  static readonly kinds = (table as unknown as { kinds: Record<string, [number, number]> }).kinds;
  // A kind's challenge at a level: unmeasured kinds (an author's own, not yet measured) by their base's, else a
  // first-level warrior's.
  static of(kind: string, level = 1): number {
    const id = Canon.resolve('species', kind);
    const [first, fifth] = this.kinds[id] ?? this.kinds[Canon.isBody(id) ? Canon.creature(id).variantOf ?? '' : '']
      ?? [1, 5];
    return Math.max(first / 4, first + (fifth - first) * (level - 1) / 4);
  }
  static measured(kind: string): boolean { return Object.hasOwn(this.kinds, Canon.resolve('species', kind)); }
  // The highest level, up to a ceiling, at which one of the kind is still within a budget; none if not even its first.
  static level(kind: string, budget: number, most = 20): number | undefined {
    if (this.of(kind, 1) > budget) { return undefined; }
    let level = 1;
    while (level < most && this.of(kind, level + 1) <= budget) { level++; }
    return level;
  }
}
