import { Amounts } from '../rules/amounts';
import { CanonRuntime } from '../canon/canon-runtime';
import type { Ability } from '../canon/schema';

// The measures of a spell's resolution beside its harm and save (proof-slices.md, step 1: the census had rewarded a
// numerically tidy but behaviourally false migration): the save's difficulty, how it is aimed, and what it falls on.
// Read from resolved canon (CanonRuntime's area, the merged record), against the SRD's entry.
interface Srd { levels: Record<string, number>; range: string; targets: string; save: string; attack?: string }
interface Measure { ours: string; theirs: string }
export class SpellResolution {
  // The census's caster: the first level that casts a spell of its level (Westernesse's ⌈level / 2⌉ and the SRD's
  // wizard alike), its key score 16; the SRD's difficulty is 10 + the spell's level + that score's modifier, 3.
  static readonly key = 16;
  static caster(level: number): Record<string, number> {
    const at = Math.max(1, 2 * level - 1);
    return { level: at, castingLevel: at, castingScore: this.key, bonusSpellDC: 0, hitDice: at, strength: 10,
      dexterity: 10, constitution: 10, intelligence: this.key, wisdom: this.key, charisma: this.key };
  }
  // The difficulty of its save, at the census's caster: Orsino's expression (15 + #bonusSpellDC, 14 + #level...)
  // as Westernesse reads it, and the SRD's 10 + level + 3; nothing where neither has a save.
  static dc(a: Ability, s: Srd, level: number): Measure {
    const effect = a.effects?.find(e => 'save' in e && e.save) as { save?: { difficulty: unknown } } | undefined;
    const said = a.resist?.difficulty ?? effect?.save?.difficulty;
    const text = typeof said === 'string' ? said : said && typeof said === 'object' ? this.text(said) : '';
    const ours = text ? this.value(text, level) : '';
    return { ours, theirs: /^(Fortitude|Reflex|Will)/i.test(s.save) ? String(10 + level + 3) : '' };
  }
  private static text(amount: object): string {
    const a = amount as { kind: string; expression?: string; value?: number };
    return a.kind === 'literal' ? String(a.value) : a.expression ?? '';
  }
  private static value(text: string, level: number): string {
    try { return String(Amounts.mean(text, this.caster(level))); } catch { return text; }
  }
  // How it is aimed: Westernesse's spells roll to hit by an attack effect (a weapon's blow) or by a touch (Touch,
  // srd-proving-cases.md case 35); the SRD's by a touch or a ray, melee or ranged.
  static attack(a: Ability, s: Srd): Measure {
    const touch = a.effects?.find(e => e.touch)?.touch;
    return { ours: touch ? `${touch} touch` : a.effects?.some(e => e.kind === 'attack') ? 'attack' : 'none',
      theirs: s.attack ?? 'none' };
  }
  // What it falls on, as a shape: itself, one, several, a cone, a burst, a line; Westernesse's by its resolved area
  // (its own or the rules' for it) or its target, the SRD's by its target or area line.
  static target(id: string, a: Ability, s: Srd): Measure {
    const area = CanonRuntime.area(id, a), first = a.effects?.find(e => e.kind !== 'cast'), t = first?.target ?? '';
    const ours = area ?? (first?.chain ? 'chain' : t === 'self' ? 'self' : t === 'random enemies' ? 'several'
      : ['enemies', 'allies', 'party', 'all'].includes(t) ? 'all' : t ? 'one' : '');
    return { ours, theirs: this.shape(s) };
  }
  private static shape(s: Srd): string {
    const t = s.targets.toLowerCase();
    if (/^personal/i.test(s.range) || t === 'you') { return 'self'; }
    if (/cone/.test(t)) { return 'cone'; }
    if (/line/.test(t)) { return 'line'; }
    if (/spread|burst|radius|emanation|cylinder|cloud/.test(t)) { return 'burst'; }
    if (/primary target/.test(t)) { return 'chain'; }
    return /up to|or more|creatures|rays/.test(t) ? 'several' : 'one';
  }
}
