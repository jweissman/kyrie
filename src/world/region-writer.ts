import type { Landmark } from './region-land';
import { RegionGeography } from './region-geography';
import { RegionPeoples } from './region-peoples';
import { RegionSites } from './region-sites';
import { RegionWeather } from './region-weather';
import { RegionRoads } from './region-roads';
import { RegionZones } from './region-zones';
import { RegionBorders } from './region-borders';
import type { Atlas } from './land/atlas';
import type { Side } from './land/borders';
import type { History } from './history/histories';
import { RegionWorks } from './region-works';
import { RegionFellows } from './region-fellows';
import type { CalendarStart } from '../presentation/calendar';
import { RegionGrowth } from './region-growth';
import { RegionMarvels } from './region-marvels';
import { SettlementWriter } from './settlement-writer';
import { RegionTraffic } from './region-traffic';
// A generated region (the Deem `region` generator's output, plus sites scenarios asked for) written as an ordinary
// Kyr module: settlements as their founding made them (see SettlementWriter), roads between them, and a track out to
// each site. Every
// entity it writes is exported under its own id, so scenarios bind to it like any other module.
// A generated name: what it is made of, and what it means in which tongue (see PlaceNames).
interface Naming { feature?: string; affix?: string; gloss?: string; tongue?: string }
export interface Settlement extends Naming {
  id: string; name: string; size: string; trade: string; inn: string;
  innkeeper: string; priest: string; merchant: string; traveller: string; calling: string;
  // What kind of merchant the settlement's trade supports (a smith where tin is mined, a salter where salt is
  // boiled): a row of the Deem table merchantType, which says what they stock and buy.
  merchantType?: string;
  // Its folk, each of its people's ancestry, and how a lesser people came to live there (see RegionPeoples).
  folk?: string; people?: Partial<Record<'innkeeper' | 'priest' | 'merchant' | 'traveller', string>>; came?: string;
  // Whether each of its innkeeper, priest, merchant and traveller is he or she, drawn apart from all else about them.
  pronouns?: Partial<Record<'innkeeper' | 'priest' | 'merchant' | 'traveller', string>>;
  // The cell of the region's atlas it stands on.
  cell?: number;
}
// A site: what it is and what it is called, and where: its cell, and the wild country (and part of it) it is in.
export interface Site extends Naming { id: string; kind: string; name: string; hours: number; near?: string;
  cell?: number; zone?: string; part?: number;
  // The makers' work it is, if it is one (see Histories): by which plan and art.
  work?: { plan: string; art: string; great?: boolean; deep?: boolean } }
export interface Region extends Naming {
  name: string; terrain: string; ancestry: string; domain: string; deity: string;
  settlements: Settlement[]; sites: Site[]; wonder: { kind: string; description: string };
  // The region's named land (see RegionLand): its river, lake, peak, pass or wood. Its peoples, majority first.
  land?: Landmark[]; peoples?: string[];
  // The day the company arrives, which decides the season and each day's weather (see RegionWeather).
  calendar?: CalendarStart;
  // Its land, settlements, roads and wild country (see Atlases).
  atlas?: Atlas;
  // Who made things in it before its folk, what they made, and who came after (see Histories).
  history?: History;
  // Where it lies in its world, and what the folk call the country beyond each of its borders (see WorldGrid).
  at?: [number, number]; beyond?: Partial<Record<Side, { name: string; terrain: string }>>;
}
// The region's people who pass news on, by the channel they carry it through.
export interface Carrier { id: string; settlement: string; channel: 'tavern' | 'temple' | 'market' | 'road' }
// A company member's old acquaintance, from their background: a carrier who passes on news of that channel heard
// anywhere in the region, and who is introduced where they are found.
// The company as the region declares it: how many, the old acquaintances its members have here, and for one
// protagonist, where they begin (a room, or a way into a settlement written for them) and the coin they carry.
export interface Company {
  size: number; contacts: Contact[]; coin?: number;
  start?: { place: string; approach?: { settlement: string; name: string; way: string } };
}
export interface Contact {
  member: string; background: string; channel: Carrier['channel']; carrier: string; room: string; text: string;
  // What the contact has heard that brought the member here: a rumour of one of the region's troubles.
  concern?: string;
}

