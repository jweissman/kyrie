import { Canon } from '../canon/canon';
import { parseAbility } from '../lang/parse';
import { Content } from '../content';
import { MechanicsText } from '../presentation/mechanics-text';
import { PerkText } from '../presentation/perk-text';
import type { Proficiencies } from '../canon/schema';

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
  static mechanics(id: string): string | undefined {
    const runtime = Content.abilities.find(a => a.id === id);
    return runtime ? MechanicsText.full(runtime) : undefined;
  }
  static trait(id: string): string[] {
    const t = Canon.traits[Canon.resolve('traits', id)];
    if (!t) { return []; }
    const modifiers = MechanicsText.modifiers(t.modifiers ?? {});
    const perks = (t.perks ?? []).filter(p => p.environment || p.weapon || p.triggers || p.bonuses)
      .map(p => PerkText.of(p));
    return [...modifiers.length ? [`${this.capital(modifiers.join(', '))}.`] : [], ...perks];
  }
  // What using an item does, said from the effect it is written as ("Heal (1d4 + 1) health to ally.").
  static use(effect: string): string {
    try { return MechanicsText.ability(parseAbility('use', 'Use', effect)).summary.replace(/\.$/, ''); }
    catch { return effect.replace(/\.$/, ''); }
  }
  static capital(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
