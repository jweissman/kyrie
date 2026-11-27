import { Durings } from './during';
import { Spatial } from './spatial';
import type { DiscoveryDefinition } from './discovery';
import type { Change, Module, NumberValue, Operator, Predicate, Query, Signature, WorldRule } from './module';
import { WorldConstructs, type EventSpec, type PassageSpec, type ThingSpec } from './world-constructs';
import type { VocabularyContext } from './vocabulary';
import { PersonParser } from './person-parser';
import { Endings, type EndingSpec } from './endings';
import { Chapters, type ChapterSpec } from './chapters';
import { Promises, type PromiseSpec } from './promises';
import { Occasions, type OccasionSpec } from './occasions';
import { Situations, type SituationSpec } from './situations';
import { Routes, type RouteSpec } from './routes';
import { Milestones, type MilestoneSpec } from './milestones';

type Field = { field: string; value: unknown };
type During = { when: Predicate; fields: Field[] };
// Each declaration of a module, as the parser hands it over, joined to the module: a person, a passage, an item made
// into the entities, facts, observations and rules it stands for; anything else kept as it is.
export class ModuleDeclarations {
  // A spatial exit is an entity and the action that takes it.
  static exit(module: Module, entity: Module['entities'][number]) {
    module.entities.push(entity);
    const lowered = Spatial.lowerExit(entity);
    module.initial.push(...lowered.initial); module.actions.push(lowered.action);
  }
  // What someone says (Speaker priest) is said only while they can speak, as a topic is: able and where the company
  // is, or travelling with it and awake (the audit's F6: a dead priest heard the company out and agreed).
  private static spoken(action: Operator, s: string) {
    const { call, and } = ModuleDeclarations;
    const here = and(call('able', s), and(call('at', s, '?here'), call('at', 'actor', '?here')));
    const along = and(call('travelsWith', s, 'actor'),
      { kind: 'not', value: and(call('joinedAs', '?m', s), { kind: 'not', value: call('awake', '?m') }) });
    action.requires = and(action.requires, { kind: 'or', left: here, right: along });
  }
  private static call(name: string, ...args: string[]): Predicate { return { kind: 'call', name, args }; }
  // A Rule written `once` happens the first time its condition holds, and never again: it keeps its own latch (262 of
  // 731 rules asserted a fact their own condition denied, a latch each wrote by hand: the architecture review's M2).
  private static rule(module: Module, r: WorldRule & { once?: boolean }): WorldRule {
    if (!r.once) { return r; }
    const rule: WorldRule & { once?: boolean } = { ...r };
    const latch = { kind: 'call' as const, name: `${r.id}_once`, args: [] };
    delete rule.once;
    module.relations.push({ name: latch.name, types: [], exclusive: false });
    return { ...rule, when: { kind: 'and', left: rule.when, right: { kind: 'not', value: latch } },
      effects: [...rule.effects, { kind: 'assert', call: latch }] };
  }
  // What the language writes for an Ending is its own: a module's `concluded` was one with its Ending's, which could
  // then never be reached (the architecture review's A16). The language's other names (reached, achieved, merit,
  // unopened) are the shared rules', and a module's own is made its own apart (see ModuleShadow).
  private static own(s: Signature): Signature {
    if (s.name === Endings.concluded) { throw new Error(`${s.name} is the language's own: an Ending writes it`); }
    return s;
  }
  private static and(left: Predicate, right: Predicate): Predicate { return { kind: 'and', left, right }; }
  // What is written within a During holds its condition as well as its own, ahead of it (see Durings): a rule's and
  // an observation's when, an act's requires; a During within, both.
  private static during({ when, fields }: During): Field[] {
    return fields.flatMap(({ field, value }) => {
      const v = value as Record<string, unknown>, id = String(v.id ?? 'a During');
      switch (field) {
        case 'rule': case 'observation':
          return [{ field, value: { ...v, when: Durings.within(when, v.when as Predicate, id) } }];
        case 'action': return [{ field, value: { ...v, requires: Durings.within(when, v.requires as Predicate, id) } }];
        case 'during': return this.during({ when: Durings.within(when, (v as During).when, 'a During'),
          fields: (v as During).fields });
        default: throw new Error(`During holds rules, acts, observations and Durings, not ${field}`);
      }
    });
  }
  // One declaration, joined to the module it is in.
  static declare(context: VocabularyContext, module: Module, { field, value }: Field,
    into: { information: DiscoveryDefinition[]; singleton: Set<string> }) {
    const { information, singleton } = into;
    switch (field) {
      case 'person': PersonParser.declare(context, module, value); break;
      case 'passage': WorldConstructs.passage(module, value as PassageSpec); break;
      case 'company': PersonParser.company(module, value as NonNullable<Module['company']>); break;
      case 'item': WorldConstructs.item(context, module, value as { id: string; name?: string; kind: string; place?: string },
        context.kind((value as { kind: string }).kind)?.name); break;
      case 'thing': WorldConstructs.thing(context, module, value as ThingSpec); break;
      case 'event': WorldConstructs.event(context, module, value as EventSpec); break;
      case 'ending': Endings.lower(module, value as EndingSpec); break;
      case 'chapter': Chapters.lower(module, value as ChapterSpec); break;
      case 'promise': Promises.lower(module, value as PromiseSpec); break;
      case 'occasion': Occasions.lower(module, value as OccasionSpec); break;
      case 'situation': Situations.lower(module, value as SituationSpec); break;
      case 'during': for (const f of ModuleDeclarations.during(value as During)) { this.declare(context, module, f, into); } break;
      case 'route': Routes.lower(module, value as RouteSpec); break;
      case 'milestone': Milestones.lower(module, value as MilestoneSpec); break;
      case 'objective': (module.objectives ??= []).push(value as NonNullable<Module['objectives']>[number]); break;
      case 'place': case 'hazard': module.entities.push(value as Module['entities'][number]); break;
      case 'exit': ModuleDeclarations.exit(module, value as Module['entities'][number]); break;
      case 'information': information.push(value as DiscoveryDefinition); break;
      case 'pursuit': (module.pursuits ??= []).push(value as NonNullable<Module['pursuits']>[number]); break;
      case 'rule': (module.rules ??= []).push(ModuleDeclarations.rule(module, value as WorldRule)); break;
      case 'observation': (module.observations ??= []).push(value as NonNullable<Module['observations']>[number]); break;
      case 'kind': module.kinds.push(value as string); break;
      case 'relation': module.relations.push(ModuleDeclarations.own(value as Signature)); break;
      case 'measure': module.measures.push(value as Signature); break;
      case 'query': module.queries.push(value as Query); break;
      case 'entity': module.entities.push(value as Module['entities'][number]); break;
      case 'initial': module.initial.push(value as Change); break;
      case 'action': {
        type Latched = Operator & { once?: boolean; only?: boolean; tried?: boolean; again?: string };
        const { once: put, only, tried, again: answer, ...action } = value as Latched;
        const topic = action.topic, once = put || answer !== undefined;
        // A question put once can be put again, for the same answer and nothing more (M16: topics vanished once asked);
        // one put once only cannot (The Third Night's friction 6). One that says something else again (Says "…" again
        // "…": R60) is put once by that, and its again says that, whatever it taught.
        if (answer !== undefined && only) { throw new Error(`Topic ${action.id} is put once only, and cannot say again`); }
        Milestones.talked(module, action);
        const again = once && topic && !only ? WorldConstructs.recall(action, answer) : [];
        if (once) { WorldConstructs.once(module, action); }
        if (tried) { WorldConstructs.tried(module, action); }
        if (action.answers) { WorldConstructs.answer(module, action, action.answers); }
        if (action.speaker && !topic) { ModuleDeclarations.spoken(action, action.speaker); }
        module.actions.push(action, ...again); break;
      }
      case 'localkind': case 'localspecies': break;
      default:
        if (singleton.has(field)) { throw new Error(`Duplicate module field ${field}`); }
        singleton.add(field);
        if (field === 'goal') { module.goal = value as Predicate; }
        if (field === 'budget') { module.budget = value as NumberValue; }
        if (field === 'description') { module.description = value as string; }
    }
  }
}
