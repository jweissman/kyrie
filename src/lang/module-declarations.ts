import { Spatial } from '../spatial';
import type { DiscoveryDefinition } from '../information/discovery';
import type { Change, Module, NumberValue, Operator, Predicate, Query, Signature } from './module';
import { WorldConstructs, type EventSpec, type PassageSpec, type ThingSpec } from './world-constructs';
import { ItemCatalog } from '../item-catalog';
import { PersonParser } from './person-parser';
import { Endings, type EndingSpec } from './endings';
import { Milestones, type MilestoneSpec } from './milestones';

type Field = { field: string; value: unknown };
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
  private static and(left: Predicate, right: Predicate): Predicate { return { kind: 'and', left, right }; }
  // One declaration, joined to the module it is in.
  static declare(module: Module, { field, value }: Field,
    into: { information: DiscoveryDefinition[]; singleton: Set<string> }) {
    const { information, singleton } = into;
    switch (field) {
      case 'person': PersonParser.declare(module, value); break;
      case 'passage': WorldConstructs.passage(module, value as PassageSpec); break;
      case 'company': PersonParser.company(module, value as NonNullable<Module['company']>); break;
      case 'item': WorldConstructs.item(module, value as { id: string; name?: string; kind: string; place: string },
        ItemCatalog.definitions[(value as { kind: string }).kind]?.name); break;
      case 'thing': WorldConstructs.thing(module, value as ThingSpec); break;
      case 'event': WorldConstructs.event(module, value as EventSpec); break;
      case 'ending': Endings.lower(module, value as EndingSpec); break;
      case 'milestone': Milestones.lower(module, value as MilestoneSpec); break;
      case 'objective': (module.objectives ??= []).push(value as NonNullable<Module['objectives']>[number]); break;
      case 'place': case 'hazard': module.entities.push(value as Module['entities'][number]); break;
      case 'exit': ModuleDeclarations.exit(module, value as Module['entities'][number]); break;
      case 'information': information.push(value as DiscoveryDefinition); break;
      case 'pursuit': (module.pursuits ??= []).push(value as NonNullable<Module['pursuits']>[number]); break;
      case 'rule': (module.rules ??= []).push(value as NonNullable<Module['rules']>[number]); break;
      case 'observation': (module.observations ??= []).push(value as NonNullable<Module['observations']>[number]); break;
      case 'kind': module.kinds.push(value as string); break;
      case 'relation': module.relations.push(value as Signature); break;
      case 'measure': module.measures.push(value as Signature); break;
      case 'query': module.queries.push(value as Query); break;
      case 'entity': module.entities.push(value as Module['entities'][number]); break;
      case 'initial': module.initial.push(value as Change); break;
      case 'action': {
        const { once, topic, ...action } = value as Operator & { once?: boolean; topic?: boolean };
        if (once) { WorldConstructs.once(module, action); }
        if (action.speaker && !topic) { ModuleDeclarations.spoken(action, action.speaker); }
        module.actions.push(action); break;
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
