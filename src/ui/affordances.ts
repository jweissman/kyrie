import type { Why } from '../presentation/glance-types';
import { Attending } from './attention';
import type { Choice } from './choice-list';
import type { Candidate, Kind } from './promotion';
import { Marks } from './marks';
import { SceneModel, type Scene, type SceneSubject } from './scene';
import type { ExitRow, Screen } from './screen-types';

// What the glance reads the page's choices with, besides the screen: each command's action as the rules declare it
// (its kind, what it is done to, whether it is written to be asked of someone), what the company's aims name, the way
// it came, the signs and the life it has just seen, what it has done here and whom it has spoken with, and its needs.
// All of it from what the company has perceived and the module declares, never from a choice's words.
export interface Reading {
  schema: Map<string, string>; args: Map<string, string[]>; speakers: Set<string>;
  // What the module's author wrote to be done with something here (Change follow "Follow the ruts"): its own act.
  authored: Set<string>;
  // The ids the aim shown names (its people, places and things, and the places of a site it names), those the other
  // aims held name, and the ways from here that lead toward a place they name (by exit id, and for which).
  named: Set<string>; held: Set<string>; toward: Map<string, 'toward' | 'held'>;
  back?: string; here: string;
  // A sign perceived here and not seen before, by whom or what it is of ('' for the place's own).
  signs: Map<string, string>;
  life?: string; pointed: Set<string>; done: Set<string>; talked: Set<string>;
  needs: { hungry: boolean; rations: number; hurt: Set<string>; night: boolean; weary: boolean; settled: boolean;
    open: boolean;
    // Where in the settlement a bed is to be had, a step from here, when there is none here.
    bed?: string };
}
// Every top-level choice of the place (as the page draws it: Attending.place over the scene), and the walks about the
// town, as candidates to be led with, each with every reason it might be (see Promotion). Pure.
export class Affordances {
  static of(scene: Scene, screen: Screen, r: Reading): Candidate[] {
    const threat = scene.subjects.some(s => SceneModel.threat(s));
    const back = threat || !!screen.warned || !!screen.dark;
    // In the dark, nothing gives light when no one can light one (see ChoiceList.lighting).
    const lightless = !!screen.dark && !scene.you.some(c => this.kind(c, r) === 'light');
    return [...scene.subjects.flatMap(s => this.warning(this.subject(s, screen, r), s, screen)),
      ...[...scene.near, ...scene.far].flatMap(c => this.way(c, screen, { r, back })),
      ...this.around(screen, r), ...this.journeys(screen, r),
      ...scene.you.flatMap(c => this.yours(c, screen, { r, threat, lightless }))]
      .map((c, order) => ({ ...c, order }));
  }
  // Whoever warns the company off: what is done toward them comes first, before the way back.
  private static warning(cands: Candidate[], s: SceneSubject, screen: Screen): Candidate[] {
    return screen.warned?.id === s.id ? cands.map((c, i) => i ? c : { ...c, whys: ['warned', ...c.whys] }) : cands;
  }
  private static subject(s: SceneSubject, screen: Screen, r: Reading): Candidate[] {
    if (s.kind === 'companion' || s.state) { return []; }
    if (SceneModel.threat(s)) { return this.threat(s, r); }
    const only = s.choices.length === 1 ? s.choices[0]! : undefined;
    const opener = only && [`${s.id}#talk`, `${s.id}#look`].includes(only.id) ? only : undefined;
    if (opener) { return this.opened(s, opener, screen, r); }
    // An animal, or a creature of no danger: its first gentle act, for what is new about it.
    const gentle = this.gentle(s.choices, r);
    if (!gentle) { return []; }
    const whys: Why[] = [...r.signs.has(s.id) ? ['sign' as const] : [], ...r.life === s.id ? ['life' as const] : [],
      ...this.about([gentle], r) ? ['about' as const] : [], ...this.ownWhy([gentle], r)];
    return [this.candidate(gentle, { subject: s.id, kind: 'act', whys, r })];
  }
  // A danger: its gentlest act (one of its own first, then any that is neither a risk nor a blow), and the attack.
  private static threat(s: SceneSubject, r: Reading): Candidate[] {
    const gentle = this.gentle(s.choices, r), attack = s.choices.find(c => this.kind(c, r) === 'attack');
    return [...gentle ? [this.candidate(gentle, { subject: s.id, kind: 'act', r,
      whys: ['danger', ...this.about([gentle], r) ? ['about' as const] : []] })] : [],
    ...attack ? [this.candidate(attack, { subject: s.id, kind: 'attack', r, whys: ['danger'],
      notes: { danger: s.danger ?? '' } })] : []];
  }
  private static gentle(choices: Choice[], r: Reading): Choice | undefined {
    const open = choices.filter(c => this.command(c) && !c.disabled && !this.risky(c) && this.kind(c, r) !== 'attack');
    return open.find(c => c.own) ?? open[0];
  }
  // Someone to talk to, or something to look at: one choice that opens what can be done; it is led with for anything
  // nested in it, said beside it (an answer owed, the aim, a bed for the night).
  private static opened(s: SceneSubject, opener: Choice, screen: Screen, r: Reading): Candidate[] {
    const leaves = Attending.all(opener.children ?? []).filter(c => c.command && !c.disabled);
    // What is new to be said to them: not a question asked once more (its action the first's, "_again"), nor what
    // they sell; the page had led with "Talk to Adrik — your aim" for as long as he had an answer to repeat.
    const fresh = leaves.filter(c => r.speakers.has(c.command!) && !/_again(\(|$)/.test(c.command!));
    const talked = r.talked.has(s.id), person = s.kind === 'person';
    const answer = leaves.find(c => c.answer), kin = s.stake && (!talked || fresh.some(c => !r.done.has(c.command!)));
    const word = s.note?.split(' · ')[0], feature = screen.things.find(t => t.id === s.id)?.kind === 'feature';
    const looked = leaves.find(c => r.schema.get(c.command!) === 'look_closely' && !r.done.has(c.command!));
    const whys: Why[] = [...answer ? ['answer' as const] : [], ...kin ? ['kin' as const] : [],
      ...this.about(fresh, r) ? ['about' as const] : [], ...person && r.life === s.id && !talked ? ['life' as const] : [],
      ...this.ownWhy(leaves, r), ...r.signs.has(s.id) ? ['sign' as const] : [],
      ...person && s.asked && !talked ? ['asked' as const] : [], ...feature && looked ? ['unlooked' as const] : []];
    const needs = this.served(leaves, r);
    const base = { subject: s.id, kind: person ? 'talk' as const : 'act' as const, r };
    return [this.candidate(opener, { ...base, whys: [...whys, ...needs.map(n => n.why)], notes: {
      ...answer ? { answer: answer.label } : {}, ...kin ? { kin: word?.startsWith('your ') ? word : 'your aim' } : {},
      ...Object.fromEntries(needs.map(n => [n.why, n.note])) },
    ...answer?.command ? { command: answer.command } : {} })];
  }
  // What someone here offers that the company needs now: a bed at night in a settlement, healing for one hurt.
  private static served(leaves: Choice[], r: Reading): { why: Why; note: string }[] {
    const bed = r.needs.night && r.needs.settled
      && leaves.find(c => ['take_lodging', 'take_lodging_guest'].includes(r.schema.get(c.command!) ?? ''));
    const cure = r.needs.hurt.size > 0 && leaves.find(c => r.schema.get(c.command!) === 'take_healing');
    return [...bed ? [{ why: 'night' as const, note: `for the night: ${this.priced(bed)}` }] : [],
      ...cure ? [{ why: 'hurt' as const, note: this.priced(cure) }] : []];
  }
  private static priced(c: Choice): string {
    const fee = c.note?.split(' · ')[0];
    return `${c.label.charAt(0).toLowerCase()}${c.label.slice(1)}${fee && /coin$/.test(fee) ? `, ${fee}` : ''}`;
  }
  // A way: the one the aim names, one toward it, the way back when there is something to get away from, a way about
  // the place not yet taken, the first thing to try on a way barred.
  private static way(c: Choice, screen: Screen, at: { r: Reading; back: boolean }): Candidate[] {
    const exit = screen.exits.find(e => c.id === e.id || c.id.startsWith(`${e.id}/`)), r = at.r;
    if (!exit) { return []; }
    const dest = exit.destination.id, tried = c.id !== exit.id && !!exit.blocked;
    const first = tried && this.firstTry(c, exit);
    const toward = r.toward.get(exit.id);
    // A way about the place not yet taken is worth taking by day; at night, the way to a bed.
    const whys: Why[] = [...at.back && dest === r.back && !c.disabled ? ['retreat' as const] : [],
      ...r.named.has(dest) ? ['named' as const] : [], ...toward ? [toward] : [],
      ...r.held.has(dest) ? ['held' as const] : [], ...r.needs.night && dest === r.needs.bed ? ['night' as const] : [],
      ...exit.local && !exit.visited && !r.needs.night ? ['unvisited' as const] : [], ...first ? ['unlooked' as const] : []];
    // A try on a way barred (look at the portcullis) is something done there, not a way.
    const kind = tried ? 'act' as const : exit.bearing ? 'step' as const : 'way' as const;
    return [this.candidate(c, { exit: exit.id, kind, whys, r,
      notes: { retreat: 'the way you came', named: 'your aim', toward: 'toward your aim', held: 'another aim',
        night: 'a bed for the night', unlooked: exit.blocked ?? '' }, visited: exit.visited,
      pointed: r.pointed.has(dest) })];
  }
  private static firstTry(c: Choice, exit: ExitRow): boolean {
    return c.id === `${exit.id}/${exit.acts[0]?.key ?? ''}`;
  }
  // The other places of the town, walked to directly.
  private static around(screen: Screen, r: Reading): Candidate[] {
    const visited = new Set(screen.map.filter(p => p.visited).map(p => p.id));
    return (screen.around ?? []).map(d => ({ choice: `travel:${d.id}`, command: `travel:${d.id}`, label: `To ${d.name}`,
      kind: 'travel' as const, order: 0, marks: d.minutes > 10 && Marks.journey(screen.elapsed, d.minutes) ? [Marks.dusk] : [],
      minutes: d.minutes, visited: visited.has(d.id),
      pointed: r.pointed.has(d.id), whys: [...r.named.has(d.id) ? ['named' as const] : [],
        ...r.held.has(d.id) ? ['held' as const] : [], ...visited.has(d.id) ? [] : ['unvisited' as const]],
      notes: { named: 'your aim', held: 'another aim' } }));
  }
  // A journey to where the aim shown is, further than the ways from here, by the way the company knows (as far as it
  // is known), unless it goes only as far as here: a far aim had been set out for from the map alone (the owner, 31
  // October). Not another aim held: two such, each shown where it names the place, sent a company back and forth
  // between the edges of two wild countries (REV-08).
  private static journeys(screen: Screen, r: Reading): Candidate[] {
    const near = new Set((screen.around ?? []).map(d => d.id)), here = screen.place.name.toLowerCase();
    return (screen.destinations ?? []).filter(d => !near.has(d.id) && r.named.has(d.id)
      && d.toward?.toLowerCase() !== here).map(d => ({ choice: `travel:${d.id}`, command: `travel:${d.id}`,
      kind: 'travel' as const, order: 0, label: `Set out ${d.toward ? 'toward' : 'for'} ${d.name}`, minutes: d.minutes,
      marks: Marks.journey(screen.elapsed, d.minutes) ? [Marks.dusk] : [], whys: ['named' as const],
      notes: { named: 'your aim' } }));
  }
  // What the company does by itself: light a light in the dark, tend whoever is hurt, eat when hungry, camp at night
  // in the open or weary, rest when hurt, search for a sign or where the aim is, and the place's own acts.
  private static yours(c: Choice, screen: Screen,
    at: { r: Reading; threat: boolean; lightless: boolean }): Candidate[] {
    const r = at.r, n = r.needs, kind = this.kind(c, r);
    const lit = at.lightless && kind === 'wait'
      ? (c.children ?? []).find(k => r.schema.get(k.command ?? '') === 'wait_for_light') : undefined;
    const mended = kind === 'tend' && [...n.hurt].some(id => c.id === `mend:${id}`);
    const whys: Why[] = [...kind === 'light' ? ['dark' as const] : [], ...lit ? ['dark' as const] : [],
      ...mended ? ['hurt' as const] : [], ...kind === 'eat' && n.hungry && n.rations > 0 ? ['hungry' as const] : [],
      ...kind === 'camp' && ((n.night && !n.settled) || n.weary) ? ['exposed' as const] : [],
      ...kind === 'rest' && n.hurt.size > 0 && !at.threat ? ['hurt' as const] : [],
      ...kind === 'search' && r.signs.has('') ? ['sign' as const] : [],
      ...kind === 'search' && r.named.has(r.here) && !r.done.has(c.command ?? '') ? ['named' as const] : [],
      ...this.ownWhy([c], r)];
    return [this.candidate(c, { kind, whys, r, notes: { dark: lit ? 'until first light' : 'in the dark',
      hungry: 'you are hungry', exposed: n.weary ? 'you are weary' : 'night in the open', named: 'where your aim is',
      hurt: kind === 'tend' ? c.note ?? '' : 'you are hurt' }, ...lit?.command ? { command: lit.command } : {} })];
  }
  // One of the place's own acts not done here (not a topic: what is asked of someone is theirs).
  private static ownWhy(choices: Choice[], r: Reading): Why[] {
    return choices.some(c => c.command && (c.own || r.authored.has(c.command)) && !r.speakers.has(c.command)
      && !r.done.has(c.command)) ? ['own'] : [];
  }
  // Whether what it does is done to something the aim names (not the company, nor the place it is done at).
  private static about(choices: Choice[], r: Reading): boolean {
    return choices.some(c => (r.args.get(this.command(c) ?? '') ?? []).some(a => r.named.has(a)));
  }
  // What a choice is, by the kind of action its command is, or by the company's own choices' kinds.
  static kind(c: Choice, r: Reading): Kind {
    if (c.id.startsWith('light:')) { return 'light'; }
    if (c.id.startsWith('mend:')) { return 'tend'; }
    if (/^(prepare|advance):/.test(c.id)) { return 'study'; }
    const kinds = (c.command ? [c] : Attending.all(c.children ?? []).filter(k => k.command))
      .map(k => r.schema.get(k.command!) ?? '');
    if (kinds.length && kinds.every(k => k.startsWith('wait'))) { return 'wait'; }
    const kind = kinds[0] ?? '';
    return ({ attack: 'attack', search: 'search', camp: 'camp', rest: 'rest', rest_unfed: 'rest', eat: 'eat',
      talk_to: 'talk' } as Record<string, Kind>)[kind] ?? (c.own ? 'act' : 'other');
  }
  private static command(c: Choice): string | undefined {
    return c.command ?? Attending.all(c.children ?? []).find(k => k.command && !k.disabled)?.command;
  }
  private static risky(c: Choice): boolean {
    return !!c.risk || (!!c.children?.length && c.children.every(k => this.risky(k)));
  }
  private static candidate(c: Choice, at: { kind: Kind; whys: Why[]; r: Reading; subject?: string; exit?: string;
    notes?: Candidate['notes']; command?: string; visited?: boolean; pointed?: boolean }): Candidate {
    const command = at.command ?? this.command(c);
    return { choice: c.id, label: c.label, ...command ? { command } : {}, ...at.subject ? { subject: at.subject } : {},
      ...at.exit ? { exit: at.exit } : {}, kind: at.kind, whys: at.whys, ...at.notes ? { notes: at.notes } : {},
      order: 0, marks: c.marks ?? [], ...c.minutes ? { minutes: c.minutes } : {},
      ...this.risky(c) ? { risk: true } : {},
      ...c.own ? { own: true } : {}, ...command && at.r.done.has(command) ? { known: true } : {},
      ...at.visited !== undefined ? { visited: at.visited } : {}, ...at.pointed ? { pointed: true } : {},
      ...c.disabled ? { barred: true } : {} };
  }
}
