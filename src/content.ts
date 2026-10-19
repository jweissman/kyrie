import { buildSetting, Generator, Template } from 'deem';
import type { DeemValue } from 'deem';
import tables from '../data/default/tables/deem.tables.json';
import templates from '../data/default/templates/deem.templates.json';
import { Expressions } from './expressions';
import { Effects } from './effects';
import { FantasyRules } from './fantasy-rules';
import type { ArenaAbility } from './lang/parse';
import { Canon } from './canon/canon';
import { CanonRuntime } from './canon/canon-runtime';
import { TraitGrants } from './canon/trait-grants';
import { CanonValidation } from './canon/canon-validation';
import { CreatureSchema, type Attribute, type Creature } from './creature';
import { CombatProjection } from './combat-projection';
import { Overlays } from './overlays';
import type { Fighter } from './model';

const classData = CanonRuntime.callings();
const races = CanonRuntime.kinds();
const statuses = CanonRuntime.conditions();
const rules = Canon.rules;
const creatures = Canon.legacy.creatures;
const encounters = Canon.legacy.encounters;
const backgrounds = Canon.legacy.backgrounds;
export type ClassId = string;
export type RaceId = string;
export type CreatureGenerationContext = Partial<Record<Attribute, number>> & {
  raceId?: RaceId; classId?: ClassId; level?: number; population?: 'any' | 'pc' | 'monster';
  name?: string; primary?: Attribute;
  abilities?: string[]; backgroundId?: string; professionId?: string; traits?: string[]; gear?: string[];
};
interface CreatureKind { stats?: Partial<Record<Attribute, number>>; hitPoints?: number }
export class Content {
  static readonly classes = classData;
  static readonly backgrounds = backgrounds;
  static readonly playableClasses = Object.entries(classData).filter(([, c]) => 'playable' in c && c.playable)
    .map(([id]) => id as ClassId);
  static readonly playableRaces = Object.entries(races).filter(([, r]) => 'playable' in r && r.playable)
    .map(([id]) => id as RaceId);
  static readonly statuses = statuses;
  static readonly races = races;
  static readonly creatures = creatures;
  static readonly rules = rules;
  // A creature kind (a non-playable ancestry such as a dragon) may carry a complete stat line and hit points derived
  // from a source creature definition. Authored scores in the generation context still win.
  static kind(raceId: string | undefined): CreatureKind | undefined {
    return raceId ? (races as Record<string, CreatureKind>)[raceId] : undefined;
  }
  static resistance(raceId: string, damageType: string): number {
    const race = races[raceId as keyof typeof races] as { resistances?: Record<string, number> } | undefined;
    return race?.resistances?.[damageType]
      ?? (['piercing', 'slashing', 'bludgeoning'].includes(damageType) ? race?.resistances?.physical : undefined) ?? 0;
  }
  static readonly abilities: ArenaAbility[] = CanonRuntime.abilities();
  private static readonly setting = buildSetting({ ...tables,
    creatureClass: { discriminator: 'classId', groups: classData },
    creatureRace: { discriminator: 'raceId', groups: races },
  } as unknown as Parameters<typeof buildSetting>[0], templates);
  private runtime;
  static settingWith(tables: Parameters<typeof buildSetting>[0], templates: Parameters<typeof buildSetting>[1]) {
    const extra = buildSetting(tables, templates);
    for (const name of Object.keys(extra)) {
      if (name in Content.setting) { throw new Error(`Bundle cannot replace shared generation definition ${name}`); }
    }
    return { ...Content.setting, ...extra };
  }
  constructor(seed: string, private readonly setting = Content.setting) {
    this.runtime = Template.bootstrapDeem({ seed: Expressions.seed(seed) }, this.setting);
    Object.assign(this.runtime.stdlib, FantasyRules.functions);
    Content.validate();
  }
  private static checked = false;
  static validate() {
    if (!Content.checked) { CanonValidation.assert(); Content.checked = true; }
    const ids = new Set(Content.abilities.map(a => a.id));
    for (const definition of [...Object.values(races), ...Object.values(classData)]) {
      for (const trait of (definition as { traits?: string[] }).traits ?? []) {
        if (!Object.hasOwn(Canon.traits, Canon.resolve('traits', trait))) { throw new Error(`Unknown passive trait ${trait}`); }
      }
    }
    for (const status of Object.values(statuses) as { saves?: Record<string, number>; immune?: string[] }[]) {
      for (const kind of [...Object.keys(status.saves ?? {}), ...status.immune ?? []]) {
        if (!Object.hasOwn(rules.saveKinds, kind)) { throw new Error(`Unknown save category ${kind}`); }
      }
    }
    for (const race of Object.values(races)) {
      const resistance = (race as { resistances?: Record<string, number> }).resistances ?? {};
      for (const [type, amount] of Object.entries(resistance)) {
        if (!rules.damageTypes.includes(type) || !Number.isFinite(amount) || amount < -1 || amount > 1) {
          throw new Error('Invalid innate resistance');
        }
      }
    }
    for (const entry of [...Object.values(creatures), ...Object.values(encounters).flat()]) {
      if (!Object.hasOwn(classData, entry.class) || !Object.hasOwn(races, entry.race)) {
        throw new Error('Unknown creature/encounter class or race');
      }
    }
    for (const entry of Object.values(classData)) {
      for (const id of entry.abilities) {
        if (!ids.has(id)) { throw new Error(`Unknown class ability: ${id}`); }
      }
    }
    for (const ability of Content.abilities) {
      for (const effect of ability.effects) {
        Effects.validate(effect, [...ids]);
        if ((effect.kind === 'apply' || effect.kind === 'remove') && !(effect.status in statuses)) {
          throw new Error(`Unknown status: ${effect.status}`);
        }
        if (effect.kind === 'summon' && !(effect.creature in creatures)) {
          throw new Error(`Unknown summon: ${effect.creature}`);
        }
      }
    }
  }
  generate(type: string, context: Record<string, DeemValue> = {}) {
    const result = Generator.gen(type, { ...context, __setting: this.setting, __deemRuntime: this.runtime });
    if (Array.isArray(result)) { throw new Error('Expected a single generated entity'); }
    return result;
  }
  private static number(generated: Record<string, DeemValue>, key: string): number {
    const value = generated[key];
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
      throw new Error(`Invalid generated ${key}`);
    }
    return value;
  }
  creature(archetype: string, id: string, team: Fighter['team']): Fighter {
    const definition = creatures[archetype];
    if (!definition || !Object.hasOwn(creatures, archetype)) { throw new Error(`Unknown creature ${archetype}`); }
    return this.character(definition.class as ClassId, id, team, definition.race as RaceId);
  }
  encounter(group: string): Fighter[] {
    if (!Object.hasOwn(encounters, group)) { throw new Error(`No encounter roster registered for ${group}`); }
    return encounters[group]!.map((entry, i) =>
      this.character(entry.class as ClassId, `${group}-${i + 1}`, 'goblins', entry.race as RaceId));
  }
  character(classId: ClassId, id: string, team: Fighter['team'], raceId: RaceId = 'human'): Fighter {
    return CombatProjection.fighter(this.createCreature(id, { classId, raceId }), team);
  }
  createCreature(id: string, context: CreatureGenerationContext = {}): Creature {
    if ((context.backgroundId !== undefined && !Object.hasOwn(backgrounds, context.backgroundId)
      && !Overlays.has(context.backgroundId))
      || Object.keys(context).some(key => key.endsWith('Score'))
      || (context.raceId !== undefined && !Object.hasOwn(races, context.raceId))
      || (context.classId !== undefined && !Object.hasOwn(classData, context.classId))
      || (context.population !== undefined && !Object.hasOwn(tables.creaturePopulation.groups, context.population))
      || (context.primary !== undefined && !CreatureSchema.attributes.includes(context.primary))
      || CreatureSchema.attributes.some(key => context[key] !== undefined
        && (!Number.isSafeInteger(context[key]) || context[key]! < 1))
      || (context.level !== undefined && (!Number.isSafeInteger(context.level) || context.level < 1))) {
      throw new Error(`Invalid creature generation context for ${id}`);
    }
    const { professionId, traits: chosen, gear, ...rest } = context;
    const kind = Content.kind(context.raceId);
    const generationContext = { ...kind?.stats, ...rest };
    const creature = this.generatedCreature(this.generate('creature', generationContext), id);
    if (kind?.hitPoints) { creature.base.maxHp = creature.state.hp = kind.hitPoints; }
    if (context.backgroundId) { creature.backgroundId = context.backgroundId; }
    if (professionId) { creature.professionId = professionId; }
    if (chosen?.length) {
      creature.traits = chosen.map(t => Canon.resolve('traits', t));
      creature.base.abilities = [...new Set([...creature.base.abilities, ...TraitGrants.abilities(creature)])];
    }
    Overlays.validate({ classId: creature.classId, backgroundId: creature.backgroundId, professionId }, id);
    Overlays.apply(creature);
    Overlays.carry(creature, gear ?? []);
    CreatureSchema.validate(creature);
    return creature;
  }
  private generatedCreature(generated: Record<string, DeemValue>, id: string): Creature {
    const classId = generated.classId;
    const raceId = generated.raceId;
    if (typeof classId !== 'string' || !Object.hasOwn(classData, classId)
      || typeof raceId !== 'string' || !Object.hasOwn(races, raceId)
      || typeof generated.name !== 'string' || !Array.isArray(generated.abilities)
      || generated.abilities.some(a => typeof a !== 'string' || !Content.abilities.some(b => b.id === a))) {
      throw new Error('Invalid generated creature references');
    }
    const scores = Object.fromEntries(CreatureSchema.attributes.map(key =>
      [key, Content.number(generated, key)])) as Record<Attribute, number>;
    const creature: Creature = { id, name: generated.name, classId, raceId,
      base: { ...scores, level: Content.number(generated, 'level'),
        abilities: generated.abilities as string[], maxHp: Content.number(generated, 'maxHp'),
        maxMana: Content.number(generated, 'maxMana'), speed: Content.number(generated, 'speed') },
      state: { hp: Content.number(generated, 'maxHp'), mana: Content.number(generated, 'maxMana'),
        gold: 0, experience: 0, learnedAbilities: [], conditions: [] } };
    CreatureSchema.validate(creature);
    return creature;
  }
}
