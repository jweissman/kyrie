import type * as ohm from 'ohm-js';
import type { Module, Predicate } from './module';
import type { World } from './world';
import type { InstalledModule } from '../campaign/definition';
import { ObservationText } from './observation-text';

type Node = ohm.Node;
export interface EndingSpec { id: string; title: string; when: Predicate; text: string }

// An ending closes the book: `Ending sealed "The Re-Sealing" when sealed(heart) "epilogue".` The first whose condition
// holds is reached, its epilogue told as it happens, and play stops, the page closing on its title and epilogue
// (Thrume F12, The Patient Star's 28, the Road's F19 and F23: four endings each, written as relations and an epilogue
// observation, with play carrying on after). It is an entity of the kind `ending` and a rule that reaches it once: the
// first of its module's endings to hold, for each installation has its own `concluded`. A module installed into a world
// already under way (a country beyond a march: InstalledModule.chapter) closes only its own chapter: its epilogue is
// told as it happens, and the world goes on (What Tessary Owes, the authoring-friction report).
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
  static readonly concluded = 'concluded';
  static lower(module: Module, e: EndingSpec) {
    module.entities.push({ id: e.id, type: 'ending', name: e.title });
    if (!module.relations.some(r => r.name === Endings.concluded)) { module.relations.push({ name: Endings.concluded, types: [], exclusive: false }); }
    const concluded = { kind: 'call' as const, name: Endings.concluded, args: [] };
    (module.rules ??= []).push({ id: e.id, say: e.text, when: { kind: 'and', left: e.when,
      right: { kind: 'not', value: concluded } },
    effects: [{ kind: 'assert', call: { kind: 'call', name: 'reached', args: [e.id] } }, { kind: 'assert', call: concluded }] });
  }
  // The ending the world has come to, as the page closes on it: one of a module the campaign was made of, not of a
  // chapter installed into it as it went on.
  static reached(world: World, installations: readonly InstalledModule[] = []): { title: string; lines: string[] } | undefined {
    const chapters = installations.filter(m => m.chapter).map(m => `${m.id}__`);
    const id = world.relates('reached') ? world.related('reached').map(r => r.args[0]!)
      .find(e => !chapters.some(c => e.startsWith(c))) : undefined;
    if (!id) { return undefined; }
    const say = world.module.rules?.find(r => r.id === id)?.say;
    const title = world.module.entities.find(e => e.id === id)?.name ?? id;
    return { title, lines: say ? [ObservationText.render(say, world)] : [] };
  }
}
