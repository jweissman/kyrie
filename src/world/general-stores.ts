import { Draw } from './land/draw';
import { Foundings } from './founding';
import { CommunityWriter } from './community/community-writer';
import { Communities } from './community/community';
import { RegionShops } from './region-shops';
import type { Region, Settlement } from './region-writer';
import { Canon } from '../canon/canon';
import folk from '../../data/generation/scenes/folk.json';
import table from '../../data/generation/scenes/general-stores.json';

type Size = 'town' | 'market';
interface Store {
  pool?: string; always: Record<Size, string[]>; drawn: Record<Size, number>; purse: Record<Size, number>;
}
interface Kind { role: string; room: string; painting: string; scene: string }
interface Table { kinds: Record<string, Kind>; stores: Record<string, Store>; clothTrades: string[]; clothing: string[];
  village: { always: string[]; trade: number }; trade: Record<string, string[]> }
export type Ware = [string, number, number];

// Where a country's ordinary gear and clothing are bought (the owner, 7 November): a market town's general store and
// clothier, a smaller general store in any other town (with a shirt, shoes and a cloak where no clothier keeps a
// shop), a clothier where the trade is wool or furs, and a few more ordinary things at a village's chandler; each
// stocked by the settlement's size and by what its trade makes (data/generation/scenes/general-stores.json). Written
// after everything else the country has, so that their keepers take no one's name and no one's likeness, and every
// draw made before is as it was.
export class GeneralStores {
  static readonly table = table as unknown as Table;
  // The stores a settlement keeps.
  static kinds(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    if (s.size !== 'town') { return []; }
    return this.size(region, i) === 'market' || this.table.clothTrades.includes(s.trade) ? ['general', 'clothier']
      : ['general'];
  }
  private static size(region: Region, i: number): Size {
    return Foundings.of(region, i).kind === 'market' ? 'market' : 'town';
  }
  // Kinds a country cannot name, the shared rules taking their names for a parameter (Put {cargo} in {box}): a town
  // whose store drew Orsino's box would not compile ("Parameter shadows entity box").
  static readonly unnamable = new Set(['box']);
  // What a store has on its shelves: what it always has at the town's size, then some of the rest of Orsino's stock
  // for its kind, drawn for the town, then what the town's own trade makes, cheaper there and more of it.
  static shelves(region: Region, i: number, kind: string): Ware[] {
    const s = region.settlements[i]!, store = this.table.stores[kind]!, size = this.size(region, i);
    // Where no clothier keeps a shop, the general store has the clothes a village chandler has.
    const plain = kind === 'general' && !this.kinds(region, i).includes('clothier') ? this.table.village.always : [];
    const always = [...store.always.town, ...size === 'market' ? store.always.market : [], ...plain];
    const cloth = new Set(this.table.clothing);
    const made = (this.table.trade[s.trade] ?? []).filter(k => (kind === 'clothier') === cloth.has(k));
    const rest = (store.pool ? RegionShops.stocks[store.pool]?.stock ?? [] : []).map(([what]) => what)
      .filter(k => !always.includes(k) && !made.includes(k) && !cloth.has(k) && this.worth(k) <= 10
        && !GeneralStores.unnamable.has(k));
    const drawn = new Draw(`${region.name}:${s.id}:store:${kind}:shelves`).shuffle(rest).slice(0, store.drawn[size]);
    const local = new Set(made);
    return [...new Set([...always, ...drawn, ...made])].map(k => this.ware(k, local.has(k), size === 'market' ? 2 : 1));
  }
  // A village chandler's ordinary things besides the outfit: a shirt, shoes and a cloak, and some of what the
  // village's own trade makes (a slate-quarrying village's chalk, an eel-catching one's hooks).
  static village(region: Region, s: Settlement, have: string[]): Ware[] {
    if (s.size !== 'village') { return []; }
    const made = new Draw(`${region.name}:${s.id}:chandler:made`).shuffle((this.table.trade[s.trade] ?? [])
      .filter(k => !have.includes(k) && !this.table.village.always.includes(k))).slice(0, this.table.village.trade);
    const local = new Set(made);
    return [...this.table.village.always.filter(k => !have.includes(k)), ...made]
      .map(k => this.ware(k, local.has(k), 1));
  }
  // What a thing costs, and how many there are: its worth, a quarter off where it is made; two of it where it is made,
  // and in a market town, and one of anything dear.
  private static ware(kind: string, local: boolean, plenty: number): Ware {
    const worth = this.worth(kind), fee = local ? Math.max(1, Math.floor(worth * 3 / 4)) : worth;
    return [kind, fee, worth > 8 ? 1 : local ? plenty + 1 : plenty];
  }
  private static worth(kind: string): number { return Canon.items[kind]?.value ?? 1; }
  // Every store of the country, with its keeper: a name no one else has (taken: every name the country's people
  // already have), given and family both, so that no one drawn after them can be taken for them.
  static keepers(region: Region, taken: Set<string>): { s: Settlement; i: number; kind: string; name: string;
    pronoun: string; draw: Draw }[] {
    const used = new Set(taken), given = folk.given as unknown as Record<string, Record<string, string[]>>;
    const families = folk.family as unknown as Record<string, string[]>;
    return region.settlements.flatMap((s, i) => this.kinds(region, i).map(kind => {
      const draw = new Draw(`${region.name}:${s.id}:store:${kind}`), ancestry = s.folk ?? region.ancestry;
      const pronoun = draw.pick(['she', 'he']), names = (given[ancestry] ?? given.human!)[pronoun] ?? given.human!.she!;
      const first = Communities.distinct(names, ancestry, { draw, taken: used, reserved: region.reserved }).split(' ')[0]!;
      const family = draw.shuffle(families[ancestry] ?? families.human!).map(f => `${first} ${f}`);
      const name = family.find(n => !used.has(n)) ?? family[0]!;
      used.add(first); used.add(name);
      return { s, i, kind, name, pronoun, draw };
    }));
  }
  static lines(region: Region, taken: Set<string>): string[] {
    return this.keepers(region, taken).flatMap(k => this.store(region, k));
  }
  private static store(region: Region, at: ReturnType<typeof GeneralStores.keepers>[number]): string[] {
    const q = JSON.stringify, k = this.table.kinds[at.kind]!, s = at.s, id = `${s.id}_${at.kind}`, keeper = `${id}_keeper`;
    const store = this.table.stores[at.kind]!, purse = store.purse[this.size(region, at.i)];
    const likeness = CommunityWriter.likenessOf(region, { pronoun: at.pronoun, painting: k.painting, id: keeper });
    const sells = this.shelves(region, at.i, at.kind).map(([what, fee, n]) => `Sells ${what} for ${fee} coin from ${n}.`)
      .join(' ');
    return [`  Place ${id} ${q(k.room.replace('{keeper}', at.name))} is room within ${s.id} at 4, ${this.kinds(region, at.i)
      .indexOf(at.kind)} indoors.`,
    `  Passage ${id}_door ${q(`${at.name}'s door`)} is door between ${id} and ${s.id}_green.`,
    `  Person ${keeper} ${q(at.name)} at ${id} { Role ${q(k.role)}. Ancestry ${s.folk ?? region.ancestry}.${likeness}`
      + ` Peaceable. Pronouns ${at.pronoun}. Manner ${at.draw.pick(['proud', 'cheerful', 'acerbic', 'stoic', 'jovial'])}.`
      + ` ${sells} }`,
    `  Initially Assert buysValuables(${keeper}). Initially Set purse(${keeper}) to ${purse}.`
      + ` Initially Set quantity(${keeper}, gold) to ${purse}.${RegionShops.dealsIn(keeper, 'general')}`,
    `  Observe ${id}_scene at ${id} as fixture when true ${q(k.scene)}.`];
  }
}
