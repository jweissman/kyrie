import { Canon } from '../../canon/canon';
import { ItemNames } from '../../lang/item-names';
import { Foundings } from '../founding';
import { Terrain } from '../land/terrain';
import { RegionGeography } from '../region-geography';
import type { DeepLayout } from './deep-layout';
import type { DeepPurpose } from './deep-purposes';
import type { Region, Settlement, Site } from '../region-writer';
import powers from '../../../data/generation/deep/powers.json';

interface Power {
  founding: string[]; office: string; role: string; calling: string; manner: string; share: number; advance: number;
  band: string; gear: string[]; asked: string; advanced: string; out: string; trace: string; fell: string; fate: string;
  won: string; sold: string; gone: string;
}
// The ids a site's rivals are written with: the ambition, its head, the keeper and the prize, and where those are.
interface Rivals {
  id: string; head: string; seat: Settlement; keeper: string; heart: string; room: string; kind: string;
  price: number; raised: number; values: Record<string, string>; prize: string;
}

// Who else is after a deep site's prize (data/generation/deep/powers.json): the heirs of the kingdom that came after
// its makers, whose head at a settlement says what they want and why, pays for the prize, and stands a company an
// advance against it. Their delving is an ambition (data/rules/ambitions.kyr) that moves on a stage every two days
// from the second morning: out of the settlement, then down a level at a time, leaving their mark on each. At the
// bottom, while the company is not on that level, the keeper breaks them if it is still able, and what they carried is
// left lying; if it is not, they bring the prize up to their head, unless someone was there before them.
export class DeepRivals {
  static readonly q = JSON.stringify;
  static readonly table = (powers as unknown as { powers: Record<string, Power> }).powers;
  // The second morning (six o'clock of the second day, from eight on the first), and two days a stage.
  static readonly first = 132;
  static readonly pace = 288;
  // What a prize that says no worth of its own is worth, as its Kind is written (DeepSites.kinds).
  static readonly worth = 400;
  static lines(region: Region, site: Site,
    at: { layout: DeepLayout; purpose: DeepPurpose; values: Record<string, string> }): string[] {
    const { layout, purpose, values } = at, power = this.table[values.kingdomkind!];
    if (!power) { return []; }
    const bottom = layout.levels.at(-1)!.rooms, room = (bottom.find(r => r.role === 'heart') ?? bottom.at(-1)!).id;
    const price = this.price(purpose, power);
    const r: Rivals = { id: `${site.id}_rivals`, head: `${site.id}_head`, seat: this.seat(region, site, power),
      keeper: `${layout.site}_keeper`, heart: `${layout.site}_heart`, room, kind: purpose.objective.kind, price,
      raised: this.round(price * 1.5), values, prize: purpose.objective.item };
    return [...this.head(r, power, purpose), ...this.delving(r, power, layout),
      ...this.end(r, power, { layout, raises: !!(purpose.objective.goal && purpose.objective.raised) })];
  }
  // What the head pays for the prize: its share of the prize's worth as the site's Kind has it (DeepSites.kinds). A
  // default of 2000 here, where the Kind's was 400, had the Delvers' heart, which said no worth, bought for 2500
  // against a dealer's 200: one outing ten times the first town's dearest ware (SI-07: b2 and c3's day's coin 10.3
  // and 13.5, against the world gate's band of 0.5 to 3).
  static price(purpose: DeepPurpose, power: Pick<Power, 'share'>): number {
    return this.round((purpose.objective.worth ?? DeepRivals.worth) * power.share);
  }
  // The head, at the settlement's heart, with the coin to pay for the prize: what they want, and an advance. Called by
  // their office, of their kingdom where that tells them apart: "the factor" of a company stood on Porthalen's green
  // while Aster, a factor of the Founders' Exchange, sat in the taproom, and were taken for one (cold play 4, CL-49).
  // Of the settlement's own people, and of the power's calling if that people has it (an elf is no cleric), else
  // their own.
  private static head(r: Rivals, power: Power, purpose: DeepPurpose): string[] {
    const q = this.q, { id, head, seat, values } = r, w = values.w!, folk = seat.folk ?? 'human';
    const calling = power.calling && Canon.ancestries[folk]?.classes.includes(power.calling) ? power.calling : '';
    const story = purpose.objective.goal ? ` Assert knows(actor, ${w}_story).` : '';
    return [`  Entity ${id}: ambition ${q(this.fill(power.band, r))}.`,
      `  Person ${head} ${q(this.fill(power.office, r))} at ${seat.id}_green { Role ${q(this.fill(power.role, r))}.`
        + ` Ancestry ${folk}.${calling ? ` Calling ${calling}.` : ''} Peaceable.`
        + ` Manner ${power.manner}. }`,
      `  Initially Assert pursues(${head}, ${id}). Initially Set stageDue(${id}) to ${this.first}.`
        + ` Initially Set pace(${id}) to ${this.pace}.`,
      `  Initially Set quantity(${head}, gold) to ${r.raised + 100}. Initially Set pays(${head}, ${r.kind}) to ${r.price}.`,
      `  Entity ${id}_offer: fact ${q(`${this.upper(this.fill(power.office, r))} at ${seat.name} wants ${r.prize}, and will pay for it.`)}.`,
      // Asked only by one who has heard of the place or of the band (OR-1680: "Ask the prior about the king-barrow"
      // had been offered a fresh life on the green, the barrow never heard of).
      // Not asked, nor an advance to go down, with the prize in hand: the head had said "Bring me the crown" to one
      // holding it, and offered "something to go down with" to one come up (cold play 4's 26, CL-46). Nor once the
      // prize is theirs: sold to the agent, the crown was bid for again at 380 coin (S3-5).
      `  Topic ${id}_asked with ${head} ${q(`Ask {${head}} about ${purpose.hook.topic}`)}`
        + ` when (knows(actor, ${w}_named) or knows(actor, ${id}_out)) and not holding(actor, ${r.kind}) and not won(${id}) once {`,
      `    Says ${q(this.fill(power.asked, r))}.`,
      `    On discuss { Assert knows(actor, ${id}_offer). Assert knows(actor, ${w}_named). Assert knows(actor, ${w}_found).${story} }`,
      '  }',
      `  Topic ${id}_advance with ${head} ${q(`Ask {${head}} for something to go down with`)} when knows(actor, ${id}_offer)`
        + ` and not won(${id}) and not holding(actor, ${r.kind}) once {`,
      `    Says ${q(this.fill(power.advanced, r))}.`,
      `    On discuss { Increase quantity(actor, gold) by ${power.advance}. Decrease quantity(${head}, gold) by ${power.advance}.`
        + ` Decrease pays(${head}, ${r.kind}) by ${power.advance}. }`, '  }'];
  }
  // Their setting out, as the talk near the innkeeper has it that day (heard, not seen: the cold playtest's Notes
  // filed it as seen with the company's own eyes), and as their head says it to whoever asks while they are below;
  // and their mark on every level they have reached, from the stage they go down it.
  private static delving(r: Rivals, power: Power, layout: DeepLayout): string[] {
    const q = this.q, { id, head, values } = r, out = this.fill(power.out, this.heard(r)), w = values.w!;
    return [`  Entity ${id}_out: fact ${q(out)}.`,
      `  Observe ${id}_out_told near ${values.keeper} as hearsay when stage(${id}) == 1 and not knows(party, ${id}_out)`
        + ` ${q(this.says(out, values.keeper!))} teaches ${id}_out.`,
      `  Topic ${id}_gone with ${head} ${q(`Ask {${head}} where ${this.fill(power.band, r)} have gone`)}`
        + ` when stage(${id}) >= 1 and not foiled(${id}) and not won(${id}) once {`,
      `    Says ${q(this.fill(power.gone, r))}. On discuss { Assert knows(actor, ${id}_out). Assert knows(actor, ${w}_named). }`,
      '  }',
      ...layout.levels.slice(0, -1).map((level, i) => `  Observe ${id}_trace${i} at ${level.rooms[0]!.id}`
        + ` when stage(${id}) >= ${i + 1} ${q(this.fill(power.trace, r))}.`)];
  }
  // At the bottom: broken by the keeper, bringing the prize up, or finding it gone; and the prize sold to the head.
  private static end(r: Rivals, power: Power, at: { layout: DeepLayout; raises: boolean }): string[] {
    const q = this.q, { id, head, keeper, heart, room, seat, values } = r, levels = at.layout.levels;
    const due = `stage(${id}) >= ${levels.length + 1} and not won(${id}) and not foiled(${id})`
      + ` and not (at(party, ?p) and deepLevelOf(?p, ${levels.at(-1)!.id}))`;
    const entry = levels.at(-1)!.rooms[0]!.id, packs = `${id}_packs`, gear = power.gear.map((g, n) => ({ g, n }));
    const fate = this.fill(`${this.upper(power.band)} went down into {name}, and few of them came back.`, this.heard(r));
    const beaten = this.fill(`${this.upper(power.band)} came back from {name} with nothing: someone had been down to it`
      + ' before them, and they are telling everyone so.', this.heard(r));
    return [`  Place ${packs} "where they keep their packs" is room within ${levels.at(-1)!.id}.`,
      ...gear.map(({ g, n }) => `  Item ${id}_gear${n} ${q(this.called(g))} is ${g} at ${packs}.`),
      `  Relation ${id}_broken(). Relation ${id}_bought(). Entity ${id}_fate: fact ${q(fate)}.`,
      `  Rule ${id}_fell when ${due} and able(${keeper}) { Assert foiled(${id}). Assert ${id}_broken().`
        + ` Increase pays(${head}, ${r.kind}) by ${r.raised - r.price}.`
        + gear.map(({ n }) => ` Retract at(${id}_gear${n}, ${packs}). Assert at(${id}_gear${n}, ${entry}).`).join('') + ' }',
      `  Observe ${id}_fallen at ${entry} when ${id}_broken() ${q(this.fill(power.fell, r))}.`,
      `  Observe ${id}_fate_heard near ${values.keeper} as hearsay when ${id}_broken() and not knows(party, ${id}_fate)`
        + ` ${q(this.says(fate, values.keeper!))} teaches ${id}_fate.`,
      `  Topic ${id}_fate_told with ${head} ${q(`Ask {${head}} what became of ${this.fill(power.band, r)}`)}`
        + ` when ${id}_broken() once {`,
      `    Says ${q(this.fill(power.fate, { ...r, price: r.raised }))}.`
        + ` On discuss { Assert knows(actor, ${id}_fate). Assert knows(actor, ${r.values.w!}_named). }`, '  }',
      `  Rule ${id}_won when ${due} and not able(${keeper}) and at(${heart}, ${room}) { Retract at(${heart}, ${room}).`
        + ` Assert at(${heart}, ${seat.id}_green). Assert keeps(${head}, ${heart}). Assert won(${id}).`
        + `${at.raises ? ` Assert ${at.layout.site}_raised().` : ''} }`,
      `  Observe ${id}_won_seen at ${seat.id}_green when won(${id}) and keeps(${head}, ${heart}) and not ${id}_bought()`
        + ` ${q(this.fill(power.won, r))}.`,
      // Beaten to it, they come back with nothing and are heard of so: the second cold play's five diggers went up and
      // were never heard of again once the company had the crown (CL-09).
      `  Rule ${id}_empty when ${due} and not able(${keeper}) and not at(${heart}, ${room}) { Assert foiled(${id}).`
        + ` Assert ${id}_beaten(). }`,
      `  Relation ${id}_beaten(). Entity ${id}_back: fact ${q(beaten)}.`,
      `  Observe ${id}_back_heard near ${values.keeper} as hearsay when ${id}_beaten() and not knows(party, ${id}_back)`
        + ` ${q(this.says(beaten, values.keeper!))} teaches ${id}_back.`,
      `  Rule ${id}_sold at ${seat.id}_green when keeps(${head}, ${heart}) and not won(${id}) says ${q(this.fill(power.sold, r))}`
        + ` { Assert won(${id}). Assert ${id}_bought(). }`];
  }
  // News heard where the keeper keeps travellers is theirs to tell, in their voice, as the notes file it (OR-254: the
  // talk of the diggers had been told by nobody, and noted as told by the innkeeper).
  private static says(text: string, keeper: string): string { return `'${text.replace(/[.!]$/, '')},' says {${keeper}}.`; }
  // The settlement of the power's kind nearest the site, or else the settlement nearest it.
  private static seat(region: Region, site: Site, power: Power): Settlement {
    const land = RegionGeography.atlas(region).land;
    const theirs = region.settlements.filter((_, i) => power.founding.includes(Foundings.of(region, i).kind));
    return [...theirs.length ? theirs : region.settlements]
      .sort((a, b) => Terrain.distance(land, a.cell!, site.cell!) - Terrain.distance(land, b.cell!, site.cell!))[0]!;
  }
  // What is overheard of them names the site as the company knows it, not by a name it has not learned (the narration
  // audit: "the brothers, who went up to Albuslac" was talked of in a taproom where the doorway was still a doorway);
  // their head, telling it, names it.
  private static heard(r: Rivals): Rivals { return { ...r, values: { ...r.values, name: `{${r.values.w!}}` } }; }
  private static fill(text: string, r: Rivals): string {
    const words: Record<string, string> = { head: `{${r.head}}`, name: r.values.name!, seat: r.seat.name,
      kingdom: r.values.kingdom!, prize: r.prize, price: String(r.price) };
    return text.replace(/\{(\w+)\}/g, (all, key: string) => words[key] ?? all);
  }
  private static round(n: number): number { return Math.round(n / 10) * 10; }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  private static called(id: string): string {
    return ItemNames.called(Canon.items[id]?.name ?? id.replace(/_/g, ' '));
  }
}
