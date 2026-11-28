import { RegionLetters } from './region-letters';
import { FamilyNames } from './family-names';
import type { BundleSource } from '../campaign/bundle-source';
import type { BundleRequest } from '../campaign/module-bundle';
import type { CreatureGenerationContext } from '../content';
import type { VocabularyContext } from '../lang';
import type { Company, Region, Settlement } from './region-writer';
import type { Placement } from './world-assembler';
import { RegionFaith } from './region-faith';
import { Foundings } from './founding';
import { RegionSites } from './region-sites';
import { RegionRumours } from './region-rumours';
import { RegionGeography } from './region-geography';
import tables from '../../data/origins/tables.json';
import arrivals from '../../data/origins/wanderer/arrivals.json';
import { OriginPrologue } from './origin-prologue';
import { SettlementWriter } from './settlement-writer';
import { RegionUndertown } from './region-undertown';
import { AtlasOrigins } from './origin-atlas';
import { RegionKey } from './region-key';
import { DebtShapes } from './debt-shapes';
import { OriginOpenings, type OriginOpening } from './origin-opening';
import { StockOpenings, type StockOpening } from './stock-openings';
import { ReferenceSettlement } from './reference-settlement';
import { ReferenceOrigins } from './reference-origins';

// Why one person has come into a generated country, and who and what there already concerns them: a father who did
// not come home, a debt, an errand for an order, a sick child who needs what they carry. Each origin is a module of
// its own (data/origins/<id>), written against the world it is set in. It binds to people and places the world already
// holds: the drover's family becomes the protagonist's own, a merchant their creditor, a priest the one expecting
// them. It begins the game where the origin says, and states the relationship as facts the world goes on answering.
export interface OriginManifest {
  id: string; title: string; binder: string; source: string; choice: string;
  background?: string; coin?: number; gear?: string[]; kinds?: string[];
  // What is carried in place of the background's trade when another is chosen, so that what the story says the
  // protagonist can do is so (a scribe reads the old script; one who is not carries the brothers' glossary).
  otherwise?: string[];
  // What seeing it through is worth (the debt paid, the copy shown): it was nothing (the play-structure
  // investigation's PT-04).
  experience?: number;
}
// An origin as the creation page offers it; with the background it makes the protagonist, if it makes one.
// kinds: the kinds of past whose lives begin so, beyond its own background's (see CreationFlow.circumstance).
export interface OriginChoice { id: string; title: string; choice: string; background?: string; kinds?: string[];
  opening?: OriginOpening }
// What an origin is bound to in one world: the words its text is filled with, the entities it imports (with their
// types), and where the protagonist begins.
export interface OriginBound { values: Record<string, string>; imports: Record<string, [string, string]>; start: Start }
type Bound = OriginBound;
type Start = NonNullable<Company['start']>;
// The way into a settlement, by its country: its name, the scene of the town coming into sight, and the life going on
// there as one comes (data/origins/tables.json).
interface Way { name: string; way: string; scene: string; now: string }
interface Loaded { manifest: OriginManifest; source: string }

