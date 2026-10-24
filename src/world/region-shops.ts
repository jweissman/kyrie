import { Draw } from './land/draw';
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
  // The kinds a town keeps, drawn for the town.
  static chosen(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    if (s.size !== 'town') { return []; }
    const fit = Object.keys(this.kinds).filter(k => (this.stocks[k]?.stock.length ?? 0) >= 3);
    return new Draw(`${region.name}:${s.id}:shops`).shuffle(fit).slice(0, Foundings.of(region, i).kind === 'market' ? 2 : 1);
  }
  static lines(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    return this.chosen(region, i).flatMap((kind, n) => this.shop(region, s, { kind, n }));
  }
  // Who keeps a shop: a name nobody settled in the country has (see Communities.everyone).
  private static keeper(region: Region, s: Settlement, kind: string): { name: string; pronoun: string; draw: Draw } {
    const draw = new Draw(`${region.name}:${s.id}_${kind}`), ancestry = s.folk ?? region.ancestry;
    const pronoun = draw.pick(['she', 'he']), given = folk.given as unknown as Record<string, Record<string, string[]>>;
    const names = (given[ancestry] ?? given.human!)[pronoun] ?? given.human!.she!;
    const name = Communities.distinct(names, ancestry, { draw, taken: Communities.everyone(region) });
    return { name, pronoun, draw };
  }
  // Everyone who keeps a shop in the country, by name.
  static keepers(region: Region): string[] {
    return region.settlements.flatMap((s, i) => this.chosen(region, i).map(kind => this.keeper(region, s, kind).name));
  }
  private static shop(region: Region, s: Settlement, at: { kind: string; n: number }): string[] {
    const q = JSON.stringify, k = this.kinds[at.kind]!, id = `${s.id}_${at.kind}`, keeper = `${id}_keeper`;
    const ancestry = s.folk ?? region.ancestry, { name, pronoun, draw } = this.keeper(region, s, at.kind);
    const room = k.room.replace('{keeper}', name);
    const sells = this.stocks[at.kind]!.stock.map(([what, fee]) => `Sells ${what} for ${fee} coin from 2.`).join(' ');
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
