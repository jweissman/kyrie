import type * as ohm from 'ohm-js';
import type { Module, Predicate } from './module';
import type { World } from './world';
import { ObservationText } from './observation-text';

type Node = ohm.Node;
export interface EndingSpec { id: string; title: string; when: Predicate; text: string }

// An ending closes the book: `Ending sealed "The Re-Sealing" when sealed(heart) "epilogue".` The first whose condition
// holds is reached, its epilogue told as it happens, and play stops, the page closing on its title and epilogue
// (Thrume F12, The Patient Star's 28, the Road's F19 and F23: four endings each, written as relations and an epilogue
// observation, with play carrying on after). It is an entity of the kind `ending` and a rule that reaches it once.
export class Endings {
  static readonly actions = { Ending: Endings.parse, EndingWhen: Endings.when };
  static parse(_ending: Node, id: Node, title: Node, when: Node) {
    return { field: 'ending', value: { id: id.sourceString, title: Endings.ast(title) as string,
      ...Endings.ast(when) as { when: Predicate; text: string } } };
  }
  static when(_when: Node, when: Node, text: Node, _dot: Node) {
    return { when: Endings.ast(when) as Predicate, text: Endings.ast(text) as string };
  }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static lower(module: Module, e: EndingSpec) {
    module.entities.push({ id: e.id, type: 'ending', name: e.title });
    (module.rules ??= []).push({ id: e.id, say: e.text, when: { kind: 'and', left: e.when,
      right: { kind: 'not', value: { kind: 'call', name: 'reached', args: ['?ending'] } } },
    effects: [{ kind: 'assert', call: { kind: 'call', name: 'reached', args: [e.id] } }] });
  }
  // The ending the world has come to, as the page closes on it.
  static reached(world: World): { title: string; lines: string[] } | undefined {
    const id = world.relates('reached') ? world.related('reached')[0]?.args[0] : undefined;
    if (!id) { return undefined; }
    const say = world.module.rules?.find(r => r.id === id)?.say;
    const title = world.module.entities.find(e => e.id === id)?.name ?? id;
    return { title, lines: say ? [ObservationText.render(say, world)] : [] };
  }
}
