import { GenerationSetting } from '../generation-setting';
import { RegionGeography } from './region-geography';
import { RegionFaith, type Cult } from './region-faith';
import { RegionRecruits } from './region-recruits';
import { SettlementScenes } from './settlement-scenes';
import { Communities } from './community/community';
import { CommunityWriter } from './community/community-writer';
import { Foundings, type Founding } from './founding';
import { RegionShops } from './region-shops';
import { Outfitters } from './outfitters';
import type { Region, Settlement } from './region-writer';

// A merchant's trade: who they are, their shop and what it looks like inside (a salt-house had no words of its own:
// play 7), and what they sell and buy.
interface MerchantType {
  role: string; profession?: string; shop: string; scene?: string;
  stock: [string, number, number][]; buys: [string, number][];
}
interface Tables {
  merchantType: { groups: Record<string, MerchantType> };
  innStock: { groups: Record<string, { price: number; stock: number }> };
}

// A settlement as Kyr, as its founding made it: its heart (a green, a ford, a pit-head, a gate-yard), and about it only
// what the place has: an inn where travellers are why it exists, an alehouse in someone's front room, a guest-hall or
// a canteen, or no more than a hayloft; a shrine, a chapel or a stone by the track; a shop, or goods sold from a door.
// Whoever keeps travellers, keeps the god and sells is always someone (they pass news on, and know the country), but
// what they are and where they stand is the founding's.
export class SettlementWriter {
  static readonly q = JSON.stringify;
  // What the settlement has besides its heart.
  static rooms(region: Region, s: Settlement): { taproom: boolean; shrine: boolean; shop: boolean } {
    const f = Foundings.of(region, region.settlements.indexOf(s));
    return { taproom: f.keeping !== 'none', shrine: Foundings.holyPlace(region, s) === `${s.id}_shrine`,
      shop: f.selling === 'shop' };
  }
  // Where the one who keeps travellers, the god or the goods stands: in their own room, or on the heart.
  static standing(region: Region, s: Settlement, role: 'innkeeper' | 'priest' | 'merchant' | 'traveller'): string {
    const has = this.rooms(region, s);
    const room = { innkeeper: 'taproom', traveller: 'taproom', priest: 'shrine', merchant: 'shop' }[role] as keyof typeof has;
    return has[room] ? `${s.id}_${room}` : `${s.id}_green`;
  }
  static lines(s: Settlement, i: number, region: Region): string[] {
    const q = this.q, [x, y] = RegionGeography.town(region, i), cult = RegionFaith.cults(region)[i]!;
    const f = Foundings.of(region, i), has = this.rooms(region, s);
    return [
      `  Place ${s.id} ${q(s.name)} is settlement within region at ${x}, ${y}.`,
      `  Initially Assert townSize(${s.id}, size_${s.size}).`,
      `  Place ${s.id}_green ${q(f.heart)} is room within ${s.id} at 1, 1.`,
      ...has.taproom ? this.keeping(s, f) : [],
      ...has.shrine ? this.holy(s, f, cult) : [],
      ...has.shop ? [`  Place ${s.id}_shop ${q(`${s.merchant}'s ${this.trade(s).shop}`)} is room within ${s.id} at 2, 1.`,
        `  Passage ${s.id}_shop_door ${q(`${s.merchant}'s door`)} is door between ${s.id}_shop and ${s.id}_green.`,
        ...this.trade(s).scene ? [`  Observe ${s.id}_shop_scene at ${s.id}_shop as fixture when true ${q(this.trade(s).scene!)}.`] : []]
        : [],
      this.keeper(s, f, region),
      this.priest(s, f, { region, cult }),
      this.merchant(s, f, region),
      ...RegionRecruits.traveller(s, i, region, has.taproom ? `${s.id}_taproom` : `${s.id}_green`),
      `  Observe ${s.id}_day at ${s.id}_green as fixture when not dark() ${q(SettlementScenes.green(region, i, cult.name))}.`,
      `  Observe ${s.id}_night at ${s.id}_green as fixture when dark() ${q(SettlementScenes.night(region, i))}.`,
      ...has.taproom ? [`  Observe ${s.id}_tap at ${s.id}_taproom as fixture when true ${q(SettlementScenes.taproom(region, i))}.`] : [],
      `  Observe ${s.id}_why at ${s.id}_green as ambience when not dark() ${q(f.why)}.`,
      ...SettlementScenes.life(region, i) ? [`  Observe ${s.id}_life at ${s.id}_green as ambience when not dark() ${q(SettlementScenes.life(region, i)!)}.`] : [],
      ...RegionFaith.lines(s, cult, has.shrine ? `${s.id}_shrine` : `${s.id}_green`, this.wayside(f, cult)),
      // A chandlery, where the merchant is not a chandler (see Outfitters); the shops a town keeps besides.
      ...Outfitters.lines(region, s),
      ...RegionShops.lines(region, i),
      // The people who live there, at their work and about the place, and its animals (see Communities).
      ...CommunityWriter.lines(region, Communities.plan(region, s, this.trade(s).stock.map(([what]) => what))),
    ];
  }
  // The house where travellers sleep, and its door onto the heart.
  private static keeping(s: Settlement, f: Founding): string[] {
    const q = this.q, k = Foundings.table.keeping[f.keeping], words = this.words(s);
    const building = f.keeping === 'inn' ? s.inn : f.keeping === 'alehouse' ? `${s.innkeeper}'s house`
      : f.keeping === 'guesthouse' ? `the brothers' house at ${s.name}` : `the fort at ${s.name}`;
    return [`  Place ${s.id}_inn ${q(building)} is building within ${s.id}.`,
      `  Place ${s.id}_taproom ${q(Foundings.fill(k.room!, words))} is room within ${s.id}_inn at 1, 0.`,
      `  Passage ${s.id}_inn_door ${q(Foundings.fill(k.door!, words))} is door between ${s.id}_taproom and ${s.id}_green.`];
  }
  private static holy(s: Settlement, f: Founding, cult: Cult): string[] {
    const q = this.q, h = Foundings.table.holy[f.holy], words = { ...this.words(s), cult: cult.name };
    return [`  Place ${s.id}_shrine ${q(Foundings.fill(h.room!, words))} is room within ${s.id} at 0, 1.`,
      `  Passage ${s.id}_shrine_door ${q(Foundings.fill(h.door!, words))} is doorway between ${s.id}_shrine and ${s.id}_green.`,
      ...this.tower(s, h.tower, words)];
  }
  // A town's shrine has a tower: climbed, it shows what can be seen from it (see RegionSights), and climbed again on
  // another day, what the haze hid; once the company has gone from it, it is a tower to climb again.
  static towered(s: Settlement): boolean { return s.size === 'town'; }
  private static tower(s: Settlement, t: { name: string; unseen: string; seen: string; change: string } | undefined,
    words: Record<string, string>): string[] {
    if (!t || !this.towered(s)) { return []; }
    const q = this.q, id = `${s.id}_shrine_view`;
    return [`  Thing ${id} ${q(Foundings.fill(t.name, words))} at ${s.id}_shrine is scenery {`,
      `    State below ${q(Foundings.fill(t.unseen, words))}.`,
      `    State above "The way down is the stair you came up.".`,
      `    Change climb ${q(Foundings.fill(t.change, words))} from below to above.`, '  }',
      `  Observe ${id}_seen at ${s.id}_shrine as sign when state(${id}, above) ${q(Foundings.fill(t.seen, words))}.`,
      `  Rule ${id}_down when state(${id}, above) and not at(party, ${s.id}_shrine) { Assert state(${id}, below). }`];
  }
  private static wayside(f: Founding, cult: Cult): string | undefined {
    return f.holy === 'wayside' ? Foundings.fill(Foundings.table.holy.wayside.thing!, { cult: cult.name }) : undefined;
  }
  private static words(s: Settlement): Record<string, string> {
    return { name: s.name, inn: s.inn.replace(/^The /, 'the '), keeper: s.innkeeper };
  }
  // Whoever keeps travellers: an innkeeper, or an alehouse-keeper, a guest-master, a sutler, or whoever speaks for a
  // hamlet and has a hayloft; each with what they ask for a night, the food they can spare, and a light for the road
  // (a ranger asked six of a country's people for a candle, and none sold one: the cold evaluation).
  private static keeper(s: Settlement, f: Founding, region: Region): string {
    const q = this.q, k = Foundings.table.keeping[f.keeping], stock = this.stock(s);
    const at = f.keeping === 'none' ? `${s.id}_green` : `${s.id}_taproom`;
    const work = f.keeping === 'inn' ? 'Profession innkeeper.'
      : `Background ${k.background}. Offers lodging ${q(k.lodging![0])} for ${k.lodging![1]} coin.`;
    return `  Person ${s.id}_innkeeper ${q(s.innkeeper)} at ${at} { Role ${q(Foundings.fill(k.role, this.words(s)))}. ${this.of(s, 'innkeeper', region)} ${work} Peaceable.${this.pronoun(s, 'innkeeper', f)} `
      + `Sells rations for ${stock.price} coin from ${f.keeping === 'none' ? Math.min(2, stock.stock) : stock.stock}. `
      + `Sells torch for 1 coin from ${f.keeping === 'none' ? 1 : 3}. Sells candle for 1 coin from ${f.keeping === 'none' ? 2 : 4}.`
      + `${s.size === 'hamlet' ? Outfitters.hamlet.map(([what, fee, n]) => ` Sells ${what} for ${fee} coin from ${n}.`).join('') : ''} }`;
  }
  // Only a town's priest has the learning to call the dead back, and keeps a copy of the old orders' glossary of the
  // old script, for whoever would read the makers' stones.
  private static priest(s: Settlement, f: Founding, at: { region: Region; cult: Cult }): string {
    const q = this.q, { region, cult } = at, h = Foundings.table.holy[f.holy];
    const where = f.holy === 'wayside' ? `${s.id}_green` : `${s.id}_shrine`;
    return `  Person ${s.id}_priest ${q(s.priest)} at ${where} { Role ${q(Foundings.fill(h.role, { ...this.words(s), cult: cult.name }))}. ${this.of(s, 'priest', region)} Profession priest. Peaceable.${this.pronoun(s, 'priest', f)}${s.size === 'town' ? ' Offers raising "a raising of the dead" for 150 coin. Sells old_glossary for 80 coin from 1.' : ''} }`;
  }
  // The merchant a settlement's trade supports, with that kind of merchant's stock and what they will buy: in a shop,
  // or at their own door on the heart.
  private static merchant(s: Settlement, f: Founding, region: Region): string {
    const t = this.trade(s), q = this.q;
    const sells = t.stock.map(([what, fee, n]) => `Sells ${what} for ${fee} coin from ${n}.`).join(' ');
    const buys = t.buys.map(([what, fee]) => `Buys ${what} for ${fee} coin.`).join(' ');
    // Every merchant deals in valuables too, as far as their purse goes: a town's goes further than a hamlet's.
    const purse = ({ town: 600, village: 120 } as Record<string, number>)[s.size] ?? 60;
    const role = f.selling === 'shop' ? t.role : Foundings.fill(Foundings.table.selling.door.role, { role: t.role });
    return `  Person ${s.id}_merchant ${q(s.merchant)} at ${s.id}_${f.selling === 'shop' ? 'shop' : 'green'} { Role ${q(role)}. ${this.of(s, 'merchant', region)}`
      + `${t.profession ? ` Profession ${t.profession}.` : ''} Peaceable.${this.pronoun(s, 'merchant', f)} ${sells}${buys ? ` ${buys}` : ''} }\n`
      + `  Initially Assert buysValuables(${s.id}_merchant). Initially Set purse(${s.id}_merchant) to ${purse}.`
      + ` Initially Set quantity(${s.id}_merchant, gold) to ${purse}.`;
  }
  // The merchant a settlement's trade supports.
  static trade(s: Settlement): MerchantType {
    const types = (GenerationSetting.tables as unknown as Tables).merchantType;
    return types.groups[s.merchantType ?? 'chandler'] ?? types.groups.chandler!;
  }
  // Whether a townsperson is he or she, as drawn, unless their place says (a guest-master or a prior of a brothers'
  // house is a brother; a herb-wife is a wife).
  private static pronoun(s: Settlement, role: 'innkeeper' | 'priest' | 'merchant', f: Founding): string {
    const said = role === 'innkeeper' && f.keeping === 'guesthouse' ? 'he' : role === 'priest' && f.holy === 'chapel' ? 'he'
      : role === 'merchant' && s.merchantType === 'herbwife' ? 'she' : s.pronouns?.[role];
    return said ? ` Pronouns ${said}.` : '';
  }
  // A townsperson's people, as a Person says it.
  private static of(s: Settlement, role: 'innkeeper' | 'priest' | 'merchant' | 'traveller', region: Region): string {
    return `Ancestry ${s.people?.[role] ?? s.folk ?? region.ancestry}.`;
  }
  // What a place of its size can spare: plenty in a town, a little in a hamlet, dearer.
  static stock(s: Settlement): { price: number; stock: number } {
    return (GenerationSetting.tables as unknown as Tables).innStock.groups[s.size] ?? { price: 2, stock: 6 };
  }
}
