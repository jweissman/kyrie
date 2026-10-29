import type { Settlement } from '../region-writer';
import type { Resident, Workplace } from './community';
import commons from '../../../data/generation/scenes/commons.json';

type Common = 'waterside' | 'fields' | 'lanes';
// Where the people of a settlement work whose work has no place of its own built for it (data/generation/scenes/
// commons.json): by the water, where there is water; in the home fields; in the lanes behind the heart. Whoever works
// in the open of the heart (a carter, a tinker, a reeve) works there, and so does whoever the settlement is the work of
// (a pit-head's miners). The owner's review of Mission 18 found a green at eight in the morning with a thatcher, a
// weaver and a farmer standing on it: everyone without a workplace had stood on the heart all day.
export class Commons {
  static readonly table = commons as unknown as { places: Record<Common, { name: string; scene: string }>;
    works: Record<Common, string[]> };
  // The common places the settlement's people work in, made as they are needed, and each of those people set to theirs.
  static assign(s: Settlement, residents: Resident[], at: { workplaces: Workplace[]; water: boolean; heart: boolean }):
    Workplace[] {
    const made = new Map<string, Workplace>();
    for (const r of residents.filter(x => !x.workplace && !(at.heart && x.work.trades?.includes(s.trade)))) {
      const kind = this.kind(r.occupation, at.water);
      if (!kind) { continue; }
      const id = `${s.id}_${kind}`, built = at.workplaces.find(w => w.id === id || w.name === this.name(kind, s));
      if (built) { r.workplace = built.id; continue; }
      if (!made.has(id)) {
        const scene = this.table.places[kind].scene;
        made.set(id, { id, name: this.name(kind, s), scene, indoors: false, common: true });
      }
      r.workplace = id;
    }
    return [...made.values()];
  }
  private static kind(occupation: string, water: boolean): Common | undefined {
    const kind = (Object.keys(this.table.works) as Common[]).find(k => this.table.works[k].includes(occupation));
    return kind === 'waterside' && !water ? 'lanes' : kind;
  }
  private static name(kind: Common, s: Settlement): string { return this.table.places[kind].name.replace('{place}', s.name); }
}
