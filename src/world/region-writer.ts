import { ModuleSource } from '../lang/module-source';
import { RegionNews } from './region-news';
import { RegionIds } from '../region-ids';
import type { Landmark } from './region-land';
import { RegionGeography } from './region-geography';
import { RegionPeoples } from './region-peoples';
import { RegionSites } from './region-sites'; import { RegionRumours } from './region-rumours';
import { RegionWeather } from './region-weather';
import { RegionRoads } from './region-roads';
import { RegionUndertown } from './region-undertown';
import { ReferenceSettlement } from './reference-settlement';
import { FirstAims } from './first-aims';
import { RegionOutskirts } from './region-outskirts';
import { RegionPractitioners } from './region-practitioners';
import { RegionPleasures } from './region-pleasures';
import { RegionAfoot } from './region-afoot';
import { RegionRoom } from './region-room';
import { RegionTies } from './region-ties';
import { RegionThreads } from './region-threads';
import { RegionZones } from './region-zones';
import { RegionSights } from './region-sights';
import { RegionBorders } from './region-borders';
import { RegionGates } from './region-gates';
import { Provinces, type Province } from './provinces';
import type { Atlas } from './land/atlas';
import type { Side } from './land/borders';
import type { After } from './countries';
import type { Great } from './world-shape';
import type { History } from './history/histories';
import { RegionWorks } from './region-works';
import { RegionFellows } from './region-fellows';
import type { CalendarStart } from '../campaign/calendar';
import { RegionGrowth } from './region-growth';
import { RegionMarvels } from './region-marvels';
import { SettlementWriter } from './settlement-writer';
import { CommunityWriter } from './community/community-writer';
import { RegionTraffic } from './region-traffic';
import { RegionTracts } from './region-tracts';
import { RegionAnimals } from './region-animals';
import { RegionRovers } from './region-rovers';
import { RegionQuarters } from './region-quarters';
import { GeneralStores } from './general-stores';
import type { VocabularyContext } from '../lang';
import { StoryPeople } from './story-people';
import { RegionMeetings } from './region-meetings';
import { ModuleCanon } from '../campaign/module-canon';
import { StrategicAtlas } from './strategic-atlas';
import { StockOpenings, type Opened } from './stock-openings';
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
  // The canon's identity it is, where it is a city of the canon (Dun Rìerdan: dun_ri), seated there (see WorldShape).
  seat?: string;
}
// A site: what it is and what it is called, and where: its cell, and the wild country (and part of it) it is in.
export interface Site extends Naming { id: string; kind: string; name: string; hours: number; near?: string;
  cell?: number; zone?: string; part?: number;
  // Its old name, where the starting country calls it by its Common meaning (see OldPlaces): learned by reading it.
  old?: string;
  // The makers' work it is, if it is one (see Histories): by which plan and art.
  // A work's: its plan, its makers' art, and the name its makers gave it (`made`), which the folk wore down.
  work?: { plan: string; art: string; made?: string; great?: boolean; deep?: boolean; imperial?: boolean } }