export class Origins {
  static readonly library = 'data/origins/library.json';
  static async load(base: BundleSource): Promise<Loaded[]> {
    const index = base.resolve(this.library);
    const list = JSON.parse(await base.read(index)) as { origins: string[] };
    return Promise.all(list.origins.map(async file => {
      const at = base.resolve(file, index), manifest = JSON.parse(await base.read(at)) as OriginManifest;
      return { manifest, source: await base.read(base.resolve(manifest.source, at)) };
    }));
  }
  // The origins this world can hold, said as the creation page offers them. In a country with the reference game's
  // settlement, only the lives that begin in it (OR-644, OR-682): "Coming home" had begun at the drover's town and the
  // fever's at the sick child's, where a going-on is set only outside the reference town (ScenarioTowns), so two of
  // four blind lives never saw the old woods. An origin named (a tester's, a spec's) still begins where it binds.
  static choices(loaded: Loaded[], region: Region, placements: Placement[],
    vocabulary: VocabularyContext): OriginChoice[] {
    return loaded.flatMap(o => {
      const found = this.bind(o.manifest.binder, region, placements);
      const bound = found && this.referenced(region, found.start) ? found : undefined;
      const opening = bound && OriginOpenings.of(this.fill(o.source, bound.values), o.manifest.title, vocabulary);
      return bound ? [{ id: o.manifest.id, title: o.manifest.title, choice: this.fill(o.manifest.choice, bound.values),
        ...opening ? { opening } : {}, ...o.manifest.background ? { background: o.manifest.background } : {},
        ...o.manifest.kinds ? { kinds: o.manifest.kinds } : {} }] : [];
    });
  }
  // Where an origin begins a life in this country, if it can.
  static begins(binder: string, region: Region, placements: Placement[]): string | undefined {
    return this.bind(binder, region, placements)?.start.place;
  }
  private static referenced(region: Region, start: Start): boolean {
    const s = ReferenceSettlement.of(region);
    return !s || start.place === s.id || start.place.startsWith(`${s.id}_`);
  }
  // The protagonist as the origin makes them: its background (what they know how to do), which is what its story
  // says they are (a scribe of the order reads the old script), and what they carry. One that makes them nothing in
  // particular keeps the trade they chose.
  // The origin's trade is the one set out with unless another was chosen (the owner, 3 November: an aphorist chosen
  // at creation set out a trader, the origin's).
  static member(origin: OriginManifest, member: CreatureGenerationContext, chosen = false): CreatureGenerationContext {
    const own = chosen && member.backgroundId, other = !!own && own !== origin.background;
    const gear = [...origin.gear ?? [], ...other ? origin.otherwise ?? [] : []];
    return { ...member, ...origin.background && !own ? { backgroundId: origin.background } : {},
      ...gear.length ? { gear: [...member.gear ?? [], ...gear] } : {} };
  }
  // The protagonist as the origin makes them (see member), and, placed in a family, called as the family is (see
  // FamilyNames): Morgran come home to a brother Travok Strakeln is Morgran Strakeln; one written with a family's
  // name (Morgran Stonehelm) gives the family theirs.
  static protagonist(origin: OriginManifest, chosen: CreatureGenerationContext,
    at: { chosen: boolean; region: Region; placements: Placement[] }): CreatureGenerationContext {
    const { region, placements } = at, member = this.member(origin, chosen, at.chosen);
    // The answer to a letter home is from their own people: by the origin, else by their background (RegionLetters).
    RegionLetters.give(region, origin.id, member);
    const p = origin.binder === 'kin' ? this.placed(placements, 'drover') : undefined;
    const town = p && this.home(region, p.bindings.town ?? '');
    if (!town || !member.name) { return member; }
    const as = member.pronouns === 'she' || member.pronouns === 'he' ? member.pronouns : 'they';
    return { ...member, name: FamilyNames.household({ key: `${town.name}:drover`, people: member.raceId ?? 'human',
      roster: '', own: member.name, as }).you ?? member.name };
  }
  // The origin's module, written against this world, for the campaign to install after the region.
  // opening: a stock opening the life begins in first, whose after-template says what the origin tells in place of its
  // first watches' lines (see StockOpenings).
  static write(o: Loaded, at: { region: Region; placements: Placement[]; protagonist: string; root: string;
    files: Record<string, string>; opening?: StockOpening })
    : { request: BundleRequest; start: Start; coin: number } | undefined {
    const bound = this.bind(o.manifest.binder, at.region, at.placements);
    if (!bound) { return undefined; }
    const values = { ...bound.values, protagonist: Origins.said(at.protagonist) };
    const prologue = this.prologue(bound, at.region);
    if (prologue) { bound.imports.inn = prologue.inn; }
    const names = Object.keys(bound.imports), dir = `${at.root}/origin`;
    at.files[`${dir}/module.json`] = JSON.stringify({ version: 1, source: 'origin.kyr', rules: ['world'],
      globals: ['party'], imports: ['party', ...names], ...o.manifest.experience ? { experience: o.manifest.experience } : {},
      // A relation imported (KX-03: the gate's letThrough) is bound by its name, and is no entity to hold a role to.
      roles: Object.fromEntries([['party', { type: 'group' }],
        ...names.filter(n => bound.imports[n]![1] !== 'relation').map(n => [n, { type: bound.imports[n]![1] }])]) });
    // The inn, wherever whoever was met on the road goes on to or the origin's aim sends the company, is the origin's
    // once, however many ask for it.
    const more = at.opening ? StockOpenings.after(at.opening, o.manifest.id, values) : [];
    const lines = [...bound.imports.inn ? ['  Place inn "the inn" is room.'] : [], ...prologue?.lines ?? [], ...more];
    // A life begun elsewhere first knows nothing yet of what its origin begins knowing: it learns it as it is told
    // (an opening's after-template teaches it), not under the fallen roof of the opening.
    const filled = this.fill(o.source, values);
    const source = more.length ? filled.replace(/Initially Assert knows\(party, \w+\)\.\s*/g, '') : filled;
    at.files[`${dir}/origin.kyr`] = lines.length ? source.replace(/\}\s*$/, `${lines.join('\n')}\n}\n`) : source;
    return { request: { id: 'origin', bundle: `${dir}/module.json`,
      imports: { party: 'region.party', ...Object.fromEntries(names.map(n => [n, bound.imports[n]![0]])) } },
    start: bound.start, coin: o.manifest.coin ?? 10 };
  }
  // A life that begins on the way into a town meets something going on there first (see OriginPrologue), its people
  // going on to the town's inn.
  private static prologue(bound: Bound, region: Region): { lines: string[]; inn: [string, string] } | undefined {
    const s = region.settlements.find(x => x.id === bound.start.approach?.settlement);
    if (!s || !bound.imports.approach || !SettlementWriter.rooms(region, s).taproom) { return undefined; }
    const lines = OriginPrologue.lines(RegionKey.of(region), { approach: 'approach', inn: 'inn', home: s.name, folk: region.ancestry });
    return lines.length ? { lines, inn: this.inn(s) } : undefined;
  }
  private static inn(s: Settlement): [string, string] { return [`region.${s.id}_taproom`, 'place']; }
  // A name as it can stand in the module's text: no braces (which would name an entity, or be filled again as a
  // template word) and its quotes and backslashes escaped (Wen"na and {creditor} broke Begin: the architecture
  // review's A12).
  static said(name: string): string { return name.replace(/[{}]/g, '').replace(/["\\]/g, '\\$&'); }
  // Template words are filled in before the module is read; anything else in braces is the module's own.
  private static fill(text: string, values: Record<string, string>): string {
    let out = text;
    for (let pass = 0; pass < 2; pass++) {
      out = out.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
    }
    return out;
  }
  // A country of the strategic atlas begins only its own lives (see AtlasOrigins).
  private static bind(binder: string, region: Region, placements: Placement[]): Bound | undefined {
    if (region.country) { return AtlasOrigins.bind(binder, region, placements); }
    const referenced = ReferenceOrigins.bind(binder, region, Origins);
    if (referenced !== undefined) { return referenced ?? undefined; }
    switch (binder) {
      case 'kin': return this.kin(region, placements);
      case 'debt': return this.debt(region);
      case 'herbs': return this.herbs(region, placements);
      case 'order': return this.order(region);
      case 'wanderer': return this.wanderer(region, placements);
      case 'map': return this.delve(region, 0);
      case 'lost': return this.lost(region);
      case 'courier': return this.courier(region);
      default: return undefined;
    }
  }
  private static placed(placements: Placement[], scenario: string): Placement | undefined {
    return placements.find(p => p.scenario === scenario && p.rid === 'region');
  }
  // How someone comes into a settlement, by its country; and what its trade looks like from the road.
  static approach(region: Region, s: Settlement): Record<string, string> {
    const a = this.way(region);
    const trade = (tables.trade as Record<string, string>)[s.trade] ?? 'smoke from the chimneys';
    // What is seen of it from the road is what made it: masts at a harbour, the brothers' wall, a fort's gate-tower.
    const sight = Foundings.table.foundings[Foundings.of(region, region.settlements.indexOf(s)).kind].sight;
    return { scene: a.scene.replace('{home}', s.name).replace('{trade}', trade).replace('{sight}', sight), home: s.name,
      // then: what a reason's own find opens after it, where a country says (ReferenceOrigins: OR-1505); else nothing.
      homename: s.name, region: region.name, then: '',
      // Where work is heard of, as one come over the hills knows it: at the inn, unless the country says (OR-1688).
      hear: ' The place to hear of it is the inn.' };
  }
  private static way(region: Region): Way {
    return (tables.approach as Record<string, Way>)[region.terrain] ?? tables.approach.forest;
  }
  // Beginning on the way into a settlement, which the region writes for the protagonist, with the life going on there
  // as they come (see RegionWriter.company).
  static arriving(region: Region, s: Settlement): { start: Start; approach: [string, string] } {
    const a = this.way(region);
    return { start: { place: `${s.id}_approach`, approach: { settlement: s.id, name: a.name.replace('{home}', s.name),
      way: a.way, now: a.now.replace('{home}', s.name) } }, approach: [`region.${s.id}_approach`, 'place'] };
  }
  private static home(region: Region, id: string): Settlement | undefined {
    return region.settlements.find(s => s.id === id);
  }
  private static kin(region: Region, placements: Placement[]): Bound | undefined {
    const p = this.placed(placements, 'drover'), s = p && this.home(region, p.bindings.town ?? '');
    if (!p || !s) { return undefined; }
    const { start, approach } = this.arriving(region, s);
    return { values: this.approach(region, s), start, imports: { approach, home: [`region.${s.id}`, 'place'],
      wife: [`${p.instance}.wife`, 'group'], son: [`${p.instance}.son`, 'group'], missing: [`${p.instance}.missing`, 'fact'] } };
  }
  private static debt(region: Region): Bound | undefined {
    const s = region.settlements.find(t => t.size === 'town') ?? region.settlements[0];
    if (!s) { return undefined; }
    const after = this.after(region, s), inn = !!SettlementWriter.rooms(region, s).taproom;
    const near = inn ? this.near(region, s) : {};
    // Told at the inn of the old places round about, the aim is the nearest of them, where there may be what pays.
    // Been to the nearest and still short, the next the innkeeper told of: the gold had led back to the first, spent,
    // again and again (the gold walk, 12 November).
    const owing = 'owed(loan) > 0 and not called(party) and (spoke(party) or not at(party, shop)) and quantity(party, '
      + 'gold) < owed(loan) and not worthSelling(party) and knows(party, told)';
    const drawn = DebtShapes.of(region, s, owing, this.chain(owing, near));
    return { values: { ...this.approach(region, s), merchant: s.merchant, after: after.said, out: drawn.lines,
      lost: (tables.lost as Record<string, string>)[s.trade] ?? 'a cartload of goods', ...drawn.values },
    start: { place: `${s.id}_shop` }, imports: { shop: [`region.${s.id}_shop`, 'place'],
      // Where the creditor says work is asked after; a town with no inn, the shop itself.
      ...inn
        ? { inn: this.inn(s), keeper: [`region.${s.id}_innkeeper`, 'group'] as [string, string],
          told: [`region.${s.id}_country_told`, 'fact'] as [string, string],
          ...drawn.shape === 'salvage' ? near : {} }
        : { inn: [`region.${s.id}_shop`, 'place'] as [string, string], keeper: [`region.${s.id}_merchant`, 'group'] as [string, string] },
      creditor: [`region.${s.id}_merchant`, 'group'], ...after.imports, ...drawn.imports } };
  }
  // The nearest of the old places the innkeeper tells of, for the debt's aim once told (see RegionRumours), and the
  // next two after it.
  private static near(region: Region, s: Settlement): Partial<Record<'near' | 'further' | 'furthest', [string, string]>> {
    const [site, next, last] = RegionRumours.nearest(region, s, RegionRumours.told(region)).map(x => x.site);
    return site ? { near: [`region.${site.id}`, 'place'], ...next ? { further: [`region.${next.id}`, 'place'] } : {},
      ...next && last ? { furthest: [`region.${last.id}`, 'place'] } : {} } : {};
  }
  // The debt's aims over the old places the innkeeper told of, each in turn: the nearest; been to and come back to the
  // shop still short, the next; been to and left still short, the last (M21's PL-27: at Marsh Howe, searched, the aim
  // still named it, nothing was gold, and Palusporta, told of with the others, was never led).
  private static chain(owing: string, near: Partial<Record<'near' | 'further' | 'furthest', unknown>>): string {
    if (!near.near) { return ''; }
    const owe = 'You owe {creditor} {owed(loan)} coin by market day';
    const lines = ['  Place near "the old place" is site.',
      `  Objective owing_out when ${owing}${near.further ? ' and not nearSpent(party)' : ''} toward near "${owe}. `
      + '{keeper} told of {near}, nearest of the old places round about: what is in such places could pay it.".'];
    if (near.further) {
      lines.push('  Place further "the next old place" is site.', '  Relation nearSpent(group).',
        '  Rule near_spent when been(party, near) and at(party, shop) and owed(loan) > 0 and not nearSpent(party) '
        + '{ Assert nearSpent(party). }',
        `  Objective owing_further when ${owing} and nearSpent(party)${near.furthest ? ' and not furtherSpent(party)' : ''}`
        + ` toward further "${owe}, and {near} has not paid it. {keeper} told of {further} as well: what is in such `
        + 'places could pay it.".');
    }
    if (near.furthest) {
      lines.push('  Place furthest "the last old place" is site.', '  Relation furtherSpent(group).',
        '  Rule further_spent when nearSpent(party) and been(party, further) and not within(party, further) '
        + 'and owed(loan) > 0 and not furtherSpent(party) { Assert furtherSpent(party). }',
        `  Objective owing_furthest when ${owing} and furtherSpent(party) toward furthest "${owe}, and neither {near} `
        + 'nor {further} has paid it. {keeper} told of {furthest} too: what is in such places could pay it.".');
    }
    return `${lines.join('\n')}\n`;
  }
  // What a debt paid leaves (the play-structure investigation's PT-01: a resolution had ended in "Nothing more is
  // asked of you"): the merchant, square, says where there is work for someone with nothing to lose, the makers' work
  // nearest the town, whose name and way the company then knows, and so an aim. A country with no lesser work leaves
  // the debt where it ends.
  private static after(region: Region, s: Settlement): { said: string; imports: Record<string, [string, string]> } {
    // Not the one the inn tells of first, which the debt has sent the company to already: paid, Tuck had said of
    // Seolforfyrd, just come back from, that nobody had been inside it in living memory (Mission 20's second round).
    const first = RegionRumours.nearest(region, s, RegionRumours.told(region))[0]?.site;
    const works = region.sites.filter(w => w.work && !w.work.imperial && !w.work.great && !w.work.deep && w !== first);
    const work = this.nearest(region, s, works);
    const seat = work && RegionGeography.seats(region).find(x => x.site === work);
    if (!work || !seat) { return { said: '', imports: {} }; }
    const where = RegionSites.where(seat, region);
    return { said: ` Then, as you go: 'If you want work, and have the stomach for it: ${work.name}, out in ${where}.`
      + ' Nobody from here has been inside it in living memory. Whatever is in there would sell.\'',
    imports: { named: [`region.${work.id}_named`, 'fact'], found: [`region.${work.id}_found`, 'fact'] } };
  }
  private static herbs(region: Region, placements: Placement[]): Bound | undefined {
    const p = this.placed(placements, 'fever'), s = p && this.home(region, p.bindings.town ?? '');
    const sender = region.settlements.find(t => t.id !== s?.id);
    if (!p || !s || !sender) { return undefined; }
    const { start, approach } = this.arriving(region, s);
    return { values: { ...this.approach(region, s), sender: sender.name }, start,
      imports: { approach, mother: [`${p.instance}.mother`, 'group'], sick: [this.fact('fever.sick', p), 'fact'] } };
  }
  // An order's errand: the old writing at the first of the makers' works that has some, and the priest of the town
  // nearest the order's road (the region's town).
  private static order(region: Region): Bound | undefined {
    const s = region.settlements.find(t => t.size === 'town') ?? region.settlements[0];
    const history = region.history, makers = history?.makers[0];
    const works = region.sites.filter(w => w.work && !w.work.imperial && !w.work.great && w.work.art === makers?.art);
    const work = s && this.nearest(region, s, works);
    if (!s || !makers || !work) { return undefined; }
    const cult = RegionFaith.cults(region)[region.settlements.indexOf(s)]!;
    const seat = RegionGeography.seats(region).find(x => x.site === work)!;
    const where = RegionSites.where(seat, region);
    const holy = Foundings.holyPlace(region, s);
    return { values: { ...this.approach(region, s), work: work.name, cult: cult.name, where,
      priestly: SettlementWriter.called(region, s) }, start: { place: holy },
      imports: { shrine: [`region.${holy}`, 'place'], delving: [`region.${work.id}`, 'place'],
        priest: [`region.${s.id}_priest`, 'group'], named: [`region.${work.id}_named`, 'fact'],
        found: [`region.${work.id}_found`, 'fact'], history: [`region.history_${makers.art}`, 'fact'],
        fate: [`region.history_${makers.art}_fate`, 'fact'] } };
  }
  // Of the makers' works, the nearest the town the errand is told in: the first drawn had been fifteen hours off, which
  // the priest's "Go in daylight" could not mean (play 11).
  private static nearest(region: Region, s: Settlement, works: Region['sites']): Region['sites'][number] | undefined {
    return [...works].sort((a, b) => this.away(region, s, a) - this.away(region, s, b))[0];
  }
  private static away(region: Region, s: Settlement, w: { cell?: number }): number {
    const [x, y] = RegionGeography.spot(region, s.cell!), [a, b] = RegionGeography.spot(region, w.cell!);
    return Math.hypot(a - x, b - y);
  }
  // One who comes over the hills arrives as something is happening: the first of the town's troubles that has an
  // arrival (data/origins/wanderer/arrivals.json), seen on the way in; having seen it, they know what the trouble is.
  private static wanderer(region: Region, placements: Placement[]): Bound | undefined {
    const s = region.settlements[0];
    if (!s) { return undefined; }
    const { start, approach } = this.arriving(region, s), values = this.approach(region, s);
    const met = arrivals.arrivals.map(a => ({ a, p: placements.find(p => p.scenario === a.scenario && p.rid === 'region'
      && p.bindings.town === s.id) })).find(x => x.p);
    if (!met) { return this.unhired(region, s, { values, start, imports: { approach } }); }
    const text = JSON.stringify(this.fill(met.a.text, { home: s.name }));
    return { values: { ...values, incident: `  Entity trouble: fact "What is the matter here". Initially Assert knows(party, trouble).\n`
      + `  Observe incident at approach as feature when watch(clock) < 1 ${text}.` },
      start, imports: { approach, trouble: [this.fact(met.a.fact, met.p!), 'fact'] } };
  }
  // Come over the hills to no trouble in particular, the first aim is the inn, where work is heard of (the owner, 7
  // November: every origin leads plainly into its first goal); a town with no inn leaves the road to the player. And
  // at the inn the work is told: its keeper sends the company to the town's notice, and the company knows what is on
  // it (the notice, a lead; each job an aim when its giver is asked, HP-01). Come there, the aim had been seen
  // through on the threshold with nothing said of any work (thorn's Misthythe, round 9's diagnosis of the owner's
  // OR-60).
  private static unhired(region: Region, s: Settlement, bound: Bound): Bound {
    if (!SettlementWriter.rooms(region, s).taproom) { return { ...bound, values: { ...bound.values, incident: '' } }; }
    const told = RegionUndertown.noticed(region, s), keeper = this.said(s.innkeeper);
    return { ...bound, imports: { ...bound.imports, inn: this.inn(s),
      ...told ? { notice: [`region.${s.id}_u_notice`, 'fact'] as [string, string] } : {} }, values: { ...bound.values,
      incident: '  Objective work when not been(party, inn) toward inn "Go to {inn} and ask after work: there is work in '
        + '{home} for someone who will do what others will not.".'
        + (told ? '\n  Entity notice: fact "What the notice on the well-post says".'
          + `\n  Rule work_told when at(party, inn) and not knows(party, notice) says "‘Work?’ says ${keeper}. ‘The notice on`
          + ' the well-post has jobs on it, every one of them still wanting a body. Ask after any of them in '
          + 'here or round the town.’" teaches notice { }' : '') } };
  }
  // A life drawn to one of the makers' lesser works by something of its own there (a dead man's map, a sister who did
  // not come out of it): the nth nearest the first town, or the nearest, begun on the way into that town,
  // the work named and its way known from the first, so that the aim is on the map; the work's own place imported, for
  // what lies there to be found by searching.
  private static delve(region: Region, nth: number): Bound | undefined {
    const s = region.settlements[0];
    const works = region.sites.filter(w => w.work && !w.work.imperial && !w.work.great && !w.work.deep);
    const near = s ? [...works].sort((a, b) => this.away(region, s, a) - this.away(region, s, b)) : [];
    // Another than the nearest only where it is hardly farther: a sister's barrow nine hours off had made a first
    // goal of a day's walk.
    const pick = near[nth] && s && this.away(region, s, near[nth]) <= 1.5 * this.away(region, s, near[0]!) ? nth : 0;
    const work = near[pick];
    const seat = work && RegionGeography.seats(region).find(x => x.site === work);
    if (!s || !work || !seat) { return undefined; }
    const { start, approach } = this.arriving(region, s);
    return { values: { ...this.approach(region, s), work: work.name, where: RegionSites.where(seat, region) }, start,
      imports: { approach, delving: [`region.${work.id}`, 'place'], named: [`region.${work.id}_named`, 'fact'],
        found: [`region.${work.id}_found`, 'fact'] } };
  }
  // A sister gone under: the work, as a map's is, and someone at home to ask of her, whoever keeps its inn (or its
  // merchant, where it has none): followed, the hook had gone quiet with no one to ask (round 6, the register's US-01).
  private static lost(region: Region): Bound | undefined {
    const bound = this.delve(region, 1), s = region.settlements[0];
    if (!bound || !s) { return undefined; }
    const keeper = SettlementWriter.rooms(region, s).taproom ? 'innkeeper' : 'merchant';
    return { ...bound, imports: { ...bound.imports, keeper: [`region.${s.id}_${keeper}`, 'group'] } };
  }
  // A letter carried from over the hills to the merchant of the next town on from the first: begun on the way into
  // the first, the next town on the map; and, delivered, the merchant tells of work near there as a creditor squared
  // does (Origins.after). Its card calls them by their trade there (the herb-wife at Shaykhafar): "the merchant at
  // Shaykhafar" had been a herb-wife when the letter came to her (the blind playtest of 15 November, BL-06).
  private static courier(region: Region): Bound | undefined {
    const s = region.settlements[0], others = region.settlements.filter(t => t !== s && t.cell !== undefined);
    const dest = s?.cell === undefined ? undefined
      : [...others].sort((a, b) => this.away(region, s, a) - this.away(region, s, b))[0];
    if (!s || !dest) { return undefined; }
    const { start, approach } = this.arriving(region, s), after = this.after(region, dest);
    const sender = (tables.senders as string[])[RegionKey.of(region).length % tables.senders.length]!;
    const values = { ...this.approach(region, s), destname: dest.name, merchant: dest.merchant, sender,
      trade: SettlementWriter.trade(dest).role, after: after.said };
    return { values, start,
      imports: { approach, dest: [`region.${dest.id}`, 'place'], addressee: [`region.${dest.id}_merchant`, 'group'],
        ...after.imports } };
  }
  // A scenario's fact (module.fact, as its hooks name it) where the placement installed it: its modules take their
  // own ids, numbered after the first instance (as WorldAssembler installs them).
  private static fact(ref: string, p: Placement): string {
    const [module, name] = ref.split('.') as [string, string], n = Number(p.instance.match(/\d+$/)?.[0] ?? 1);
    return `${module.replace(/[^A-Za-z0-9]/g, '')}${n > 1 ? n : ''}.${name}`;
  }
}
