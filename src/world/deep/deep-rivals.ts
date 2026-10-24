import { Canon } from '../../canon/canon';
import { ItemNames } from '../../item-names';
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
  won: string; sold: string;
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
  static lines(region: Region, site: Site,
    at: { layout: DeepLayout; purpose: DeepPurpose; values: Record<string, string> }): string[] {
    const { layout, purpose, values } = at, power = this.table[values.kingdomkind!];
    if (!power) { return []; }
    const bottom = layout.levels.at(-1)!.rooms, room = (bottom.find(r => r.role === 'heart') ?? bottom.at(-1)!).id;
    const price = this.round((purpose.objective.worth ?? 2000) * power.share);
    const r: Rivals = { id: `${site.id}_rivals`, head: `${site.id}_head`, seat: this.seat(region, site, power),
      keeper: `${layout.site}_keeper`, heart: `${layout.site}_heart`, room, kind: purpose.objective.kind, price,
      raised: this.round(price * 1.5), values, prize: purpose.objective.item };
    return [...this.head(r, power, purpose), ...this.delving(r, power, layout),
      ...this.end(r, power, { layout, raises: !!(purpose.objective.goal && purpose.objective.raised) })];
  }
  // The head, at the settlement's heart, with the coin to pay for the prize: what they want, and an advance. Of the
  // settlement's own people, and of the power's calling if that people has it (an elf is no cleric), else their own.
  private static head(r: Rivals, power: Power, purpose: DeepPurpose): string[] {
    const q = this.q, { id, head, seat, values } = r, w = values.w!, folk = seat.folk ?? 'human';
    const calling = power.calling && Canon.ancestries[folk]?.classes.includes(power.calling) ? power.calling : '';
    const story = purpose.objective.goal ? ` Assert knows(actor, ${w}_story).` : '';
    return [`  Entity ${id}: ambition ${q(this.fill(power.band, r))}.`,
      `  Person ${head} ${q(power.office)} at ${seat.id}_green { Role ${q(this.fill(power.role, r))}.`
        + ` Ancestry ${folk}.${calling ? ` Calling ${calling}.` : ''} Peaceable.`
        + ` Manner ${power.manner}. }`,
      `  Initially Assert pursues(${head}, ${id}). Initially Set stageDue(${id}) to ${this.first}.`
        + ` Initially Set pace(${id}) to ${this.pace}.`,
      `  Initially Set quantity(${head}, gold) to ${r.raised + 100}. Initially Set pays(${head}, ${r.kind}) to ${r.price}.`,
      `  Entity ${id}_offer: fact ${q(`${this.upper(power.office)} at ${seat.name} wants ${r.prize}, and will pay for it.`)}.`,
      `  Topic ${id}_asked with ${head} ${q(`Ask {${head}} about ${purpose.hook.topic}`)} when true once {`,
      `    Says ${q(this.fill(power.asked, r))}.`,
      `    On discuss { Assert knows(actor, ${id}_offer). Assert knows(actor, ${w}_named). Assert knows(actor, ${w}_found).${story} }`,
      '  }',
      `  Topic ${id}_advance with ${head} ${q(`Ask {${head}} for something to go down with`)} when knows(actor, ${id}_offer)`
        + ` and not won(${id}) once {`,
      `    Says ${q(this.fill(power.advanced, r))}.`,
      `    On discuss { Increase quantity(actor, gold) by ${power.advance}. Decrease quantity(${head}, gold) by ${power.advance}.`
        + ` Decrease pays(${head}, ${r.kind}) by ${power.advance}. }`, '  }'];
  }
  // Their setting out, as the talk near the innkeeper has it that day, and their mark on every level above the last.
  private static delving(r: Rivals, power: Power, layout: DeepLayout): string[] {
    const q = this.q, { id, values } = r, out = this.fill(power.out, r);
    return [`  Entity ${id}_out: fact ${q(out)}.`,
      `  Observe ${id}_out_told near ${values.keeper} when stage(${id}) == 1 and not knows(party, ${id}_out) ${q(out)}`
        + ` teaches ${id}_out.`,
      ...layout.levels.slice(0, -1).map((level, i) => `  Observe ${id}_trace${i} at ${level.rooms[0]!.id}`
        + ` when stage(${id}) >= ${i + 2} ${q(this.fill(power.trace, r))}.`)];
  }
  // At the bottom: broken by the keeper, bringing the prize up, or finding it gone; and the prize sold to the head.
  private static end(r: Rivals, power: Power, at: { layout: DeepLayout; raises: boolean }): string[] {
    const q = this.q, { id, head, keeper, heart, room, seat, values } = r, levels = at.layout.levels;
    const due = `stage(${id}) >= ${levels.length + 1} and not won(${id}) and not foiled(${id})`
      + ` and not (at(party, ?p) and deepLevelOf(?p, ${levels.at(-1)!.id}))`;
    const entry = levels.at(-1)!.rooms[0]!.id, packs = `${id}_packs`, gear = power.gear.map((g, n) => ({ g, n }));
    const fate = this.fill(`${this.upper(power.band)} went down into {name}, and few of them came back.`, r);
    return [`  Place ${packs} "where they keep their packs" is room within ${levels.at(-1)!.id}.`,
      ...gear.map(({ g, n }) => `  Item ${id}_gear${n} ${q(this.called(g))} is ${g} at ${packs}.`),
      `  Relation ${id}_broken(). Relation ${id}_bought(). Entity ${id}_fate: fact ${q(fate)}.`,
      `  Rule ${id}_fell when ${due} and able(${keeper}) { Assert foiled(${id}). Assert ${id}_broken().`
        + ` Increase pays(${head}, ${r.kind}) by ${r.raised - r.price}.`
        + gear.map(({ n }) => ` Retract at(${id}_gear${n}, ${packs}). Assert at(${id}_gear${n}, ${entry}).`).join('') + ' }',
      `  Observe ${id}_fallen at ${entry} when ${id}_broken() ${q(this.fill(power.fell, r))}.`,
      `  Observe ${id}_fate_heard near ${values.keeper} when ${id}_broken() and not knows(party, ${id}_fate) ${q(fate)}`
        + ` teaches ${id}_fate.`,
      `  Topic ${id}_fate_told with ${head} ${q(`Ask {${head}} what became of ${this.fill(power.band, r)}`)}`
        + ` when ${id}_broken() once {`,
      `    Says ${q(this.fill(power.fate, { ...r, price: r.raised }))}. On discuss { Assert knows(actor, ${id}_fate). }`, '  }',
      `  Rule ${id}_won when ${due} and not able(${keeper}) and at(${heart}, ${room}) { Retract at(${heart}, ${room}).`
        + ` Assert at(${heart}, ${seat.id}_green). Assert keeps(${head}, ${heart}). Assert won(${id}).`
        + `${at.raises ? ` Assert ${at.layout.site}_raised().` : ''} }`,
      `  Observe ${id}_won_seen at ${seat.id}_green when won(${id}) and keeps(${head}, ${heart}) and not ${id}_bought()`
        + ` ${q(this.fill(power.won, r))}.`,
      `  Rule ${id}_empty when ${due} and not able(${keeper}) and not at(${heart}, ${room}) { Assert foiled(${id}). }`,
      `  Rule ${id}_sold at ${seat.id}_green when keeps(${head}, ${heart}) and not won(${id}) says ${q(this.fill(power.sold, r))}`
        + ` { Assert won(${id}). Assert ${id}_bought(). }`];
  }
  // The settlement of the power's kind nearest the site, or else the settlement nearest it.
  private static seat(region: Region, site: Site, power: Power): Settlement {
    const land = RegionGeography.atlas(region).land;
    const theirs = region.settlements.filter((_, i) => power.founding.includes(Foundings.of(region, i).kind));
    return [...theirs.length ? theirs : region.settlements]
      .sort((a, b) => Terrain.distance(land, a.cell!, site.cell!) - Terrain.distance(land, b.cell!, site.cell!))[0]!;
  }
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
