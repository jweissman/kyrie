import { Canon } from '../canon/canon';

const rules = Canon.rules;

export interface KyrStatus {
  damage: number; skip: boolean; armor: number; power: number; lifetime: 'persistent' | 'encounter';
  save?: number; saves?: Record<string, number>; immune?: string[]; resistances?: Record<string, number>;
}
export interface StatusTranslation { status: KyrStatus; translated: Record<string, string>; omitted: string[] }

// Translates an Orsino status modifier map into a Kyr status definition. Each source key is either translated (and
// the translation is named) or omitted; nothing is approximated silently. Kyr catalog entries derived from Orsino
// statuses are checked against this function, so they cannot drift from the source.
export class OrsinoStatuses {
  static translate(effect: Record<string, unknown>, lifetime: KyrStatus['lifetime'] = 'persistent'): StatusTranslation {
    const status: KyrStatus = { damage: 0, skip: false, armor: 0, power: 0, lifetime };
    const translated: Record<string, string> = {}, omitted: string[] = [];
    for (const [key, value] of Object.entries(effect)) {
      const target = this.key(key, value, status);
      if (target) { translated[key] = target; } else { omitted.push(key); }
    }
    return { status, translated, omitted: omitted.sort() };
  }
  private static suffix(key: string, prefix: string): string | undefined {
    return key.startsWith(prefix) ? key.slice(prefix.length).toLowerCase() : undefined;
  }
  private static key(key: string, value: unknown, status: KyrStatus): string | undefined {
    const resist = this.suffix(key, 'resist'), versus = this.suffix(key, 'saveVersus');
    const immune = this.suffix(key, 'immune');
    if (typeof value === 'number' && resist && resist !== 'all' && rules.damageTypes.includes(resist)) {
      (status.resistances ??= {})[resist] = value;
      return `resistances.${resist}`;
    }
    if (typeof value === 'number' && key === 'saveVersusAll') { status.save = value; return 'save'; }
    if (typeof value === 'number' && versus && Object.hasOwn(rules.saveKinds, versus)) {
      (status.saves ??= {})[versus] = value;
      return `saves.${versus}`;
    }
    if (value === true && immune && Object.hasOwn(rules.saveKinds, immune)) {
      (status.immune ??= []).push(immune);
      return `immune.${immune}`;
    }
    if (typeof value === 'number' && key === 'bonusDamage') { status.power = value; return 'power'; }
    if (value === true && key === 'noActions') { status.skip = true; return 'skip'; }
    if (key === 'displayClass' || key === 'displayName') { return 'presentation'; }
    return undefined;
  }
}
