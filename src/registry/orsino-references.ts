import type { OrsinoIndex } from './orsino-index';

export interface Reference { field: string; ref: string; resolved: boolean }
interface Walk { index: OrsinoIndex; references: Reference[]; features: Set<string>; inEffect: boolean; field: string }

// Dependencies and mechanical features of a source definition. References name other registry entries; features name
// the Orsino rule machinery a definition relies on (effect types, target kinds, status modifier keys, save kinds,
// damage kinds, weapon flags). Kyr support is judged per feature, never by an entry's name.
export class OrsinoReferences {
  static readonly effectTypes = new Set(['attack', 'cast', 'damage', 'heal', 'buff', 'debuff', 'flee', 'drain', 'summon',
    'removeStatus', 'upgrade', 'gold', 'xp', 'resurrect', 'kill', 'randomEffect', 'cycleEffects', 'learn',
    'grantPassive', 'teleport', 'planeshift', 'recalculateHp', 'acquireItem']);
  private static readonly flags = ['saveForHalf', 'saveNegates', 'cascade', 'spillover', 'chance', 'condition',
    'randomEffects', 'cycledEffects', 'applyTraits', 'saveDC', 'succeedDC', 'hpPercent', 'bonusDamage', 'healCaster'];
  // Orsino merges abilities.json and then abilities/*.json; a later definition replaces an earlier one.
  private static readonly abilities = ['divineSpell', 'arcaneSpell', 'ability'];
  private static readonly tableRefs: Record<string, string[]> = {
    weapon: ['weapon'], npcWeapon: ['weapon'], monsterWeapon: ['weapon'],
    armor: ['armor'], npcArmor: ['armor'], monsterNaturalArmor: ['armor'],
    abilities: this.abilities, monsterAbilities: this.abilities, monsterTypeAbilities: this.abilities,
    elementalAbilities: this.abilities, creatureAspectAbilities: this.abilities, combatEntityAbilities: this.abilities,
    traits: ['trait'], monsterTraits: ['trait'], combatEntityTraits: ['trait'],
  };
  private static readonly fieldRefs: Record<string, string[]> = {
    abilities: this.abilities, traits: ['trait'], traitChoices: ['trait'], incompatibleWith: ['trait'],
    applyTraits: ['trait'], traitName: ['trait'], weapon: ['weapon'], effectiveWeapon: ['weapon'], body: ['armor'],
    startingGear: ['gear', 'consumable', 'equipment', 'weapon', 'armor'], requiredClass: ['class'], class: ['class'],
    classes: ['class'], race: ['ancestry'], races: ['ancestry'], spellName: this.abilities,
    abilityName: this.abilities, status: ['status'], statusName: ['status'], creature: ['template'],
    kind: ['rule.damageKind'], saveKind: ['rule.saveKind'], succeedType: ['rule.saveKind'],
  };
  static analyse(definition: unknown, index: OrsinoIndex, tables?: string[]) {
    const c: Walk = { index, references: [], features: new Set<string>(), inEffect: false, field: '' };
    if (tables) {
      for (const [table, value] of Object.entries(definition as Record<string, unknown>)) {
        const families = this.tableRefs[table];
        for (const key of families ? this.strings(value) : []) { this.add(c, table, families!, key); }
        // A domain blessing is a status effect: its keys are modifiers like any status's.
        this.walk(value, { ...c, field: table === 'deityBlessings' ? 'effect' : table });
      }
    } else { this.walk(definition, c); }
    return { references: this.unique(c.references), features: [...c.features].sort() };
  }
  private static add(c: Walk, field: string, families: string[], key: string) {
    const ref = c.index.find(families, key);
    c.references.push({ field, ref: ref ?? `${families[0]!}:${key}`, resolved: !!ref });
  }
  private static walk(value: unknown, c: Walk) {
    if (Array.isArray(value)) {
      if (c.field === 'target') {
        value.filter(v => typeof v === 'string').forEach(v => c.features.add(`target:${v as string}`));
        return;
      }
      value.forEach(v => this.walk(v, c));
      return;
    }
    if (!value || typeof value !== 'object') { return; }
    const record = value as Record<string, unknown>;
    const isEffect = typeof record.type === 'string' && this.effectTypes.has(record.type)
      && (c.inEffect || c.field === 'effects' || c.field === 'effect' || c.field.startsWith('on'));
    if (isEffect) {
      c.features.add(`effect:${record.type as string}`);
      for (const flag of this.flags) { if (record[flag] !== undefined) { c.features.add(`flag:${flag}`); } }
    }
    for (const [key, v] of Object.entries(record)) {
      if (c.field === 'effect' && !Array.isArray(record) && !isEffect) { c.features.add(`modifier:${key}`); }
      if (key === 'target' && typeof v === 'string' && isEffect) { c.features.add(`target:${v}`); }
      if (key === 'saveKind' || key === 'succeedType') { c.features.add(`save:${String(v)}`); }
      if (key === 'kind' && isEffect && typeof v === 'string') { c.features.add(`damage:${v}`); }
      const families = this.fieldRefs[key];
      if (families && (key !== 'kind' || isEffect) && (key !== 'creature' || isEffect)
        && (key !== 'status' || typeof v === 'string')) {
        for (const s of this.strings(v)) {
          for (const part of key === 'statusName' ? s.split('|').filter(p => p !== '.*') : [s]) {
            if (!part.startsWith('=')) { this.add(c, key, families, part); }
          }
        }
      }
      this.walk(v, { ...c, inEffect: isEffect || c.inEffect, field: key });
    }
  }
  // Top-level fields of character and creature records, named by source table so that the same key in different
  // tables (a background's str versus an ancestry's str) is judged separately.
  static fieldFeatures(definition: unknown, tables: string[] | undefined, family: string): string[] {
    const records: [string, unknown][] = tables && tables.length > 1
      ? Object.entries(definition as Record<string, unknown>) : [[tables?.[0] ?? family, definition]];
    return records.flatMap(([table, value]) => value && typeof value === 'object' && !Array.isArray(value)
      ? Object.keys(value).filter(k => k !== 'description' && k !== 'name').map(k => `field:${table}.${k}`)
      : [`field:${table}`]);
  }
  static weaponReference(definition: Record<string, unknown>, index: OrsinoIndex): Reference {
    const key = String(definition.type), ref = index.find(['rule.damageKind'], key);
    return { field: 'type', ref: ref ?? `rule.damageKind:${key}`, resolved: !!ref };
  }
  static weaponFeatures(definition: Record<string, unknown>): string[] {
    return [`damage:${String(definition.type)}`, ...['missile', 'breath', 'intercept', 'natural']
      .filter(flag => definition[flag]).map(flag => `weapon:${flag}`)];
  }
  static strings(value: unknown): string[] {
    if (typeof value === 'string') { return [value]; }
    if (Array.isArray(value)) { return value.flatMap(v => this.strings(v)); }
    return [];
  }
  private static unique(references: Reference[]): Reference[] {
    const seen = new Set<string>();
    return references.filter(r => {
      const key = `${r.field}|${r.ref}`;
      if (seen.has(key)) { return false; }
      seen.add(key); return true;
    }).sort((a, b) => a.ref.localeCompare(b.ref) || a.field.localeCompare(b.field));
  }
}
