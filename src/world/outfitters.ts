import { Draw } from './land/draw';
import { GenerationSetting } from '../generation-setting';
import { Communities } from './community/community';
import { CommunityWriter } from './community/community-writer';
import { RegionShops } from './region-shops';
import type { Region, Settlement } from './region-writer';
import folk from '../../data/generation/scenes/folk.json';
import outfit from '../../data/generation/scenes/outfit.json';

interface Outfit { chandler: string; hamlet: [string, number, number][] }
interface Trade { role: string; shop: string; scene?: string; stock: [string, number, number][] }

// Where anyone setting out can buy what they need (Mission 18, the owner's fifth priority: rations, light, rope and
// a crowbar, found from a typical starting place without searching blindly through many shops). Every village and
// town has a chandler: the settlement's own merchant, where its trade makes them one; otherwise a chandlery off the
// heart, kept by someone of the town's folk. In a hamlet, whoever keeps travellers sells the least of it besides
// food and a light (see SettlementWriter.keeper).
export class Outfitters {
  private static readonly tables = { outfit: outfit as unknown as Outfit,
    ...GenerationSetting.tables as unknown as { merchantType: { groups: Record<string, Trade> } } };
  static get kit(): [string, number, number][] { return this.chandler.stock; }
  static get hamlet(): [string, number, number][] { return this.tables.outfit.hamlet; }
  private static get chandler(): Trade { return this.tables.merchantType.groups[this.tables.outfit.chandler]!; }
  // Whether the settlement needs a chandlery of its own: a village or town whose merchant is not a chandler.
  static needed(s: Settlement): boolean {
    return s.size !== 'hamlet' && (s.merchantType ?? 'chandler') !== this.tables.outfit.chandler;
  }
  // Who keeps each settlement's chandlery: a name no one else in the country has (nor the chandler of a settlement
  // before it), of the settlement's own folk; drawn once for the country, settlement by settlement.
  private static readonly named = new WeakMap<Region, Map<string, { name: string; pronoun: string }>>();
  static keeper(region: Region, s: Settlement): { name: string; pronoun: string } {
    return this.drawn(region).get(s.id)!;
  }
  static keepers(region: Region): string[] { return [...this.drawn(region).values()].map(k => k.name); }
  private static drawn(region: Region): Map<string, { name: string; pronoun: string }> {
    const memo = this.named.get(region);
    if (memo) { return memo; }
    const out = new Map<string, { name: string; pronoun: string }>();
    const taken = new Set([...Communities.everyone(region), ...RegionShops.keepers(region)]);
    const given = folk.given as unknown as Record<string, Record<string, string[]>>;
    for (const s of region.settlements.filter(t => this.needed(t))) {
      const draw = new Draw(`${region.name}:${s.id}:chandler`), ancestry = s.folk ?? region.ancestry;
      const pronoun = draw.pick(['she', 'he']), names = (given[ancestry] ?? given.human!)[pronoun] ?? given.human!.she!;
      const name = Communities.distinct(names, ancestry, { draw, taken });
      taken.add(name);
      out.set(s.id, { name, pronoun });
    }
    this.named.set(region, out);
    return out;
  }
  // Every name the country's settled people have, its chandlers' among them (see Communities.everyone).
  static everyone(region: Region): Set<string> {
    return new Set([...Communities.everyone(region), ...this.keepers(region)]);
  }
  static lines(region: Region, s: Settlement): string[] {
    if (!this.needed(s)) { return []; }
    const q = JSON.stringify, id = `${s.id}_chandlery`, keeper = `${s.id}_chandler`, c = this.chandler;
    const { name, pronoun } = this.keeper(region, s), ancestry = s.folk ?? region.ancestry;
    const draw = new Draw(`${region.name}:${s.id}:chandler:manner`);
    const sells = c.stock.map(([what, fee, n]) => `Sells ${what} for ${fee} coin from ${n}.`).join(' ');
    const likeness = CommunityWriter.likenessOf(region, { pronoun, painting: 'shopkeeper', id: keeper });
    return [`  Place ${id} ${q(`${name}'s ${c.shop}`)} is room within ${s.id} at 3, 0 indoors.`,
      `  Passage ${id}_door ${q(`${name}'s door`)} is door between ${id} and ${s.id}_green.`,
      `  Person ${keeper} ${q(name)} at ${id} { Role ${q(c.role)}. Ancestry ${ancestry}.${likeness} Peaceable.`
        + ` Pronouns ${pronoun}. Manner ${draw.pick(['proud', 'cheerful', 'acerbic', 'stoic', 'jovial'])}. ${sells} }`,
      ...c.scene ? [`  Observe ${id}_scene at ${id} as fixture when true ${q(c.scene)}.`] : []];
  }
}
