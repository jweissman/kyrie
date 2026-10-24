import { ChoiceList, type Choice, type Section } from '../../src/ui/choice-list';
import { ChoiceTree } from '../../src/ui/choice-tree';
import { SceneModel, type Scene } from '../../src/ui/scene';
import { Attending, type Attention, type Examined, type Talk } from '../../src/ui/attention';
import type { Frame } from '../engine/protocol';
import type { Travel } from './reader-app';

export type View = 'here' | 'company' | 'pack' | 'journal' | 'map' | 'story';
// What can be chosen now: the scene (who and what is here, the ways, yourself), or a conversation with one of them, or
// one thing looked at; in a fight, the acting companion's options; or the company's or the pack's. Every choice in
// the order it is drawn, with what is open after its opener.
export interface Menu { sections: Section[]; choices: Choice[]; scene?: Scene; talk?: Talk; examined?: Examined }

export class MenuModel {
  static build(frame: Frame | undefined, view: View, open: string[], attention?: Attention): Menu {
    if (!frame) { return { sections: [], choices: [] }; }
    const opened = new Set(open);
    if (!frame.combat && !['pack', 'company'].includes(view)) {
      const scene = SceneModel.build(frame.screen);
      return this.attending(scene, opened, attention) ?? this.place(Attending.place(scene), opened);
    }
    const sections = frame.combat ? ChoiceList.combat(frame.combat)
      : view === 'pack' ? ChoiceList.pack(frame.screen) : ChoiceList.party(frame.screen);
    return { sections, choices: ChoiceList.all(sections).flatMap(c => this.unfold(c, opened)) };
  }
  private static place(scene: Scene, opened: Set<string>): Menu {
    return { scene, sections: this.sections(scene), choices: SceneModel.order(scene, opened) };
  }
  // Someone spoken with: what can be said to them, and taking leave. Something looked at: what can be done with it, by
  // kind, and turning away. The scene is kept whole, so what is said is said to them by name.
  private static attending(scene: Scene, opened: Set<string>, attention?: Attention): Menu | undefined {
    if (attention?.kind === 'person') {
      const talk = Attending.talk(scene, attention.id);
      const choices = talk && [...talk.replies.flatMap(c => this.unfold(c, opened)), talk.leave];
      return talk && { scene, talk, choices: choices!, sections: [{ id: talk.subject.id, title: talk.subject.name,
        tone: 'person', glyph: '☺', choices: choices! }] };
    }
    if (attention?.kind === 'thing') {
      const examined = Attending.thing(scene, attention.id);
      const choices = examined && [...examined.groups.flatMap(g => g.choices.flatMap(c => this.unfold(c, opened))),
        examined.back];
      return examined && { scene, examined, choices: choices!, sections: examined.groups.map(g => ({ id: g.title,
        title: g.title, tone: 'thing' as const, glyph: '·', choices: g.choices })) };
    }
    return undefined;
  }
  private static unfold(c: Choice, open: Set<string>): Choice[] {
    return [c, ...open.has(c.id) && c.children ? c.children.flatMap(k => this.unfold(k, open)) : []];
  }
  // The scene as sections, for automation: each subject, the ways about the place and out, and yourself.
  private static way(id: string, title: string, choices: Choice[]): Section[] {
    return choices.length ? [{ id, title, tone: 'way', glyph: '→', choices }] : [];
  }
  private static sections(scene: Scene): Section[] {
    return [...scene.subjects.map(s => ({ id: s.id, title: s.name, tone: s.kind === 'companion' ? 'person' as const
      : s.kind === 'animal' ? 'creature' as const : s.kind, glyph: '·', choices: s.choices })),
    ...this.way('ways', 'Go', scene.near), ...this.way('ways-out', 'Set out', scene.far),
    ...scene.you.length ? [{ id: 'company', title: 'Yourself', tone: 'company' as const, glyph: '○', choices: scene.you }] : []];
  }
  // The choices beside one: those it would close by opening (see ChoiceTree).
  static siblings(menu: Menu, id: string): string[] {
    return ChoiceTree.siblings(menu.scene?.subjects ?? [], menu.sections, id);
  }
  // What the player chose, as they would say it: said beside Wat, "Ask about Father" is "Ask Wat about Father";
  // beside the dog, "Make much of" is "Make much of Fly".
  static said(menu: Menu, choice: Choice): string {
    const subject = menu.scene?.subjects.find(s => this.holds(s.choices, choice.id));
    if (!subject || choice.label.includes(subject.name)) { return choice.label; }
    const ask = /^(Ask|Tell|Show|Offer|Give|Pay) (about|what|why|how|if|for|whether|that|where|who)\b/
      .exec(choice.label);
    if (ask) { return choice.label.replace(/^(\w+) /, `$1 ${subject.name} `); }
    return /^\w+( \w+)?( of| at| to| with)?$/.test(choice.label) ? `${choice.label} ${this.inline(subject.name)}` : choice.label;
  }
  private static holds(choices: Choice[], id: string): boolean {
    return choices.some(c => c.id === id || (c.children ? this.holds(c.children, id) : false));
  }
  private static inline(name: string): string { return name.replace(/^(The|A|An|Some) /, m => m.toLowerCase()); }
  // A way that takes a while across the country is a journey: said while it is worked out.
  static travel(choice: Choice, frame: Frame): Travel | undefined {
    const exit = frame.screen.exits.find(e => choice.id === e.id || choice.id.startsWith(`${e.id}/`));
    if (choice.tone !== 'way' || !exit || (choice.minutes ?? 0) < 20) { return undefined; }
    return { from: frame.screen.place.id, to: exit.destination.id, way: exit.way ?? exit.name,
      minutes: choice.minutes ?? 0 };
  }
  static shape(c: Choice) {
    return { id: c.id, label: c.label, ...(c.command ? { command: c.command } : {}),
      ...(c.children ? { children: c.children.length } : {}), ...(c.disabled ? { disabled: c.disabled } : {}) };
  }
}
