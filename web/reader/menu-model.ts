import { ChoiceList, type Choice, type Section } from '../../src/ui/choice-list';
import { ChoiceTree } from '../../src/ui/choice-tree';
import { SceneModel, type Scene } from '../../src/ui/scene';
import { Attending, type Attention, type Examined, type Talk } from '../../src/ui/attention';
import { Routes } from '../../src/ui/route';
import type { Frame } from '../engine/protocol';
import type { Glance } from '../../src/presentation/glance-types';
import type { Travel } from './reader-app';
import { Words } from './words';
import { Hours } from './hours';
import { Wares } from './wares';

export type View = 'here' | 'company' | 'pack' | 'journal' | 'map' | 'story';
// What can be chosen now: the scene (who and what is here, the ways, yourself), or a conversation with one of them, or
// one thing looked at; in a fight, the acting companion's options; or the company's or the pack's. Every choice in
// the order it is drawn, with what is open after its opener.
export interface Menu {
  sections: Section[]; choices: Choice[]; scene?: Scene; talk?: Talk; examined?: Examined; destinations?: Choice[];
  // The other places of the town, further than a step, walked to directly.
  around?: Choice[];
  // Where each choice at a place is drawn besides the glance (see Glance): who and what is here and the place's own
  // acts under Look about, the ways under Every way, the company's own under More. It places them; it ranks nothing.
  sheets?: Sheets;
}
export interface Sheets { look: string[]; ways: string[]; more: string[] }

