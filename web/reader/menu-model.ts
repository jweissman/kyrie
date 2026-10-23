import { ChoiceList, type Choice, type Section } from '../../src/ui/choice-list';
import { Intentions } from '../../src/ui/intentions';
import type { Frame } from '../engine/protocol';

export type View = 'here' | 'company' | 'pack' | 'journal' | 'map' | 'story';
export interface Menu { sections: Section[]; level: Choice[]; trail: Choice[] }

// What can be chosen now, from the frame the engine sent and what the page is showing: the place's choices, a
// companion's in a fight, or those of the company or the pack. A choice that opens a short list is followed by the
// trail; the list on show is the top level or the last one opened.
export class MenuModel {
  static build(frame: Frame | undefined, view: View, trail: string[]): Menu {
    const sections = !frame ? [] : frame.combat ? ChoiceList.combat(frame.combat)
      : view === 'pack' ? ChoiceList.pack(frame.screen) : view === 'company' ? ChoiceList.party(frame.screen)
        : Intentions.book(frame.screen);
    const opened: Choice[] = [];
    for (const id of trail) {
      const found = ChoiceList.find(sections, id);
      if (!found?.children) { break; }
      opened.push(found);
    }
    return { sections, level: opened.length ? opened.at(-1)!.children! : ChoiceList.all(sections), trail: opened };
  }
  static shape(c: Choice) {
    return { id: c.id, label: c.label, ...(c.command ? { command: c.command } : {}),
      ...(c.children ? { children: c.children.length } : {}), ...(c.disabled ? { disabled: c.disabled } : {}) };
  }
}
