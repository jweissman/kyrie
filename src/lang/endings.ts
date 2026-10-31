import type * as ohm from 'ohm-js';
import type { Module, Predicate } from './module';
import type { World } from './world';
import type { InstalledModule } from '../campaign/definition';
import { ObservationText } from './observation-text';
import { Chapters } from './chapters';
import { Promises } from './promises';
import { Occasions } from './occasions';
import { EndingOrder } from './ending-order';

type Node = ohm.Node;
// over: the endings this one is reached before, where both hold (see EndingOrder).
export interface EndingSpec { id: string; title: string; when: Predicate; text: string; over?: string[] }

// An ending closes the book: `Ending sealed "The Re-Sealing" when sealed(heart) "epilogue".` The first whose condition
// holds is reached, its epilogue told as it happens, and play stops, the page closing on its title and epilogue
// (Thrume F12, The Patient Star's 28, the Road's F19 and F23: four endings each, written as relations and an epilogue
// observation, with play carrying on after). It is an entity of the kind `ending` and a rule that reaches it once: the
// first of its module's endings to hold, for each installation has its own `concluded`. A module installed into a world
// already under way (a country beyond a march: InstalledModule.chapter) closes only its own chapter: its epilogue is
// told as it happens, and the world goes on (What Tessary Owes, the authoring-friction report). Of two that hold at
// once, the one written first is reached, unless the other is said to be over it (see EndingOrder).
export class Endings {
  // A chapter is written as an ending is, and opens as an ending closes (see Chapters); a promise is kept or broken as
  // one does (see Promises).
  static readonly actions = { Ending: Endings.parse, EndingTail: Endings.tail, EndingOver: Endings.over,
    EndingWhen: Endings.when, ...Chapters.actions, ...Promises.actions, ...Occasions.actions };
  static parse(_ending: Node, id: Node, title: Node, tail: Node) {
    return { field: 'ending', value: { id: id.sourceString, title: Endings.ast(title) as string,
      ...Endings.ast(tail) as { over?: string[]; when: Predicate; text: string } } };
  }
  // `over a, b` before its condition: the endings this one is reached before, where both hold.
  static tail(over: Node, when: Node) {
    return { ...over.children.length ? { over: Endings.ast(over.children[0]!) as string[] } : {},
      ...Endings.ast(when) as { when: Predicate; text: string } };
  }
  static over(_over: Node, ids: Node): string[] { return ids.asIteration().children.map(c => c.sourceString); }
  // Once a file's endings are all written, each said to be over others holds them back (see EndingOrder.rank).
  static rank(module: Module, fields: readonly { field: string; value: unknown }[]) {
    EndingOrder.rank(module, fields.filter(f => f.field === 'ending').map(f => f.value as EndingSpec));
  }
  static when(_when: Node, when: Node, text: Node, _dot: Node) {
    return { when: Endings.ast(when) as Predicate, text: Endings.ast(text) as string };
  }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static readonly concluded = 'concluded';
  static lower(module: Module, e: EndingSpec) {
    module.entities.push({ id: e.id, type: 'ending', name: e.title });
    if (!module.relations.some(r => r.name === Endings.concluded)) {
      module.relations.push({ name: Endings.concluded, types: [], exclusive: false });
    }
    const concluded = { kind: 'call' as const, name: Endings.concluded, args: [] };
    (module.rules ??= []).push({ id: e.id, say: e.text, when: { kind: 'and', left: e.when,
      right: { kind: 'not', value: concluded } },
    effects: [{ kind: 'assert', call: { kind: 'call', name: 'reached', args: [e.id] } },
      { kind: 'assert', call: concluded }] });
  }
  // The ending the world has come to, as the page closes on it: one of a module the campaign was made of, not of a
  // chapter installed into it as it went on.
  static reached(world: World, installations: readonly InstalledModule[] = []):
    { title: string; lines: string[] } | undefined {
    const chapters = installations.filter(m => m.chapter).map(m => `${m.id}__`);
    const id = world.relates('reached') ? world.related('reached').map(r => r.args[0]!)
      .find(e => !chapters.some(c => e.startsWith(c))) : undefined;
    if (!id) { return undefined; }
    const rule = world.module.rules?.find(r => r.id === id), say = rule?.say;
    const title = world.module.entities.find(e => e.id === id)?.name ?? id;
    // Said of whom it was reached by, where its condition names them ("?g leaves rich" was printed: the
    // architecture review's A17).
    const asked = rule?.when.kind === 'and' ? rule.when.left : undefined;
    const binding = asked && say && ObservationText.variables(say).length
      ? world.solve(asked, {}).next().value ?? {} : {};
    return { title, lines: say ? [ObservationText.render(say, world, true, binding)] : [] };
  }
}
