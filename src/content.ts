import { Spellcasting } from './rules/spellcasting';
import { buildSetting, Generator, Template } from 'deem';
import type { DeemValue } from 'deem';
import { Expressions } from './expressions';
import { Effects } from './effects';
import { FantasyRules } from './fantasy-rules';
import type { ArenaAbility } from './lang/parse';
import { Canon } from './canon/canon';
import { CanonRuntime } from './canon/canon-runtime';
import { TraitGrants } from './canon/trait-grants';
import { CanonValidation } from './canon/canon-validation';
import { CreatureDefinition } from './creature-definition';
import { CreatureSchema, type Attribute, type Creature } from './creature';
import { CombatProjection } from './combat-projection';
import { Overlays } from './overlays';
import { Creation } from './rules/creation';
import { RandomStreams } from './random-streams';
import { Fighting } from './rules/fighting';
import type { Fighter } from './model';
import { GenerationSetting } from './generation-setting';
const { tables, templates } = GenerationSetting;

const rules = Canon.rules;
export type ClassId = string;
export type RaceId = string;
// What an author or the creation screen may say about a creature. traits are the chosen ones (a specialization);
// spells are a specialist's picks; weapon and armor override the class's starting tables.
export type CreatureGenerationContext = Partial<Record<Attribute, number>> & {
  raceId?: RaceId; classId?: ClassId; level?: number; population?: 'any' | 'pc' | 'monster';
  name?: string; abilities?: string[]; backgroundId?: string; professionId?: string; traits?: string[];
  spells?: string[]; gear?: string[]; weapon?: string; armor?: string;
  // An NPC prepares a sample of its spells (Orsino's enemy casters) instead of making a player's picks.
  family?: string;
  prepared?: boolean; adaptation?: string; parameters?: Record<string, DeemValue>;
  lineage?: string; maturity?: string;
};
export class Content {
  // What the creation screen and presenters show: classes and kinds by name.
  static readonly classes: Record<string, { name: string; playable?: boolean }> = { ...Canon.classes };
  static readonly races: Record<string, { name: string; classes?: string[]; playable?: boolean }> = {
    ...Canon.ancestries, ...Object.fromEntries(Object.keys(Canon.species).map(id => [id, Canon.creature(id)])) };
  static readonly playableClasses = Object.entries(Canon.classes).filter(([, c]) => c.playable).map(([id]) => id);
  static readonly playableRaces = Object.entries(Canon.ancestries).filter(([, a]) => a.playable).map(([id]) => id);
  static readonly statuses = CanonRuntime.conditions();
  static readonly rules = rules;
  static readonly abilities: ArenaAbility[] = CanonRuntime.abilities();
  private static readonly setting = buildSetting(
    tables as unknown as Parameters<typeof buildSetting>[0], templates);
  private runtime;
  static settingWith(tables: Parameters<typeof buildSetting>[0], templates: Parameters<typeof buildSetting>[1]) {
    const extra = buildSetting(tables, templates);
    for (const name of Object.keys(extra)) {
      if (name in Content.setting) { throw new Error(`Bundle cannot replace shared generation definition ${name}`); }
    }
    return { ...Content.setting, ...extra };
  }
  constructor(private readonly seed: string, private readonly setting = Content.setting) {
    this.runtime = Template.bootstrapDeem({ seed: Expressions.seed(seed) }, this.setting);
    Object.assign(this.runtime.stdlib, FantasyRules.functions);
    Content.validate();
  }
  private static checked = false;
  static validate() {
    if (Content.checked) { return; }
    CanonValidation.assert();
    const ids = Content.abilities.map(a => a.id);
    for (const ability of Content.abilities) {
      for (const effect of ability.effects) {
        Effects.validate(effect, ids);
      }
    }
    Content.checked = true;
  }
  generate(type: string, context: Record<string, DeemValue> = {}) {
    const result = Generator.gen(type, { ...context, __setting: this.setting, __deemRuntime: this.runtime });
    if (Array.isArray(result)) { throw new Error('Expected a single generated entity'); }
    return result;
  }
  // One of a list, drawn from this generator's seeded stream (Orsino's NullDriver picks uniformly).
  pick<T>(options: T[]): T {
    if (!options.length) { throw new Error('Nothing to choose from'); }
    const roll = this.runtime.evaluate(`1d${options.length}`) as number;
    return options[roll - 1]!;
  }
  // A summoned or ad hoc creature of a species.
  creature(species: string, id: string, team: Fighter['team']): Fighter {
    if (!Canon.isSpecies(species)) { throw new Error(`Unknown species ${species}`); }
    return CombatProjection.fighter(this.createCreature(id, { raceId: species }), team);
  }
  character(classId: ClassId, id: string, team: Fighter['team'], raceId: RaceId = 'human'): Fighter {
    return CombatProjection.fighter(this.createCreature(id, { classId, raceId }), team);
  }
  // A request names a family-specific dimension (lineage, material, an adaptation…) that only Deem composition
  // honours. A class alone keeps the character-creation path.
  private static composed(context: CreatureGenerationContext): boolean {
    if (Object.keys(context.parameters ?? {}).length) { return true; }
    const dimensions = new Set(Object.values(tables.creatureDimensions.groups).flat());
    dimensions.delete('classId');
    return [...Object.keys(context), ...Object.keys(context.parameters ?? {})].some(key => dimensions.has(key));
  }
  private static invalid(context: CreatureGenerationContext): boolean {
    return (context.backgroundId !== undefined && !Overlays.has(context.backgroundId))
      || Object.keys(context).some(key => key.endsWith('Score'))
      || (context.raceId !== undefined && !Object.hasOwn(Content.races, context.raceId))
      || (context.classId !== undefined && !Creation.classOf(context.classId))
      || (context.population !== undefined && !Object.hasOwn(tables.creaturePopulation.groups, context.population))
      || CreatureSchema.attributes.some(key => context[key] !== undefined
        && (!Number.isSafeInteger(context[key]) || context[key]! < 1))
      || (context.level !== undefined && (!Number.isSafeInteger(context.level) || context.level < 1));
  }
  // Orsino's character creation: roll 3d6 per score, add the ancestry's, class's and background's modifiers, take the
  // ancestry's birth traits and a specialization, pick spells, draw a weapon and armour from the class's tables, and
  // derive hit points and spell slots. A species creature takes its own statistics, natural weapon and nature traits.
  createCreature(id: string, context: CreatureGenerationContext = {}, randomIdentity = id): Creature {
    if (Content.invalid(context)) { throw new Error(`Invalid creature generation context for ${id}`); }
    const speciesFamily = context.raceId && Canon.isSpecies(context.raceId)
      ? context.raceId : undefined;
    if (speciesFamily && context.classId !== undefined) {
      throw new Error(`${id}: ${Creation.a(speciesFamily)} is a species and takes no class`);
    }
    const deemSpecies = speciesFamily && Object.hasOwn(tables.creatureBody.groups, speciesFamily);
    const family = context.family;
    if (family || deemSpecies || Content.composed(context)) {
      if (context.backgroundId || context.professionId || context.spells || context.gear?.length) {
        throw new Error('Specialized Deem creatures do not yet support background, profession, spell or extra gear overlays');
      }
      const generated = new Content(RandomStreams.key(this.seed, 'creature', randomIdentity), this.setting)
        .generate('creature', { ...context.parameters, ...context, ...family ? { family } : {} });
      return CreatureDefinition.accept(id, generated);
    }
    const stream = this.stream.bind(this, randomIdentity);
    const raceId = context.raceId ?? stream('population').generate('population', context.population ? { population: context.population } : {})
      .raceId as string;
    const species = Canon.isSpecies(raceId);
    if (species && context.classId !== undefined) { throw new Error(`${id}: ${Creation.a(raceId)} is a species and takes no class`); }
    const ancestry = Canon.ancestries[raceId];
    const classId = species ? undefined : Creation.classId(context.classId
      ?? stream('class').pick(ancestry!.classes.filter(c => Canon.classes[c]?.adventuring !== false)));
    if (ancestry && !ancestry.classes.includes(classId!)) { throw new Error(`${id}: ${Creation.a(raceId)} cannot be ${Creation.a(classId!)}`); }
    const kind = ancestry?.nameGroup ?? (Object.hasOwn(tables.forename.groups, raceId) ? raceId : 'hero');
    const generated = { ...stream('attributes').generate('attributes'),
      name: String(stream('name').generate('creature_name', { kind }).name) };
    const chassis = Creation.chassis(raceId, classId);
    const level = context.level ?? (species ? Canon.creature(raceId).statistics?.level : undefined) ?? 1;
    const scores = Object.fromEntries(CreatureSchema.attributes.map(key => [key, Math.max(1,
      (chassis.fixed?.[key] ?? Content.score(generated, key)) + (chassis.attributes[key] ?? 0))]));
    const creature: Creature = { id, name: context.name ?? String(generated.name), raceId,
      ...classId ? { classId } : {},
      base: { ...scores as Record<Attribute, number>, level, abilities: [], maxHp: 1, maxMana: 0, speed: 0 },
      state: { hp: 1, mana: 0, gold: 0, experience: 0, learnedAbilities: [], conditions: [] } };
    if (context.backgroundId) { creature.backgroundId = context.backgroundId; }
    if (context.professionId) { creature.professionId = context.professionId; }
    Overlays.validate({ classId, backgroundId: context.backgroundId, professionId: context.professionId }, id);
    Overlays.apply(creature);
    for (const key of CreatureSchema.attributes) {
      if (context[key] !== undefined) { creature.base[key] = context[key]!; }
    }
    creature.traits = [...new Set([...chassis.traits, ...TraitGrants.choose(creature, context.traits, stream('traits'))])];
    const granted = TraitGrants.abilities(creature, { spells: context.spells, prepared: context.prepared }, stream('spells'));
    creature.base.abilities = [...new Set([...chassis.abilities, ...granted,
      ...context.abilities ?? []])].filter(a => Creation.executable(a));
    const hp = chassis.hitPoints ?? Creation.hitPoints(chassis.hitDie, level, creature.base.constitution);
    creature.base.maxHp = creature.state.hp = hp;
    // Spells spend slots by level; the general pool is only for techniques that cost something, and none does yet.
    creature.base.maxMana = creature.state.mana = 0;
    Spellcasting.equip(creature);
    creature.base.speed = Math.max(0, Fighting.statMod(creature.base.dexterity));
    if (!species) { this.equip(creature, chassis, context, randomIdentity); }
    Overlays.carry(creature, context.gear ?? []);
    CreatureSchema.validate(creature);
    return creature;
  }
  private stream(identity: string, domain: string): Content {
    return new Content(RandomStreams.key(this.seed, domain, identity), this.setting);
  }
  // The pc equipment template: one weapon and one body armour from the class's tables, worn from the start.
  private equip(creature: Creature, chassis: ReturnType<typeof Creation.chassis>,
    context: CreatureGenerationContext, randomIdentity: string) {
    const inventory = creature.state.inventory ??= [];
    for (const [choice, table] of [[context.weapon, chassis.weapons], [context.armor, chassis.armor]] as const) {
      // A weapon or armour the author gave the person replaces the draw from the class's table.
    const authored = (context.gear ?? []).map(g => Canon.resolve('items', g))
      .find(g => table === chassis.weapons ? Canon.items[g]?.weapon && Canon.items[g]?.slot : Canon.items[g]?.armor);
    const kind = choice ?? authored ?? (table.length ? new Content(RandomStreams.key(this.seed, table === chassis.weapons ? 'weapon' : 'armor', randomIdentity), this.setting).pick([...table]) : undefined);
      if (!kind || Canon.items[kind]?.weapon?.natural) { continue; }
      if (!Canon.items[kind]) { throw new Error(`${creature.id}: unknown starting equipment ${kind}`); }
      // A background that already gave one (an outlaw's dagger) has it in hand: there is one of each kind.
      const id = Overlays.gearId(creature.id, kind), held = inventory.find(i => i.id === id);
      if (held) { held.equipped = true; continue; }
      inventory.push({ id, definition: kind, equipped: true });
    }
  }
  private static score(generated: Record<string, DeemValue>, key: string): number {
    const value = generated[key];
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) { throw new Error(`Invalid generated ${key}`); }
    return value;
  }
}
