import cistern from '../../data/generation/works/cistern.kyrt' with { type: 'text' };
import galleries from '../../data/generation/works/galleries.kyrt' with { type: 'text' };
import watchtower from '../../data/generation/works/watchtower.kyrt' with { type: 'text' };
import barrow from '../../data/generation/works/barrow.kyrt' with { type: 'text' };
import singing from '../../data/generation/works/singing_hall.kyrt' with { type: 'text' };
import keep from '../../data/generation/works/keep.kyrt' with { type: 'text' };
import abbey from '../../data/generation/works/abbey.kyrt' with { type: 'text' };
import tollhouse from '../../data/generation/works/tollhouse.kyrt' with { type: 'text' };
import greatBarrow from '../../data/generation/works/great_barrow.kyrt' with { type: 'text' };
import greatCistern from '../../data/generation/works/great_cistern.kyrt' with { type: 'text' };
import greatGalleries from '../../data/generation/works/great_galleries.kyrt' with { type: 'text' };
import greatHall from '../../data/generation/works/great_singing_hall.kyrt' with { type: 'text' };
import greatTower from '../../data/generation/works/great_watchtower.kyrt' with { type: 'text' };
import { Histories, type History, type Work } from './history/histories';
import { DeepPurposes } from './deep/deep-purposes';
import { DeepSites } from './deep/deep-sites';
import { WorkPlans } from './history/work-plans';
import { RegionGeography } from './region-geography';
import { RegionSites } from './region-sites';
import { RegionRenewal } from './region-renewal';
import { RegionMarvels } from './region-marvels';
import { RegionRiddles } from './region-riddles';
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
  static readonly texts = [cistern, galleries, watchtower, barrow, singing, keep, abbey, tollhouse, greatBarrow,
    greatCistern, greatGalleries, greatHall, greatTower];
  static {
    for (const text of this.texts) { Histories.register(text); }
    for (const purpose of Object.values(DeepPurposes.all)) { Histories.add(DeepPurposes.plan(purpose)); }
  }
  static lines(region: Region, taken: Record<string, string> = {}): string[] {
    const history = region.history;
    if (!history) { return []; }
    return [...this.facts(region), ...region.sites.filter(s => s.work).flatMap(site => {
      const work = history.works.find(w => w.id === site.id)!, plan = Histories.plan(work.plan);
      const values = this.values(region, site, work), purpose = plan.deep && DeepPurposes.of(work.art);
      if (purpose) { return taken[site.id] ? [] : DeepSites.lines(region, site, { purpose, values }); }
      const sections = WorkPlans.choose(plan, `${region.name}:${work.id}:${work.plan}`, values)
        .filter(s => s.group === 'outside' || !taken[site.id]);
      const written = sections.flatMap(s => WorkPlans.fill(s.lines, values));
      return [...written, ...taken[site.id] ? [] : [...RegionRenewal.work(region, site, { plan, sections, values }),
        ...RegionMarvels.work(region, site, work.plan, written), ...RegionRiddles.work(region, site, written)]];
    })];
  }
  // What a work's plan is given to say: the work's ids and names, its makers, and the kingdom after them.
  private static values(region: Region, site: Site, work: Work): Record<string, string> {
    const history = region.history!, makers = history.makers.find(m => m.art === work.art) ?? history.makers[0]!;
    // What reading a work teaches: its own makers' story; the later kingdom's works keep the first makers'.
    const facts = { makersfact: `history_${makers.art}`, fatefact: `history_${makers.art}_fate`,
      // Which of its art's two ends its makers came to (fatea, fateb), for the sections that show it.
      [`fate${'ab'[Math.max(0, Histories.arts[makers.art]?.fates.indexOf(makers.fate) ?? 0)]}`]: 'yes' };
    const zone = site.zone, twin = region.sites.find(s => s !== site && s.work?.plan === work.plan);
    return { w: site.id, name: site.name, old: work.old.name, oldup: work.old.name.toUpperCase(), gloss: work.old.gloss,
      land: zone ?? `${site.id}_land`, x: String(zone ? site.part ?? 0 : 1), y: String(zone ? 3 : 2),
      epithet: makers.epithet, craft: makers.craft, belief: makers.belief, fate: makers.fate,
      successors: history.successors.name, deity: region.deity, bound: this.bound(region, site),
      ...facts, ...this.kingdom(history), ...this.treasure(work), ...this.tellers(region, site),
      ...this.sight(region, site), ...this.shape(region, site), ...this.sign(region, site, work),
      ...twin ? this.twin(region, site, twin) : {} };
  }
  // Of the works of one plan in a country no two are laid out alike (shape0, shape1 or shape2 is set).
  private static shape(region: Region, site: Site): Record<string, string> {
    return { [`shape${RegionSites.shape(region, site)}`]: 'yes' };
  }
  // A lesser work of the art of the country's greatest work shows the way to it, in its makers' own way (a still
  // pool, a star in a bronze ring, a flute that is answered): greatart is set, with where the great work lies.
  private static sign(region: Region, site: Site, work: Work): Record<string, string> {
    const great = region.sites.find(s => s.work?.great);
    const seat = great && RegionGeography.seats(region).find(x => x.site === great);
    if (!great || !seat || site.work?.great || great.work!.art !== work.art) { return {}; }
    return { greatart: 'yes', greatfound: `${great.id}_found`, greatwhere: RegionSites.where(seat, region),
      greatwork: great.name, greatseen: RegionSites.look(great, region) };
  }
  // The kingdom after the makers, as its own works tell it: its name, what it was, and how it fell (fallplague,
  // fallwinter, fallheirs or fallraiders is set, for the sections that show it).
  private static kingdom(history: History): Record<string, string> {
    const s = history.successors;
    return { kingdom: s.name, kingdomup: s.name.toUpperCase(), were: s.were, fall: s.fall, [`fall${s.fallen}`]: 'yes' };
  }
  // The nearest other site, as it looks from a height before its name is known, and which way it lies.
  private static sight(region: Region, site: Site): Record<string, string> {
    const seats = RegionGeography.seats(region), from = RegionGeography.spot(region, site.cell!);
    const near = seats.filter(s => s.site !== site && s.site.cell !== undefined).map(s => ({ s,
      d: Math.hypot(...RegionGeography.spot(region, s.site.cell!).map((v, i) => v - from[i]!)) }))
      .sort((a, b) => a.d - b.d)[0]?.s;
    return near ? { sight: near.site.id, sightseen: RegionSites.seenAs(near, region),
      sightside: RegionGeography.compass(from, RegionGeography.spot(region, near.site.cell!)) } : {};
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
    const lists = Histories.arts[work.art]?.treasure ?? Histories.kinds.find(k => k.id === work.art)?.treasure
      ?? { common: ['simple_ring'], rich: ['moonstone'] };
    const draw = new Draw(`${work.id}:${work.old.name}:treasure`);
    const common = draw.pick(lists.common), rich = draw.pick(lists.rich), great = lists.great?.[0] ?? rich;
    return { common, commonname: this.called(common), rich, richname: this.called(rich), great,
      greatname: this.called(great),
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
  // The region's history as facts: who each people of makers were and what they held, how each ended, and who came
  // after them. Knowing the whole story of the first makers shows where the greatest of their works here lies.
  private static facts(region: Region): string[] {
    const history = region.history!, q = JSON.stringify, first = history.makers[0]!, s = history.successors;
    const lines = [...RegionRenewal.lines()];
    lines.push(...history.makers.flatMap((m, i) => [`  Discovery history_${m.art} ${q(i ? `${m.epithet.replace(/^t/, 'T')} made things in this country too, before the folk. ${m.craft} ${m.belief}`
      : `Before the folk came, ${m.epithet} held this country. ${m.craft} ${m.belief}`)}.`,
    `  Discovery history_${m.art}_fate ${q(`How ${m.epithet} ended: ${m.fate}`)}.`]));
    lines.push(`  Discovery history_successors ${q(`After ${first.epithet} came the kingdom of ${s.name}, where the power lay with ${s.were}. It fell to ${s.fall}.`)}.`);
    const great = region.sites.find(x => x.work?.great);
    const seat = great && RegionGeography.seats(region).find(x => x.site === great);
    if (great && seat) {
      lines.push(`  Observe ${great.id}_revealed near party when knows(party, history_${first.art}) and knows(party, history_${first.art}_fate) and not knows(party, ${great.id}_found) ${q(`With the story of ${first.epithet} whole, one thing in it stands out that no single stone says: where they went at the end. Every inscription that speaks of it points the same way, to ${RegionSites.where(seat, region)}.`)} teaches ${great.id}_found.`);
    }
    return lines;
  }
}
