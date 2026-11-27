import { Canon } from '../canon/canon';
import { parseAbility } from '../lang/parse';
import { Content } from '../content';
import type { MechanicsWording } from '../shared/mechanics-wording';
import type { Proficiencies } from '../rules/catalog-schema';

// Small pieces of handbook text, each read from a definition: qualities, proficiencies, what an ability or a trait
// does. An ability the game cannot play is named as such wherever it is mentioned.
export class HandbookText {
  static attributes(a: Partial<Record<string, number>>): string {
    const parts = Object.entries(a).filter(([, v]) => v).map(([k, v]) => `${v! > 0 ? '+' : '−'}${Math.abs(v!)} ${k}`);
    return parts.join(', ') || '—';
  }
  static proficiency(p: Proficiencies): string {
    if (p.all) { return 'all'; }
    return [p.kinds?.length ? p.kinds.join(', ') : '', p.weights?.length ? `(${p.weights.join(', ')})` : ''].filter(Boolean).join(' ') || '—';
  }
  // An ability by name, marked when the game cannot play it.
  static ability(id: string): string {
    const a = Canon.abilities[Canon.resolve('abilities', id)];
    if (!a) { return id; }
    return a.unsupported ? `${a.name} (not playable)` : a.name;
  }
  // What an executable ability does, from its typed effects.
  static mechanics(id: string, words: MechanicsWording): string | undefined {
    const runtime = Content.abilities.find(a => a.id === id);
    return runtime ? words.full(runtime) : undefined;
  }
  static trait(id: string, words: MechanicsWording): string[] {
    const t = Canon.traits[Canon.resolve('traits', id)];
    if (!t) { return []; }
    const modifiers = words.modifiers(t.modifiers ?? {});
    const perks = (t.perks ?? []).filter(p => p.environment || p.weapon || p.triggers || p.bonuses)
      .map(p => words.perk(p));
    const skills = (t.skills ?? []).map(s => Canon.skills[s]?.name.toLowerCase() ?? s);
    return [...modifiers.length ? [`${this.capital(modifiers.join(', '))}.`] : [], ...perks,
      ...skills.length ? [`Skilled in ${skills.join(' and ')}.`] : []];
  }
  // What using an item does, said from the effect it is written as ("Heal (1d4 + 1) health to ally.").
  static use(effect: string, words: MechanicsWording): string {
    let ability: ReturnType<typeof parseAbility>;
    try { ability = parseAbility('use', 'Use', effect); }
    catch { return effect.replace(/\.$/, ''); }
    return words.ability(ability).summary.replace(/\.$/, '');
  }
  static capital(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
