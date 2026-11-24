import type { Campaign } from '../../src/campaign/campaign';
import type { Change } from '../../src/lang/module';
import { EntityIndex } from '../../src/lang/entity-index';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Spatial } from '../../src/lang/spatial';
import { EconomyMeasure } from '../economy-measure';
import type { Country } from '../novice-country';

// What a first country's money comes to, as the quantity gate reads it (measures 3 and 4), and why it is read so.
//   - The country's own: what lies and what is sold in the land the company begins in and the provinces within it.
//     Not what lies across a sea in a land of its own that a story's voyage reaches (the circus's isle of Sarn, eleven
//     days off, whose dragons' eggs were half of a1's treasure and three-fifths of its day's coin): its ways in are a
//     gangway that opens at the end of the voyage, and the country's ways, read known or not, had taken it for a walk.
//   - A day's coin is one outing and one job: the richest one place to go and come back from within the day's reach
//     (a level of a site, or a site, or a part of the country: what a company can clear and carry home in a day),
//     sold at the best a buyer pays, and the best pay of one job near. It had been every valuable within six hours'
//     going, found and sold, and every job's pay together: four levels of the deep site under the town, Deepwater,
//     the king-barrow and the jobs of the whole town in one day, an upper bound no company comes near (OR-323).
export interface Purse { day: number; outing: string; haul: number; job: number; worth: number; listed: number;
  stock: number }
export class QuantityPurse {
  static read(c: Campaign, country: Country, far: Map<string, number>, reach: number): Purse {
    const w = c.world, byId = EntityIndex.of(c.module.entities).byId;
    const land = Spatial.ancestry(byId, country.start).find(e => e.space?.kind === 'region')?.id;
    const own = QuantityPurse.own.bind(QuantityPurse, byId, land);
    const best = this.best(c), hauls = new Map<string, number>();
    const lying = w.related('itemKind').map(r => r.args[0]!).filter(i => !w.test(ModuleWriter.call('forSale', i))
      && w.test(ModuleWriter.call('valuable', EconomyMeasure.kind(w, i))) && own(w.one('at', i) ?? ''));
    for (const i of lying) {
      const at = w.one('at', i)!, kind = EconomyMeasure.kind(w, i);
      if ((far.get(at) ?? Infinity) > reach) { continue; }
      const outing = this.outing(byId, at);
      hauls.set(outing, (hauls.get(outing) ?? 0) + this.fetches(c, best, kind));
    }
    const [outing, haul] = [...hauls].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0] ?? ['', 0];
    const job = this.job(c, far, reach);
    // What lies, at what it fetches: the most a buyer pays for it (as the day's coin reads it), not its list worth,
    // which is twice what a dealer pays and no money anyone spends (OR-324). Its list worth is said beside it.
    const worth = lying.reduce((t, i) => t + this.fetches(c, best, EconomyMeasure.kind(w, i)), 0);
    const listed = lying.reduce((t, i) => t + w.number(ModuleWriter.call('worth', EconomyMeasure.kind(w, i))), 0);
    const stock = w.related('forSale').map(r => r.args[0]!).filter(i => own(w.one('at', i) ?? ''))
      .reduce((t, i) => t + w.number(ModuleWriter.call('price', i)), 0);
    return { day: haul + job, outing, haul, job, worth, listed, stock };
  }
  private static own(byId: ReturnType<typeof EntityIndex.of>['byId'], land: string | undefined, place: string): boolean {
    return !land || Spatial.ancestry(byId, place).some(e => e.id === land);
  }
  // The place an outing goes to for what lies at a place: its level of a site, else its site, else the area it is
  // in (a town, a stretch of wild country).
  private static outing(byId: ReturnType<typeof EntityIndex.of>['byId'], at: string): string {
    const up = Spatial.ancestry(byId, at);
    return (up.find(e => e.space?.kind === 'level') ?? up.find(e => e.space?.kind === 'site')
      ?? up.find(e => !!e.space && e.space.kind !== 'room') ?? up[0])?.id ?? at;
  }
  // What a kind fetches: the most a buyer pays for it, a dealer or one who wants it.
  private static fetches(c: Campaign, best: Map<string, number>, kind: string): number {
    return Math.max(c.world.number(ModuleWriter.call('dealerPays', kind)), best.get(kind) ?? 0);
  }
  // The most any buyer pays for a kind (pays(buyer, kind)).
  private static best(c: Campaign): Map<string, number> {
    const best = new Map<string, number>();
    for (const m of c.world.measured('pays')) {
      const kind = m.call.args[1];
      if (kind && m.call.args.length === 2) { best.set(kind, Math.max(best.get(kind) ?? 0, m.value)); }
    }
    return best;
  }
  // The best pay of one job of a part of the country within reach (a job's full pay, half and rest one payment).
  private static job(c: Campaign, far: Map<string, number>, reach: number): number {
    const near = new Map<string, number>(), pays = new Map<string, number>();
    for (const [place, minutes] of far) {
      const part = /^region__([a-z]+\d+)/.exec(place)?.[1];
      if (part && minutes < (near.get(part) ?? Infinity)) { near.set(part, minutes); }
    }
    for (const r of [...(c.module.rules ?? []).map(x => ({ id: x.id, effects: x.effects })),
      ...c.module.actions.map(a => ({ id: a.id, effects: a.success }))]) {
      const part = /^region__([a-z]+\d+)/.exec(r.id)?.[1], gives = r.effects.reduce((t, x) => t + this.gives(x), 0);
      if (!part || !gives || (near.get(part) ?? Infinity) > reach) { continue; }
      const stem = r.id.replace(/_(paid|half|rest)$/, '');
      pays.set(stem, Math.max(pays.get(stem) ?? 0, gives));
    }
    return Math.max(0, ...pays.values());
  }
  private static gives(c: Change): number {
    return c.kind === 'increase' && c.call.name === 'quantity' && c.call.args[1] === 'gold' && c.value.kind === 'number'
      ? c.value.value : 0;
  }
}
