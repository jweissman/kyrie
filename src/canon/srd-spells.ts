import { Amounts } from '../rules/amounts';
import type { Ability } from './schema';
import type { Effect } from '../lang/parse';

// The catalog's spells brought to the Revised 3.5 SRD (data/catalog/srd-spells.json), laid over the generated records
// as the canon loads, never written into them: each spell its SRD level on its tradition's list and its school; its
// harm (the first damage, drain or healing it does) the SRD's dice, a die a caster level written roll(min(#level, 10),
// 6); that harm's kind; and the save a target makes, its kind and what a success does. A save on the spell as a whole
// (Orsino's resist) takes the SRD's kind, as does one on an effect named only by the score it is made with; one named
// for what it guards against (paralysis, sleep, charm, fear) keeps its name, for the immunities that read it. A spell
// the SRD gives no save loses its own.
export interface SrdSpell {
  srd35: string; level: number; school: string; harm?: string; damageType?: string; save?: string; notes?: string;
}
export class SrdSpells {
  static readonly fields = ['srd35', 'level', 'school', 'harm', 'damageType', 'save', 'notes'];
  static readonly plain = ['fortitude', 'reflex', 'will', 'magic'];
  // The difficulty a spell's save is made against where the SRD gives one and Orsino's gave none: Orsino's own.
  static readonly difficulty = '15 + #bonusSpellDC';
  static convert(abilities: Record<string, Ability>, conversions: Record<string, SrdSpell>): Record<string, Ability> {
    const out = { ...abilities };
    for (const [id, c] of Object.entries(conversions)) {
      if (out[id]?.spell) { out[id] = this.converted(out[id], c); }
    }
    return out;
  }
  static converted(a: Ability, c: SrdSpell): Ability {
    const effects = a.effects?.map(e => ({ ...e })) as Effect[] | undefined;
    const harmed = effects?.find(e => ['damage', 'drain'].includes(e.kind)) ?? effects?.find(e => e.kind === 'heal');
    if (harmed && c.harm && 'amount' in harmed) { (harmed as { amount: unknown }).amount = Amounts.of(c.harm); }
    if (harmed && c.damageType && harmed.kind !== 'heal') { (harmed as { damageType: string }).damageType = c.damageType; }
    const saved = effects && c.save ? this.saved(a, effects, c.save) : { effects, resist: a.resist };
    const rest = { ...a };
    delete rest.resist;
    return { ...rest, spell: { ...a.spell!, level: c.level, school: c.school },
      ...saved.effects ? { effects: saved.effects } : {}, ...saved.resist ? { resist: saved.resist } : {},
      source: { ...a.source, srd35: c.srd35, conversion: 'srd35-westernesse-v1', fidelity: 'adapted',
        ...c.notes ? { notes: c.notes } : {} } };
  }
  // The save as the SRD writes it ("reflex half", "will negates", "none"), on the spell and on its effects.
  private static saved(a: Ability, effects: Effect[], save: string): { effects: Effect[]; resist?: Ability['resist'] } {
    const harms = effects.filter(e => ['damage', 'drain'].includes(e.kind));
    if (save === 'none') {
      for (const e of harms) { delete e.onResist; }
      return { effects };
    }
    const [kind, outcome] = save.split(' ') as [string, 'half' | 'negates'];
    for (const e of harms) { e.onResist = outcome === 'half' ? 'half' : 'negate'; }
    for (const e of effects) {
      if (e.save?.kind && this.plain.includes(e.save.kind)) { e.save = { ...e.save, kind }; }
    }
    const resist = a.resist ? { ...a.resist, kind } : harms.length ? { kind, difficulty: this.difficulty } : undefined;
    return { effects, ...resist ? { resist } : {} };
  }
  static problems(conversions: Record<string, SrdSpell>, abilities: Record<string, Ability>): string[] {
    return Object.entries(conversions).flatMap(([id, c]) => [
      ...Object.keys(c).filter(k => !this.fields.includes(k)).map(k => `srd spell ${id}: unknown field ${k}`),
      ...!abilities[id]?.spell ? [`srd spell ${id}: no such spell`] : [],
      ...!/^spell:[a-z0-9-]+$/.test(c.srd35) || c.level < 0 || c.level > 9 ? [`srd spell ${id}: bad srd35 or level`] : [],
      ...c.harm && !Amounts.valid(c.harm) ? [`srd spell ${id}: harm ${c.harm} is not an amount`] : [],
      ...c.save && !/^(none|(fortitude|reflex|will) (half|negates))$/.test(c.save) ? [`srd spell ${id}: save ${c.save}`] : []]);
  }
}
