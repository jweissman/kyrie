import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';

type Node = ohm.Node;
type Field = { field: string; value: unknown };

// An aim: its id, the condition it holds while, what it is toward where its author says (Objective … toward keeper
// "…": see ObjectiveTarget), and its words.
export class ObjectiveParser {
  static of(id: Node, when: Node, toward: Node, text: Node): Field {
    const ids = toward.children[0]?.children[1]!.asIteration().children.map(c => c.sourceString) ?? [];
    return { field: 'objective', value: { id: id.sourceString, when: ModuleParser.ast(when),
      text: ModuleParser.ast(text), ...ids.length ? { toward: ids } : {} } };
  }
}
