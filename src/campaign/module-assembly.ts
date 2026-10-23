import { LocalKinds } from '../canon/local-catalog';
import { Spatial } from '../spatial';
import { Canon } from '../canon/canon';
import { RuntimeCapabilities } from './runtime-capabilities';
import { ItemCatalog } from '../item-catalog';
import { FieldUse } from './field-use';
import { Discovery, type DiscoveryBinding, type DiscoveryDefinition } from '../information/discovery';
import { Content, type CreatureGenerationContext } from '../content';
import { World } from '../lang/world';
import { ModuleParser } from '../lang/module-parser';
import { ModuleCompiler } from '../lang/module-compiler';
import { ModuleWriter } from '../lang/module-writer';
import { Cast } from './cast';
import type { CampaignActor, CampaignDefinition } from './definition';
import type { Instance, Operator, Module, Person } from '../lang/module';

interface GoalSource {
  id: string; when: string; target: string; priority: number; urgent?: { when: string; priority: number };
}
export interface SituationManifest {
  facts?: { name: string; args: string[] }[];
  discoveries?: DiscoveryBinding[];
  information?: DiscoveryDefinition[];
  name: string;
  labels?: Record<string, string>;
  casting?: Record<string, CreatureGenerationContext>;
  items?: Record<string, string>;
  creatures: { id: string; context: CreatureGenerationContext; gold: number }[];
  actors: { order: (Omit<CampaignActor, 'goals'> & { goals: GoalSource[] })[] };
  initial: { name: string; args: string[]; value: number }[];
  pressure?: CampaignDefinition['pressures'][number];
  outcomes: { id: string; predicate: string }[];
  imports?: string[];
}

export type AdventureManifest = SituationManifest;

