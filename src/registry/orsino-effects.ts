import type { Amount, Effect, Target } from '../lang/parse';
import type { Periodic } from '../rules/modifiers';

type Raw = Record<string, unknown>;
// The species a summon can call, read from Kyr's species catalogs: by Orsino source ("animal:rat"), monsters by type,
// and each ancestry's companion beasts (Orsino's companionType).
export interface Bestiary {
  byOrsino: Record<string, string>; byType: Record<string, string[]>; companions: Record<string, string[]>;
}
export interface Vocabulary { saveKinds: string[]; damageTypes: string[]; bestiary?: Bestiary }

// One Orsino ability effect (Ability.ts handleSingleEffect) as Kyr typed effects, or the reason it cannot be.
export class OrsinoEffects {
  constructor(private vocabulary: Vocabulary, private status: (s: unknown, from: string) => string | undefined,
    private saveKindOf: (id: string) => string | undefined) {}
  // Orsino amounts are Deem expressions over the acting creature's record (#str, #level); Kyr names scores in full.
  static expression(value: unknown): string {
    const names: Record<string, string> = { str: 'strength', dex: 'dexterity', con: 'constitution',
      int: 'intelligence', wis: 'wisdom', cha: 'charisma' };
    return String(value).replace(/^=/, '').trim().replace(/#(str|dex|con|int|wis|cha)\b/g, (_, k: string) => `#${names[k]}`);
  }
  private static amount(value: unknown): Amount {
    const text = OrsinoEffects.expression(value ?? '1');
    return /^\d+$/.test(text) ? { kind: 'literal', value: Number(text) } : { kind: 'deem', expression: text };
  }
  private damageType(kind: unknown): string | undefined {
    const type = kind === undefined ? 'true' : String(kind);
    return this.vocabulary.damageTypes.includes(type) ? type : undefined;
  }
  periodic(list: Raw[]): Periodic[] | string {
    const out: Periodic[] = [];
    for (const e of list) {
      if (e.type === 'damage') {
        const type = this.damageType(e.kind);
        if (!type) { return `Turn-end damage of kind ${String(e.kind)} is not a Kyr damage type.`; }
        out.push({ kind: 'damage', amount: OrsinoEffects.expression(e.amount), damageType: type });
      } else if (e.type === 'heal') {
        out.push({ kind: 'heal', amount: OrsinoEffects.expression(e.amount) });
      } else { return `Turn-end effect ${String(e.type)} is not supported.`; }
    }
    return out;
  }
  private scope(raw: Raw, target: Target): { target: Target; extra: Partial<Effect> } | string {
    const t = raw.target === 'self' ? 'self' : ['target', 'attacker'].includes(String(raw.target)) ? 'enemy'
      : raw.target === undefined ? target : undefined;
    if (!t) { return `Effect target ${String(raw.target)} is not supported.`; }
    const extra: Partial<Effect> = {};
    if (raw.condition && typeof raw.condition === 'object') {
      const c = raw.condition as Raw;
      if (typeof c.trait === 'string' && Object.keys(c).length === 1) { extra.targetTrait = c.trait; }
      else { return 'Only trait conditions on effects are supported.'; }
    }
    return { target: t as Target, extra };
  }
  effect(raw: Raw, abilityTarget: Target, from: string): Effect[] | string {
    const scoped = this.scope(raw, abilityTarget);
    if (typeof scoped === 'string') { return scoped; }
    const { target, extra } = scoped;
    const onResist = raw.saveForHalf ? 'half' as const : raw.saveNegates ? 'negate' as const : undefined;
    switch (raw.type) {
      case 'attack': return [{ kind: 'attack', target, ...raw.spillover ? { spillover: true } : {}, ...extra } as Effect];
      case 'damage': case 'drain': {
        if (raw.cascade) { return 'Cascading damage is not supported.'; }
        const damageType = this.damageType(raw.kind);
        if (!damageType) { return `Damage kind ${String(raw.kind)} is not a Kyr damage type.`; }
        return [{ kind: raw.type, amount: OrsinoEffects.amount(raw.amount), damageType, target,
          ...onResist ? { onResist } : {}, ...extra } as Effect];
      }
      case 'heal': return [{ kind: 'heal', amount: OrsinoEffects.amount(raw.amount), target, ...extra } as Effect];
      case 'buff': case 'debuff': {
        const status = this.status(raw.status, from);
        if (!status) { return `Unknown status ${JSON.stringify(raw.status)}.`; }
        const duration = typeof raw.duration === 'number' ? raw.duration : 3;
        const save = raw.type === 'debuff' ? { save: { kind: String(raw.saveKind ?? this.saveKindOf(status) ?? 'magic'),
          difficulty: { kind: 'deem' as const, expression: `${Number(raw.saveDC ?? 15)} + #level + #bonusSpellDC` } } } : {};
        if (save.save && !this.vocabulary.saveKinds.includes(save.save.kind)) { return `Unknown save ${save.save.kind}.`; }
        return [{ kind: 'apply', status, duration, target, ...save, ...extra } as Effect];
      }
      // Orsino removes, by a case-insensitive pattern over names, every active status that matches; Kyr does the same.
      case 'summon': return this.summon(raw, target);
      case 'removeStatus':
        return [{ kind: 'remove' as const, status: '', pattern: String(raw.statusName), target, ...extra } as Effect];
      default: return `Effect ${String(raw.type)} is not supported.`;
    }
  }
  // Orsino's summon: an animal by kind or a companion by the summoner's ancestry, or a monster by class, element or
  // type, at the level its options name. Its rank has no effect in Orsino, and none here.
  summon(raw: Raw, target: Target): Effect[] | string {
    if (target !== 'self') { return `A summon aimed at ${target} is not supported.`; }
    const b = this.vocabulary.bestiary, o = (raw.options ?? {}) as Raw;
    if (!b) { return 'No bestiary to summon from.'; }
    const aspect = o.animal_aspect ?? o.monster_aspect;
    if (aspect) { return `Summoning with the ${String(aspect)} aspect is not modelled.`; }
    const known = ['background', 'animal_type', 'level', 'rank', '_class', 'element', 'monster_type'];
    const unknown = Object.keys(o).filter(k => !known.includes(k));
    if (unknown.length) { return `Summon options ${unknown.join(', ')} are not supported.`; }
    let from: string[] = [], byAncestry: Record<string, string[]> | undefined;
    if (raw.creature === 'animal' && o.animal_type) {
      from = OrsinoEffects.choices(o.animal_type).map(k => b.byOrsino[`animal:${k}`]!).filter(Boolean);
    } else if (raw.creature === 'animal') {
      byAncestry = b.companions;
      from = [...new Set(Object.values(b.companions).flat())];
    } else if (raw.creature === 'monster' && o.monster_type) {
      from = OrsinoEffects.choices(o.monster_type).map(k => b.byOrsino[`monsterType:${k}`]!).filter(Boolean);
    } else if (raw.creature === 'monster' && o.element) {
      from = OrsinoEffects.choices(o.element).map(k => b.byOrsino[`elemental:${k}`]!).filter(Boolean);
    } else if (raw.creature === 'monster' && o._class) {
      from = OrsinoEffects.choices(o._class).flatMap(c => b.byType[c] ?? []);
    } else { return `Summoning a ${String(raw.creature)} is not supported.`; }
    if (!from.length) { return 'No Kyr species stands for what this summons.'; }
    return [{ kind: 'summon', creature: from[0]!, target, from,
      ...byAncestry ? { byAncestry } : {},
      ...raw.amount !== undefined ? { amount: OrsinoEffects.amount(raw.amount) } : {},
      ...typeof o.level === 'number' ? { level: o.level } : {} } as Effect];
  }
  // "=oneOf(beast, fey)" or "Lich": the keys an option allows.
  static choices(value: unknown): string[] {
    const text = String(value).replace(/^=/, '').trim();
    const m = /^oneOf\((.*)\)$/.exec(text);
    return (m ? m[1]!.split(',') : [text]).map(s => s.trim()).filter(Boolean);
  }
}
