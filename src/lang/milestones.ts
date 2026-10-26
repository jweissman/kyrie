import type * as ohm from 'ohm-js';
import type { Module, Predicate } from './module';
import type { World } from './world';
import { ModuleWriter } from './module-writer';

type Node = ohm.Node;
export interface MilestoneSpec { id: string; title: string; worth: number; when: Predicate }

// Something done that a company grows by: `Milestone deeds_carried "carried the deeds of the held" worth 300 when
// deedsDelivered(ossel).` Old-school experience is for what is resolved, not only what is killed; a long adventure
// resolves many things on the way to its one goal (What Tessary Owes; the Road's "a company does not grow"). It is an
// entity of the kind `milestone` worth so much (merit), and a rule that marks it achieved the first time its condition
// holds; the company is given its worth then, as for a module seen through (Progression.milestones).
export class Milestones {
  static readonly actions = { Milestone: Milestones.parse, MilestoneWorth: Milestones.worth,
    MilestoneWhen: Milestones.when };
  static parse(_milestone: Node, id: Node, title: Node, terms: Node) {
    return { field: 'milestone', value: { id: id.sourceString, title: Milestones.ast(title) as string,
      ...Milestones.ast(terms) as { worth: number; when: Predicate } } };
  }
  static worth(_worth: Node, amount: Node, when: Node) {
    return { worth: Number(amount.sourceString), when: Milestones.ast(when) as Predicate };
  }
  static when(_when: Node, condition: Node, _dot: Node) { return Milestones.ast(condition); }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static lower(module: Module, m: MilestoneSpec) {
    module.entities.push({ id: m.id, type: 'milestone', name: m.title });
    module.initial.push({ kind: 'set', call: ModuleWriter.call('merit', m.id), value: ModuleWriter.number(m.worth) });
    const achieved = ModuleWriter.call('achieved', m.id);
    (module.rules ??= []).push({ id: `${m.id}_achieved`, when: { kind: 'and', left: m.when,
      right: { kind: 'not', value: achieved } }, effects: [{ kind: 'assert', call: achieved }] });
  }
  // The milestones achieved, with what each is worth and called: given once each, as they come.
  static achieved(world: World): { id: string; title: string; worth: number }[] {
    if (!world.relates('achieved')) { return []; }
    return world.related('achieved').map(r => r.args[0]!).map(id => ({ id,
      title: world.module.entities.find(e => e.id === id)?.name ?? id,
      worth: world.number(ModuleWriter.call('merit', id)) }));
  }
}