// Combines declarative content and a reusable ruleset; contains no adventure-specific decisions.
export class ModuleAssembly {
  static compose(situationSource: string | Module, rulesSource: string | Module, manifest: AdventureManifest,
    seed: string): Instance {
    const situation = typeof situationSource === 'string' ? ModuleParser.parse(situationSource) : situationSource;
    const rules = typeof rulesSource === 'string' ? ModuleParser.parse(rulesSource) : rulesSource;
    const module = this.joined(situation, rules, manifest);
    Spatial.addEscorts(module); Spatial.addSearches(module);
    Spatial.placeFacts(module); Cast.itemKinds(module); Cast.professions(module, situation.people ?? []);
    this.talkers(module, manifest.imports ?? []);
    const { cast, conflicts, company, people } = this.people(module, situation.people ?? [], manifest);
    const seen = (situation.people ?? []).filter(p => p.seen);
    if (seen.length) { module.seen = Object.fromEntries(seen.map(p => [p.id, p.seen!])); }
    delete module.people;
    if (module.initial.some(c => ['memberOf', 'awake', 'needsCare', 'canCast', 'treatable', 'ownedItem', 'wearing', 'canTrain', 'proficient'].includes(c.call.name))) {
      throw new Error('Member state is inferred from the canonical cast; do not initialize it manually');
    }
    this.generatedItems(module, manifest.items ?? {});
    this.itemTraits(module);
    this.references(module, cast);
    const order = [...manifest.actors.order, ...(company ? [company.actor] : []), ...people];
    const actors = this.actors(order, module);
    const extensions = this.extensions(module, actors);
    const definition: CampaignDefinition = { actors, ...(conflicts.length ? { conflicts } : {}),
      ...(extensions.length ? { extensions } : {}),
      creatures: structuredClone(cast),
      pressures: manifest.pressure ? [structuredClone(manifest.pressure)] : [],
      outcomes: manifest.outcomes.map(outcome => ({ ...outcome,
        predicate: ModuleParser.predicate(outcome.predicate) })) };
    this.validate(actors, module.entities, module.actions, definition);
    for (const [id, name] of Object.entries(manifest.labels ?? {})) {
      const entity = module.entities.find(e => e.id === id);
      if (!entity || typeof name !== 'string' || !name.length) { throw new Error('Invalid generated entity label'); }
      entity.name = name;
    }
    const compiler = new ModuleCompiler(RuntimeCapabilities.signatures);
    const instance = compiler.instantiate(module, seed);
    for (const p of instance.module.pursuits ?? []) {
      const owner = definition.actors.find(a => a.id === p.actor)
        ?? definition.extensions?.find(e => e.actor === p.actor);
      const goals = owner!.goals;
      const goal = goals.find(g => g.id === p.id)!;
      goal.when = p.when; goal.target = p.target;
    }
    Discovery.validate(instance.module, new World(instance.module, instance.world), manifest.imports);
    definition.schemas = structuredClone(instance.module.actions);
    this.readOnly(instance, definition, compiler);
    return { ...instance, campaign: definition };
  }
  // A situation joined to its ruleset, with its information, discoveries and generated facts and measures.
  private static joined(situation: Module, rules: Module, manifest: AdventureManifest): Module {
    const information = Discovery.describe(manifest.information ?? []);
    if (manifest.discoveries?.some(b => information.entities.some(e => e.id === b.source))) {
      throw new Error('Source configured by both information and legacy discoveries');
    }
    return { ...situation, name: manifest.name ? `${situation.name}: ${manifest.name}` : situation.name,
      kinds: [...rules.kinds, ...situation.kinds], relations: [...rules.relations, ...situation.relations],
      measures: [...rules.measures, ...situation.measures], queries: [...rules.queries, ...situation.queries],
      entities: [...rules.entities, ...situation.entities, ...information.entities],
      actions: [...rules.actions, ...situation.actions],
      pursuits: [...(rules.pursuits ?? []), ...(situation.pursuits ?? [])],
      rules: [...(rules.rules ?? []), ...(situation.rules ?? [])],
      observations: [...(rules.observations ?? []), ...(situation.observations ?? [])],
      objectives: [...(rules.objectives ?? []), ...(situation.objectives ?? [])],
      ...LocalKinds.merge(rules.catalog, situation.catalog),
      initial: [...rules.initial, ...situation.initial, ...information.initial,
        ...Discovery.lower(manifest.discoveries ?? []),
        ...(manifest.facts ?? []).map(row => ({ kind: 'assert' as const, call: ModuleWriter.call(row.name, ...row.args) })),
        ...manifest.initial.map(row => ({
        kind: 'set' as const, call: ModuleWriter.call(row.name, ...row.args), value: ModuleWriter.number(row.value),
      }))], budget: manifest.pressure ? ModuleWriter.number(manifest.pressure.at) : situation.budget };
  }
  // Who is in the module: the manifest's creatures, the company, and each declared person's group, named as
  // generation cast them; and a controller for each person.
  private static people(module: Module, people: Person[], manifest: AdventureManifest) {
    const conflicts: string[] = [];
    const groups = people.map(p => Cast.group(p, manifest.casting?.[p.id] as Record<string, unknown> | undefined,
      conflicts));
    const company = Cast.company(module);
    const actors = people.map((p, i) => ({ id: p.id, members: groups[i]!.map(m => m.id),
      horizon: p.horizon ?? 4, actions: p.actions, goals: [] }));
    for (const p of people) {
      const name = manifest.casting?.[p.id]?.name;
      if (name) { module.entities.find(e => e.id === p.id)!.name = p.role ? `${name}, ${p.role}` : name; }
    }
    if (company && manifest.actors.order.some(a => a.player)) { throw new Error('Declare the company once: in the module or the party table'); }
    if (Object.keys(manifest.casting ?? {}).some(id => !people.some(p => p.id === id))) {
      throw new Error('Generated casting names an undeclared Person');
    }
    return { cast: [...manifest.creatures, ...(company?.creatures ?? []), ...groups.flat()], conflicts, company,
      people: actors };
  }
  // Nothing a module does may write what the campaign projects or keeps: creatures' facts, the clock, records and
  // pressures; and every pressure, outcome and goal must be a well-formed predicate over the module.
  private static readOnly(instance: Instance, definition: CampaignDefinition, compiler: ModuleCompiler) {
    if (instance.module.actions.some(a => [...a.success, ...a.failure].some(c =>
      ['able', 'dead', 'watch', 'recorded', 'deficit', 'capable',
        'memberOf', 'awake', 'needsCare', 'canCast', 'treatable', 'ownedItem', 'wearing', 'canTrain', 'proficient'].includes(c.call.name)))) {
      throw new Error('Creature projections and campaign clock/pressure records are read-only');
    }
    if ([...instance.module.initial, ...(instance.module.rules ?? []).flatMap(r => r.effects)]
      .some(c => c.call.name === 'capable')) {
      throw new Error('Creature capabilities are read-only projections');
    }
    for (const pressure of definition.pressures) {
      compiler.validate({ ...instance.module, goal: { kind: 'compare', operator: '>=',
        left: pressure.measure, right: ModuleWriter.number(0) } });
      if (!instance.module.entities.some(e => e.id === pressure.id && e.type === 'pressure')) {
        throw new Error('Unknown pressure');
      }
    }
    for (const p of [...definition.outcomes.map(o => o.predicate), ...definition.actors.flatMap(a =>
      a.goals.flatMap(g => [g.when, g.target, ...(g.urgent ? [g.urgent.when] : [])]))]) {
      compiler.validate({ ...instance.module, goal: p });
    }
  }
  // Controllers for the manifest's actors, the company and declared people, with their goals and pursuits.
  private static actors(order: AdventureManifest['actors']['order'], module: Module): CampaignActor[] {
    const actors: CampaignActor[] = order.map(actor => ({ ...actor,
      goals: actor.goals.map(goal => ({ id: goal.id, priority: goal.priority, when: ModuleParser.predicate(goal.when),
        target: ModuleParser.predicate(goal.target), ...(goal.urgent ? {
          urgent: { ...goal.urgent, when: ModuleParser.predicate(goal.urgent.when) },
        } : {}) })),
    }));
    for (const actor of actors) {
      if (actor.actions.includes('*')) {
        if (actor.player) { actor.allActions = true; }
        actor.actions = module.actions.filter(a => actor.player || (!a.resolve && a.time === 1 && !a.speaker))
          .map(a => a.id);
      }
    }
    for (const actor of actors.filter(a => a.player)) {
      actor.actions.push(...module.actions.filter(a => a.speaker && !actor.actions.includes(a.id)).map(a => a.id));
    }
    if (module.kinds.includes('member')) {
      for (const actor of actors) {
        for (const member of actor.members) {
          module.initial.push({ kind: 'assert', call: ModuleWriter.call('memberOf', `member_${member}`, actor.id) });
        }
      }
    }
    for (const p of (module.pursuits ?? []).filter(p => actors.some(a => a.id === p.actor))) {
      const actor = actors.find(a => a.id === p.actor)!;
      if (actor.goals.some(g => g.id === p.id)) { throw new Error(`Invalid pursuit controller ${p.actor}`); }
      actor.goals.push({ id: p.id, priority: p.priority, when: p.when, target: p.target });
      actor.actions.push(...(p.using ?? []).filter(id => !actor.actions.includes(id)));
    }
    return actors;
  }
  // A pursuit for someone this module does not declare (an imported person) extends that person when the module is
  // installed: they take up the goal and may use the actions it names.
  private static extensions(module: Module, actors: CampaignActor[]): NonNullable<CampaignDefinition['extensions']> {
    const out: NonNullable<CampaignDefinition['extensions']> = [];
    for (const p of (module.pursuits ?? []).filter(p => !actors.some(a => a.id === p.actor))) {
      if (!module.entities.some(e => e.id === p.actor && e.type === 'group')) {
        throw new Error(`Invalid pursuit controller ${p.actor}`);
      }
      let extension = out.find(e => e.actor === p.actor);
      if (!extension) { extension = { actor: p.actor, goals: [], actions: [] }; out.push(extension); }
      extension.goals.push({ id: p.id, priority: p.priority, when: p.when, target: p.target });
      extension.actions.push(...(p.using ?? []).filter(id => !extension.actions.includes(id)));
    }
    return out;
  }
  private static generatedItems(module: Module, items: Record<string, string>) {
    for (const [id, kind] of Object.entries(items)) {
      const entity = module.entities.find(e => e.id === id && e.type === 'item');
      const definition = ItemCatalog.get(kind);
      if (!entity || !module.entities.some(e => e.id === kind && e.type === 'itemkind')
        || module.initial.some(c => c.call.name === 'itemKind' && c.call.args[0] === id)) {
        throw new Error(`Generated item ${id} needs a declared item, kind and no duplicate authored binding`);
      }
      entity.name = definition.name;
      module.initial.push({ kind: 'assert', call: ModuleWriter.call('itemKind', id, kind) });
    }
  }
  // Who can be talked to: a person of an ancestry (not a beast of a species), and anyone with something to be asked.
  // Someone a module borrows from another (an imported innkeeper) is said to talk by the module that has them.
  private static talkers(module: Module, imported: string[]) {
    if (!module.relations.some(r => r.name === 'talks')) { return; }
    const ids = new Set([...(module.people ?? []).filter(p => !p.creature && !(p.raceId && Canon.isSpecies(p.raceId)))
      .map(p => p.id), ...module.actions.flatMap(a => a.speaker && !imported.includes(a.speaker) ? [a.speaker] : [])]);
    for (const id of ids) { module.initial.push({ kind: 'assert', call: ModuleWriter.call('talks', id) }); }
  }
  private static itemTraits(module: Module) {
    const kinds = new Set(module.initial.filter(c => c.kind === 'assert' && c.call.name === 'itemKind')
      .map(c => c.call.args[1]!));
    for (const kind of kinds) {
      const definition = ItemCatalog.get(kind);
      const fuel = [...kinds].some(k => ItemCatalog.get(k).fuel === kind);
      for (const name of [...(definition.slot ? ['wearable'] : []), ...(definition.use ? ['consumable'] : []),
        ...(/^Apply (torchlit|candlelit) to self/.test(definition.use ?? '') ? ['lightsUp'] : []), ...fuel ? ['fuel'] : []]) {
        this.trait(module, name, kind);
      }
      if (definition.fuel && kinds.has(definition.fuel)) { this.trait(module, 'burns', kind, definition.fuel); }
    }
  }
  private static trait(module: Module, name: string, ...args: string[]) {
    if (module.relations.some(r => r.name === name) && !module.initial.some(c => c.kind === 'assert'
      && c.call.name === name && c.call.args.every((a, i) => a === args[i]))) {
      module.initial.push({ kind: 'assert', call: ModuleWriter.call(name, ...args) });
    }
  }
  private static references(module: Module, cast: SituationManifest['creatures']) {
    if (module.relations.some(r => r.name === 'fieldUsable')) {
      for (const ability of Content.abilities.filter(a => FieldUse.safe(a.id))) {
        module.initial.push({ kind: 'assert', call: ModuleWriter.call('fieldUsable', ability.id) });
      }
    }
    if (module.kinds.includes('member')) {
      for (const creature of cast) {
        module.entities.push({ id: `member_${creature.id}`, creatureId: creature.id,
          name: creature.context.name ?? creature.id, type: 'member' });
      }
    }
    if (module.kinds.includes('feat')) {
      for (const [id, t] of Object.entries(Canon.traits).filter(([, t]) => t.category === 'feat')) {
        if (!module.entities.some(e => e.id === id)) { module.entities.push({ id, type: 'feat', name: t.name }); }
      }
    }
    if (module.kinds.includes('ability')) {
      for (const ability of Content.abilities) {
        if (!module.entities.some(e => e.id === ability.id)) {
          module.entities.push({ id: ability.id, type: 'ability', name: ability.name });
        }
      }
    }
  }
  private static validate(actors: CampaignActor[], entities: { id: string; type: string }[],
    schemas: Operator[], definition: CampaignDefinition) {
    const ids = definition.creatures.map(c => c.id), members = actors.flatMap(a => a.members);
    if (new Set(ids).size !== ids.length || new Set(members).size !== members.length
      || new Set(actors.map(a => a.id)).size !== actors.length || actors.filter(a => a.player).length > 1
      || members.some(id => !ids.includes(id)) || ids.some(id => !members.includes(id))) {
      throw new Error('Invalid campaign actor membership');
    }
    for (const actor of actors) {
      if (!actor.members.length || !entities.some(e => e.id === actor.id && e.type === 'group')
        || !Number.isSafeInteger(actor.horizon) || actor.horizon < 1
        || actor.actions.some(name => !schemas.some(s => s.id === name))
        || actor.goals.some(g => !Number.isFinite(g.priority) || (g.urgent && !Number.isFinite(g.urgent.priority)))) {
        throw new Error(`Invalid controller ${actor.id}`);
      }
      if (!actor.player && schemas.some(s => actor.actions.includes(s.id) && s.resolve)) {
        throw new Error('NPC controllers cannot use actions with combat or other resolution');
      }
    }
    for (const pressure of definition.pressures) {
      if (!Number.isSafeInteger(pressure.at) || pressure.at < 1
        || !Number.isSafeInteger(pressure.required) || pressure.required < 1) {
        throw new Error('Invalid pressure');
      }
    }

  }
}
