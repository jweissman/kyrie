import { Draw } from './land/draw';
import { Herbals } from './herbals';
import { Foundings } from './founding';
import { Communities } from './community/community';
import { CommunityWriter } from './community/community-writer';
import type { Region, Settlement } from './region-writer';
import world from '../../data/generation/scenes/orsino-world.json';
import shops from '../../data/generation/scenes/shops.json';
import folk from '../../data/generation/scenes/folk.json';

interface Kind { role: string; room: string; painting: string; scene: string }

// The shops of Orsino's shop table a town keeps beside its own merchant: a market town two, any other town one, of
// the kinds that have something a country's market sees (an apothecary, an armoury, a jeweller's, a potion-shop),
// each kept by someone of the town's folk, selling what Orsino says that kind of shop sells, at what it is worth.
export class RegionShops {
  static readonly kinds = shops.kinds as Record<string, Kind>;
  static readonly stocks = world.shops as unknown as Record<string, { name: string; stock: [string, number][] }>;
  // Shops that sell the same things, of which a town keeps one at most: a herb-wife's town had a dispensary and a
  // potion-shop besides, and no rope (the owner's review of Mission 18). The general kinds are its chandler's.
  static readonly families: Record<string, string> = { alchemy: 'remedies', apothecary: 'remedies',
    dispensary: 'remedies', herbs: 'remedies', potions: 'remedies', general: 'general', emporium: 'general',
    variety: 'general', provisions: 'general', tools: 'general', kitchen: 'general', armory: 'arms', weapons: 'arms',
    fabrics: 'cloth', exotician: 'rare', magic_items: 'rare', scrolls: 'rare', jewelry: 'rare' };
  static readonly merchants: Record<string, string> = { herbwife: 'remedies', chandler: 'general', smith: 'arms' };
  // The kinds a town keeps, drawn for the town: none of the family its merchant or chandler already sells.
  static chosen(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    if (s.size !== 'town') { return []; }
    const fit = Object.keys(this.kinds).filter(k => this.shelves(region, i, k).length >= 3);
    const had = new Set(['general', this.merchants[s.merchantType ?? 'chandler'] ?? '']), out: string[] = [];
    for (const kind of new Draw(`${region.name}:${s.id}:shops`).shuffle(fit)) {
      const family = this.families[kind] ?? kind;
      if (!had.has(family)) { out.push(kind); had.add(family); }
    }
    return out.slice(0, Foundings.of(region, i).kind === 'market' ? 2 : 1);
  }
  static lines(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    return this.chosen(region, i).flatMap((kind, n) =>
      this.shop(region, s, { kind, n, shelves: this.shelves(region, i, kind) }));
  }
  // What a town's shop of a kind has on its shelves, of all its kinds Orsino's shop would sell: the first five (what
  // anyone setting out needs, then the cheapest) and three more drawn for the town from the rest it can afford to keep,
  // cheapest first. A market town's jeweller may have a ring of protection; a small town's has what a small town buys.
  static shelves(region: Region, i: number, kind: string): [string, number][] {
    return this.shelf(kind, { means: Foundings.of(region, i).kind === 'market' ? 800 : 300,
      key: `${region.name}:${region.settlements[i]!.id}:${kind}:shelves` });
  }
  static shelf(kind: string, at: { means: number; key: string }): [string, number][] {
    const pool = (this.stocks[kind]?.stock ?? []).filter(([, fee]) => fee <= at.means), draw = new Draw(at.key);
    return [...pool.slice(0, 5), ...draw.shuffle(pool.slice(5)).slice(0, 3)].sort((a, b) => a[1] - b[1]);
  }
  // Who keeps a shop: a name nobody settled in the country has (see Communities.everyone).
  private static keeper(region: Region, s: Settlement, kind: string): { name: string; pronoun: string; draw: Draw } {
    const draw = new Draw(`${region.name}:${s.id}_${kind}`), ancestry = s.folk ?? region.ancestry;
    const pronoun = draw.pick(['she', 'he']), given = folk.given as unknown as Record<string, Record<string, string[]>>;
    const names = (given[ancestry] ?? given.human!)[pronoun] ?? given.human!.she!;
    const name = Communities.distinct(names, ancestry,
      { draw, taken: Communities.everyone(region), reserved: region.reserved });
    return { name, pronoun, draw };
  }
  // Everyone who keeps a shop in the country, by name.
  static keepers(region: Region): string[] {
    return region.settlements.flatMap((s, i) => this.chosen(region, i).map(kind => this.keeper(region, s, kind).name));
  }
  // What a settlement's merchant has of their trade besides what anyone setting out needs (a smith's swords and coats
  // of mail, a herb-wife's comfrey): three things drawn for the settlement from Orsino's shops of that trade, one of
  // each, within what it can afford to keep; a village smith had sold a dagger, and nothing else to fight with.
  static wares(region: Region, s: Settlement, of: { trades: string[]; have: string[] }): [string, number, number][] {
    const means = ({ town: 300, village: 80 } as Record<string, number>)[s.size] ?? 25;
    const pool = [...new Map(of.trades.flatMap(k => this.stocks[k]?.stock ?? [])
      .filter(([what, fee]) => fee <= means && !of.have.includes(what))).entries()];
    return new Draw(`${region.name}:${s.id}:wares`).shuffle(pool).slice(0, 3).sort((a, b) => a[1] - b[1])
      .map(([what, fee]) => [what, fee, 1]);
  }
  private static shop(region: Region, s: Settlement, at: { kind: string; n: number; shelves: [string, number][] }):
    string[] {
    const q = JSON.stringify, k = this.kinds[at.kind]!, id = `${s.id}_${at.kind}`, keeper = `${id}_keeper`;
    const ancestry = s.folk ?? region.ancestry, { name, pronoun, draw } = this.keeper(region, s, at.kind);
    const room = k.room.replace('{keeper}', name);
    // Two of what is cheap; one of what is dear (a jeweller has one ring of protection, not a pair).
    const sells = at.shelves.map(([what, fee]) => `Sells ${what} for ${fee} coin from ${fee > 100 ? 1 : 2}.`).join(' ')
      + (RegionShops.families[at.kind] === 'remedies' ? ` ${Herbals.buys().map(([what, fee]) => `Buys ${what} for ${fee} coin.`).join(' ')}` : '');
    const likeness = CommunityWriter.likenessOf(region, { pronoun, painting: k.painting, id: keeper });
    return [`  Place ${id} ${q(room)} is room within ${s.id} at 3, ${1 + at.n} indoors.`,
      `  Passage ${id}_door ${q(`${name}'s door`)} is door between ${id} and ${s.id}_green.`,
      `  Person ${keeper} ${q(name)} at ${id} { Role ${q(k.role)}. Ancestry ${ancestry}.${likeness} Peaceable.`
        + ` Pronouns ${pronoun}. Manner ${draw.pick(['proud', 'cheerful', 'acerbic', 'stoic', 'jovial'])}. ${sells} }`,
      `  Initially Assert buysValuables(${keeper}). Initially Set purse(${keeper}) to 300.`
        + ` Initially Set quantity(${keeper}, gold) to 300.`,
      `  Observe ${id}_scene at ${id} as fixture when true ${q(k.scene)}.`];
  }
}
