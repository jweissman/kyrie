import type * as ohm from 'ohm-js';
import type { Module, Predicate } from './module';

type Node = ohm.Node;
export interface ChapterSpec { id: string; title: string; when: Predicate; text: string }

// A chapter opens once, when its condition first holds: its title heads the page, and its words are told first of
// what came of the step, in a paragraph of their own (`Chapter saturday "Saturday" when day(clock) == 2 and
// hour(clock) >= 6 "The bells of Saint Ebba's ring six…".`). Three adventures built their days' openings by hand, a
// rule and a latch each, and found them run on after supper, or told after the day's weather (the Banns at Hessel's
// 22, the Liberty of the Ice's 26, A Winter in Carth's chapter rules). It is an entity of the kind `heading` and a
// rule, before its file's others, that asserts chapterOpened(id).
export class Chapters {
  static readonly actions = { Chapter: Chapters.parse };
  static parse(_chapter: Node, id: Node, title: Node, when: Node) {
    const said = Chapters.ast(when) as { when: Predicate; text: string };
    return { field: 'chapter', value: { id: id.sourceString, title: Chapters.ast(title) as string, ...said } };
  }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static lower(module: Module, c: ChapterSpec) {
    const heads = new Set(module.entities.filter(e => e.type === 'heading').map(e => e.id));
    module.entities.push({ id: c.id, type: 'heading', name: c.title });
    const opened = { kind: 'call' as const, name: 'chapterOpened', args: [c.id] }, rules = (module.rules ??= []);
    let at = 0;
    while (at < rules.length && heads.has(rules[at]!.id)) { at++; }
    rules.splice(at, 0, { id: c.id, say: c.text, when: { kind: 'and', left: c.when, right: { kind: 'not', value: opened } },
      effects: [{ kind: 'assert', call: opened }] });
  }
  // The chapter a step opened, if one did: its title, and its words as they were told.
  static opened(module: Module, perceptions: readonly { id: string; text: string }[] = []):
    { title: string; text: string } | undefined {
    const heads = new Map(module.entities.filter(e => e.type === 'heading').map(e => [e.id, e.name ?? e.id]));
    const p = perceptions.find(x => heads.has(x.id));
    return p ? { title: heads.get(p.id)!, text: p.text } : undefined;
  }
}
