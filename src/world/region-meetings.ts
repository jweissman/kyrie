import text from '../../data/generation/wild/meetings.kyrt' with { type: 'text' };
import { Draw } from './land/draw';
import { Terrain, type Land } from './land/terrain';
import { KyrTemplates, type KyrSection } from './kyr-template';
import { RegionGeography, type Seat } from './region-geography';
import { RegionTracts } from './region-tracts';
import { RegionSites } from './region-sites';
import { Vantage } from './vantage';
import type { Region } from './region-writer';

// A meeting in the open country: the stretch it is in, what is met there, and the site beyond it leads to, if any.
export interface Meeting { cell: number; section: KyrSection; lead?: Seat }

// What is met with in the open country of a generated region, a stretch here and there (the owner's OWN-27: a
// wilderness worth exploring, its exploration regularly uncovering worthwhile destinations and interactions; the
// wild's own meetings and finds). What each is, a charcoal-burner at a flaring stack, a boar over a trampled pack,
// a cache under marked stones, a fallen way-stone, is the author's, in data/generation/wild/meetings.kyrt, drawn by
// the kind of land the stretch is; this chooses the stretches and fills them in. One stretch near each town first, at
// the edge of what its people know, then others across the country, none next to another, about one stretch in ten
// and never more than a few dozen, so that the country is quick to write. A meeting that leads somewhere leads to the
// nearest site beyond it that a teller could name, so that the company is drawn on from the known edge into the wild
// (REV-08). A danger is met only away from the roads and the towns, and warns first.
export class RegionMeetings {
  static readonly template = KyrTemplates.parse(text);
  // The heights have the fells' meetings; the heath its own and the fells' as well.
  static readonly kin: Record<string, string[]> = { peak: ['fell'], heath: ['heath', 'fell'] };
  static readonly most = 24;
  static lines(region: Region): string[] {
    const meetings = this.meetings(region);
    if (!meetings.length) { return []; }
    const once = this.template.sections.filter(s => s.group === 'country').flatMap(s => s.lines);
    return [...once, ...meetings.flatMap(m => this.write(region, m))];
  }
  // The meetings of a country, by its seed: which stretches, and what is met in each.
  static meetings(region: Region): Meeting[] {
    const land = RegionGeography.atlas(region).land, cells = this.open(region);
    const roads = new Set(RegionGeography.roads(region).flatMap(r => r.route.cells));
    const towns = region.settlements.flatMap(s => s.cell === undefined ? [] : [s.cell]);
    const draw = new Draw(`${region.name}:meetings`), chosen: number[] = [];
    const most = Math.min(this.most, Math.round(cells.length / 10));
    // At the edge of what each town knows: two or three stretches out from it.
    for (const t of towns) {
      const edge = draw.shuffle(cells.filter(c => [2, 3].includes(Terrain.distance(land, t, c))));
      const c = edge.find(e => this.apart(land, chosen, e));
      if (c !== undefined && chosen.length < most) { chosen.push(c); }
    }
    for (const c of draw.shuffle(cells)) {
      if (chosen.length >= most) { break; }
      if (this.apart(land, chosen, c)) { chosen.push(c); }
    }
    const busy = [...roads, ...towns];
    return chosen.flatMap(c => this.met(region, c, busy.every(o => Terrain.distance(land, o, c) >= 2)));
  }
  // No meeting next to another: a stretch between them at least.
  private static apart(land: Land, chosen: number[], c: number): boolean {
    return chosen.every(o => Terrain.distance(land, o, c) > 2);
  }
  // The stretches a meeting can be in: open country with nothing standing on it and no road across it.
  private static open(region: Region): number[] {
    const standing = new Set(RegionTracts.standing(region).map(s => s.cell));
    const roads = new Set(RegionGeography.roads(region).flatMap(r => r.route.cells));
    return RegionTracts.cells(region).filter(c => !standing.has(c) && !roads.has(c));
  }
  // What is met in one stretch: an option of its land's (or of any land), drawn by weight; one that leads somewhere
  // only where there is somewhere to lead, and a danger only away from the roads and towns.
  private static met(region: Region, cell: number, away: boolean): Meeting[] {
    const cover = RegionGeography.atlas(region).land.cover[cell]!, lands = [...this.kin[cover] ?? [cover], 'any'];
    const lead = this.lead(region, cell);
    const options = this.template.sections.filter(s => lands.includes(s.group)
      && (lead || !s.said.includes('lead')) && (away || !s.said.includes('danger')));
    if (!options.length) { return []; }
    const section = new Draw(`${region.name}:meeting:${cell}`).weighted(options.map(o => [o, o.weight] as const));
    return [{ cell, section, ...lead && section.said.includes('lead') ? { lead } : {} }];
  }
  // The nearest site a teller could name within a long day's walk of here: not a great work, which is found only by
  // looking for it, and not one standing here.
  static lead(region: Region, cell: number): Seat | undefined {
    const land = RegionGeography.atlas(region).land;
    return RegionGeography.seats(region)
      .filter(s => !s.site.work?.great && !s.site.work?.imperial && s.site.cell !== cell)
      .map(s => ({ s, d: Terrain.distance(land, s.site.cell!, cell) })).filter(x => x.d <= 8)
      .sort((a, b) => a.d - b.d)[0]?.s;
  }
  private static write(region: Region, m: Meeting): string[] {
    const land = RegionGeography.atlas(region).land, W = land.width, id = `wm${m.cell}`;
    const draw = new Draw(`${region.name}:meeting:${m.cell}:who`), she = draw.chance(0.5);
    const town = [...region.settlements].filter(s => s.cell !== undefined)
      .sort((a, b) => Terrain.distance(land, a.cell!, m.cell) - Terrain.distance(land, b.cell!, m.cell))[0];
    const values: Record<string, string> = { m: id, tract: RegionTracts.id(m.cell), folk: region.ancestry,
      town: town?.name ?? region.name, he: she ? 'she' : 'he', his: she ? 'her' : 'his', him: she ? 'her' : 'him' };
    if (m.lead) {
      const at = m.lead.site.cell!;
      Object.assign(values, { site: m.lead.site.id, seen: RegionSites.seenAs(m.lead, region),
        toward: Vantage.bearing(at % W - m.cell % W, Math.floor(at / W) - Math.floor(m.cell / W)) });
    }
    const base = this.template.sections.filter(s => s.group === 'base');
    return KyrTemplates.fill([...base, m.section].flatMap(s => s.lines), values);
  }
}
