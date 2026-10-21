import { Canon } from '../canon/canon';

type Modifiers = NonNullable<(typeof Canon.conditions)[string]>['modifiers'];
// Whether a condition helps its holder, hurts them, or is neither, as the catalog shows it. One resisted with a
// save, inflicted by a blow, or that does harm each turn hurts; otherwise its modifiers are weighed: better aim,
// damage, armour, evasion, rolls, saves, attributes, resistances and immunities, temporary hit points, healing each
// turn, a guard or a skill brought help, and their opposites hurt. Taking turns away hurts unless it heals.
export class ConditionSense {
  static tone(id: string): 'help' | 'hurt' | 'neutral' {
    const c = Canon.conditions[Canon.resolve('conditions', id)];
    if (!c) { return 'neutral'; }
    const m = c.modifiers ?? {};
    if (c.saveKind || 'trigger' in c || (m.onTurnEnd ?? []).some(p => p.kind === 'damage')) { return 'hurt'; }
    const score = this.weigh(m) + (c.guard ? 1 : 0) + (c.grants?.length ? 1 : 0);
    return score > 0 ? 'help' : score < 0 ? 'hurt' : 'neutral';
  }
  static helps(id: string): boolean { return this.tone(id) === 'help'; }
  static name(id: string): string { return Canon.conditions[Canon.resolve('conditions', id)]?.name ?? id; }
  private static sum(r?: Record<string, number>): number {
    return Object.values(r ?? {}).reduce((a, b) => a + Math.sign(b), 0);
  }
  private static weigh(m: Modifiers): number {
    const sum = this.sum.bind(this);
    const damage = typeof m.bonusDamage === 'number' ? Math.sign(m.bonusDamage) : m.bonusDamage ? 1 : 0;
    const heals = (m.onTurnEnd ?? []).some(p => p.kind === 'heal');
    return Math.sign(m.toHit ?? 0) + damage - Math.sign(m.ac ?? 0) + Math.sign(m.evasion ?? 0)
      + Math.sign(m.allRolls ?? 0) + Math.sign(m.saveVersusAll ?? 0) + sum(m.saves) + sum(m.attributes)
      + sum(m.resistances) + (m.immune?.length ?? 0) + (m.tempHp ? 1 : 0) + (heals ? 1 : 0)
      - (m.noActions && !heals ? 2 : 0) - (m.noSpellcasting ? 1 : 0);
  }
}