export class MenuModel {
  static build(frame: Frame | undefined, view: View, open: string[],
    at: { attention?: Attention; member?: string; asked?: string[] } = {}): Menu {
    const { attention, member } = at;
    if (!frame) { return { sections: [], choices: [] }; }
    const opened = new Set(open);
    if (!frame.combat && !['pack', 'company'].includes(view)) {
      const scene = SceneModel.build(frame.screen);
      return this.attending(scene, opened, { attention, asked: at.asked }, frame)
        ?? this.place(Attending.place(scene), opened, frame);
    }
    const sections = frame.combat ? ChoiceList.combat(frame.combat)
      : view === 'pack' ? ChoiceList.pack(frame.screen) : this.character(frame.screen, member);
    // What can be prepared in place of each spell is drawn under it, open (see CharacterPage.Prepared).
    return { sections, choices: sections.flatMap(s => s.id === 'prepare' ? s.choices.flatMap(g => g.children ?? [])
      : s.choices.flatMap(c => this.unfold(c, opened))) };
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
    const all = ChoiceList.party({ ...screen, party: [m] })[0]?.choices[0]?.children ?? [];
    const prepare = all.find(c => c.label === 'Prepare spells'), others = all.filter(c => c !== prepare);
    const development = (m.development?.options ?? []).filter(o => o.command).map(o => ({ id: `dev:${o.command!}`,
      label: o.kind === 'quality' ? `Raise ${o.name}` : `Take up ${o.name}`, tone: 'member' as const, command: o.command }));
    return [
      ...screen.party.length > 1 ? [{ id: 'members', title: 'The company', tone: 'member' as const, glyph: '☺',
        choices: screen.party.map(x => ({ id: x.id, label: x.name, tone: 'member' as const, note: `${x.line} · level ${x.level}` })) }] : [],
      ...development.length ? [{ id: 'development', title: 'Development', tone: 'member' as const, glyph: '+',
        choices: development }] : [],
      ...prepare?.children?.length ? [{ id: 'prepare', title: 'Prepared today', tone: 'spell' as const, glyph: '✦',
        choices: prepare.children }] : [],
      { id: 'acts', title: 'What can be done', tone: 'member' as const, glyph: '·',
        choices: others.filter(c => !this.develops(c)) }];
  }
  // The place, and after its ways out, the places the company knows the way to and could set out for. A level's
  // development is spent in the character, where what each way of spending it changes is said: here it is only said
  // that there is one (the free play of M16 found seven "take up" acts crowding the place).
  // Nothing is folded: the ways about the place and the roads out are each a choice, and of the places further off the
  // nearest few are journeys to set out on, the rest on the map (the owner's interim report: folded trees of roads and
  // destinations were the graph laid bare, a town square's thirty peers the reason they had been folded: PT-09).
  private static place(found: Scene, opened: Set<string>, frame: Frame): Menu {
    const screen = frame.screen;
    const scene = { ...found, you: found.you.map(c => /^advance:/.test(c.id) ? this.developing(c, screen)
      : /^prepare:/.test(c.id) ? this.preparing(c, screen) : c) };
    // On a road the page draws no glance (see RoadStage): its two ends and what is by it, in their own order.
    const glance = Routes.of(screen) ? undefined : frame.leaf.glance;
    const aimed = frame.leaf.glance?.aimed;
    const going = [...this.onward(frame.bound), ...this.destinations(screen, frame.bound?.id, aimed)];
    const about = this.around(screen), subjects = scene.subjects.flatMap(s => s.choices);
    const ways = [...scene.near, ...about, ...scene.far, ...going];
    const own = scene.you.filter(SceneModel.own), yours = scene.you.filter(c => !SceneModel.own(c));
    const sheets = { look: this.ids([...subjects, ...own], opened), ways: this.ids(ways, opened),
      more: this.ids(yours, opened) };
    return { scene, sections: [...this.sections(scene), ...going.length
      ? [{ id: 'destinations', title: 'Set out for', tone: 'way' as const, glyph: '⇢', choices: going }] : []],
    choices: this.led(this.unfolded([...subjects, ...ways, ...scene.you], opened), glance, aimed), destinations: going,
    around: about, ...glance ? { sheets } : {} };
  }
  // Every choice as drawn, what is open under its opener (and what is in a way, always: see inWay).
  private static unfolded(choices: Choice[], opened: Set<string>): Choice[] {
    return choices.flatMap(c => this.unfold(c, this.inWay(c) ? new Set([...opened, c.id]) : opened));
  }
  private static ids(choices: Choice[], opened: Set<string>): string[] {
    return this.unfolded(choices, opened).map(c => c.id);
  }
  // What the glance leads with comes first, in its order (the keys' 1, 2 and 3), then everything else as it was: the
  // same choices, none twice, none lost.
  // What the glance leads with first; on a road, where no glance is drawn, the way toward the aim (the first key had
  // been a word with whoever was by the road, and a player following the page went back and forth to them).
  private static led(choices: Choice[], glance?: Glance, aimed: string[] = []): Choice[] {
    const first = glance ? glance.acts.flatMap(a => choices.find(c => c.id === a.choice) ?? [])
      : aimed.flatMap(id => choices.find(c => c.id === id) ?? []);
    return [...first, ...choices.filter(c => !first.includes(c))];
  }
  // A thing for sale, open whole (its quantities are among the choices).
  private static ware(w: Choice, opened: Set<string>): Choice[] {
    return this.unfold(w, new Set([...opened, ...this.all(w)]));
  }
  // Something in a way and what can be done about it are drawn under the way, open, and are among the choices (they
  // had been a fold: play 7): a choice of a way's own that holds choices of its own, the first of them too (a way
  // barred by a portcullis drew "Push and pull at it" under it, and a touch on it found nothing: play 9).
  private static inWay(c: Choice): boolean { return /^exit:[^/]+\/\d+:/.test(c.id) && !!c.children; }
  // The other places of the town further than a step, each walked to directly by the known way: "To the taproom of
  // the Fierce Goblet, by the landing".
  static around(screen: Frame['screen']): Choice[] {
    return (screen.around ?? []).map(d => ({ id: `travel:${d.id}`, label: `To ${d.name.replace(/^The /, 'the ')}`,
      tone: 'way' as const, command: `travel:${d.id}`, minutes: d.minutes,
      note: `by ${d.legs.slice(0, -1).map(l => l.to.replace(/^The /, 'the ')).join(' and ')}` }));
  }
  // How many of the places further off are offered where the company stands; the map has them all.
  static readonly near = 3;
  private static developing(c: Choice, screen: Frame['screen']): Choice {
    const id = /^advance:([^/]+)/.exec(c.id)![1]!, m = screen.party.find(x => x.id === id);
    const left = m?.development?.left ?? 1;
    return { id: c.id, label: `${m?.name ?? c.label}: ${left === 1 ? 'a development' : `${left} developments`} to spend`,
      tone: c.tone, command: `view:company:${id}` };
  }
  // Spells are prepared on the caster's page, each in place of one prepared now: here it is only said that they can
  // be (play 9 found a fold three deep, "Prepare spells › In place of Bless (first-level slot) › Dark Bolt": M17-25).
  private static preparing(c: Choice, screen: Frame['screen']): Choice {
    const id = /^prepare:([^/]+)/.exec(c.id)![1]!, m = screen.party.find(x => x.id === id);
    return { id: c.id, label: `${m?.name ?? c.label}: prepare other spells`, tone: c.tone, note: 'an hour each',
      command: `view:company:${id}` };
  }
  // The nearest places known and the way to them, each a journey to set out on at once: where it goes, how long, and
  // by where (the first legs' places). A place whose way is not known is set out toward, as far as the known ways go
  // (the edge of the wood it is said to be in). Past the nearest few, the map, which has them all.
  static destinations(screen: Frame['screen'], bound?: string, aimed: string[] = []): Choice[] {
    const all = (screen.destinations ?? []).filter(d => d.id !== bound);
    // The nearest, and the place your aims name, near or far: the engine says which (see Glance.aimed).
    const named = all.slice(this.near).find(d => aimed.includes(`travel:${d.id}`));
    const shown = [...all.slice(0, this.near), ...named ? [named] : []], rest = all.length - shown.length;
    return [...shown.map(d => ({ ...this.journey(d), note: [d.scale, this.by(d), Hours.dark(screen.elapsed, d.minutes)]
      .filter(Boolean).join(' · ') })), ...this.roads(screen, bound, this.near - shown.length),
      ...rest > 0 ? [{ id: 'view:map', label: rest === 1 ? 'One other place you know, on the map'
        : `${Words.upper(Words.many(rest, 'other place'))} you know, on the map`, tone: 'way' as const, command: 'view:map' }] : []];
  }
  // Where nothing much has been told of yet (a first town), the nearest of the towns the roads go to and the
  // march-stones at their ends, as many as make up the few: the first town had offered nowhere to set out for, though
  // four towns were a day or less by the roads (the navigation review). Not one a single way off: that way is on the
  // page already.
  private static roads(screen: Frame['screen'], bound: string | undefined, few: number): Choice[] {
    if (few <= 0) { return []; }
    return (screen.roads ?? []).filter(d => d.id !== bound && d.legs.length > 1).slice(0, few)
      .map(d => ({ ...this.journey(d), note: [`${Words.span(d.minutes)} by the roads`, Hours.dark(screen.elapsed, d.minutes)]
        .filter(Boolean).join(' · ') }));
  }
  // A journey held (set out on, and not yet come to the end of): going on with it, by the way known from here, and
  // giving it up.
  static readonly unbind = 'unbind';
  static onward(bound: Frame['bound']): Choice[] {
    if (!bound) { return []; }
    return [{ id: `travel:${bound.id}`, label: `Go on to ${bound.name}`, tone: 'way', command: `travel:${bound.id}`,
      minutes: bound.minutes, note: this.by(bound) },
    { id: this.unbind, label: 'Give up going there', tone: 'way', command: this.unbind }];
  }
  // "about 2 hours, by the holly hollow": how long, and the places a journey goes by on its way.
  static by(d: NonNullable<Frame['screen']['destinations']>[number]): string {
    const via = d.legs.slice(0, -1).map(l => l.to).slice(-2);
    return [d.toward ? `${Words.span(d.minutes)}, as far as ${d.toward}` : Words.span(d.minutes),
      via.length ? `by ${via.join(' and ')}` : ''].filter(Boolean).join(', ');
  }
  // Setting out for a place known the way to, chosen on the map or in the notes: as the place offers it, for a lead.
  static journey(d: NonNullable<Frame['screen']['destinations']>[number]): Choice {
    return { id: `travel:${d.id}`, label: `Set out ${d.toward ? 'toward' : 'for'} ${d.name}`, tone: 'way',
      command: `travel:${d.id}`, minutes: d.minutes };
  }
  // Someone spoken with: what can be said to them, and taking leave. Something looked at: what can be done with it, by
  // kind, and turning away. The scene is kept whole, so what is said is said to them by name.
  // What has been asked already goes after what has not, taking leave last of all: the page led with "Ask again about
  // the road your father took" for as long as a player went on pressing what it led with (the owner, 31 October).
  private static attending(scene: Scene, opened: Set<string>, { attention, asked = [] }: { attention?: Attention;
    asked?: string[] }, frame?: Frame): Menu | undefined {
    if (attention?.kind === 'person') {
      const said = Attending.talk(scene, attention.id), done = new Set(asked);
      const talk = said && { ...said,
        replies: [...said.replies].sort((a, b) => Number(done.has(a.id)) - Number(done.has(b.id))) };
      // What is for sale is on the counter, each thing a control, in the counter's order before what can be said, as
      // the page draws them: among the choices, never folded (play 7).
      const sold = talk && Wares.of(frame?.screen.trade.find(c => c.id === talk.subject.id), talk.replies);
      // What is new to ask first, then what can be bought, then what has been asked and what cannot be afforded (a
      // counter had led the page, and a player following it spent the last coin on candles, or stood at it for ever);
      // everything asked, taking leave leads.
      const buys = (sold?.wares ?? []).flatMap(w => w.buy ? [w.buy] : []), can = buys.filter(b => !b.disabled);
      const rest = sold?.rest ?? [], spent = talk && rest.every(c => done.has(c.id));
      const choices = talk && [...spent ? [talk.leave] : [],
        ...rest.filter(c => !done.has(c.id)).flatMap(c => this.unfold(c, opened)),
        ...can.flatMap(w => this.ware(w, opened)),
        ...rest.filter(c => done.has(c.id)).flatMap(c => this.unfold(c, opened)),
        ...buys.filter(b => b.disabled).flatMap(w => this.ware(w, opened)), ...spent ? [] : [talk.leave]];
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
  private static all(c: Choice): string[] { return [c.id, ...(c.children ?? []).flatMap(k => this.all(k))]; }
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
    const to = known && [...frame.screen.destinations ?? [], ...frame.screen.roads ?? []].find(d => d.id === known);
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
