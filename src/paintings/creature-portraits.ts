import { Canon } from '../canon/canon';
import { PaintingConcepts } from './painting-concepts';
import { Likeness } from './likeness';

// The painting a creature is shown by, from its kind's own record (the owner, 5 November: a wolf, a rat, a spider or
// a dragon has a visual identity, a variation an override where it is truly distinct): the record's portrait if it
// names one; else a painting of the kind itself among the creatures the paintings show; else its base's, up the
// variantOf chain. None, and it is drawn by its emblem.
export class CreaturePortraits {
  static painting(raceId: string): string | undefined {
    const seen = new Set<string>();
    for (let id: string | undefined = raceId; id && !seen.has(id) && Canon.isSpecies(id);
      id = Canon.species[id]!.variantOf) {
      seen.add(id);
      const own = Canon.species[id]!;
      if (own.portrait) { return own.portrait; }
      if (PaintingConcepts.creatures.includes(id)) { return id; }
    }
    return undefined;
  }
  static of(raceId: string): ReturnType<typeof Likeness.portrait> | undefined {
    const painting = this.painting(raceId);
    return painting ? Likeness.portrait(painting) : undefined;
  }
  // No two on one page in one painting (see the people on a page): a second creature of a kind already painted there
  // (the inn's dog and the drover's, both the dog's) is drawn by its emblem, as one of a kind with no painting is. A
  // person's likeness is their own already (see Portraits), and kept.
  static once<T extends { kind: string; portrait?: { src: string } }>(rows: T[]): T[] {
    const shown = new Set<string>();
    return rows.map(r => {
      if (!r.portrait) { return r; }
      if (r.kind === 'person' || !shown.has(r.portrait.src)) { shown.add(r.portrait.src); return r; }
      const rest = { ...r };
      delete rest.portrait;
      return rest;
    });
  }
}
