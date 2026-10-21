import { Canon } from '../canon/canon';
import type { Perk } from '../canon/schema';
import { MechanicsText } from './mechanics-text';

// What a perk does, said from what it is (its modifiers, bonuses, triggers and where it holds), so the words are the
// rule: "Herbal Remedies: +1d4 healing." Orsino's own descriptions name checks Kyr does not make.
export class PerkText {
  static readonly places: Record<string, string> = { urban: 'in a town', forest: 'in forest', cave: 'in the dark',
    mountain: 'in the mountains', hills: 'in the hills', marsh: 'in fen country', desert: 'in desert', frost: 'in the frozen north' };
  static of(perk: Perk): string {
    const parts = [...MechanicsText.modifiers(perk.modifiers), ...this.bonuses(perk), ...this.triggers(perk)];
    const where = [perk.environment ? this.places[perk.environment] ?? `in ${perk.environment}` : '',
      perk.weapon ? `with a ${[perk.weapon.weight, perk.weapon.type].filter(Boolean).join(' ')} weapon` : '']
      .filter(Boolean).join(', ');
    return `${perk.name}: ${parts.join(', ') || 'no effect Kyr plays'}${where ? `, ${where}` : ''}.`;
  }
  private static bonuses(perk: Perk): string[] {
    const b = perk.bonuses ?? {}, out: string[] = [];
    if (b.search) { out.push(`+${b.search} to searching`); }
    if (b.goldMultiplier) { out.push(b.goldMultiplier === 1.5 ? 'half again as much coin from everything'
      : `${b.goldMultiplier}× coin from everything`); }
    if (b.loot) { out.push(`${b.loot} more common supplies from a good search`); }
    if (b.spellDuration) { out.push(`what they cast lasts ${b.spellDuration} turn${b.spellDuration === 1 ? '' : 's'} longer`); }
    for (const [ability, m] of Object.entries(b.abilityDamage ?? {})) {
      const name = (Canon.abilities[ability]?.name ?? ability).toLowerCase();
      out.push(m === 1.5 ? `${name} does half again as much damage` : `${name} does ${m}× damage`);
    }
    return out;
  }
  private static triggers(perk: Perk): string[] {
    const t = perk.triggers ?? {}, out: string[] = [];
    for (const k of t.onKill ?? []) {
      if (k.gold) { out.push(`${k.gold} gold pieces for each kill (a coin for every ten)`); }
      if (k.experience) { out.push(`${k.experience} experience for each kill`); }
      if (k.status) { out.push(`${MechanicsText.conditionName(k.status)} after each kill`); }
    }
    for (const l of t.onLevelUp ?? []) { out.push(`+${l.maxHp} hit point${l.maxHp === 1 ? '' : 's'} each level`); }
    for (const c of t.onOffensiveCasting ?? []) {
      out.push(`each spell cast against enemies also does ${c.amount} ${c.damageType} damage to all of them`);
    }
    return out;
  }
}
