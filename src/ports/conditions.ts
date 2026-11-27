import { Installed } from './installed';
import type { Condition } from '../rules/catalog-schema';

// What the rules ask of a condition, through a domain a setting installs (the platform's root blocker,
// platform-separation.md: the runtime declares what it needs; the setting's rules implement it; another setting
// installs its own or none). The runtime had read Canon's catalog of conditions directly; it asks here instead, and
// answers from the installation in scope: a campaign's own, else the composition root's (src/ports/installed.ts; the
// fantasy rules', src/canon/canon.ts). Asked of with none installed, it says so rather than answering that there is no
// such condition.
export interface ConditionDomain {
  // The condition by its own id or any name it is also known by; none where there is no such condition.
  condition(id: string): Condition | undefined;
  // The condition by its own id only.
  exact(id: string): Condition | undefined;
  // The installed catalog's canonical key, when a setting gives one; otherwise the id is already canonical.
  resolve?(id: string): string;
}
export class Conditions {
  static of(id: string): Condition | undefined { return this.installed().condition(id); }
  static exact(id: string): Condition | undefined { return this.installed().exact(id); }
  static resolve(id: string): string { return this.installed().resolve?.(id) ?? id; }
  // Whether a condition helps, hurts or is neither, as its installed catalog describes it.
  static tone(id: string): 'help' | 'hurt' | 'neutral' {
    const condition = this.of(id);
    if (!condition) { return 'neutral'; }
    const modifiers = condition.modifiers ?? {};
    if (condition.saveKind || 'trigger' in condition
      || (modifiers.onTurnEnd ?? []).some(effect => effect.kind === 'damage')) { return 'hurt'; }
    const score = this.weigh(modifiers) + this.weigh(condition.perAmount ?? {})
      + (condition.guard ? 1 : 0) + (condition.grants?.length ? 1 : 0);
    return score > 0 ? 'help' : score < 0 ? 'hurt' : 'neutral';
  }
  static helps(id: string): boolean { return this.tone(id) === 'help'; }
  static law(id: string): boolean { return !!this.of(id)?.law; }
  static name(id: string): string { return this.of(id)?.name ?? id; }
  private static sum(record?: Record<string, number>): number {
    return Object.values(record ?? {}).reduce((sum, value) => sum + Math.sign(value), 0);
  }
  private static weigh(modifiers: Condition['modifiers']): number {
    const damage = typeof modifiers.bonusDamage === 'number' ? Math.sign(modifiers.bonusDamage)
      : modifiers.bonusDamage ? 1 : 0;
    const heals = (modifiers.onTurnEnd ?? []).some(effect => effect.kind === 'heal');
    return Math.sign(modifiers.toHit ?? 0) + damage - Math.sign(modifiers.ac ?? 0)
      + Math.sign(modifiers.evasion ?? 0) + Math.sign(modifiers.allRolls ?? 0)
      + Math.sign(modifiers.saveVersusAll ?? 0) + this.sum(modifiers.saves) + this.sum(modifiers.attributes)
      + this.sum(modifiers.resistances) + this.sum(modifiers.resist) + (modifiers.immune?.length ?? 0)
      + (modifiers.tempHp ? 1 : 0) + (modifiers.images ? 1 : 0) + (heals ? 1 : 0)
      + (modifiers.concealment ? 1 : 0) - (modifiers.noActions && !heals ? 2 : 0)
      - (modifiers.noSpellcasting ? 1 : 0);
  }
  private static installed(): ConditionDomain { return Installed.need('conditions'); }
}
