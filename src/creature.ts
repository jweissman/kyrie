import { ItemCatalog } from './item-catalog';
export type Attribute = 'strength' | 'dexterity' | 'intelligence' | 'wisdom' | 'constitution' | 'charisma';
export type Attributes = Record<Attribute, number>;
export interface ConditionInstance { id: string; remaining: number; source?: string; clock?: 'owner-turn' | 'world-time' | 'until-removed' }
export interface ItemInstance { id: string; definition: string; equipped?: boolean }
export interface Creature {
  id: string; name: string; raceId: string; classId: string; backgroundId?: string; professionId?: string;
  traits?: string[];
  base: Attributes & {
    maxHp: number; maxMana: number; speed: number; level: number; abilities: string[];
  };
  state: {
    hp: number; mana: number; gold: number; experience: number;
    learnedAbilities: string[]; conditions: ConditionInstance[]; inventory?: ItemInstance[];
  };
}

export class CreatureSchema {
  static readonly attributes: Attribute[] = [
    'strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma',
  ];
  static validate(creature: Creature) {
    if (Object.hasOwn(creature.base, 'scores')) {
      throw new Error('Legacy score/modifier creature data requires migration');
    }
    if (![creature.id, creature.name, creature.raceId, creature.classId].every(v => typeof v === 'string' && v.length)) {
      throw new Error('Creature needs identity, name, ancestry and class');
    }
    const values = [creature.base.level, creature.base.maxHp, creature.base.maxMana, creature.base.speed,
      creature.state.hp, creature.state.mana, creature.state.gold, creature.state.experience,
      ...this.attributes.map(key => creature.base[key])];
    if (!values.every(v => Number.isSafeInteger(v) && v >= 0) || creature.base.maxHp < 1 || creature.base.level < 1
      || creature.state.hp > creature.base.maxHp || creature.state.mana > creature.base.maxMana) {
      throw new Error(`Invalid creature statistics: ${creature.id}`);
    }
    if (this.attributes.some(key => creature.base[key] < 1)) { throw new Error('Invalid ability score'); }
    const inventory = creature.state.inventory ?? [];
    if (!Array.isArray(inventory) || inventory.some(i => !i.id || !i.definition
      || (i.equipped !== undefined && typeof i.equipped !== 'boolean'))
      || new Set(inventory.map(i => i.id)).size !== inventory.length) { throw new Error('Invalid item inventory'); }
    const slots = inventory.filter(i => i.equipped).map(i => ItemCatalog.get(i.definition).slot);
    inventory.forEach(i => ItemCatalog.get(i.definition));
    if (slots.some(s => !s) || new Set(slots).size !== slots.length) { throw new Error('Invalid equipment slots'); }
    const grants = creature.base.abilities;
    const learned = creature.state.learnedAbilities;
    if (!Array.isArray(grants) || !Array.isArray(learned)
      || [...grants, ...learned].some(id => typeof id !== 'string' || !id)
      || new Set([...grants, ...learned]).size !== grants.length + learned.length) {
      throw new Error('Invalid creature abilities');
    }
    if (!Array.isArray(creature.state.conditions) || creature.state.conditions.some(c =>
      (c.clock !== undefined && !['owner-turn', 'world-time', 'until-removed'].includes(c.clock))
      || typeof c.id !== 'string' || !c.id || !Number.isSafeInteger(c.remaining) || c.remaining < 1)
      || new Set(creature.state.conditions.map(c => `${c.id}:${c.source ?? ""}`)).size !== creature.state.conditions.length) {
      throw new Error('Invalid creature conditions');
    }
  }
}
