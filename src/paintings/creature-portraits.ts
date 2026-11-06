import { Canon } from '../canon/canon';
import { Likeness } from './likeness';

// The painting a creature is shown by, from its kind's own record and nowhere else (the owner, 5 November: the
// canonical files say which kinds have a portrait and which need one; no inventory beside them): the record's
// portrait, else its base's, up the variantOf chain. None, and it is drawn by its emblem.
export class CreaturePortraits {
  static painting(raceId: string): string | undefined {
    const seen = new Set<string>();
    // An old name or a composed kind (golem/glass) by what it is: a composed kind by its base's.
    // Each step by what it names (a module's kind may be like an old name: like cave_hound, the hound in the cave).
    for (let id = this.named(raceId); id && !seen.has(id) && Canon.species[id];
      id = this.named(Canon.species[id]!.variantOf)) {
      seen.add(id);
      if (Canon.species[id]!.portrait) { return Canon.species[id]!.portrait; }
    }
    return undefined;
  }
  private static named(id?: string): string | undefined { return id && Canon.resolve('species', id).split('/')[0]; }
  // As a fight's card shows a face (see CompanyPortraits): the small copy, and the large for a page.
  static face(raceId: string): { id: string; src: string; medium: string } | undefined {
    const painting = Canon.isBody(raceId) ? this.painting(raceId) : undefined;
    return painting ? { id: painting, src: Likeness.src(painting), medium: Likeness.src(painting) } : undefined;
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
