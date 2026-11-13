import srd from '../../data/sources/srd35/spells.json';
import concordance from '../../data/sources/srd35/concordance.json';
import { Amounts } from '../rules/amounts';
import { Canon } from '../canon/canon';
import type { Ability } from '../canon/schema';
import type { Effect } from '../lang/parse';
import { SpellResolution } from './srd-spell-resolution';

// A catalog spell against its Revised 3.5 SRD entry (data/sources/srd35, the concordance names which), field by
// field: its level on its tradition's list, its school, its harm's dice (their mean at caster levels 1, 5, 10 and 20)
// and kind, its save (the score it is made with, and what a success saves) and that save's difficulty, how it is
// aimed (an attack, a touch, a ray, or none), what it falls on (itself, one, several, a cone, a burst, a line), and how
// long what it lays lasts. Each field is exact, converted (by a rule it names), differs (both values said), or n/a.
// The fields are graded three ways (the reviewer's atlas): structural (level and school), resolution (what is rolled
// and what it does), and play identity (the behaviours that make it recognisable, proved by a focused test the
// concordance names; unassessed until one does).
export type Verdict = 'exact' | 'converted' | 'differs' | 'n/a';
export interface SrdSpell {
  name: string; school: string; descriptors: string[]; levels: Record<string, number>; range: string; targets: string;
  duration: string; save: string; sr: string; attack?: string;
  damage?: { dice: string; per?: string; max?: string; type: string; plus?: string };
  heal?: { dice: string; plus?: string; max?: string };
}
export interface Field { verdict: Verdict; ours: string; theirs: string }
export const spellFields = ['level', 'school', 'dice', 'type', 'save', 'dc', 'attack', 'target', 'duration'] as const;
export type Grade = 'pass' | 'fail' | 'unsupported' | 'unassessed' | 'proved';
export interface Grades { structural: Grade; resolution: Grade; identity: Grade }
export type SpellRow = { id: string; srd: string; grades: Grades } & Record<typeof spellFields[number], Field>;
export class SpellFidelity {
  static readonly spells = srd.spells as unknown as Record<string, SrdSpell>;
  static readonly map = concordance.spells as unknown as Record<string, string>;
  static readonly identities = (concordance as { identities?: Record<string, string> }).identities ?? {};
  // A field's departure from the SRD by a rule the concordance names: read as converted, the rule said, not differs.
  static readonly conversions = (concordance as { conversions?: Record<string, Record<string, string>> })
    .conversions ?? {};
  static readonly structural = ['level', 'school'] as const;
  static readonly resolution = ['dice', 'type', 'save', 'dc', 'attack', 'target', 'duration'] as const;
  static readonly levels = [1, 5, 10, 20];
  static rows(): SpellRow[] {
    return Object.entries(this.map).filter(([id]) => Canon.abilities[id]?.spell).map(([id, key]) => this.row(id, key));
  }
  static row(id: string, key: string, ability: Ability = Canon.abilities[id]!): SpellRow {
    const s = this.spells[key]!, level = this.listed(s, ability.spell!.tradition) ?? 1, r = SpellResolution;
    const fields = { level: this.level(ability, s), school: this.same(ability.spell!.school ?? '', s.school),
      dice: this.dice(ability, s), type: this.type(ability, s), save: this.save(ability, s),
      dc: this.measured(r.dc(ability, s, level)), attack: this.measured(r.attack(ability, s)),
      target: this.measured(r.target(id, ability, s)), duration: this.same(this.lasts(ability), this.theirs(s)) };
    for (const [field, rule] of Object.entries(this.conversions[id] ?? {})) {
      const f = fields[field as keyof typeof fields];
      if (f?.verdict === 'differs') { fields[field as keyof typeof fields] = { verdict: 'converted', ours: rule, theirs: f.theirs }; }
    }
    return { id, srd: key, ...fields, grades: this.graded(id, ability, fields) };
  }
  private static measured(m: { ours: string; theirs: string }): Field { return this.same(m.ours, m.theirs); }
  private static passes(f: Record<string, Field>, keys: readonly string[]): boolean {
    return keys.every(k => f[k]!.verdict !== 'differs');
  }
  // Its three grades: a grade passes when none of its fields differs; resolution is unsupported where the catalog
  // says Westernesse cannot execute it; play identity is proved only by a focused test the concordance names.
  private static graded(id: string, a: Ability, f: Record<typeof spellFields[number], Field>): Grades {
    return { structural: this.passes(f, this.structural) ? 'pass' : 'fail',
      resolution: a.unsupported ? 'unsupported' : this.passes(f, this.resolution) ? 'pass' : 'fail',
      identity: this.identities[id] ? 'proved' : 'unassessed' };
  }
  // Faithful in structure and resolution both (play identity is reported beside, proved one entry at a time).
  static faithful(row: SpellRow): boolean { return row.grades.structural === 'pass' && row.grades.resolution === 'pass'; }
  private static same(ours: string, theirs: string): Field {
    return { verdict: !ours && !theirs ? 'n/a' : ours === theirs ? 'exact' : 'differs', ours, theirs };
  }
  // Its level on the list of its tradition: an arcane spell the sorcerer's and wizard's, a divine one the cleric's,
  // else the druid's, else the lowest it has.
  static listed(s: SrdSpell, tradition?: string): number | undefined {
    const lists = tradition === 'arcane' ? ['Sor/Wiz'] : ['Clr', 'Drd'];
    return lists.map(l => s.levels[l]).find(n => n !== undefined) ?? Math.min(...Object.values(s.levels));
  }
  private static level(a: Ability, s: SrdSpell): Field {
    return this.same(String(a.spell!.level), String(this.listed(s, a.spell!.tradition)));
  }
  private static harm(a: Ability): Effect | undefined {
    return a.effects?.find(e => ['damage', 'drain'].includes(e.kind)) ?? a.effects?.find(e => e.kind === 'heal');
  }
  // The mean of its harm (or healing) at each caster level, as the catalog's expression and as the SRD writes it.
  private static dice(a: Ability, s: SrdSpell): Field {
    const e = this.harm(a), theirs = s.damage ?? s.heal;
    const ours = e && 'amount' in e ? this.levels.map(l => this.mean(e, l)).join('/') : '';
    return this.same(ours, theirs ? this.levels.map(l => this.srdMean(theirs, l)).join('/') : '');
  }
  private static mean(e: Effect, level: number): string {
    const amount = (e as { amount: { kind: string; expression?: string; value?: number } }).amount;
    const text = amount.kind === 'literal' ? String(amount.value) : amount.expression!;
    try {
      return String(Amounts.mean(text, { level, castingLevel: level, bonusSpellDC: 0, hitDice: level, strength: 10,
        dexterity: 10,
        constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }));
    } catch { return text; }
  }
  static srdMean(d: { dice: string; per?: string; max?: string; plus?: string }, level: number): string {
    const [count, sides] = d.dice.split(/[d+]/).map(Number) as [number, number];
    const flat = Number(d.dice.split('+')[1] ?? 0), die = (sides + 1) / 2;
    const most = d.max ? Number(d.max.split('d')[0]) : Infinity;
    const times = d.per === 'level' ? Math.min(level, most) : d.per === 'two levels' ? Math.min(Math.floor(level / 2), most) : 1;
    const cap = Number(d.plus?.match(/(\d+)$/)?.[1] ?? Infinity), plus = d.plus ? Math.min(level, cap) : 0;
    return String(count * die * times + flat + plus);
  }
  static readonly energies: Record<string, string[]> = { fire: ['fire'], cold: ['cold'], acid: ['acid'],
    electricity: ['lightning', 'electric'], sonic: ['sonic', 'thunder'], force: ['force'], negative: ['necrotic'],
    positive: ['radiant'] };
  private static type(a: Ability, s: SrdSpell): Field {
    const e = this.harm(a), ours = e && 'damageType' in e ? String(e.damageType) : '';
    const theirs = s.damage && s.damage.type !== 'untyped' ? s.damage.type : '';
    if (!theirs) { return { verdict: 'n/a', ours, theirs: s.damage ? 'untyped' : '' }; }
    return { verdict: this.energies[theirs]?.includes(ours) ? 'exact' : 'differs', ours, theirs };
  }
  // What it is saved with (the score, and whether a success halves or negates), the SRD's Fortitude, Reflex and Will
  // read as the scores the catalog's saves of those names use. A save named for what it guards against (paralysis,
  // sleep, charm, fear: what an immunity reads) keeps its name: converted, if a success does what the SRD's does.
  private static save(a: Ability, s: SrdSpell): Field {
    const m = s.save.match(/^(Fortitude|Reflex|Will) (half|negates|partial)/i);
    const outcome = m && (m[2] === 'half' ? 'half' : 'negates');
    const theirs = m ? `${Canon.rules.saveKinds[m[1]!.toLowerCase()]} ${outcome}` : '';
    const effect = a.effects?.find(e => 'save' in e && e.save) as { save?: { kind: string; success?: string } } | undefined;
    const kind = a.resist?.kind ?? effect?.save?.kind, half = a.effects?.some(e => 'onResist' in e && e.onResist === 'half')
      || effect?.save?.success === 'half';
    const field = this.same(kind ? `${Canon.rules.saveKinds[kind]} ${half ? 'half' : 'negates'}` : '', theirs);
    const named = kind && !a.resist && !SpellFidelity.plain.includes(kind);
    return named && field.verdict === 'differs' && outcome === (half ? 'half' : 'negates')
      ? { verdict: 'converted', ours: `${kind} ${outcome}`, theirs } : field;
  }
  static readonly plain = ['fortitude', 'reflex', 'will', 'magic'];
  // How long what it lays lasts: at once, a number of rounds (at caster level 5), or past the fight.
  private static lasts(a: Ability): string {
    const laid = a.effects?.find(e => e.kind === 'apply') as { duration?: number | string } | undefined;
    if (!laid) { return 'instant'; }
    return typeof laid.duration === 'number' && laid.duration < 20 ? `${laid.duration} rounds` : 'long';
  }
  private static theirs(s: SrdSpell): string {
    const d = s.duration.toLowerCase();
    if (d.startsWith('instantaneous')) { return 'instant'; }
    const rounds = d.match(/^(\d+) rounds?(\/level)?/);
    return rounds ? `${Number(rounds[1]) * (rounds[2] ? 5 : 1)} rounds` : 'long';
  }
}