export interface Region extends Naming {
  // The name its draws are seeded by, where it is called otherwise (see RegionKey).
  name: string; key?: string; terrain: string; ancestry: string; domain: string; deity: string;
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
  at?: [number, number];
  // The great region of the world it is part of, if it is (see WorldShape), and the side of it that falls to a great
  // sea, if one does.
  great?: Great; shore?: Side;
  // The city of the canon built in it, if one is: its chief town is the city (see WorldShape.seat).
  seat?: { identity: string; name: string };
  // The country of the strategic atlas it is, where its world is one of the atlas's (see StrategicAtlas).
  country?: string;
  // One with no road over into it from here (an authored country entered from another side) is closed, and the
  // folk may know the country it is entered from (way). A sea is closed too: the march toward it is its shore.
  beyond?: Partial<Record<Side, { name: string; terrain: string; rumour?: string; heard?: string; topic?: string;
    notice?: { name: string; text: string; talk: string }; after?: After; closed?: boolean;
    way?: string; skyline?: string; sea?: boolean }>>;
  // The authored countries its folk have heard of further off, beyond the countries next to theirs (Countries.further).
  further?: { side: Side; via: string; then: Side; name: string; terrain: string; far: string; id: string }[];
  // Its provinces: authored adventures installed as parts of it, each entered by its way in (see Provinces).
  provinces?: Province[];
  // The paintings the world's people hold already, where it is a country drawn beyond the march: its own people are
  // painted in one of them only where none else fits (see CommunityWriter.likenessOf).
  held?: string[] | undefined;
  // The names the people of the stories placed in it have of their authors (see StoryPeople): none of its own people
  // is given one.
  reserved?: string[];
  // The answer to a letter home, from the company's own people (see RegionLetters), where its life has a start.
  letter?: { from: string; news: string };
  // How the protagonist's life began (an origin's id), where one did (see RegionLetters.give).
  origin?: string | undefined;
  // The world's seed it was drawn in (see WorldAssembler.region).
  world?: string;
  // The debt's chain where it is fixed, not drawn (see DebtShapes).
  chain?: string | undefined;
  // What an inn's count of the old places says of a site a kit's placement has made its own, by the site's id
  // (Placement.told; see WorldAssembler.held).
  told?: Record<string, string>;
}
// The region's people who pass news on, by the channel they carry it through.
export interface Carrier { id: string; settlement: string; channel: 'tavern' | 'temple' | 'market' | 'road' }
// A company member's old acquaintance, from their background: a carrier who passes on news of that channel heard
// anywhere in the region, and who is introduced where they are found.
// The company as the region declares it: how many, the old acquaintances its members have here, and for one
// protagonist, where they begin (a room, or a way into a settlement written for them) and the coin they carry.
export interface Company {
  size: number; contacts: Contact[]; coin?: number;
  // opening: a stock opening the life begins in, ahead of where its origin begins (see StockOpenings).
  start?: { place: string; approach?: { settlement: string; name: string; way: string; now?: string };
    opening?: Opened };
}
export interface Contact {
  member: string; background: string; channel: Carrier['channel']; carrier: string; room: string; text: string;
  // What the contact has heard that brought the member here: a rumour of one of the region's troubles.
  concern?: string;
}

