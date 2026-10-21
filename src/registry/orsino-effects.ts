import type { Amount, Effect, Target } from '../lang/parse';
import type { Periodic } from '../rules/modifiers';

type Raw = Record<string, unknown>;
export interface Vocabulary { saveKinds: string[]; damageTypes: string[] }

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
      case 'removeStatus':
        return [{ kind: 'remove' as const, status: '', pattern: String(raw.statusName), target, ...extra } as Effect];
      default: return `Effect ${String(raw.type)} is not supported.`;
    }
  }
}
