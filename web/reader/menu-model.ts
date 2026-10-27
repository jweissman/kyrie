import { ChoiceList, type Choice, type Section } from '../../src/ui/choice-list';
import { ChoiceTree } from '../../src/ui/choice-tree';
import { SceneModel, type Scene } from '../../src/ui/scene';
import { Attending, type Attention, type Examined, type Talk } from '../../src/ui/attention';
import type { Frame } from '../engine/protocol';
import type { Travel } from './reader-app';
import { Words } from './words';
import { Routes } from '../../src/ui/route';

export type View = 'here' | 'company' | 'pack' | 'journal' | 'map' | 'story';
// What can be chosen now: the scene (who and what is here, the ways, yourself), or a conversation with one of them, or
// one thing looked at; in a fight, the acting companion's options; or the company's or the pack's. Every choice in
// the order it is drawn, with what is open after its opener.
export interface Menu {
  sections: Section[]; choices: Choice[]; scene?: Scene; talk?: Talk; examined?: Examined; destinations?: Choice[];
}

export class MenuModel {
  static build(frame: Frame | undefined, view: View, open: string[],
    at: { attention?: Attention; member?: string } = {}): Menu {
    const { attention, member } = at;
    if (!frame) { return { sections: [], choices: [] }; }
    const opened = new Set(open);
    if (!frame.combat && !['pack', 'company'].includes(view)) {
      const scene = SceneModel.build(frame.screen);
      return this.attending(scene, opened, attention) ?? this.place(Attending.place(scene), opened, frame.screen);
    }
    const sections = frame.combat ? ChoiceList.combat(frame.combat)
      : view === 'pack' ? ChoiceList.pack(frame.screen) : this.character(frame.screen, member);
    return { sections, choices: ChoiceList.all(sections).flatMap(c => this.unfold(c, opened)) };
  }
  // The character: who in the company is shown (when there is more than one), the development they have to spend,
  // each way of spending it said with what it is, and whatever else can be done with them.
  static readonly development = /^(raise_quality|learn_skill)\(/;
  // A choice that spends a development, or opens only ways of spending one (Advance › Take up a skill).
  private static develops(c: Choice): boolean {
    return this.development.test(c.command ?? '') || (!!c.children?.length && c.children.every(k => this.develops(k)));
  }
  static character(screen: Frame['screen'], member?: string): Section[] {
    const m = screen.party.find(x => x.id === member) ?? screen.party[0];
    if (!m) { return []; }
    const others = ChoiceList.party({ ...screen, party: [m] })[0]?.choices[0]?.children ?? [];
    const development = (m.development?.options ?? []).filter(o => o.command).map(o => ({ id: `dev:${o.command!}`,
      label: o.kind === 'quality' ? `Raise ${o.name}` : `Take up ${o.name}`, tone: 'member' as const, command: o.command }));
    return [
      ...screen.party.length > 1 ? [{ id: 'members', title: 'The company', tone: 'member' as const, glyph: '☺',
        choices: screen.party.map(x => ({ id: x.id, label: x.name, tone: 'member' as const, note: `${x.line} · level ${x.level}` })) }] : [],
      ...development.length ? [{ id: 'development', title: 'Development', tone: 'member' as const, glyph: '+',
        choices: development }] : [],
      { id: 'acts', title: 'What can be done', tone: 'member' as const, glyph: '·',
        choices: others.filter(c => !this.develops(c)) }];
  }
  // The place, and after its ways out, the places the company knows the way to and could set out for. A level's
  // development is spent in the character, where what each way of spending it changes is said: here it is only said
  // that there is one (the free play of M16 found seven "take up" acts crowding the place).
  // Where there are ways about the place, the roads out of it are folded under one choice that opens them, and so are
  // the places known further off when there are more than a few: a town square offered thirty peers, its people
  // twice, its destinations twice and its roads out among them (the play-structure investigation's PT-09).
  private static place(found: Scene, opened: Set<string>, screen: Frame['screen']): Menu {
    const scene = { ...found, you: found.you.map(c => /^advance:/.test(c.id) ? this.developing(c, screen) : c) };
    const destinations = this.destinations(screen);
    // On a road the two ways on are the road itself, never folded.
    const far = scene.near.length && scene.far.length && !Routes.of(screen)
      ? [this.fold(MenuModel.roads, 'Roads out', scene.far)] : scene.far;
    const going = destinations.length > 3 ? [this.fold(MenuModel.going, 'Set out for', destinations)] : destinations;
    const choices = [...scene.subjects.flatMap(s => s.choices), ...scene.near, ...far, ...going,
      ...scene.you].flatMap(c => this.unfold(c, opened));
    return { scene: { ...scene, far }, sections: [...this.sections({ ...scene, far }), ...going.length
      ? [{ id: 'destinations', title: 'Set out for', tone: 'way' as const, glyph: '⇢', choices: going }] : []], choices,
    destinations: going };
  }
  static readonly roads = 'fold:roads';
  static readonly going = 'fold:going';
  private static fold(id: string, label: string, children: Choice[]): Choice {
    return { id, label, tone: 'way', note: `${children.length}`, children };
  }
  private static developing(c: Choice, screen: Frame['screen']): Choice {
    const id = /^advance:([^/]+)/.exec(c.id)![1]!, m = screen.party.find(x => x.id === id);
    const left = m?.development?.left ?? 1;
    return { id: c.id, label: `${m?.name ?? c.label}: ${left === 1 ? 'a development' : `${left} developments`} to spend`,
      tone: c.tone, command: `view:company:${id}` };
  }
  // A place known and the way to it: opened, the way it goes, leg by leg, and setting out. A place whose way is not
  // known is set out toward, as far as the known ways go (the edge of the wood it is said to be in).
  static destinations(screen: Frame['screen']): Choice[] {
    return (screen.destinations ?? []).map(d => ({ id: `dest:${d.id}`, label: d.toward ? `Toward ${d.name}` : d.name,
      tone: 'way' as const, note: d.toward ? `${Words.span(d.minutes)}, as far as ${d.toward}` : Words.span(d.minutes),
      children: [{ id: `travel:${d.id}`, label: `Set out ${d.toward ? 'toward' : 'for'} ${d.name}`, tone: 'way' as const,
        command: `travel:${d.id}`, minutes: d.minutes }] }));
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
    const label = Words.shown(choice.label);
    if (!subject || label.includes(subject.name)) { return label; }
    const ask = /^(Ask|Tell|Show|Offer|Give|Pay) (about|what|why|how|if|for|whether|that|where|who)\b/.exec(label);
    if (ask) { return label.replace(/^(\w+) /, `$1 ${subject.name} `); }
    if (label === 'Look closely') { return `Look closely at ${this.inline(subject.name)}`; }
    return /^\w+( \w+)?( of| at| to| with)?$/.test(label) ? `${label} ${this.inline(subject.name)}` : label;
  }
  private static holds(choices: Choice[], id: string): boolean {
    return choices.some(c => c.id === id || (c.children ? this.holds(c.children, id) : false));
  }
  private static inline(name: string): string { return name.replace(/^(The|A|An|Some) /, m => m.toLowerCase()); }
  // A way that takes a while across the country is a journey: said while it is worked out.
  static travel(choice: Choice, frame: Frame): Travel | undefined {
    const known = /^travel:(.+)$/.exec(choice.command ?? '')?.[1];
    const to = known && frame.screen.destinations?.find(d => d.id === known);
    if (to) {
      return { from: frame.screen.place.id, to: to.id, way: to.legs.map(l => l.way).join(', then '), minutes: to.minutes };
    }
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
