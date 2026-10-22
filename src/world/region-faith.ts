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
    return { deity, domain, form, name, title: this.title(deity, domain, rng),
      look: this.pick(t.shrineLook.groups.default!, rng), seat: this.pick(t.shrineSeat.groups[form]!, rng),
      practice: this.pick(t.shrinePractice.groups[domain] ?? [''], rng),
      history: this.fill(this.pick(t.shrineHistory.groups[land ?? 'default'] ?? [''], rng), named),
      offering: rng.number('1d4+1') };
  }
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
  // The shrine as Kyr: what stands there, whose it is and what it asks, and how it looks and is kept.
  static lines(s: Settlement, cult: Cult): string[] {
    const q = JSON.stringify, altar = `${s.id}_altar`, a = /^[aeiou]/.test(cult.look) ? 'An' : 'A';
    const text = `${a} ${cult.look} ${cult.form} of ${cult.name}, ${cult.title}: ${cult.seat}. ${cult.practice} `
      + `${cult.history} Offerings of ${s.trade} lie before it.`;
    return [`  Thing ${altar} ${q(`the ${cult.form} of ${cult.name}`)} at ${s.id}_shrine is shrine { }`,
      `  Initially Assert shrineOf(${altar}, faith_${cult.domain}). Initially Set offering(${altar}) to ${cult.offering}.`,
      `  Observe ${s.id}_holy at ${s.id}_shrine when true ${q(text.replace(/\s+/g, ' ').trim())}.`];
  }
}
