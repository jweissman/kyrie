import { Canon } from '../../src/canon/canon';
import { RegionEcology } from '../../src/world/region-ecology';
import { DeepLayouts } from '../../src/world/deep/deep-layout';
import { DeepPacing } from '../../src/world/deep/deep-pacing';
import { DeepPurposes, type DeepGroup, type DeepPurpose } from '../../src/world/deep/deep-purposes';

// How much of the bestiary the world can field (the owner, 26 November: "make sure we're deploying as much of our
// bestiary as possible"). In the deep: the kinds a deep site's own tables name (its dwellers, its elites, its
// keeper), and the kinds its rooms are found holding over a fixed sample of sites of every purpose (a party composed
// from the purpose's habitats, below the first level: DeepPacing.composed). Placed: those, and every kind the
// country's dens and open ground can choose by its record (RegionEcology). Each by its base kind (a cave spider is a
// spider); a people (a mine's goblins) is an ancestry, not a kind of the bestiary, and is not counted. Held by a
// ratchet in test/small/deep-bestiary and said by the quantity gate.
export class QuantityBestiary {
  static readonly sample = 40;
  static base(species: string): string { return Canon.resolve('species', species).split('/')[0]!; }
  // The kinds a purpose's own tables name.
  static written(purpose: DeepPurpose): Set<string> {
    const groups: DeepGroup[] = [...purpose.dwellers, ...purpose.elites ?? []].flatMap(r => r.groups);
    return new Set([...groups, purpose.keeper].flatMap(g => g.species ? [this.base(g.species)] : []));
  }
  // The kinds the rooms of so many sites of a purpose hold, as paced.
  static met(art: string, purpose: DeepPurpose, sample = this.sample): Set<string> {
    const out = new Set<string>();
    for (let n = 0; n < sample; n++) {
      const key = `census:${art}:${n}`, layout = DeepLayouts.make(purpose, `census${n}`, key);
      for (const d of DeepPacing.plan(purpose, layout, key).flatMap(c => c.dwellers ? [c.dwellers] : [])) {
        for (const g of [d.group, d.beside?.group]) { if (g?.species) { out.add(this.base(g.species)); } }
      }
    }
    return out;
  }
  // Every kind the deep can field, with the purposes that field it.
  static fielded(sample = this.sample): Map<string, string[]> {
    const out = new Map<string, string[]>();
    for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
      for (const kind of new Set([...this.written(purpose), ...this.met(art, purpose, sample)])) {
        out.set(kind, [...out.get(kind) ?? [], art]);
      }
    }
    return out;
  }
  // Every kind some generated placement can field: the deep's, a den's, the open ground's.
  static placed(sample = this.sample): Set<string> {
    const habitats = Object.keys(Canon.habitats);
    const dens = [...habitats.flatMap(h => RegionEcology.recorded(h)),
      ...Object.values(RegionEcology.tables.denBeast.groups).flat()].map(r => this.base(r._key));
    const open = RegionEcology.seen(new Set(habitats)).map(([id]) => this.base(id));
    return new Set([...this.fielded(sample).keys(), ...dens, ...open]);
  }
  // The bestiary's kinds nothing generated fields.
  static unplaced(sample = this.sample): string[] {
    const placed = this.placed(sample);
    return Canon.catalogued.filter(k => !placed.has(k)).sort();
  }
}
