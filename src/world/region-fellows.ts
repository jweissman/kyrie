import { Draw } from './land/draw';
import { Terrain } from './land/terrain';
import type { Wilds } from './land/atlas';
import { RegionGeography, type Seat } from './region-geography';
import { RegionFaith } from './region-faith';
import { RegionSites } from './region-sites';
import { RegionZones } from './region-zones';
import type { Region, Settlement } from './region-writer';
import tables from '../../data/generation/scenes/fellows.json';

interface Knows { of: string; label: string; says: string }
interface Calling { knows?: Knows; remarks: Record<string, string>; ruin: string[]; story: string[][]; shrine?: string;
  market?: string }
interface Table { kin: string[]; work: Record<string, string>; home: string[]; homecoming: string[];
  greet: Record<string, string>; ask: { label: string; says: string[] }; callings: Record<string, Calling> }
// One traveller as they would be in a company: who they are, their calling, and what fills what they say.
interface Fellow { s: Settlement; id: string; member: string; name: string; calling: Calling; draw: Draw;
  values: Record<string, string> }

// Whoever goes along with a company is somebody. Each settlement's traveller comes from another settlement of the
// country, where someone of theirs keeps the inn, the shop or the shrine, and is welcomed there with them; their
// calling has taught them something a company can use (the paths of a wood, a holy place, news nobody likes to
// talk about, who made the old metalwork), told when they are asked; they say what they think of a place that
// touches their calling, the first time the company comes to one; and on a quiet night they will tell a story of
// their own, a little at a time. All of it is said only while they travel with the company and are awake.
export class RegionFellows {
  static readonly table = tables as unknown as Table;
  static readonly roles = ['innkeeper', 'merchant', 'priest'] as const;
  static readonly rooms: Record<string, string> = { innkeeper: 'taproom', merchant: 'shop', priest: 'shrine' };
  static lines(region: Region): string[] {
    const fellows = region.settlements.flatMap(s => this.fellow(region, s));
    return [...this.places(region),
      ...fellows.flatMap(f => [...this.talk(region, f), ...this.kin(f), ...this.remarks(region, f)])];
  }
  // The kinds of place a fellow may have something to say at, as facts about the places, once for the country: the
  // landmarks of each kind, the doors of the makers' works, the greens of the towns.
  private static places(region: Region): string[] {
    const marks = this.marks(region), kinds = [...new Set(marks.map(l => l.kind!))];
    return ['  Relation work_door(place). Relation town_green(place).', ...kinds.map(k => `  Relation mark_${k}(place).`),
      ...marks.map(l => `  Initially Assert mark_${l.kind}(${l.id}).`),
      ...this.doors(region).map(x => `  Initially Assert work_door(${x.site.id}).`),
      ...region.settlements.filter(x => x.size === 'town').map(x => `  Initially Assert town_green(${x.id}_green).`)];
  }
  private static marks(region: Region) {
    const said = new Set(Object.values(this.table.callings).flatMap(c => Object.keys(c.remarks)));
    return RegionGeography.atlas(region).zones.flatMap(z => RegionZones.landmarks(region, z))
      .filter(l => l.kind && said.has(l.kind));
  }
  private static doors(region: Region) { return RegionGeography.seats(region).filter(x => !x.site.work?.great); }
  private static fellow(region: Region, s: Settlement): Fellow[] {
    const calling = this.table.callings[s.calling];
    if (!calling) { return []; }
    const id = `${s.id}_traveller`, draw = new Draw(`${region.name}:${s.id}:fellow`), name = s.traveller;
    return [{ s, id, member: `member_${id}_person`, name, calling, draw, values: { name, ...this.home(region, s, draw) } }];
  }
  // Where they come from and who they have there: another settlement of the country, and someone in it.
  private static home(region: Region, s: Settlement, draw: Draw): Record<string, string> {
    const others = region.settlements.filter(x => x.id !== s.id);
    if (!others.length) { return {}; }
    const home = draw.pick(others), role = draw.pick(this.roles);
    const god = RegionFaith.cults(region)[region.settlements.indexOf(home)]?.name ?? region.deity;
    return { home: home.name, homeId: home.id, role, kin: draw.pick(this.table.kin), kinName: home[role],
      kinWork: this.fill(this.table.work[role]!, { inn: home.inn, god }) };
  }
  // What can be said with them on the road: where they come from, what they know, and a story over three nights.
  private static talk(region: Region, f: Fellow): string[] {
    const q = JSON.stringify, { id, member, name, calling, values } = f, awake = `awake(${member})`;
    const lines = [`  Initially Assert fellow(${member}).`];
    if (values.home) {
      lines.push(`  Topic ${id}_home with ${id} travelling ${q(`Ask ${name} about home`)} when ${awake} once {`,
        `    Says ${q(this.fill(f.draw.pick(this.table.home), values))}.`, '  }');
    }
    const knows = calling.knows && this.knows(region, f, calling.knows);
    if (knows) {
      lines.push(`  Topic ${id}_knows with ${id} travelling ${q(this.fill(calling.knows!.label, values))} when ${awake} once {`,
        `    Says ${q(knows.says)}.`, `    On discuss { Assert knows(actor, ${knows.fact}). }`, '  }');
    }
    f.draw.pick(calling.story).forEach((beat, n) => lines.push(
      `  Topic ${id}_night${n + 1} with ${id} travelling ${q(`Sit up late with ${name}`)} when ${awake} and dark()`
        + ` and not hushed(${id}) and confided(${id}) == ${n} once {`,
      `    Says ${q(this.fill(beat, values))}.`, `    On discuss { Increase confided(${id}) by 1. Assert hushed(${id}). }`, '  }'));
    return lines;
  }
  // What their calling taught them that a company could use: the paths of the nearest wild country of their kind;
  // something of the country's past (who made the old things and how, how they ended, the kingdom that came after);
  // or where a site is: a holy place, an old fort, the makers' stonework, a place nobody likes to talk about.
  private static knows(region: Region, f: Fellow, k: Knows): { says: string; fact: string } | undefined {
    if (['wood', 'fen', 'heights'].includes(k.of)) { return this.wild(region, f, k); }
    if (['makers', 'fate', 'song'].includes(k.of)) { return this.past(region, f, k); }
    const seat = this.site(region, f.s, k.of), cult = RegionFaith.cults(region)[0]!;
    return seat ? { says: this.fill(k.says, { ...f.values, god: cult.name, title: cult.title, holy: seat.site.name,
      site: seat.site.name, where: RegionSites.where(seat, region) }), fact: `${seat.site.id}_named` } : undefined;
  }
  private static wild(region: Region, f: Fellow, k: Knows): { says: string; fact: string } | undefined {
    const zone = this.zone(region, f.s, k.of);
    if (!zone) { return undefined; }
    const marks = RegionZones.landmarks(region, zone);
    const heart = marks.find(m => m.id.endsWith('_heart')) ?? marks.at(-1)!;
    const values = { ...f.values, zone: zone.naming.name, edge: marks[0]!.name, heart: heart.name };
    return { says: this.fill(k.says, values), fact: `${zone.id}_mapped` };
  }
  // The country's past as a tinker, a scholar or a minstrel has it: from the old metalwork, the old script, a song.
  private static past(region: Region, f: Fellow, k: Knows): { says: string; fact: string } | undefined {
    const makers = region.history?.makers[0], later = region.history?.successors;
    if (!makers || !later) { return undefined; }
    const values = { ...f.values, makers: makers.epithet, craft: makers.craft, fate: makers.fate, kingdom: later.name,
      were: later.were, fall: later.fall };
    const says = this.capital(this.fill(k.says, values));
    const facts: Record<string, string> = { makers: `history_${makers.art}`, fate: `history_${makers.art}_fate`,
      song: 'history_successors' };
    return { says, fact: facts[k.of]! };
  }
  // The wild country of a kind (the heights are heath or fell) nearest a settlement.
  private static zone(region: Region, s: Settlement, of: string): Wilds | undefined {
    const atlas = RegionGeography.atlas(region), kinds = of === 'heights' ? ['heath', 'fell'] : [of];
    return atlas.zones.filter(z => kinds.includes(z.wild))
      .sort((a, b) => this.apart(region, a, s.cell!) - this.apart(region, b, s.cell!))[0];
  }
  private static apart(region: Region, zone: Wilds, cell: number): number {
    const land = RegionGeography.atlas(region).land;
    return Math.min(...zone.cells.map(c => Terrain.distance(land, c, cell)));
  }
  // A site that can be heard of (not the makers' greatest work, which is found another way), of the kind a calling
  // would know (a holy place, a fort), if there is one; else the nearest.
  private static site(region: Region, s: Settlement, of: string): Seat | undefined {
    const land = RegionGeography.atlas(region).land;
    const seats = RegionGeography.seats(region).filter(x => !x.site.work?.great);
    const fitting = seats.filter(x => this.fits(of, x)), pool = fitting.length ? fitting : seats;
    return [...pool].sort((a, b) => Terrain.distance(land, a.site.cell!, s.cell!)
      - Terrain.distance(land, b.site.cell!, s.cell!))[0];
  }
  private static fits(of: string, seat: Seat): boolean {
    const plan = seat.site.work?.plan ?? '', kind = seat.site.kind;
    if (of === 'faith') { return ['barrow', 'grove'].includes(kind) || ['barrow', 'singing', 'abbey'].includes(plan); }
    if (of === 'forts') { return kind === 'tower' || ['watchtower', 'keep', 'tollhouse'].includes(plan); }
    return true;
  }
  // Their own: coming home with them, the welcome there (and food for the road), and what their kin says of them.
  private static kin(f: Fellow): string[] {
    const v = f.values, q = JSON.stringify;
    if (!v.homeId) { return []; }
    const kin = `${v.homeId}_${v.role}`, room = `${v.homeId}_${this.rooms[v.role!]}`, green = `${v.homeId}_green`;
    const here = `travelsWith(${f.id}, party) and awake(${f.member})`;
    return [`  Initially Assert kin(${f.id}, ${kin}).`,
      `  Event ${f.id}_homecoming at ${green} when ${here} and at(party, ${green}) ${q(this.fill(f.draw.pick(this.table.homecoming), v))}.`,
      `  Event ${f.id}_welcomed at ${room} when ${here} and at(party, ${room}) ${q(this.fill(this.table.greet[v.role!]!, v))}`
        + ' then { Increase quantity(party, rations) by 2. }',
      `  Topic ${f.id}_asked with ${kin} ${q(this.fill(this.table.ask.label, v))} when travelsWith(${f.id}, actor) once {`,
      `    Says ${q(this.fill(f.draw.pick(this.table.ask.says), v))}.`, '  }'];
  }
  // What they say on coming somewhere that touches their calling, the first time only: a charcoal-burners' clearing,
  // a fold on the fell, the first ruin, a market; and at every shrine, a pilgrim's words to its god.
  private static remarks(region: Region, f: Fellow): string[] {
    const c = f.calling, q = JSON.stringify, here = `travelsWith(${f.id}, party) and awake(${f.member})`;
    const kinds = new Set(this.marks(region).map(l => l.kind!));
    const lines = Object.entries(c.remarks).filter(([k]) => kinds.has(k)).map(([k, text]) =>
      `  Event ${f.id}_${k} when ${here} and at(party, ?p) and mark_${k}(?p) ${q(this.fill(text, f.values))}.`);
    if (this.doors(region).length) {
      lines.push(`  Event ${f.id}_ruin when ${here} and at(party, ?p) and work_door(?p) ${q(this.fill(f.draw.pick(c.ruin), f.values))}.`);
    }
    if (c.market && region.settlements.some(x => x.size === 'town' && x.id !== f.s.id)) {
      lines.push(`  Event ${f.id}_market when ${here} and at(party, ?p) and town_green(?p) and not at(party, ${f.s.id}_green)`
        + ` ${q(this.fill(c.market, f.values))}.`);
    }
    const cults = RegionFaith.cults(region);
    if (c.shrine) {
      region.settlements.forEach((x, i) => lines.push(`  Event ${f.id}_prays_${x.id} at ${x.id}_shrine when ${here}`
        + ` and at(party, ${x.id}_shrine) ${q(this.fill(c.shrine!, { ...f.values, god: cults[i]!.name }))}.`));
    }
    return lines;
  }
  private static fill(text: string, values: Record<string, string | undefined>): string {
    return text.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // "the Water-Wardens" begins a sentence as "The Water-Wardens".
  private static capital(text: string): string {
    return text.replace(/(^|[.?!]\s+'?)the /g, (_, lead: string) => `${lead}The `);
  }
}
