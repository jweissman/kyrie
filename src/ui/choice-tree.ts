import type { Choice, Section } from './choice-list';

// What opening a choice closes: the choices beside it (one open thing per subject at a time). One opened inside
// another (Guard, in a fight's other abilities, opening whom to guard) is beside only those in the same list, and
// does not close what it is in; one at the top of the menu is beside everything else at the top.
export class ChoiceTree {
  static siblings(subjects: readonly { choices: Choice[] }[], sections: readonly Section[], id: string): string[] {
    const subject = subjects.find(s => s.choices.some(c => c.id === id));
    const top = sections.flatMap(s => s.choices);
    const list = subject?.choices ?? (top.some(c => c.id === id) ? top
      : this.within([...subjects.map(s => s.choices), top], id) ?? top);
    return list.map(c => c.id).filter(x => x !== id);
  }
  private static within(lists: Choice[][], id: string): Choice[] | undefined {
    for (const list of lists) {
      if (list.some(c => c.id === id)) { return list; }
      const inner = this.within(list.flatMap(c => c.children ? [c.children] : []), id);
      if (inner) { return inner; }
    }
    return undefined;
  }
}
