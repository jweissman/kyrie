import { Canon } from '../canon/canon';
import { Expressions } from '../expressions';
import { GenerationSetting } from '../generation-setting';
import { RegionGeography } from './region-geography';
import type { Region, Settlement } from './region-writer';

// A settlement's shrine: whose it is, what it is, how it is kept and how it came to be.
export interface Cult {
  deity: string; name: string; domain: string; title: string; form: string; look: string; seat: string;
  practice: string; history: string; offering: number;
}
type Groups = { groups: Record<string, string[]> };
interface Tables {
  shrineForm: Groups; shrineLook: Groups; shrineSeat: Groups; shrinePractice: Groups; shrineHistory: Groups;
  localCult: { groups: Record<string, { _key: string; domain: string }[]> };
}

// The faith of a generated region, after Orsino's deity and shrine templates. The first settlement keeps the region's
// god; another may keep the god of the land it stands by, as people keep the gods of the places they live beside (the
// river's at a ford, the storm god's under a pass, the wood's). Each shrine has Orsino's form (altar, statue,
// fountain, obelisk, mural, relic) and look (ancient, overgrown, humble…), a practice of its faith, a history of the
// place, and Orsino's offering of a few coins for the god's favour.
export class RegionFaith {
  static get tables(): Tables { return GenerationSetting.tables as unknown as Tables; }
  static cults(region: Region): Cult[] {
    return region.settlements.map((s, i) => this.cult(region, s, i));
  }
  private static cult(region: Region, s: Settlement, i: number): Cult {
    const rng = new Expressions(`${region.name}:${s.id}:faith`), land = this.land(region, i);
    const local = i > 0 && land ? this.tables.localCult.groups[land] : undefined;
    const pick = local && rng.number('1d100') <= 60 ? this.pick(local, rng) : undefined;
    const deity = pick?._key ?? this.id(region.deity), domain = pick?.domain ?? region.domain;
    const form = this.pick(this.tables.shrineForm.groups[domain] ?? this.tables.shrineForm.groups.default!, rng);
    const named = { land: this.landName(region, land), town: s.name,
      country: RegionGeography.country[region.terrain] ?? 'country' };
    const t = this.tables, name = Canon.deities[deity]?.name ?? region.deity;
    const look = this.pick(t.shrineLook.groups.default!, rng), seat = this.pick(t.shrineSeat.groups[form]!, rng);
    return { deity, domain, form, name, title: this.title(deity, domain, rng), look, seat: this.bare(seat),
      practice: this.pick(t.shrinePractice.groups[domain] ?? [''], rng),
      history: this.fill(this.bare(this.pick(this.agreeing(t.shrineHistory.groups[land ?? 'default'] ?? [''], seat), rng)), named),
      offering: rng.number('1d4+1') };
  }
  // A seat says what it is made of ([stone], [wood], [water]…); a history that assumes what it is made of ("cut from
  // the first tree felled") is told only of a seat made so. The rest are told of any.
  private static agreeing(histories: string[], seat: string): string[] {
    const made = this.made(seat), fit = histories.filter(h => !this.made(h) || this.made(h) === made);
    return fit.length ? fit : this.tables.shrineHistory.groups.default!.filter(h => !h.startsWith('['));
  }
  private static made(text: string): string | undefined { return /^\[(\w+)\]/.exec(text)?.[1]; }
  private static bare(text: string): string { return text.replace(/^\[\w+\]/, ''); }
  // The land a settlement stands by, if its roads cross any: the river, the pass, the wood, the mere.
  private static land(region: Region, i: number): string | undefined {
    const id = region.settlements[i]?.id;
    return RegionGeography.roads(region).find(r => r.form && (r.from.id === id || r.to.id === id))?.form?.form;
  }
  private static landName(region: Region, form?: string): string {
    const land = region.land?.find(l => l.form === form);
    return land ? (['river', 'pass'].includes(land.form) ? `the ${land.name}` : land.name) : '';
  }
  private static fill(text: string, at: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (whole, key: string) => at[key] || whole);
  }
  // The catalog's id for a god's name: "Gwyn ap Nudd" is gwyn_ap_nudd.
  private static id(name: string): string { return name.toLowerCase().replaceAll(' ', '_'); }
  // How Orsino titles a god: "Belenus, God of Light"; a god may be Lord, a goddess is Goddess.
  private static title(deity: string, domain: string, rng: Expressions): string {
    const female = Canon.deities[deity]?.gender === 'female', word = female ? 'Goddess' : this.pick(['God', 'Lord'], rng);
    return `${word} of ${Canon.domains[domain]?.name ?? domain}`;
  }
  private static pick<T>(list: T[], rng: Expressions): T { return list[rng.number(`1d${list.length}`) - 1]!; }
  // The shrine as Kyr: what stands there, whose it is and what it asks, and how it looks and is kept; in a shrine of
  // its own, or by the track where a hamlet keeps its god (a wayside shrine, told in a line).
  static lines(s: Settlement, cult: Cult, at = `${s.id}_shrine`, wayside?: string): string[] {
    const q = JSON.stringify, altar = `${s.id}_altar`, a = /^[aeiou]/.test(cult.look) ? 'An' : 'A';
    const text = wayside ? `By the track stands ${wayside}: ${/^[aeiou]/.test(cult.look) ? 'an' : 'a'} ${cult.look} ${cult.form}, small and weathered, with offerings of ${s.trade} before it.`
      : `${a} ${cult.look} ${cult.form} of ${cult.name}, ${cult.title}: ${cult.seat}. ${cult.practice} `
        + `${cult.history} Offerings of ${s.trade} lie before it.`;
    return [`  Thing ${altar} ${q(wayside ?? `the ${cult.form} of ${cult.name}`)} at ${at} is shrine { }`,
      `  Initially Assert shrineOf(${altar}, faith_${cult.domain}). Initially Set offering(${altar}) to ${cult.offering}.`,
      `  Observe ${s.id}_holy at ${at} when true ${q(text.replace(/\s+/g, ' ').trim())}.`];
  }
}