export class RegionWriter {
  static readonly id = RegionIds.region;
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
  static source(region: Region, company: Company | null, taken: Record<string, string>,
    vocabulary: VocabularyContext): string {
    // One text whole (a fixture, an author's look): what was declared as values written as its Kyr.
    const body = this.body(region, taken, vocabulary).map(l => ModuleSource.is(l) ? ModuleSource.read(l).kyr : l);
    return [`Module ${this.id} ${JSON.stringify(region.name)} {`, ...body, ...this.company(region, company),
      '}'].join('\n');
  }
  // The same, as the files of one module: the country in parts small enough to be read one at a time, then who
  // comes into it in a file of its own, so that the country reads the same whoever comes (see ModuleBundle.warm).
  // The country's own kinds of thing and creature come first, in the first file: a file is read on its own, and an
  // item of one site may be written in a file before the one its kind was declared in (wren's chalice, two works'
  // own, was placed in a file before its kind's; in the browser, with no kinds left over from another start, Begin
  // failed on it).
  static files(region: Region, company: Company | null, taken: Record<string, string>, vocabulary: VocabularyContext):
    Record<string, string> {
    CommunityWriter.afresh(region);
    const head = `Module ${this.id} ${JSON.stringify(region.name)} {`, parts: string[][] = [[]];
    const body = this.body(region, taken, vocabulary), own = body.filter(l => RegionWriter.ownKind.test(l));
    // A file ends only where a statement does: a rule whose words come on the line after its condition had been cut
    // between them (a rover's coming, 11 November: the drowned stair's country failed to parse).
    let depth = 0, size = 0, ended = true;
    for (const line of [...own, ...body.filter(l => !RegionWriter.ownKind.test(l))]) {
      if (depth === 0 && ended && size > 40000) { parts.push([]); size = 0; }
      // (A declaration made as a value counted as its Kyr, so that the files part where the text's would.)
      parts.at(-1)!.push(line); size += ModuleSource.is(line) ? ModuleSource.read(line).kyr.replace(/\n/g, '').length
        : line.length;
      depth += RegionWriter.braces(line);
      ended = /[.}]$/.test(line.trim()) || line.trim().startsWith('//');
    }
    // What a writer declared as values (ModuleSource) goes beside its file, not in it: its declarations, each at the
    // character its line would have begun at (nothing of it in the text), and their Kyr for inspection, never parsed
    // (AX-04, generated-ir.md).
    const out: [string, string][] = [];
    for (const [i, lines] of parts.entries()) {
      const name = i ? `region-${i + 1}.kyr` : 'region.kyr';
      const { text, source } = ModuleSource.parted(name, lines, head.length + 1);
      out.push([name, [head, ...text, '}'].join('\n')]);
      if (source.declared.length) {
        out.push([`${name}.ir.json`, JSON.stringify(source)], [`${name}.ir.kyr`, ModuleSource.kyr(source)]);
      }
    }
    return Object.fromEntries([...out, ['company.kyr', [head, ...this.company(region, company), '}'].join('\n')]]);
  }
  // A file the module reads as Kyr (not what stands beside one for inspection, nor its declarations made as values).
  static readsAsKyr(name: string): boolean { return !/\.ir\.(json|kyr)$/.test(name); }
  // A kind of thing or creature the country declares for itself (Kind delver_token "a Delver's token" is …).
  private static readonly ownKind = /^\s*(Kind|Species) [A-Za-z_][\w]* "/;
  // How many blocks a line opens, less those it closes, outside its quoted text.
  private static braces(line: string): number {
    return [...line.replace(/"(?:[^"\\]|\\.)*"/g, '')].reduce((n, c) => n + (c === '{' ? 1 : c === '}' ? -1 : 0), 0);
  }
  private static body(region: Region, taken: Record<string, string>, vocabulary: VocabularyContext): string[] {
    return RegionNews.writing(region, () => this.parts(region, taken, vocabulary));
  }
  private static parts(region: Region, taken: Record<string, string>, vocabulary: VocabularyContext): string[] {
    const q = JSON.stringify, lines: string[] = [];
    lines.push(
      `  Description ${q(`${region.name}: ${this.terrain(region.terrain)} country, home to ${this.peoples(region)}, who keep the faith of ${region.deity}.${this.meaning(region)}`)}.`,
      `  Place region ${q(region.name)} is region within ${ModuleCanon.imbar}.`,
      `  Initially Assert terrain(region, ${region.terrain}).`);
    region.settlements.forEach((s, i) => lines.push(...this.settlement(s, i, region)));
    // A city of the canon is built here: the canon's identity is seated in it (Dun Rìerdan: see WorldShape.seat).
    lines.push(...region.settlements.filter(s => s.seat).map(s => `  Initially Assert seatOf(${s.seat}, ${s.id}).`));
    // Each road runs through its own stretch of country, where travellers can be met or waylaid; the land decides
    // how long it takes and what it asks (see RegionGeography).
    lines.push(...RegionRoads.lines(region), ...RegionZones.lines(region), ...RegionSights.lines(region),
      ...RegionGrowth.lines(region),
      ...RegionMarvels.lines(region),
      ...RegionBorders.lines(region), ...RegionGates.lines(region),
      ...RegionSites.lines(region, taken), ...RegionRumours.lines(region),
      ...RegionWorks.lines(region, taken, vocabulary), ...RegionFellows.lines(region), ...RegionTraffic.lines(region),
      // Finding a place is its own reward, once: a makers' work more than a cave (the owner, 1 November: hex
      // crawling encouraged, exploration rewarded).
      ...region.sites.map(w => `  Milestone ${w.id}_reached ${JSON.stringify(`found ${w.name}`)} worth ${w.work ? 20 : 10}`
        + ` when been(party, ${w.id}).`),
      ...region.calendar ? RegionWeather.lines(region, region.calendar) : [], ...RegionTracts.lines(region),
      // What is met with in the open country, a stretch here and there (the owner's OWN-27).
      ...RegionMeetings.lines(region), ...RegionAnimals.lines(region), ...RegionRovers.lines(region),
      ...StrategicAtlas.lines(region));
    region.settlements.forEach(s => lines.push(...this.economy(s, region)));
    // Where its ordinary gear and clothing are bought, kept by people named apart from everyone the country has.
    lines.push(...GeneralStores.lines(region, new Set(StoryPeople.country(region))));
    // Each town's quarters, by the places it was written with (see RegionQuarters), a value's by its Kyr.
    lines.push(...RegionQuarters.lines(region, lines.map(l => ModuleSource.is(l) ? ModuleSource.read(l).kyr : l)));
    return lines;
  }
  // The notice of the troubles of the town the company begins in, for an origin that sends it there (Origins.unhired).
  private static notice(region: Region, company?: Company): string[] {
    const t = company?.start?.approach?.settlement ?? /^(s\d+)_/.exec(company?.start?.place ?? '')?.[1];
    const home = company && (region.settlements.find(s => s.id === t) ?? region.settlements[0]);
    return home && RegionUndertown.noticed(region, home) ? [`${home.id}_u_notice`] : [];
  }
  // The workings under that town, which the First Aims recognise being gone into (FirstAims, OR-443).
  private static workings(region: Region, company?: Company): string[] {
    if (!company?.start) { return []; }
    const home = FirstAims.home(region, company.start), { found, explored } = FirstAims.rooms(region, home);
    return [...found, ...explored].map(r => `${home!.id}_u_${r}`);
  }
  // Who comes into the country, and where: a region beyond the first has no company of its own.
  private static company(region: Region, company: Company | null): string[] {
    const q = JSON.stringify, lines: string[] = [];
    if (!company) { return ['  Entity party: group "Your company".', '  Goal false.']; }
    company.contacts.forEach((c, i) => lines.push(`  Observe tie${i + 1} at ${c.room} when true ${q(c.text)}.`));
    // One protagonist begins where their origin says: a room of a settlement, or the way into it, where some life of
    // the town is going on as they come: what the place opens on once an opening has told the town coming into sight
    // (OWN-17; OWN-18's sign of current life).
    const a = company.start?.approach;
    if (a) {
      lines.push(`  Place ${a.settlement}_approach ${q(a.name)} is room within ${a.settlement} outdoors.`,
        `  Passage ${a.settlement}_approach_way ${q(a.way)} is road between ${a.settlement}_approach and ${a.settlement}_green taking 10 minutes.`,
        ...a.now ? [`  Observe ${a.settlement}_approach_life at ${a.settlement}_approach as ambience when not dark() ${q(a.now)}.`] : []);
    }
    // Under the town the company begins in, an adventure a step from its door (see RegionUndertown).
    if (company.start?.opening) { lines.push(...StockOpenings.lines(company.start.opening)); }
    const home = RegionPractitioners.home(region, company);
    // The reference game's town has none of the rest: no Hall nor hill above it, no pastimes and nothing afoot on its
    // heart (see ReferenceSettlement); its room is the loft let once the company has been below (OR-1130).
    lines.push(...RegionUndertown.lines(region, home, company.size),
      ...ReferenceSettlement.is(region, home) ? RegionRoom.reference(home)
        : [...RegionRoom.lines(region, home), ...RegionOutskirts.lines(region, home, company.size)],
      // A few pleasant things to do on every settlement's green (see RegionPleasures).
      ...ReferenceSettlement.others(region).flatMap(t => RegionPleasures.lines(region, t, home.id)),
      // And something going on there that moves on by the days, with or without the company (see RegionAfoot).
      ...ReferenceSettlement.others(region).flatMap(t => RegionAfoot.lines(region, t)),
      ...RegionTies.lines(region), ...RegionThreads.lines(region));
    lines.push(`  Company party ${q(company.size > 1 ? 'Your company' : 'You')} of ${company.size} at ${company.start ? StockOpenings.place(company.start) : `${region.settlements[0]!.id}_green`}.`,
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
  // A region beyond the first imports the one company from the first. Every one is a country of Imbar, the world's
  // own (data/imbar), as the authored countries beyond its marches are: the road over a march is no planar crossing.
  // The region's module written into a world's files: its manifest and its parts.
  static write(files: Record<string, string>, root: string, region: Region,
    at: { company: Company | null; taken: Record<string, string>; beyond?: boolean; vocabulary: VocabularyContext }) {
    const parts = this.files(region, at.company, at.taken, at.vocabulary);
    const sources = Object.keys(parts).filter(n => RegionWriter.readsAsKyr(n)), ir = Object.keys(parts).filter(n => n.endsWith('.ir.json'));
    files[`${root}/region/module.json`] = JSON.stringify({ ...this.manifest(region, at.taken, at.beyond,
      { ...at.company ? { company: at.company } : {}, sources }),
    ...ir.length ? { ir: Object.fromEntries(ir.map(n => [n.replace(/\.ir\.json$/, ''), n])) } : {} });
    for (const [name, text] of Object.entries(parts)) { files[`${root}/region/${name}`] = text; }
  }
  static manifest(region: Region, taken: Record<string, string> = {}, beyond = false,
    { company, sources = ['region.kyr'] }: { company?: Company; sources?: string[] } = {}): object {
    const roads = RegionGeography.roads(region), ways = roads.map(r => r.way);
    const practitioners = RegionPractitioners.of(region, company);
    const zones = RegionGeography.atlas(region).zones;
    const ids = ['party', 'region', ...region.settlements.flatMap(s => {
      const has = SettlementWriter.rooms(region, s);
      return [s.id, `${s.id}_green`, ...has.taproom ? [`${s.id}_taproom`] : [], ...has.shrine ? [`${s.id}_shrine`] : [],
        ...has.shop ? [`${s.id}_shop`] : [], `${s.id}_innkeeper`, `${s.id}_priest`, `${s.id}_merchant`, `${s.id}_traveller`,
        `${s.id}_country_told`,
        // The deep place under the reference game's woods, for a life's reason to lead to (ReferenceOrigins).
        ...ReferenceSettlement.is(region, s) ? [`${s.id}_ud`, `${s.id}_ud_named`,
          `${s.id}_wood_stones`, `${s.id}_wood_stones_known`, `${s.id}_wood_door`, `${s.id}_ud_story`, `${s.id}_ud_bane`] : []];
    }),
    ...region.sites.flatMap(w => [w.id, `${w.id}_track`, `${w.id}_named`, `${w.id}_found`]), ...ways,
    ...roads.map(r => r.land),
    ...zones.flatMap(z => [z.id, ...RegionZones.rooms(region, z), ...RegionZones.passages(region, z)]),
    ...RegionGeography.atlas(region).borders.flatMap(b => [RegionBorders.room(b), `${RegionBorders.room(b)}_land`,
      // What is said of an authored country beyond, which the country marks old news once it is seen through.
      ...RegionBorders.remembers(region.beyond?.[b.side])
        ? RegionBorders.words(`${RegionBorders.room(b)}_beyond`, region.beyond?.[b.side]?.after) : []]),
    ...RegionGates.ids(region),
    ...(region.history?.makers ?? []).flatMap(m => [`history_${m.art}`, `history_${m.art}_fate`]),
    ...region.history ? ['history_successors'] : [],
    ...company?.start?.approach ? [`${company.start.approach.settlement}_approach`] : [], ...this.notice(region, company),
    ...this.workings(region, company),
    ...StockOpenings.ids(company?.start?.opening),
    ...practitioners.map(p => p.id)];
    // A site's land is the wild country it stands in, or its own stretch of open country.
    const lands = region.sites.map(w => [`${w.id}_land`, w.zone ?? `${w.id}_land`]);
    // A ford, a bridge and a pass are where a road can be held; a road through a wood and the edge of wild country
    // are known to all.
    const held = roads.filter(r => r.form && r.form.form !== 'wood').map(r => ['chokepoint', r.way]);
    const known = [...roads.filter(r => r.form?.form === 'wood').map(r => r.way), ...zones.map(z => RegionZones.room(z, 0))]
      .map(id => ['landmark', id]);
    const commitments = [['terrain', 'region', region.terrain], ...ways.map(w => ['onRoad', w]), ...held, ...known,
      ...region.settlements.map(s => ['keeper', `${s.id}_innkeeper`, `${s.id}_green`]),
      ...practitioners.flatMap(p => [['practises', p.id, p.craft], ['dwells', p.id, p.at], ...p.written ? [['written', p.id]] : []]),
      ...ReferenceSettlement.quiet(region),
      ...region.sites.map(w => ['siteKind', w.id, w.kind]), ...Object.entries(taken).map(([w, by]) => ['taken', w, by]),
      // The Empire's posting-house is no band's hold: a kit may not take it, as no scenario may.
      ...region.sites.filter(w => w.work?.imperial && !taken[w.id]).map(w => ['taken', w.id, 'empire'])];
    return { version: 1, source: sources, rules: ['world', 'elements', 'devotion'], globals: ['party'],
      canon: [ModuleCanon.imbar, ...region.settlements.flatMap(s => s.seat ? [s.seat] : [])], ...beyond ? { imports: ['party'], roles: { party: { type: 'group' } } } : {},
      exports: Object.fromEntries([...ids.map(id => [id, id]), ...lands]), assembly: { commitments },
      chart: this.chart(region, roads) };
  }
  // The region's land for its map: the cover of each cell, the rivers and roads, and the cell of each place on it.
  private static chart(region: Region, roads: ReturnType<typeof RegionGeography.roads>): object {
    const atlas = RegionGeography.atlas(region), glyphs: Record<string, string> = { sea: '~', lake: 'o', fen: ',',
      meadow: '.', wood: 'w', heath: 'h', fell: 'f', peak: 'p' };
    return { width: atlas.land.width, height: atlas.land.height, cover: atlas.land.cover.map(c => glyphs[c]).join(''),
      rivers: atlas.rivers.map(r => r.cells), springs: atlas.rivers.map(r => r.spring ?? []),
      falls: atlas.rivers.map(r => r.fall ?? -1),
      roads: Object.fromEntries([...roads.map(r => [r.way, r.route.cells]),
        ...atlas.borders.map(b => [RegionBorders.room(b), b.road.cells]),
        ...(region.provinces ?? []).map(p => [Provinces.room(p.country), p.gate.road.cells])]),
      rooms: Object.fromEntries(roads.map(r => [r.way, r.route.cells[RegionRoads.room(r)]])),
      parts: Object.fromEntries(atlas.zones.flatMap(z => z.parts.map((cells, i) => [RegionZones.room(z, i), cells]))),
      // What each name means, in the tongue it was given in: kept with the chart, not said in the place's description.
      glosses: Object.fromEntries([...region.settlements, ...region.sites].filter(x => x.gloss && x.tongue)
        .map(x => [x.id, `${x.tongue}${x.tongue === 'Aenean' ? ', the old tongue,' : ''} for “${x.gloss}”`])),
      kinds: Object.fromEntries(region.sites.map(w => [w.id, w.kind])),
      places: Object.fromEntries([...region.settlements.map(s => [s.id, s.cell]),
        ...atlas.zones.flatMap(z => RegionZones.landmarks(region, z).map(l => [l.id, l.cell])),
        ...region.sites.filter(w => w.cell !== undefined).map(w => [w.id, w.cell]),
        ...atlas.borders.map(b => [RegionBorders.room(b), b.cell]),
        ...(region.provinces ?? []).flatMap(p => [[Provinces.room(p.country), p.gate.cell],
          ...p.region ? [[p.region, p.gate.cell]] : []]),
        ...atlas.zones.map(z => [z.id, z.centres[0]]), ...Object.entries(RegionTracts.places(region))]) };
  }
}
