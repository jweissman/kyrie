import { GenerationSetting } from '../generation-setting';
import type { Landmark } from './region-land';
import { RegionGeography } from './region-geography';
import { RegionPeoples } from './region-peoples';
import { RegionFaith } from './region-faith';
import { RegionSites } from './region-sites';
import { RegionRecruits } from './region-recruits';
import { RegionWeather } from './region-weather';
import { RegionRoads } from './region-roads';
import { RegionZones } from './region-zones';
import type { Atlas } from './land/atlas';
import type { History } from './history/histories';
import { RegionWorks } from './region-works';
import type { CalendarStart } from '../presentation/calendar';
// A generated region (the Deem `region` generator's output, plus sites scenarios asked for) written as an ordinary
// Kyr module: settlements with an inn, a shrine and a shop, roads between them, and a track out to each site. Every
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
  // The cell of the region's atlas it stands on.
  cell?: number;
}
interface MerchantType { role: string; profession?: string; shop: string; stock: [string, number, number][];
  buys: [string, number][] }
interface Tables {
  merchantType: { groups: Record<string, MerchantType> };
  innStock: { groups: Record<string, { price: number; stock: number }> };
}
// A site: what it is and what it is called, and where: its cell, and the wild country (and part of it) it is in.
export interface Site extends Naming { id: string; kind: string; name: string; hours: number; near?: string;
  cell?: number; zone?: string; part?: number;
  // The makers' work it is, if it is one (see Histories): by which plan and art.
  work?: { plan: string; art: string } }
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
}
// The region's people who pass news on, by the channel they carry it through.
export interface Carrier { id: string; settlement: string; channel: 'tavern' | 'temple' | 'market' | 'road' }
// A company member's old acquaintance, from their background: a carrier who passes on news of that channel heard
// anywhere in the region, and who is introduced where they are found.
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
  static source(region: Region, company: { size: number; contacts: Contact[] } = { size: 3, contacts: [] },
    taken: Record<string, string> = {}): string {
    const q = JSON.stringify, lines: string[] = [];
    lines.push(`Module ${this.id} ${q(region.name)} {`,
      `  Description ${q(`${region.name}: ${this.terrain(region.terrain)} country, home to ${this.peoples(region)}, who keep the faith of ${region.deity}.${this.meaning(region)}`)}.`,
      `  Place region ${q(region.name)} is region.`, `  Initially Assert terrain(region, ${region.terrain}).`);
    region.settlements.forEach((s, i) => lines.push(...this.settlement(s, i, region)));
    // Each road runs through its own stretch of country, where travellers can be met or waylaid; the land decides
    // how long it takes and what it asks (see RegionGeography).
    lines.push(...RegionRoads.lines(region), ...RegionZones.lines(region), ...RegionSites.lines(region, taken),
      ...RegionWorks.lines(region, taken),
      ...region.calendar ? RegionWeather.lines(region, region.calendar) : []);
    region.settlements.forEach(s => lines.push(...this.economy(s, region)));
    company.contacts.forEach((c, i) => lines.push(`  Observe tie${i + 1} at ${c.room} when true ${q(c.text)}.`));
    lines.push(`  Company party "Your company" of ${company.size} at ${region.settlements[0]!.id}_green.`,
      '  Initially Set quantity(party, gold) to 12. Initially Set quantity(party, rations) to 2.', '  Goal false.', '}');
    return lines.join('\n');
  }
  private static settlement(s: Settlement, i: number, region: Region): string[] {
    const q = JSON.stringify, [x, y] = RegionGeography.town(region, i), cult = RegionFaith.cults(region)[i]!;
    return [
      `  Place ${s.id} ${q(s.name)} is settlement within region at ${x}, ${y}.`,
      `  Place ${s.id}_green ${q(`${s.name} green`)} is room within ${s.id} at 1, 1.`,
      `  Place ${s.id}_inn ${q(s.inn)} is building within ${s.id}.`,
      `  Place ${s.id}_taproom ${q(`the taproom of ${s.inn}`)} is room within ${s.id}_inn at 1, 0.`,
      `  Place ${s.id}_shrine ${q(`the shrine of ${cult.name}`)} is room within ${s.id} at 0, 1.`,
      `  Place ${s.id}_shop ${q(`${s.merchant}'s ${this.trade(s).shop}`)} is room within ${s.id} at 2, 1.`,
      `  Passage ${s.id}_inn_door ${q(`the door of ${s.inn}`)} is door between ${s.id}_taproom and ${s.id}_green.`,
      `  Passage ${s.id}_shrine_door ${q(`the shrine porch in ${s.name}`)} is doorway between ${s.id}_shrine and ${s.id}_green.`,
      `  Passage ${s.id}_shop_door ${q(`${s.merchant}'s door`)} is door between ${s.id}_shop and ${s.id}_green.`,
      `  Person ${s.id}_innkeeper ${q(s.innkeeper)} at ${s.id}_taproom { Role "innkeeper". ${this.of(s, 'innkeeper', region)} Profession innkeeper. Peaceable. ${this.inn(s)} }`,
      `  Person ${s.id}_priest ${q(s.priest)} at ${s.id}_shrine { Role ${q(`priest of ${cult.name}`)}. ${this.of(s, 'priest', region)} Profession priest. Peaceable. }`,
      this.merchant(s, region),
      ...RegionRecruits.traveller(s, i, region),
      `  Observe ${s.id}_day at ${s.id}_green when not dark() ${q(`${RegionPeoples.told(s)}${this.meaning(s)} ${RegionGeography.placement(region, i)}Smoke rises from ${s.inn}; the shrine of ${cult.name} stands open across the green.`)}.`,
      `  Observe ${s.id}_night at ${s.id}_green when dark() ${q(`${s.name} is shuttered for the night. A lamp burns over the door of ${s.inn}.`)}.`,
      `  Observe ${s.id}_tap at ${s.id}_taproom when true ${q(`Benches, a long table, a fire. People who work ${s.trade} drink here.`)}.`,
      ...RegionFaith.lines(s, cult),
    ];
  }
  // The merchant a settlement's trade supports, with that kind of merchant's stock and what they will buy.
  private static trade(s: Settlement): MerchantType {
    const types = (GenerationSetting.tables as unknown as Tables).merchantType;
    return types.groups[s.merchantType ?? 'chandler'] ?? types.groups.chandler!;
  }
  // A townsperson's people, as a Person says it.
  private static of(s: Settlement, role: 'innkeeper' | 'priest' | 'merchant' | 'traveller', region: Region): string {
    return `Ancestry ${s.people?.[role] ?? s.folk ?? region.ancestry}.`;
  }
  private static merchant(s: Settlement, region: Region): string {
    const t = this.trade(s);
    const sells = t.stock.map(([what, fee, n]) => `Sells ${what} for ${fee} coin from ${n}.`).join(' ');
    const buys = t.buys.map(([what, fee]) => `Buys ${what} for ${fee} coin.`).join(' ');
    // Every merchant deals in valuables too, as far as their purse goes: a town's goes further than a hamlet's.
    const purse = ({ town: 400, village: 120 } as Record<string, number>)[s.size] ?? 40;
    return `  Person ${s.id}_merchant ${JSON.stringify(s.merchant)} at ${s.id}_shop { Role ${JSON.stringify(t.role)}. ${this.of(s, 'merchant', region)}`
      + `${t.profession ? ` Profession ${t.profession}.` : ''} Peaceable. ${sells}${buys ? ` ${buys}` : ''} }\n`
      + `  Initially Assert buysValuables(${s.id}_merchant). Initially Set quantity(${s.id}_merchant, gold) to ${purse}.`;
  }
  // Trade comes and goes by the roads. While anyone tolls a road into a settlement its inn's meal is dearer and
  // is not made good; when the roads are open, and the farms have not been robbed, the inn restocks a sack a day.
  private static economy(s: Settlement, region: Region): string[] {
    const ways = RegionGeography.roads(region).filter(r => r.from.id === s.id || r.to.id === s.id).map(r => r.way);
    if (!ways.length) { return []; }
    const { price, stock } = this.stock(s), keeper = `${s.id}_innkeeper`;
    const tolled = ways.map(w => `tolls(?collector, ${w})`).join(' or ');
    const open = ways.map(w => `not tolls(?collector, ${w})`).join(' and ');
    return [`  Rule ${s.id}_dear when (${tolled}) and goodsPrice(${keeper}, rations) < ${price + 1} {`
      + ` Set goodsPrice(${keeper}, rations) to ${price + 1}. }`,
    `  Rule ${s.id}_cheap when ${open} and goodsPrice(${keeper}, rations) > ${price} { Set goodsPrice(${keeper}, rations) to ${price}. }`,
    `  Rule ${s.id}_restock when untilLight(clock) == 1 and ${open} and losses(${s.id}_green) < 3`
      + ` and quantity(${keeper}, rations) < ${stock} { Increase quantity(${keeper}, rations) by 1. }`,
    `  Observe ${s.id}_tolled at ${s.id}_taproom when ${tolled} ${JSON.stringify(`Carters at the bar grumble about the toll on the road; the meal is dearer for it, and there is less of it.`)}.`];
  }
  private static stock(s: Settlement): { price: number; stock: number } {
    return (GenerationSetting.tables as unknown as Tables).innStock.groups[s.size] ?? { price: 2, stock: 6 };
  }
  // An inn sells what a place of its size can spare: plenty in a town, a little in a hamlet, dearer.
  private static inn(s: Settlement): string {
    const stock = this.stock(s);
    return `Sells rations for ${stock.price} coin from ${stock.stock}.`;
  }
  static terrain(t: string): string { return RegionGeography.terrain(t); }
  // What a name means, when it was given in the folk's own tongue: " The name is Westron for “cold hill”."
  private static meaning(place: { gloss?: string; tongue?: string }): string { return RegionGeography.meaning(place); }
  // The module manifest: the world rules, every place and person exported under its own id, and what the assembler
  // is told about it: the terrain, which rooms are on the roads, what kind each site is and which a scenario took.
  static manifest(region: Region, taken: Record<string, string> = {}): object {
    const roads = RegionGeography.roads(region), ways = roads.map(r => r.way);
    const zones = RegionGeography.atlas(region).zones;
    const ids = ['party', 'region', ...region.settlements.flatMap(s => [s.id, `${s.id}_green`, `${s.id}_taproom`,
      `${s.id}_shrine`, `${s.id}_shop`, `${s.id}_innkeeper`, `${s.id}_priest`, `${s.id}_merchant`, `${s.id}_traveller`]),
    ...region.sites.flatMap(w => [w.id, `${w.id}_track`, `${w.id}_named`]), ...ways, ...roads.map(r => r.land),
    ...zones.flatMap(z => [z.id, ...z.parts.map((_, i) => RegionZones.room(z, i))])];
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
    return { version: 1, source: 'region.kyr', rules: ['world', 'elements', 'devotion'], globals: ['party'],
      exports: Object.fromEntries([...ids.map(id => [id, id]), ...lands]), assembly: { commitments },
      chart: this.chart(region, roads) };
  }
  // The region's land for its map: the cover of each cell, the rivers and roads, and the cell of each place on it.
  private static chart(region: Region, roads: ReturnType<typeof RegionGeography.roads>): object {
    const atlas = RegionGeography.atlas(region), glyphs: Record<string, string> = { sea: '~', lake: 'o', fen: ',',
      meadow: '.', wood: 'w', heath: 'h', fell: 'f', peak: 'p' };
    return { width: atlas.land.width, height: atlas.land.height, cover: atlas.land.cover.map(c => glyphs[c]).join(''),
      rivers: atlas.rivers.map(r => r.cells), roads: Object.fromEntries(roads.map(r => [r.way, r.route.cells])),
      parts: Object.fromEntries(atlas.zones.flatMap(z => z.parts.map((cells, i) => [RegionZones.room(z, i), cells]))),
      places: Object.fromEntries([...region.settlements.map(s => [s.id, s.cell]),
        ...region.sites.filter(w => w.cell !== undefined).map(w => [w.id, w.cell]),
        ...atlas.zones.map(z => [z.id, z.centres[0]])]) };
  }
}
