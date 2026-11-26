import { Canon } from '../canon/canon';
import { Likeness } from './likeness';
import type { ItemCatalog } from '../item-catalog';
import type { Species } from '../rules/catalog-schema';

// The painting a creature is shown by, from its kind's own record and nowhere else (the owner, 5 November: the
// canonical files say which kinds have a portrait and which need one; no inventory beside them): the record's
// portrait, else its base's, up the variantOf chain. None, and it is drawn by its emblem.
export class CreaturePortraits {
  static canonicalPainting(raceId: string): string | undefined {
    const id = this.named(raceId);
    return id && this.canonicalSpecies(id) ? this.paint(raceId, name => this.canonicalSpecies(name)) : undefined;
  }
  static painting(catalog: ItemCatalog, raceId: string): string | undefined {
    return this.paint(raceId, id => catalog.localSpecies(id) ?? this.canonicalSpecies(id));
  }
  private static paint(raceId: string, speciesOf: (id: string) => Species | undefined): string | undefined {
    const [, ...made] = Canon.resolve('species', raceId).split('/');
    const undeath = made.find(v => Canon.variations[v]?.axis === 'undeath');
    if (undeath) { return speciesOf(this.undead[undeath] ?? '')?.portrait; }
    const own = made.map(v => Canon.variations[v]?.portrait).find(p => p !== undefined);
    if (own !== undefined) { return own ?? undefined; }
    const seen = new Set<string>();
    for (let id = this.named(raceId); id && !seen.has(id);) {
      seen.add(id);
      const species = speciesOf(id);
      if (species?.portrait) { return species.portrait; }
      id = this.named(species?.variantOf);
    }
    return undefined;
  }
  private static canonicalSpecies(id: string): Species | undefined { return Canon.species[id]; }
  // The undead whose painting stands for a kind made so.
  private static readonly undead: Record<string, string> = { zombie: 'zombie', spectral: 'spirit' };
  private static named(id?: string): string | undefined { return id && Canon.resolve('species', id).split('/')[0]; }
  // As a fight's card shows a face (see CompanyPortraits): the small copy, and the large for a page.
  static face(catalog: ItemCatalog, raceId: string): { id: string; src: string; medium: string } | undefined {
    const painting = catalog.isBody(raceId) ? this.painting(catalog, raceId) : undefined;
    return painting ? { id: painting, src: Likeness.src(painting), medium: Likeness.src(painting) } : undefined;
  }
  static of(catalog: ItemCatalog, raceId: string): ReturnType<typeof Likeness.portrait> | undefined {
    const painting = this.painting(catalog, raceId);
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
