import srd from '../../data/sources/srd35/monsters.json';
import concordance from '../../data/sources/srd35/concordance.json';
import { Canon } from '../canon/canon';
import { Content } from '../content';
import { Effects } from '../effects';
import { Fighting } from '../rules/fighting';
import { KindDefenses } from '../kind-defenses';
import type { Defense } from '../rules/defenses';
import type { Fighter } from '../model';
import type { Grades } from './srd-spell-fidelity';

// A catalog creature (a species or a composed body: ghoul/barrow) against its Revised 3.5 SRD stat block, field by
// field, as a fighter made of it at as many levels as it has Hit Dice (one if it grows as Orsino's do): its Hit Dice
// as written; its armour class as Westernesse reads the SRD's (21 less it: AC 14 is 7); its routine of blows by their
// dice (a body's own Strength is added in play, so the SRD's bonus is not compared); its defences (reduction and what
// passes it, flat resistances, energy immunities, regeneration; spell resistance the engine has none of); its special
// attacks, as the concordance records which a conversion carries; and its saves, as Westernesse rolls them (the score
// and the level) against the SRD's three. Each exact, differs, orsino (no SRD value taken: Orsino's own), or engine
// (the SRD's needs what Westernesse lacks).
export type CreatureVerdict = 'exact' | 'differs' | 'orsino' | 'engine' | 'n/a';
interface SrdMonster {
  name: string; hitDice: string; hp: number; ac: number;
  attacks: { name: string; count: number; dice: string; bonus: number }[];
  specialAttacks: string[]; saves: Record<string, number>; reduction: { amount: number; unless: string[] }[];
  resistance: Record<string, number>; immunity: string[]; sr?: number; regeneration?: number; cr: string;
}
interface Entry { srd: string; carries?: Record<string, string>; notes?: string }
export interface Cell { verdict: CreatureVerdict; ours: string; theirs: string }
export const creatureFields = ['hitDice', 'armour', 'attacks', 'hit', 'defences', 'specials', 'saves'] as const;
export type CreatureRow = { id: string; srd: string; grades: Grades } & Record<typeof creatureFields[number], Cell>;
export class CreatureFidelity {
  static readonly monsters = srd.monsters as unknown as Record<string, SrdMonster>;
  static readonly map = concordance.creatures as unknown as Record<string, Entry>;
  static rows(): CreatureRow[] { return Object.keys(this.map).filter(id => Canon.isBody(id)).map(id => this.row(id)); }
  static readonly identities = (concordance as { identities?: Record<string, string> }).identities ?? {};
  static readonly structural = ['hitDice', 'armour'] as const;
  static readonly resolution = ['attacks', 'hit', 'defences', 'saves'] as const;
  // Faithful in structure and resolution both (play identity, its specials and a focused test, reported beside).
  static faithful(row: CreatureRow): boolean { return row.grades.structural === 'pass' && row.grades.resolution === 'pass'; }
  private static passes(row: Record<string, Cell>, keys: readonly string[]): boolean {
    return keys.every(k => ['exact', 'converted', 'n/a'].includes(row[k]!.verdict));
  }
  static row(id: string): CreatureRow {
    const entry = this.map[id]!, m = this.monsters[entry.srd]!, kind = Canon.creature(id);
    const dice = kind.statistics?.hitDice, level = dice ? Number(dice.split('d')[0]) || 1 : 1;
    const f = new Content(`srd:${id}`).creature(id, 'srd', 'goblins', level);
    const cells = {
      hitDice: dice ? this.cell(dice.replace(/\s+/g, ''), m.hitDice) : { verdict: 'orsino' as const, ours: 'grows',
        theirs: m.hitDice },
      armour: this.cell(String(Fighting.armorClass(Effects.combatant(f))), String(21 - m.ac)),
      attacks: this.cell(this.blows(f), m.attacks.flatMap(a => Array(a.count).fill(a.dice)).sort().join(' ')),
      hit: this.hit(f, m), defences: this.defences(KindDefenses.of(f), m), specials: this.specials(id, entry, m),
      saves: this.saves(f, m) };
    return { id, srd: entry.srd, ...cells, grades: { structural: this.passes(cells, this.structural) ? 'pass' : 'fail',
      resolution: this.passes(cells, this.resolution) ? 'pass' : 'fail',
      identity: this.identities[id] && this.passes(cells, ['specials']) ? 'proved' : 'unassessed' } };
  }
  // Its first blow's chance to hit the census's mark, SRD AC 15 (Westernesse 6): the SRD's by its attack bonus, a
  // natural 1 a miss and a 20 a hit; Westernesse's by the fighter's own roll (Fighting.attack's need), the same way.
  // Within a twentieth is the same chance.
  private static chance(need: number): number { return Math.min(19, Math.max(1, 21 - need)) / 20; }
  private static hit(f: Fighter, m: SrdMonster): Cell {
    const mark = { ...Effects.combatant(f), armorAc: 4, dexterity: 10, modifiers: {} };
    const need = Fighting.attack(Effects.combatant(f), mark, () => 10).need, bonus = m.attacks[0]?.bonus;
    const ours = this.chance(need), theirs = bonus === undefined ? undefined : this.chance(15 - bonus);
    if (theirs === undefined) { return { verdict: 'n/a', ours: `${Math.round(ours * 100)}%`, theirs: '' }; }
    return { verdict: Math.abs(ours - theirs) <= 0.05 ? 'exact' : 'differs', ours: `${Math.round(ours * 100)}%`,
      theirs: `${Math.round(theirs * 100)}%` };
  }
  private static cell(ours: string, theirs: string): Cell {
    return { verdict: !ours && !theirs ? 'n/a' : ours === theirs ? 'exact' : 'differs', ours, theirs };
  }
  private static blows(f: Fighter): string {
    return (f.equipment.routine ?? [f.equipment.weapon]).map(w => w.damage.replace(/[+-]\d+$/, '')).sort().join(' ');
  }
  static readonly energies: Record<string, string> = { electricity: 'lightning', sonic: 'sonic' };
  private static energy(k: string): string { return this.energies[k] ?? k; }
  // Its defences as one line each side: reduction n/what passes, resistance kind n, immunity kind, regeneration n.
  private static defences(ours: Defense[], m: SrdMonster): Cell {
    const damage = Canon.rules.damageTypes;
    const theirs = [...m.reduction.map(r => `reduction ${r.amount}/${r.unless.map(u => u.replace(' ', '_')).sort()
      .join('+') || '-'}`), ...Object.entries(m.resistance).map(([k, n]) => `resistance ${this.energy(k)} ${n}`),
      ...m.immunity.map(k => this.energy(k)).filter(k => damage.includes(k)).map(k => `immunity ${k}`),
      ...m.regeneration ? [`regeneration ${m.regeneration}`] : []].sort();
    const said = ours.flatMap(d => d.kind === 'reduction' ? [`reduction ${d.amount}/${[...d.unless ?? []].sort().join('+') || '-'}`]
      : d.kind === 'resistance' ? d.to.map(t => d.mode === 'flat' ? `resistance ${String(t)} ${d.amount}` : `fraction ${String(t)} ${d.amount}`)
        : d.kind === 'immunity' ? d.to.map(t => `immunity ${String(t)}`) : [`regeneration ${d.amount}`])
      .filter(x => !/resistance electric /.test(x) || !theirs.includes(x.replace('electric', 'lightning'))).sort();
    const cell = this.cell([...new Set(said)].join(', '), theirs.join(', '));
    return m.sr && cell.verdict !== 'differs' ? { ...cell, verdict: 'engine', theirs: `${cell.theirs} SR ${m.sr}` } : cell;
  }
  // Its special attacks: each the SRD gives it carried by the conversion (the concordance says how), and no ability of
  // Orsino's beside them.
  private static specials(id: string, entry: Entry, m: SrdMonster): Cell {
    const carried = Object.keys(entry.carries ?? {}), theirs = m.specialAttacks.map(s => s.toLowerCase());
    const own = (Canon.creature(id).abilities ?? []).filter(a => !Object.values(entry.carries ?? {}).includes(a));
    const ours = [...carried.map(s => s.toLowerCase()), ...own.map(a => `orsino:${a}`)].sort().join(', ');
    if (!carried.length && own.length) { return { verdict: 'orsino', ours, theirs: theirs.join(', ') }; }
    return this.cell(ours, [...theirs].sort().join(', '));
  }
  // Westernesse's save of each name: d20 + the score's modifier + the level + its bonuses, read as the SRD's bonus.
  private static saves(f: Fighter, m: SrdMonster): Cell {
    const scores = Effects.scores(f as never) as Record<string, number>, kinds = ['fortitude', 'reflex', 'will'];
    const ours = kinds.map(k => Fighting.statMod(scores[Canon.rules.saveKinds[k]!]!) + f.level
      + Effects.saveModifier(f, k));
    return this.cell(ours.map(n => (n >= 0 ? `+${n}` : String(n))).join('/'),
      kinds.map(k => m.saves[k]!).map(n => (n >= 0 ? `+${n}` : String(n))).join('/'));
  }
}
