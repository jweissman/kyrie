import { Canon } from './canon';

// The fields each catalog record may have (the SRD adaptation briefing, §14: unknown fields are errors at every
// catalog boundary). A field Kyr does not read is refused as the canon loads, never carried inert: the unicorn's `dr`
// and `resist` had sat in its record, read by nothing, while its card promised a defense it did not have. These lists
// are the schema's (src/canon/schema.ts), kept beside it; a field added there is added here, or the catalog refuses it.
const source = ['orsino', 'kyr', 'fidelity', 'notes', 'srd35', 'conversion'];
const fields = {
  species: ['name', 'description', 'variantOf', 'type', 'kind', 'looks', 'material', 'requires', 'abundance', 'alone',
    'statistics', 'abilities', 'traits', 'defenses', 'resistances', 'temperament', 'habitats', 'variations',
    'portrait', 'worth', 'omits', 'source'],
  statistics: ['attributes', 'hitPoints', 'hitDie', 'hitDice', 'level', 'weapon', 'armor', 'primary', 'actions',
    'attacks', 'growth', 'riders', 'damage', 'armorBonus', 'saves'],
  ability: ['name', 'kind', 'description', 'effect', 'effects', 'cost', 'recharge', 'windup', 'spell', 'level',
    'resist', 'requires', 'uses', 'area', 'unsupported', 'source', 'recharges'],
  condition: ['name', 'description', 'lifetime', 'modifiers', 'hooks', 'trigger', 'duration', 'saveKind', 'law',
    'compel', 'forceTarget', 'guard', 'drains', 'stacking', 'omits', 'unsupported', 'source', 'grants', 'begins',
    'ends', 'unheld'],
  trait: ['name', 'category', 'description', 'modifiers', 'requires', 'perks', 'excludes', 'spellAccess', 'grants',
    'omits', 'unsupported', 'source'],
  item: ['name', 'category', 'description', 'value', 'slot', 'use', 'modifiers', 'weapon', 'armor', 'hooks', 'fuel',
    'charges', 'grants', 'unsupported', 'source', 'tool', 'aids', 'omits', 'rank', 'portrait', 'points', 'tier', 'drops',
    'mass', 'carries'],
  weapon: ['damage', 'type', 'kind', 'weight', 'missile', 'intercept', 'natural', 'tags'],
  armor: ['ac', 'weight', 'type'],
  ancestry: ['name', 'description', 'nameGroup', 'classes', 'playable', 'attributes', 'traits', 'forbiddenTraits',
    'techniques', 'feature', 'source'],
  class: ['name', 'description', 'hitDie', 'attributes', 'gold', 'abilities', 'playable', 'adventuring', 'skills',
    'learns', 'practice', 'specializations', 'weapons', 'armor', 'startingGear', 'features', 'proficiencies', 'slots',
    'spellcasting', 'rank', 'omits', 'source'],
  skill: ['name', 'description', 'source', 'rests', 'means'],
  plant: ['name', 'looks', 'habitats', 'source', 'portrait', 'uses', 'abundance', 'stand', 'yields', 'gathered',
    'count', 'cut', 'grounds'],
  deity: ['name', 'domains', 'gender', 'observance', 'blessing', 'source'],
  domain: ['name', 'alignment', 'description', 'spellDomain', 'blessing', 'source'],
  material: ['name', 'kind', 'hardness', 'looks', 'source', 'passes'],
  habitat: ['name', 'orsino', 'covers', 'terrains', 'sites', 'forms', 'water', 'shore'],
  variation: ['axis', 'word', 'says', 'kinds', 'attributes', 'health', 'abilities', 'traits', 'hint', 'habitats',
    'abundance', 'resistances', 'types', 'weapon', 'material', 'temperament', 'type', 'source', 'hitDice', 'defenses',
    'attacks', 'armor', 'forgoes', 'unplaced', 'riders', 'damage', 'armorBonus', 'saves'],
} as const;
type Record_ = Record<string, unknown>;

export class CatalogFields {
  static readonly fields: Readonly<Record<keyof typeof fields, readonly string[]>> = fields;
  // Every resolved record's fields (after Orsino's generated entries and Kyr's hand-written ones are merged, as the
  // canon reads them), and the fields of what each holds: a body's statistics, a weapon's and armour's stats, a source.
  static problems(): string[] {
    const families: [keyof typeof fields, Record<string, unknown>][] = [['species', Canon.species],
      ['species', Canon.devices], ['ability', Canon.abilities], ['condition', Canon.conditions], ['trait', Canon.traits],
      ['item', Canon.items], ['ancestry', Canon.ancestries], ['class', Canon.classes], ['skill', Canon.skills],
      ['plant', Canon.plants], ['deity', Canon.deities], ['domain', Canon.domains], ['material', Canon.materials],
      ['habitat', Canon.habitats], ['variation', Canon.variations]];
    return families.flatMap(([family, records]) => Object.entries(records)
      .filter(([id]) => !Canon.installed.has(id))
      .flatMap(([id, r]) => CatalogFields.of(`${family} ${id}`, family, r as Record_)));
  }
  private static of(where: string, family: keyof typeof fields, r: Record_): string[] {
    const nested = { species: ['statistics'], item: ['weapon', 'armor'] } as Record<string, (keyof typeof fields)[]>;
    return [...CatalogFields.unknown(where, r, fields[family]),
      ...(nested[family] ?? []).filter(key => r[key] && typeof r[key] === 'object')
        .flatMap(key => CatalogFields.unknown(`${where} ${key}`, r[key] as Record_, fields[key])),
      ...r.source && typeof r.source === 'object' ? CatalogFields.unknown(`${where} source`, r.source as Record_, source)
        : []];
  }
  private static unknown(where: string, r: Record_, known: readonly string[]): string[] {
    return Object.keys(r).filter(k => !known.includes(k)).map(k => `${where}: unknown field ${k}`);
  }
}