export class RegionWriter {
  static readonly id = 'region';
  static carriers(region: Region): Carrier[] {
    return region.settlements.flatMap(s => [
      { id: `${s.id}_innkeeper`, settlement: s.id, channel: 'tavern' as const },
      { id: `${s.id}_traveller`, settlement: s.id, channel: 'road' as const },
      { id: `${s.id}_priest`, settlement: s.id, channel: 'temple' as const },
      { id: `${s.id}_merchant`, settlement: s.id, channel: 'market' as const }]);
  }
  // The peoples of a region as they are spoken of, those with a settlement first: "dwarven folk, gnomes and humans".
  static peoples(region: Region): string {
    const folk = [...new Set([...region.settlements.map(s => s.folk ?? region.ancestry), ...region.peoples ?? []])]
      .map(a => RegionPeoples.word(a));
    return folk.length > 1 ? `${folk.slice(0, -1).join(', ')} and ${folk.at(-1)}` : folk[0] ?? 'folk';
  }
  // The settlement each site is reached from: the one it names, or one by turns.
  static near(region: Region, site: Site): Settlement { return RegionGeography.near(region, site); }
  // A region beyond the first (company null) has no company of its own: the one company comes to it from the others.
  static source(region: Region, company: Company | null = { size: 3, contacts: [] },
    taken: Record<string, string> = {}): string {
    return [`Module ${this.id} ${JSON.stringify(region.name)} {`, ...this.body(region, taken), ...this.company(region, company),
      '}'].join('\n');
  }
  // The same, as the files of one module: the country in parts small enough to be read one at a time, then who
  // comes into it in a file of its own, so that the country reads the same whoever comes (see ModuleBundle.warm).
  // The country's own kinds of thing and creature come first, in the first file: a file is read on its own, and an
  // item of one site may be written in a file before the one its kind was declared in (wren's chalice, two works'
  // own, was placed in a file before its kind's; in the browser, with no kinds left over from another start, Begin
  // failed on it).
  static files(region: Region, company: Company | null, taken: Record<string, string> = {}): Record<string, string> {
    const head = `Module ${this.id} ${JSON.stringify(region.name)} {`, parts: string[][] = [[]];
    const body = this.body(region, taken), own = body.filter(l => RegionWriter.ownKind.test(l));
    let depth = 0, size = 0;
    for (const line of [...own, ...body.filter(l => !RegionWriter.ownKind.test(l))]) {
      if (depth === 0 && size > 40000) { parts.push([]); size = 0; }
      parts.at(-1)!.push(line); size += line.length;
      depth += RegionWriter.braces(line);
    }
    return Object.fromEntries([...parts.map((lines, i) => [i ? `region-${i + 1}.kyr` : 'region.kyr',
      [head, ...lines, '}'].join('\n')]), ['company.kyr', [head, ...this.company(region, company), '}'].join('\n')]]);
  }
  // A kind of thing or creature the country declares for itself (Kind delver_token "a Delver's token" is …).
  private static readonly ownKind = /^\s*(Kind|Species) [A-Za-z_][\w]* "/;
  // How many blocks a line opens, less those it closes, outside its quoted text.
  private static braces(line: string): number {
    return [...line.replace(/"(?:[^"\\]|\\.)*"/g, '')].reduce((n, c) => n + (c === '{' ? 1 : c === '}' ? -1 : 0), 0);
  }
  private static body(region: Region, taken: Record<string, string>): string[] {
    const q = JSON.stringify, lines: string[] = [];
    lines.push(
      `  Description ${q(`${region.name}: ${this.terrain(region.terrain)} country, home to ${this.peoples(region)}, who keep the faith of ${region.deity}.${this.meaning(region)}`)}.`,
      `  Place region ${q(region.name)} is region.`, `  Initially Assert terrain(region, ${region.terrain}).`);
    region.settlements.forEach((s, i) => lines.push(...this.settlement(s, i, region)));
    // Each road runs through its own stretch of country, where travellers can be met or waylaid; the land decides
    // how long it takes and what it asks (see RegionGeography).
    lines.push(...RegionRoads.lines(region), ...RegionZones.lines(region), ...RegionGrowth.lines(region),
      ...RegionMarvels.lines(region),
      ...RegionBorders.lines(region),
      ...RegionSites.lines(region, taken),
      ...RegionWorks.lines(region, taken), ...RegionFellows.lines(region), ...RegionTraffic.lines(region),
      ...region.calendar ? RegionWeather.lines(region, region.calendar) : []);
    region.settlements.forEach(s => lines.push(...this.economy(s, region)));
    return lines;
  }
  // Who comes into the country, and where: a region beyond the first has no company of its own.
  private static company(region: Region, company: Company | null): string[] {
    const q = JSON.stringify, lines: string[] = [];
    if (!company) { return ['  Entity party: group "Your company".', '  Goal false.']; }
    company.contacts.forEach((c, i) => lines.push(`  Observe tie${i + 1} at ${c.room} when true ${q(c.text)}.`));
    // One protagonist begins where their origin says: a room of a settlement, or the way into it.
    const a = company.start?.approach;
    if (a) {
      lines.push(`  Place ${a.settlement}_approach ${q(a.name)} is room within ${a.settlement} outdoors.`,
        `  Passage ${a.settlement}_approach_way ${q(a.way)} is road between ${a.settlement}_approach and ${a.settlement}_green taking 10 minutes.`);
    }
    lines.push(`  Company party ${q(company.size > 1 ? 'Your company' : 'You')} of ${company.size} at ${company.start?.place ?? `${region.settlements[0]!.id}_green`}.`,
      `  Initially Set quantity(party, gold) to ${company.coin ?? 12}. Initially Set quantity(party, rations) to 2.`, '  Goal false.');
    return lines;
  }
  private static settlement(s: Settlement, i: number, region: Region): string[] {
    return SettlementWriter.lines(s, i, region);
  }
  // Trade comes and goes by the roads. While anyone tolls a road into a settlement its inn's meal is dearer and
  // is not made good; when the roads are open, and the farms have not been robbed, the inn restocks a sack a day.
  private static economy(s: Settlement, region: Region): string[] {
    const ways = RegionGeography.roads(region).filter(r => r.from.id === s.id || r.to.id === s.id).map(r => r.way);
    if (!ways.length) { return []; }
    const { price, stock } = SettlementWriter.stock(s), keeper = `${s.id}_innkeeper`;
    const tolled = ways.map(w => `tolls(?collector, ${w})`).join(' or ');
    const open = ways.map(w => `not tolls(?collector, ${w})`).join(' and ');
    return [`  Rule ${s.id}_dear when (${tolled}) and goodsPrice(${keeper}, rations) < ${price + 1} {`
      + ` Set goodsPrice(${keeper}, rations) to ${price + 1}. }`,
    `  Rule ${s.id}_cheap when ${open} and goodsPrice(${keeper}, rations) > ${price} { Set goodsPrice(${keeper}, rations) to ${price}. }`,
    `  Rule ${s.id}_restock when untilLight(clock) == 1 and ${open} and losses(${s.id}_green) < 3`
      + ` and quantity(${keeper}, rations) < ${stock} { Increase quantity(${keeper}, rations) by 1. }`,
    `  Observe ${s.id}_tolled at ${SettlementWriter.standing(region, s, 'innkeeper')} when ${tolled} ${JSON.stringify(`Everyone here is grumbling about the toll on the road: food is dearer for it, and there is less of it.`)}.`];
  }
  static terrain(t: string): string { return RegionGeography.terrain(t); }
  // What a name means, when it was given in the folk's own tongue: " The name is Westron for “cold hill”."
  private static meaning(place: { gloss?: string; tongue?: string }): string { return RegionGeography.meaning(place); }
  // The module manifest: the world rules, every place and person exported under its own id, and what the assembler
  // is told about it: the terrain, which rooms are on the roads, what kind each site is and which a scenario took.
  // A region beyond the first imports the one company from the first.
  // The region's module written into a world's files: its manifest and its parts.
  static write(files: Record<string, string>, root: string, region: Region,
    at: { company: Company | null; taken: Record<string, string>; beyond?: boolean }) {
    const parts = this.files(region, at.company, at.taken);
    files[`${root}/region/module.json`] = JSON.stringify(this.manifest(region, at.taken, at.beyond,
      { ...at.company ? { company: at.company } : {}, sources: Object.keys(parts) }));
    for (const [name, text] of Object.entries(parts)) { files[`${root}/region/${name}`] = text; }
  }
  static manifest(region: Region, taken: Record<string, string> = {}, beyond = false,
    { company, sources = ['region.kyr'] }: { company?: Company; sources?: string[] } = {}): object {
    const roads = RegionGeography.roads(region), ways = roads.map(r => r.way);
    const zones = RegionGeography.atlas(region).zones;
    const ids = ['party', 'region', ...region.settlements.flatMap(s => {
      const has = SettlementWriter.rooms(region, s);
      return [s.id, `${s.id}_green`, ...has.taproom ? [`${s.id}_taproom`] : [], ...has.shrine ? [`${s.id}_shrine`] : [],
        ...has.shop ? [`${s.id}_shop`] : [], `${s.id}_innkeeper`, `${s.id}_priest`, `${s.id}_merchant`, `${s.id}_traveller`];
    }),
    ...region.sites.flatMap(w => [w.id, `${w.id}_track`, `${w.id}_named`, `${w.id}_found`]), ...ways,
    ...roads.map(r => r.land),
    ...zones.flatMap(z => [z.id, ...RegionZones.rooms(region, z)]),
    ...RegionGeography.atlas(region).borders.flatMap(b => [RegionBorders.room(b), `${RegionBorders.room(b)}_land`]),
    ...(region.history?.makers ?? []).flatMap(m => [`history_${m.art}`, `history_${m.art}_fate`]),
    ...region.history ? ['history_successors'] : [],
    ...company?.start?.approach ? [`${company.start.approach.settlement}_approach`] : []];
    // A site's land is the wild country it stands in, or its own stretch of open country.
    const lands = region.sites.map(w => [`${w.id}_land`, w.zone ?? `${w.id}_land`]);
    // A ford, a bridge and a pass are where a road can be held; a road through a wood and the edge of wild country
    // are known to all.
    const held = roads.filter(r => r.form && r.form.form !== 'wood').map(r => ['chokepoint', r.way]);
    const known = [...roads.filter(r => r.form?.form === 'wood').map(r => r.way), ...zones.map(z => RegionZones.room(z, 0))]
      .map(id => ['landmark', id]);
    const commitments = [['terrain', 'region', region.terrain], ...ways.map(w => ['onRoad', w]), ...held, ...known,
      ...region.settlements.map(s => ['keeper', `${s.id}_innkeeper`, `${s.id}_green`]),
      ...region.sites.map(w => ['siteKind', w.id, w.kind]), ...Object.entries(taken).map(([w, by]) => ['taken', w, by])];
    return { version: 1, source: sources, rules: ['world', 'elements', 'devotion'], globals: ['party'],
      ...beyond ? { imports: ['party'], roles: { party: { type: 'group' } } } : {},
      exports: Object.fromEntries([...ids.map(id => [id, id]), ...lands]), assembly: { commitments },
      chart: this.chart(region, roads) };
  }
  // The region's land for its map: the cover of each cell, the rivers and roads, and the cell of each place on it.
  private static chart(region: Region, roads: ReturnType<typeof RegionGeography.roads>): object {
    const atlas = RegionGeography.atlas(region), glyphs: Record<string, string> = { sea: '~', lake: 'o', fen: ',',
      meadow: '.', wood: 'w', heath: 'h', fell: 'f', peak: 'p' };
    return { width: atlas.land.width, height: atlas.land.height, cover: atlas.land.cover.map(c => glyphs[c]).join(''),
      rivers: atlas.rivers.map(r => r.cells), roads: Object.fromEntries([...roads.map(r => [r.way, r.route.cells]),
        ...atlas.borders.map(b => [RegionBorders.room(b), b.road.cells])]),
      parts: Object.fromEntries(atlas.zones.flatMap(z => z.parts.map((cells, i) => [RegionZones.room(z, i), cells]))),
      // What each name means, in the tongue it was given in: kept with the chart, not said in the place's description.
      glosses: Object.fromEntries([...region.settlements, ...region.sites].filter(x => x.gloss && x.tongue)
        .map(x => [x.id, `${x.tongue}${x.tongue === 'Aenean' ? ', the old tongue,' : ''} for “${x.gloss}”`])),
      places: Object.fromEntries([...region.settlements.map(s => [s.id, s.cell]),
        ...atlas.zones.flatMap(z => RegionZones.landmarks(region, z).map(l => [l.id, l.cell])),
        ...region.sites.filter(w => w.cell !== undefined).map(w => [w.id, w.cell]),
        ...atlas.borders.map(b => [RegionBorders.room(b), b.cell]),
        ...atlas.zones.map(z => [z.id, z.centres[0]])]) };
  }
}
