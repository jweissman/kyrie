import cistern from '../../data/generation/works/cistern.kyrt' with { type: 'text' };
import galleries from '../../data/generation/works/galleries.kyrt' with { type: 'text' };
import watchtower from '../../data/generation/works/watchtower.kyrt' with { type: 'text' };
import barrow from '../../data/generation/works/barrow.kyrt' with { type: 'text' };
import singing from '../../data/generation/works/singing_hall.kyrt' with { type: 'text' };
import { Histories, type History, type Work } from './history/histories';
import { WorkPlans } from './history/work-plans';
import { RegionGeography } from './region-geography';
import { RegionSites } from './region-sites';
import { Draw } from './land/draw';
import { Canon } from '../canon/canon';
import { ItemNames } from '../item-names';
import type { Region, Site } from './region-writer';

// The makers' works in a generated region, as Kyr, from their plans (data/generation/works). Every work has its
// outside: how it looks and the name cut over it. One a scenario has not taken is written whole: its rooms and ways,
// what its makers built into it, what the kingdom after them made of it and what lives there now, each drawn for
// it; one a scenario has taken is the scenario's to fill. The region's history is a set of facts the works teach to
// whoever can read them.
export class RegionWorks {
  static readonly texts = [cistern, galleries, watchtower, barrow, singing];
  static {
    for (const text of this.texts) { Histories.register(text); }
  }
  static lines(region: Region, taken: Record<string, string> = {}): string[] {
    const history = region.history;
    if (!history) { return []; }
    return [...this.facts(history), ...region.sites.filter(s => s.work).flatMap(site => {
      const work = history.works.find(w => w.id === site.id)!, plan = Histories.plan(work.plan);
      const values = this.values(region, site, work);
      const sections = WorkPlans.choose(plan, `${region.name}:${work.id}:${work.plan}`, values)
        .filter(s => s.group === 'outside' || !taken[site.id]);
      return sections.flatMap(s => WorkPlans.fill(s.lines, values));
    })];
  }
  // What a work's plan is given to say: the work's ids and names, its makers, and the kingdom after them.
  private static values(region: Region, site: Site, work: Work): Record<string, string> {
    const history = region.history!, makers = history.makers.find(m => m.art === work.art) ?? history.makers[0]!;
    const zone = site.zone, twin = region.sites.find(s => s !== site && s.work?.plan === work.plan);
    return { w: site.id, name: site.name, old: work.old.name, oldup: work.old.name.toUpperCase(), gloss: work.old.gloss,
      land: zone ?? `${site.id}_land`, x: String(zone ? site.part ?? 0 : 1), y: String(zone ? 3 : 2),
      epithet: makers.epithet, craft: makers.craft, belief: makers.belief, fate: makers.fate,
      successors: history.successors.name, deity: region.deity, bound: this.bound(region, site),
      ...this.treasure(work), ...this.tellers(region, site), ...twin ? this.twin(region, site, twin) : {} };
  }
  // Who tells of a work: the people of the settlement nearest it (its innkeeper, priest and merchant), and the
  // traveller of its neighbour along the road; and where it is, as they say it.
  private static tellers(region: Region, site: Site): Record<string, string> {
    const town = RegionGeography.near(region, site);
    const road = RegionGeography.roads(region).find(r => r.from.id === town.id || r.to.id === town.id);
    const next = road ? (road.from.id === town.id ? road.to : road.from) : town;
    return { town: town.id, townname: town.name, keeper: `${town.id}_innkeeper`, priest: `${town.id}_priest`,
      merchant: `${town.id}_merchant`, teller: `${next.id}_traveller`, nextname: next.name,
      where: RegionSites.where(RegionGeography.seats(region).find(s => s.site === site)!, region) };
  }
  // The treasure a work holds, from its makers' (Orsino's junk and gems): a common thing and a rich one, by kind and
  // by name, drawn for the work.
  private static treasure(work: Work): Record<string, string> {
    const lists = Histories.arts[work.art]?.treasure ?? { common: ['simple_ring'], rich: ['moonstone'] };
    const draw = new Draw(`${work.id}:${work.old.name}:treasure`);
    const common = draw.pick(lists.common), rich = draw.pick(lists.rich);
    return { common, commonname: this.called(common), rich, richname: this.called(rich),
      premium: String(2 * this.worth(common)), richpremium: String(Math.round(1.5 * this.worth(rich))) };
  }
  private static worth(id: string): number { return Canon.items[id]?.value ?? 10;
  }
  private static called(id: string): string {
    return ItemNames.called(Canon.items[id]?.name ?? id.replace(/_/g, ' '));
  }
  // Which way the old bound runs past a work near the region's edge: along that edge.
  private static bound(region: Region, site: Site): string {
    const land = RegionGeography.atlas(region).land, [x, y] = RegionGeography.spot(region, site.cell!);
    const sides = [y, land.height - 1 - y, x, land.width - 1 - x], nearest = sides.indexOf(Math.min(...sides));
    return nearest < 2 ? 'east and west, along the edge of the land' : 'north and south, along the edge of the land';
  }
  // Another work of the same plan, as one can be seen from the other: its id and name, and which way it lies.
  private static twin(region: Region, site: Site, twin: Site): Record<string, string> {
    const side = RegionGeography.compass(RegionGeography.spot(region, site.cell!),
      RegionGeography.spot(region, twin.cell!));
    return { twin: twin.id, twinname: twin.name, twinside: side };
  }
  // The region's history as facts: who its makers were and what they held, how they ended, and who came after.
  private static facts(history: History): string[] {
    const q = JSON.stringify, first = history.makers[0]!, s = history.successors;
    return [`  Discovery history_makers ${q(`Before the folk came, ${first.epithet} held this country. ${first.craft} ${first.belief}`)}.`,
      `  Discovery history_fate ${q(`How ${first.epithet} ended: ${first.fate}`)}.`,
      `  Discovery history_successors ${q(`After ${first.epithet} came the kingdom of ${s.name}, ${s.were}. It fell to ${s.fall}.`)}.`];
  }
}
