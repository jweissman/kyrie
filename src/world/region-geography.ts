import { RegionEcology } from './region-ecology';
import type { Landmark } from './region-land';
import type { Region, Settlement, Site } from './region-writer';

type Spot = [number, number];
// A stretch of road between two settlements and the land it crosses: a river's ford, a wood, a mere's edge, a pass.
export interface Road { from: Settlement; to: Settlement; land: string; way: string; spot: Spot; form?: Landmark }
// Where a site stands: the stretch of country it is in, where that lies, and the settlement it is reached from.
export interface Seat { site: Site; land: string; spot: Spot; town: Settlement; form?: Landmark }
interface WayNames { land: string; way: string; out: string; on: string; kind: string; scene: string }

// Where everything in a generated region lies, at the region's scale. The settlements stand along one road, west to
// east; the first road fords the region's river, and the second goes through its wood, along its mere on a causeway,
// or over its pass under its peak. Each site stands in its own stretch of country north or south of the settlement it
// is reached from, except one that may stand on the shore of a forest's mere. The chart draws what lies where, the
// descriptions tell it, and the ways take the time the land asks: a wood or a causeway is slow going, a pass slower,
// and cold after dark; a river can rise over its ford.
export class RegionGeography {
  static readonly span = 4;
  // The kinds of site that may stand on a mere's shore.
  static readonly lakeside = ['tower', 'ruin', 'barrow', 'grove', 'bog'];
  static readonly country: Record<string, string> = { forest: 'woods', marsh: 'fen', mountain: 'fells', frost: 'snowfields' };
  static readonly looks: Record<string, string> = {
    cave: 'A dark mouth opens in the hillside.', barrow: 'A long grassed mound with a stone-lined entrance.',
    ruin: 'Fallen walls in rough grass; someone built here once.', tower: 'A lone tower stands above the land.',
    grove: 'Old trees crowd close, and the light under them is green.', bog: 'Black water between tussocks; the path is a line of stakes.',
    mine: 'Spoil heaps and a timbered adit.', sinkhole: 'Grass runs to the edge of a round pit in the ground.' };
  static town(i: number): Spot { return [i * this.span, 2]; }
  static roads(region: Region): Road[] {
    const land = region.land ?? [];
    return region.settlements.slice(1).map((to, i) => {
      const from = region.settlements[i]!, form = i === 0 ? land.find(l => l.form === 'river') : i === 1
        ? land.find(l => l.form === 'wood' || l.form === 'pass' || (l.form === 'lake' && region.terrain === 'marsh'))
        : undefined;
      return { from, to, land: `${from.id}_${to.id}_land`, way: `${from.id}_${to.id}_way`, spot: [i * this.span + 2, 2],
        ...form ? { form } : {} };
    });
  }
  // The mere a site may stand by: a forest's (a fen's mere is on the road).
  static mere(region: Region): Landmark | undefined {
    return region.terrain === 'marsh' ? undefined : region.land?.find(l => l.form === 'lake');
  }
  static seats(region: Region): Seat[] {
    const used = new Set<string>(), mere = this.mere(region);
    const shore = mere && region.sites.find(s => this.lakeside.includes(s.kind));
    return region.sites.map((site, k) => {
      const town = this.near(region, site);
      const spot = this.free(region.settlements.indexOf(town), used, k % 2 ? [4, 0] : [0, 4]);
      return { site, town, spot, land: `${site.id}_land`, ...site === shore ? { form: mere } : {} };
    });
  }
  // The settlement each site is reached from: the one it names, or one by turns.
  static near(region: Region, site: Site): Settlement {
    const index = region.sites.indexOf(site);
    return region.settlements.find(s => s.id === site.near) ?? region.settlements[index % region.settlements.length]!;
  }
  // The first open ground north or south of a settlement, then a step further east each time.
  private static free(i: number, used: Set<string>, sides: number[]): Spot {
    for (let dx = 0; ; dx++) {
      for (const y of sides) {
        const key = `${i * this.span + dx},${y}`;
        if (!used.has(key)) { used.add(key); return [i * this.span + dx, y]; }
      }
    }
  }
  // Which way one spot lies from another, as people say it: "north", "south-east".
  static compass(from: Spot, to: Spot): string {
    const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
    const ns = dy < 0 ? 'north' : dy > 0 ? 'south' : '', ew = dx < 0 ? 'west' : dx > 0 ? 'east' : '';
    if (Math.abs(dx) > 2 * Math.abs(dy)) { return ew; }
    if (Math.abs(dy) > 2 * Math.abs(dx)) { return ns; }
    return `${ns}-${ew}`;
  }
  static terrain(t: string): string {
    return ({ forest: 'forest', marsh: 'fen', mountain: 'upland', frost: 'frozen', desert: 'desert' } as Record<string, string>)[t] ?? t;
  }
  // What a name means, when it was given in the folk's own tongue: " The name is Westron for “cold hill”."
  static meaning(place: { gloss?: string; tongue?: string }): string {
    if (!place.gloss || !place.tongue) { return ''; }
    return ` The name is ${place.tongue}${place.tongue === 'Aenean' ? ', the old tongue,' : ''} for “${place.gloss}”.`;
  }
  // Where a settlement stands, by the land its roads cross: "It grew up where the road comes down to the ford of the
  // Murkbrōc." Told with its description, so the land is met before it is crossed.
  static placement(region: Region, i: number): string {
    const id = region.settlements[i]?.id, said: string[] = [];
    for (const road of this.roads(region).filter(r => r.form && (r.from.id === id || r.to.id === id))) {
      const name = road.form!.name, west = road.to.id === id;
      const lines: Record<string, [string, string]> = {
        river: [`It grew up where the road comes down to the ford of the ${name}.`, `West of it the road fords the ${name}.`],
        wood: [`East of it the road goes into ${name}.`, `West of it lies ${name}, and the road through it.`],
        pass: [`Above it the road climbs to the ${name}.`, `The road comes down to it from the ${name}.`],
        lake: [`East of it the road goes out along ${name} on a causeway.`, `The causeway along ${name} ends here.`] };
      said.push(lines[road.form!.form]?.[west ? 1 : 0] ?? '');
    }
    return said.filter(Boolean).map(l => `${l} `).join('');
  }
  // The places the land adds beyond roads and sites: the summit over a pass, and a mere's shore with no site on it.
  static extras(region: Region): string[] {
    const pass = this.roads(region).some(r => r.form?.form === 'pass') && region.land?.some(l => l.form === 'peak');
    const shore = this.mere(region) && !this.seats(region).some(s => s.form);
    return [...pass ? ['summit'] : [], ...shore ? ['lake_land', 'lake_shore'] : []];
  }
  // The land, roads and sites of a region, as Kyr.
  static lines(region: Region): string[] {
    const q = JSON.stringify, lines = this.roads(region).flatMap(r => this.road(r, region));
    const seats = this.seats(region), mere = this.mere(region);
    if (mere && !seats.some(s => s.form)) { lines.push(...this.shore(region, mere)); }
    for (const seat of seats) {
      const { site, town, land, spot: [x, y], form } = seat;
      const name = form ? form.name : `the ${this.country[region.terrain] ?? 'country'} ${this.compass(this.town(region.settlements.indexOf(town)), seat.spot)} of ${town.name}`;
      lines.push(`  Place ${land} ${q(name)} is wilderness within region at ${x}, ${y}.`,
        `  Place ${site.id} ${q(site.name)} is room within ${land} at 1, 1.`,
        `  Passage ${site.id}_track ${q(`the track to ${site.name}`)} is track between ${town.id}_green and ${site.id} taking ${site.hours} hour${site.hours === 1 ? '' : 's'}.`,
        `  Observe ${site.id}_scene at ${site.id} when true ${q(this.site(seat, region))}.`);
      if (form) { lines.push(`  Initially Assert landform(${land}, land_lake).`); }
    }
    return lines;
  }
  private static site(seat: Seat, region: Region): string {
    const { site, form } = seat, fen = region.terrain === 'marsh' ? ' Reeds hiss in the wind.' : '';
    const shore = form ? ` It stands on the shore of ${form.name}, and the water laps at its foot.${this.meaning(form)}` : '';
    const sign = RegionEcology.sign(RegionEcology.habitat(region, site, form?.form), site.id);
    return `${site.name}.${this.meaning(site)} ${this.looks[site.kind] ?? ''}${shore}${fen} ${sign}`.trim();
  }
  // A forest's mere with no site by it still has a shore to walk to.
  private static shore(region: Region, mere: Landmark): string[] {
    const q = JSON.stringify, i = Math.min(1, region.settlements.length - 1), town = region.settlements[i]!;
    const [x] = this.town(i);
    return [`  Place lake_land ${q(mere.name)} is wilderness within region at ${x + 1}, 4.`,
      '  Initially Assert landform(lake_land, land_lake).',
      `  Place lake_shore ${q(`the shore of ${mere.name}`)} is room within lake_land at 1, 1.`,
      `  Passage lake_path ${q(`the path down to ${mere.name}`)} is path between ${town.id}_green and lake_shore taking 1 hour.`,
      `  Observe lake_shore_scene at lake_shore when true ${q(`Still water under the trees, going away further than you can see. Boats are drawn up in the reeds.${this.meaning(mere)} ${RegionEcology.sign('lake', 'lake_shore')}`)}.`];
  }
  private static road(road: Road, region: Region): string[] {
    const q = JSON.stringify, { from, to, land, way, form } = road, [x, y] = road.spot, n = this.names(road, region);
    const half = form?.form === 'pass' ? '2 hours' : form?.form === 'wood' || form?.form === 'lake' ? '90 minutes' : '1 hour';
    const lines = [`  Place ${land} ${q(n.land)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${way} ${q(n.way)} is room within ${land} at 1, 1.`,
      `  Passage road_${from.id}_${to.id} ${q(n.out)} is road between ${from.id}_green and ${way} taking ${half}.`,
      `  Passage road_${from.id}_${to.id}_on ${q(n.on)} is ${n.kind} between ${way} and ${to.id}_green taking ${half}.`,
      `  Observe ${way}_scene at ${way} when true ${q(`${n.scene} ${RegionEcology.sign(form ? RegionEcology.forms[form.form]! : RegionEcology.country(region), way)}`.trim())}.`];
    if (form) { lines.push(`  Initially Assert landform(${land}, land_${form.form}).`); }
    if (form?.form === 'river') { lines.push(...this.ford(road, form)); }
    if (form?.form === 'pass') { lines.push(...this.pass(road, form, region)); }
    return lines;
  }
  // What a road and its land are called, and how it looks, by the land it crosses.
  private static names(road: Road, region: Region): WayNames {
    const { from, to, form } = road, gloss = form ? this.meaning(form) : '', name = form?.name ?? '';
    const plain = this.terrain(region.terrain);
    switch (form?.form) {
      case 'river': return { land: `the vale of the ${name}`, way: `the ford of the ${name}`, kind: 'ford',
        out: `the road from ${from.name} down to the ${name}`, on: `the ford of the ${name}`,
        scene: `The road comes down between alders to the ${name} and crosses it on a ford of flat stones; on the far bank it climbs again toward ${to.name}.${gloss}` };
      case 'wood': return { land: name, way: `the road through ${name}`, kind: 'road',
        out: `the road from ${from.name} into ${name}`, on: `the road out of ${name} to ${to.name}`,
        scene: `The road winds under the trees of ${name}, roots across it and the light gone green. It is slow going, and the wood is quiet on either hand.${gloss}` };
      case 'lake': return { land: `the shore of ${name}`, way: `the causeway along ${name}`, kind: 'causeway',
        out: `the road from ${from.name} down to ${name}`, on: `the causeway along ${name} to ${to.name}`,
        scene: `The road goes out along the edge of ${name} on a causeway of piled stone and black timber: open water on one hand, reeds on the other, and the wind across both.${gloss}` };
      case 'pass': return { land: `the ${name}`, way: `the top of the ${name}`, kind: 'road',
        out: `the road from ${from.name} up to the ${name}`, on: `the road down from the ${name} to ${to.name}`,
        scene: `The road climbs to the ${name}, a saddle of bare rock between the heights, and goes over. Cairns mark the way where the snow lies. There is no shelter here, and the wind never stops.${gloss}` };
      default: return { land: `the ${plain} between ${from.name} and ${to.name}`, way: `the road between ${from.name} and ${to.name}`,
        kind: 'road', out: `the road from ${from.name} to ${to.name}`, on: `the road on to ${to.name}`,
        scene: `The road between ${from.name} and ${to.name}, with ${plain} country close on either side.` };
    }
  }
  // A ford is crossed knee-deep; when the river is up it can be risked, and whoever goes first may be swept off it.
  private static ford(road: Road, river: Landmark): string[] {
    const q = JSON.stringify;
    return ['  Hazard swept "Swept off the ford" means "Deal (1d6) physical damage to ally unless strength save against (12).".',
      `  Thing river_water ${q(`the ${river.name}`)} on road_${road.from.id}_${road.to.id}_on is scenery {`,
      `    State low ${q(`The ${river.name} runs knee-deep and clear over the ford stones.`)}.`,
      `    State spate dangerous ${q(`The ${river.name} is in spate: brown water runs fast and loud over the ford, thigh-deep and rising.`)}.`,
      '    Hurts with swept when spate then spate.', '  }'];
  }
  // A pass is a day's climb, cold after dark; above it, a peak with the whole region below.
  private static pass(road: Road, pass: Landmark, region: Region): string[] {
    const q = JSON.stringify, peak = region.land?.find(l => l.form === 'peak');
    const lines = [`  Hazard pass_cold ${q(`The cold on the ${pass.name}`)} means "Deal (1d4) cold damage to ally unless constitution save against (12).".`,
      '  Relation chilled(group).',
      `  Rule pass_night when at(party, ${road.way}) and dark() and not chilled(party) says ${q(`Night comes down on the ${pass.name}, and the cold with it. There is no shelter, and nothing to burn.`)} { Assert strikes(pass_cold, party). Assert chilled(party). }`,
      '  Rule pass_dawn when chilled(party) and not dark() { Retract chilled(party). }'];
    if (!peak) { return lines; }
    return [...lines, `  Place summit ${q(`the top of ${peak.name}`)} is room within ${road.land} at 1, 0.`,
      `  Passage summit_climb ${q(`the climb to the top of ${peak.name}`)} is path between ${road.way} and summit taking 2 hours needing climbing or rope.`,
      `  Observe summit_view at summit when not dark() ${q(`${this.view(region, peak, road.spot)} ${RegionEcology.sign('heights', 'summit')}`)}.`,
      `  Observe summit_dark at summit when dark() ${q(`Dark all round, and the wind. Far below, a light or two where ${road.from.name} must be.`)}.`];
  }
  // What can be seen from a peak: each settlement and each site where it lies, though not what the sites are.
  private static view(region: Region, peak: Landmark, from: Spot): string {
    const sides = new Map<string, string[]>();
    region.settlements.map((s, i) => ({ s, at: this.town(i) }))
      .sort((a, b) => Math.abs(a.at[0] - from[0]) - Math.abs(b.at[0] - from[0]))
      .forEach(({ s, at }) => sides.set(this.compass(from, at), [...sides.get(this.compass(from, at)) ?? [], s.name]));
    const towns = [...sides].map(([side, names]) => `${names.join(' and beyond it ')} to the ${side}`);
    const river = region.land?.find(l => l.form === 'river'), ford = this.roads(region)[0];
    const sites = this.seats(region).map(seat => {
      const look = this.looks[seat.site.kind] ?? 'Something stands there.';
      return `${this.compass(this.town(region.settlements.indexOf(seat.town)), seat.spot)} of ${seat.town.name}, ${look[0]!.toLowerCase()}${look.slice(1, -1)}`;
    });
    return `From the top of ${peak.name} the whole of ${region.name} lies open: ${towns.join('; ')}`
      + `${river && ford ? `; and the ${river.name} winding down to its ford, ${this.compass(from, ford.spot)} of you` : ''}. `
      + sites.map(s => `${s[0]!.toUpperCase()}${s.slice(1)}.`).join(' ') + this.meaning(peak);
  }
}
