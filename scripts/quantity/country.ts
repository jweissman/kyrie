import type { Campaign } from '../../src/campaign/campaign';
import { PlayTool } from '../../src/cli/play-tool';
import { HexBoundary } from '../../src/hex-boundary';
import { ModuleWriter } from '../../src/lang/module-writer';
import { LandModel } from '../../src/ui/land-model';
import { StockOpenings } from '../../src/world/stock-openings';
import { FirstHourBands } from '../first-hour-bands';
import { NoviceCountry, type Country } from '../novice-country';
import { QuantityDungeon } from './dungeon';
import { QuantityForebode, type Foreboded } from './forebode';
import { QuantityPurse } from './purse';
import { QuantityPlaces } from './places';
import { EconomyMeasure } from '../economy-measure';

// A first country as a new life begun in its first town finds it (no stock opening: the town is where the measures
// are taken from), read by the instruments that already read it: NoviceCountry (its bands, sites, hire, and how far
// each is over its ways), FirstHourBands (the bands of the first hour's reach fought by the company and its hire, and
// what the company's reckoning said before), EconomyMeasure (what lies and what is sold), and the land's hexes
// (HexBoundary, LandModel). See doc/architecture/quantity.md for what each number is held to.
// A band of the first hour's reach: how often its census trials felled the one who plays (fell, of twelve), what the
// company's reckoning said of it, whether that reckoning's own fights felled the one who plays (mortal: can kill,
// judged once, by the fights the game plays to decide what it says), and whether the game asks before it (warned:
// Marks.asks, the rule the page's mark reads).
export interface Fair { band: string; fell: number; said: string; warned: boolean; mortal: boolean }
export interface Read {
  seed: string; near: number; fair: Fair[];
  // The combat places quests return a company to (QuantityPlaces.returned).
  returned?: string[];
  economy: { day: number; kit: number; dearest: number; ratio: number; worth: number; listed?: number; stock: number;
    purse: number;
    missing: string[]; outing?: string; haul?: number; job?: number };
  reach: { things: string[]; cells: number };
  dungeon?: { name: string; minutes: number; hexes: number; levels: number; companion: boolean; light: boolean;
    provisions: boolean; at: { companion: boolean; light: boolean; provisions: boolean; gear: boolean };
    // Its bands that fall on whoever comes in, and those with a way to them showing fewer than two signs of them.
    forebode?: Foreboded };
}
export class QuantityCountry {
  // A day's reach: six hours' going from the start, there and back in a waking day.
  static readonly day = 360;
  // The bands met within four hours of the start (combat density's second reading).
  static readonly near = 240;
  static readonly trials = 12;
  static readonly light = /^(torch|lantern|candle)$/;
  static readonly provisions = /^(ration|rations|trail_rations|rashers|bread|cheese|bread_and_cheese|food)$/;
  static readonly rope = /^rope$/;
  static async begin(seed: string): Promise<Campaign> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', 'human/warrior/Wenna',
      '--opening', StockOpenings.none]));
    return journey.session.campaign;
  }
  static async read(seed: string): Promise<Read> {
    const c = await this.begin(seed), country = NoviceCountry.read(c, seed);
    const fair = FirstHourBands.bands(c, this.trials).map(b => ({ band: `${b.name} @${b.where}`, fell: b.fell,
      said: b.said, warned: b.asks, mortal: b.mortal }));
    const dungeon = this.dungeon(c, country);
    return { seed, near: country.bands.filter(b => b.minutes <= this.near).length, fair,
      economy: this.economy(c, country), reach: this.reach(c, country), ...dungeon ? { dungeon } : {},
      returned: QuantityPlaces.returned(c, country) };
  }
  // What a day's work brings home (QuantityPurse: one outing and one job, in the country's own land) against a starter
  // kit (a light, three days' rations, a rope: the cheapest of each the first town sells) and the first town's dearest
  // ware that is not itself treasure; and what lies in the country against what its markets sell.
  static economy(c: Campaign, country: Country): Read['economy'] {
    const w = c.world, purse = QuantityPurse.read(c, country, NoviceCountry.distances(c, country.start), this.day);
    const wares = this.wares(c, country);
    const parts: [string, number][] = [['light', this.cheapest(wares, this.light)],
      ['rations', 3 * this.cheapest(wares, this.provisions)], ['rope', this.cheapest(wares, this.rope)]];
    const kit = parts.reduce((t, [, p]) => t + (Number.isFinite(p) ? p : 0), 0);
    const dearest = Math.max(0, ...wares.filter(x => !w.test(ModuleWriter.call('valuable', x.kind))).map(x => x.price));
    return { day: purse.day, kit, dearest, ratio: this.round(purse.day / Math.max(1, kit + dearest)),
      worth: purse.worth, listed: purse.listed, stock: purse.stock,
      purse: w.number(ModuleWriter.call('quantity', c.playerActor!, 'gold')),
      missing: parts.filter(([, p]) => !Number.isFinite(p)).map(([k]) => k), outing: purse.outing, haul: purse.haul,
      job: purse.job };
  }
  private static cheapest(wares: { kind: string; price: number }[], re: RegExp): number {
    return Math.min(...wares.filter(x => re.test(x.kind)).map(x => x.price));
  }
  static wares(c: Campaign, country: Country): { kind: string; price: number }[] {
    const w = c.world;
    return w.related('forSale').map(r => r.args[0]!).filter(i => {
      const at = w.one('at', i);
      return !!at && NoviceCountry.containing(c, at, 'settlement')?.id === country.town;
    }).map(i => ({ kind: EconomyMeasure.kind(w, i), price: w.number(ModuleWriter.call('price', i)) }));
  }
  // Something worth doing within two hexes of the first town: a site (a dungeon), a band out in the wild (an
  // encounter), a wonder, a pleasure or a goings-on (an occasion), each once.
  static reach(c: Campaign, country: Country): Read['reach'] {
    const m = c.module, home = country.town && this.cell(c, country.town);
    if (!home) { return { things: [], cells: 0 }; }
    const sites = m.entities.filter(e => e.space?.kind === 'site' && this.within(c, home, e.id))
      .map(e => `site:${e.name}`);
    const wild = country.bands.filter(b => !b.site && this.within(c, home, b.place)).map(b => `band:${b.name}`);
    const placed = m.entities.filter(e => !e.space && /(^|_)(wonder|pl|af)_[a-z]/.test(e.id)).flatMap(e => {
      const at = c.world.one('at', e.id);
      return at && this.within(c, home, at) ? [`${this.what(e.id)}:${e.name}`] : [];
    });
    const cells = new Set(m.entities.filter(e => e.space && this.within(c, home, e.id))
      .map(e => this.cell(c, e.id)!.cell)).size;
    return { things: [...new Set([...sites, ...wild, ...placed])], cells };
  }
  private static within(c: Campaign, home: { land: string; cell: number }, id: string): boolean {
    const at = this.cell(c, id);
    return !!at && at.land === home.land && this.hexes(c, home, at) <= 2;
  }
  private static what(id: string): string {
    return /wonder_/.test(id) ? 'wonder' : /_pl_/.test(id) ? 'pleasure' : 'occasion';
  }
  // The first dungeon as the owner defines it (24 November, OR-311): the nearest site with two levels or more, each
  // with a boss and a cache (QuantityDungeon); how far its way in is, over the ways and in hexes, from the first town;
  // whether a companion can be hired in that town for what the company carries, and a light and provisions bought
  // there; and whether someone to hire stands at it, and a light, provisions and gear lie to be found by searching
  // near its way in. (It had been the nearest site with a band out of any town in it: the deep site under the first
  // town, whose bands are under the town, was never read, and the first dungeon read was a day off: OR-327, OR-328.)
  static dungeon(c: Campaign, country: Country): Read['dungeon'] {
    const site = QuantityDungeon.first(c, country), home = country.town && this.cell(c, country.town);
    if (!site) { return undefined; }
    const at = this.cell(c, site.entry), wares = this.wares(c, country);
    return { name: site.name, minutes: site.minutes, hexes: home && at ? this.hexes(c, home, at) : Infinity,
      levels: site.held, companion: !!country.hire && country.hire.fee <= country.hire.gold,
      light: wares.some(x => this.light.test(x.kind)), provisions: wares.some(x => this.provisions.test(x.kind)),
      at: { companion: site.companion, ...site.found }, forebode: QuantityForebode.read(c, site) };
  }
  static cell(c: Campaign, id: string): { land: string; cell: number } | undefined {
    const hex = HexBoundary.hex(c.module, id), m = hex && /^(.*):(\d+)$/.exec(hex);
    return m ? { land: m[1]!, cell: Number(m[2]) } : undefined;
  }
  // Hexes between two cells of one land, by its six neighbours (LandModel.round), breadth first.
  static hexes(c: Campaign, a: { land: string; cell: number }, b: { land: string; cell: number }): number {
    const chart = c.module.charts?.[a.land];
    if (!chart || a.land !== b.land) { return Infinity; }
    const seen = new Map([[a.cell, 0]]), queue = [a.cell];
    while (queue.length) {
      const at = queue.shift()!, d = seen.get(at)!;
      if (at === b.cell) { return d; }
      for (const n of LandModel.round(chart, at)) { if (!seen.has(n)) { seen.set(n, d + 1); queue.push(n); } }
    }
    return Infinity;
  }
  static round(x: number): number { return Math.round(x * 100) / 100; }
}
