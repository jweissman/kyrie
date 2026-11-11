import { AimAsks } from './aim-asks';
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
  // The words of the aim followed, for what it asks to be asked (see AimAsks); the choices whose doing changes what it
  // waits on (see Glance.advances).
  aim?: string; advances?: Set<string>;
  // The places that hold what the aim followed names (its town, its site): a journey there goes toward it.
  holding?: Set<string>;
  schema: Map<string, string>; args: Map<string, string[]>; speakers: Set<string>;
  // What each choice's success changes the standing of: the entities its effects name (the rite of rest, the raiser).
  touches?: Map<string, Set<string>>;
  // What the module's author wrote to be done with something here (Change follow "Follow the ruts"): its own act.
  authored: Set<string>;
  // The ids the aim shown names (its people, places and things, and the places of a site it names), those the other
  // aims held name, and the ways from here that lead toward a place they name (by exit id, and for which).
  named: Set<string>; held: Set<string>; toward: Map<string, 'toward' | 'held'>;
  // In a site: the ways further into it not yet taken, by exit id; "~" before one back from a dead end toward the rest
  // of it (see Glance.inward).
  inward: Set<string>;
  back?: string; here: string;
  // A sign perceived here and not seen before, by whom or what it is of ('' for the place's own).
  signs: Map<string, string>;
  life?: string; pointed: Set<string>; done: Set<string>; talked: Set<string>;
  // Who could join the company (see Companions).
  companions?: Set<string>;
  // Places about the company it left having done nothing there, with nothing done since: no aim leads back to them.
  idle?: Set<string>;
  needs: { hungry: boolean; rations: number; hurt: Set<string>; night: boolean; weary: boolean; settled: boolean;
    open: boolean;
    // Where in the settlement a bed is to be had, a step from here, when there is none here.
    bed?: string;
    // When the company carries nothing to make light by: the kinds of thing that light, any of them worth buying.
    unlit?: Set<string>;
    // Whether the company is one alone, for whom someone who would join is help.
    alone?: boolean };
}
// Every top-level choice of the place (as the page draws it: Attending.place over the scene), and the walks about the
// town, as candidates to be led with, each with every reason it might be (see Promotion). Pure.
export class Affordances {
  static of(scene: Scene, screen: Screen, r: Reading): Candidate[] {
    const threat = scene.subjects.some(s => SceneModel.threat(s));
    // The way back is led only from a fight the company could lose, or a warning, or the dark: from every fight it had
    // been the second thing led with, and a player following the page went out of each site at its first foe (the
    // owner, 4 November: "it always guides you back out").
    // A hard fight is one the company would likely win, so it is not one it could lose: grave and deadly are.
    const losing = scene.subjects.filter(s => SceneModel.threat(s)).some(s => !['slight', 'fair', 'hard']
      .includes(screen.people.find(p => p.id === s.id)?.reckoning?.danger ?? ''));
    // The way back is led from danger only: from the dark it had led straight back into the ossuary the company had
    // just left its raiser in, and the follower went to and fro between them a hundred and fifty times. In the dark,
    // light is led with (see Promotion's dark); with nothing to light, the way up or out, toward the light.
    const back = losing || !!screen.warned;
    // In the dark, nothing gives light when no one can light one (see ChoiceList.lighting).
    const lightless = !!screen.dark && !scene.you.some(c => this.kind(c, r) === 'light');
    const threats = new Set(scene.subjects.filter(s => SceneModel.threat(s)).map(s => s.id));
    return [...scene.subjects.flatMap(s => this.warning(this.subject(s, screen, r), s, screen)),
      ...scene.subjects.flatMap(s => this.ending(s, r, threats)),
      ...[...scene.near, ...scene.far].flatMap(c => this.way(c, screen, { r, back, lightless })),
      ...this.around(screen, r), ...this.journeys(screen, r),
      ...scene.you.flatMap(c => this.yours(c, screen, { r, threat, lightless, threats }))]
      .map((c, order) => ({ ...c, order }));
  }
  // Whoever warns the company off: what is done toward them comes first, before the way back.
  private static warning(cands: Candidate[], s: SceneSubject, screen: Screen): Candidate[] {
    return screen.warned?.id === s.id ? cands.map((c, i) => i ? c : { ...c, whys: ['warned', ...c.whys] }) : cands;
  }
  // Any of the place's own ways of ending a danger here, wherever it hangs (a cleric's rite of rest over the bone-heaps
  // hangs on the black candle; a scholar's reading of the ring on the raiser): its success changes the danger's
  // standing, and it is led beside talking them round and the fight, not left behind them (a calling's own way had been
  // offered and never led).
  private static ending(s: SceneSubject, r: Reading, threats: Set<string>): Candidate[] {
    if (!threats.size) { return []; }
    return Attending.all(s.choices).filter(c => c.command && !c.disabled && (c.own || r.authored.has(c.command))
      && this.kind(c, r) !== 'attack' && [...r.touches?.get(c.command) ?? []].some(t => threats.has(t)))
      .map(c => this.candidate(c, { kind: 'act', r, whys: ['danger'] }));
  }
  private static subject(s: SceneSubject, screen: Screen, r: Reading): Candidate[] {
    if (s.kind === 'companion' || s.state) { return []; }
    if (SceneModel.threat(s)) { return this.threat(s, r); }
    // Talking to them, or looking at it, is one choice; what is done about them stands beside it (see Attending).
    const opener = s.choices.find(c => [`${s.id}#talk`, `${s.id}#look`].includes(c.id));
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
    // Never leaving a talk: led with, a danger talked to had been "Take your leave" and then talked to again, round and
    // round (the owner, 9 November).
    const open = choices.filter(c => this.command(c) && !c.disabled && !this.risky(c) && this.kind(c, r) !== 'attack'
      && !Attending.leaving(c) && r.schema.get(this.command(c) ?? '') !== 'take_leave');
    return open.find(c => c.own) ?? open[0];
  }
  // Someone to talk to, or something to look at: one choice that opens what can be done; it is led with for anything
  // nested in it, said beside it (an answer owed, the aim, a bed for the night).
  private static opened(s: SceneSubject, opener: Choice, screen: Screen, r: Reading): Candidate[] {
    const leaves = Attending.all(opener.children ?? []).filter(c => c.command && !c.disabled);
    // What is new to be said to them: not a question asked once more (its action the first's, "_again"), nor what
    // they sell; the page had led with "Talk to Adrik — your aim" for as long as he had an answer to repeat.
    // Nor a ware: a talk led for the debt had been led for a ten-foot pole, and one who followed the page bought the
    // shop out a pole at a time (the gold walker, amendment 6). A sale the aim waits on is serving's (see advances).
    const fresh = leaves.filter(c => r.speakers.has(c.command!) && !/_again(\(|$)/.test(c.command!)
      && !/^(buy|sell)_/.test(r.schema.get(c.command!) ?? ''));
    const talked = r.talked.has(s.id), person = s.kind === 'person';
    // Someone the aim followed names leads, and family while the company's own errand is followed; someone another aim
    // names, or family while a job is, after it (the owner, 4 November: a sister marked first while the rats job was).
    const errand = !screen.aims || !!screen.aims.find(a => a.followed)?.own;
    const word = s.note?.split(' · ')[0], ours = r.named.has(s.id) || (!!word?.startsWith('your ') && errand);
    // Whom the aim followed names is led for what the aim asks of them, until it is asked (the question its words put,
    // or one about what it names), and for a first word: never for every question they could be asked (the owner, 9
    // November: the innkeeper led fifteen times over, each time for another of the lands beyond). Family on the
    // company's own errand as kin, while there is anything new to say to them.
    const moving = leaves.filter(c => r.advances?.has(c.command!) && !r.done.has(c.command!));
    // Not a question for being asked where the aim is: every question in the creditor's shop binds the shop.
    const serving = [...moving, ...fresh.filter(c => !moving.includes(c) && !r.done.has(c.command!)
      && AimAsks.asks(c.label, r.aim ? [r.aim] : []))];
    const owed = s.stake && (r.named.has(s.id) ? !talked || serving.length > 0
      : !talked || fresh.some(c => !r.done.has(c.command!)));
    // Led for that aim, gilded as the aim's (the merchant the rats job sends the company to had been led as kin, and
    // not drawn in the aim's gold: the owner, 8 November).
    const named = owed && r.named.has(s.id);
    const answer = leaves.find(c => c.answer), kin = owed && ours && !named, held = owed && !ours;
    const feature = screen.things.find(t => t.id === s.id)?.kind === 'feature';
    const looked = leaves.find(c => r.schema.get(c.command!) === 'look_closely' && !r.done.has(c.command!));
    // A treasure lying here is what the delve was for: taken up, led with (the vault's rings and moonstone had been
    // under Look about once its keeper fell: OWN-57's play).
    const spoils = screen.things.find(t => t.id === s.id)?.valuable
      && leaves.some(c => /^(take_item|take_out)\(/.test(c.command!));
    const whys: Why[] = [...answer ? ['answer' as const] : [], ...named ? ['named' as const] : [], ...kin ? ['kin' as const] : [],
      ...held ? ['held' as const] : [], ...spoils ? ['spoils' as const] : [],
      ...this.about(fresh, r) || this.there(s, leaves, r) ? ['about' as const] : [],
      ...person && r.life === s.id && !talked ? ['life' as const] : [],
      ...this.ownWhy(leaves, r), ...r.signs.has(s.id) ? ['sign' as const] : [],
      ...person && s.asked && !talked ? ['asked' as const] : [], ...feature && looked ? ['unlooked' as const] : [],
      ...person && r.companions?.has(s.id) ? ['companion' as const] : []];
    const needs = this.served(leaves, r);
    const asked = named ? serving[0] ?? (talked ? undefined : fresh.find(c => !r.done.has(c.command!)))
      : fresh.find(c => !r.done.has(c.command!));
    const base = { subject: s.id, kind: person ? 'talk' as const : 'act' as const, r };
    return [this.candidate(opener, { ...base, whys: [...whys, ...needs.map(n => n.why)], notes: {
      ...answer ? { answer: answer.label } : {}, ...kin || named ? { kin: word?.startsWith('your ') ? word : 'your aim' } : {},
      ...held ? { held: word?.startsWith('your ') ? word : 'another aim' } : {}, companion: 'might come along',
      ...Object.fromEntries(needs.map(n => [n.why, n.note])) },
    ...answer?.command ? { command: answer.command } : {},
    // Led for an aim that names them, what it is led for is the first new thing to ask them, not their first reply
    // (the priest led for his job had stood for his care of the wounded, the innkeeper for a bed); else what the
    // company needs of them.
    ...!answer && (kin || named || held) && asked ? { for: asked.command! }
      : !answer && needs[0]?.choice?.command ? { for: needs[0].choice.command } : {} })];
  }
  // What someone here offers that the company needs now: a bed at night in a settlement, healing for one hurt; and
  // what it has won, put to use: a treasure it carries bought, a lesson or a spell it can pay for (a company back in
  // town was shown nothing to do with what it had won: the owner, 31 October).
  private static served(leaves: Choice[], r: Reading): { why: Why; note: string; choice?: Choice }[] {
    const bed = r.needs.night && r.needs.settled && this.offered(leaves, r, ['take_lodging', 'take_lodging_guest']);
    const cure = r.needs.hurt.size > 0 && this.offered(leaves, r, ['take_healing']);
    // Something to make light by, from one who sells it, for a company that has none (a cleric whose job lay under
    // the ground had walked from the quarry to the chandler's and back without ever being told a torch was a coin).
    const light = r.needs.unlit && leaves.find(c => r.schema.get(c.command!) === 'buy_item'
      && r.needs.unlit!.has(r.args.get(c.command!)?.[1] ?? ''));
    // Someone who would join a company of one (a cleric alone had turned back from every fight of the first town's
    // jobs, and never been told the traveller at the inn would come for a few coin).
    const hand = r.needs.alone && this.offered(leaves, r, ['recruit']);
    const sale = this.offered(leaves, r, ['sell_valuable']), lesson = this.offered(leaves, r, ['train_member', 'learn_spell']);
    return [...bed ? [{ why: 'night' as const, note: `for the night: ${this.priced(bed)}`, choice: bed }] : [],
      // Before the aim: going on with nothing to see by is going on into the dark.
      ...light ? [{ why: 'dark' as const, note: `a light: ${this.priced(light)}`, choice: light }] : [],
      ...hand ? [{ why: 'companion' as const, note: `would join you${this.fee(hand)}`, choice: hand }] : [],
      ...cure ? [{ why: 'hurt' as const, note: this.priced(cure) }] : [],
      ...sale ? [{ why: 'spoils' as const, note: this.priced(sale) }] : [],
      ...lesson ? [{ why: 'means' as const, note: `a lesson in ${lesson.label.replace(/^Train (\S+ )?(in )?| — .+$/g, '')}` }]
        : []];
  }
  // Whether a place is, or holds, something the aim names, by the world's nesting (never by its id's spelling: the road
  // between Fearnmaere and Brockminster, region__s2_s5_way, had been "in" Fearnmaere, region__s2).
  private static within(id: string, named: Set<string>, r?: Reading): boolean {
    return named.has(id) || !!r?.holding?.has(id);
  }
  // Whether a way on from here is still not taken (not the road out): searching where the aim is comes after going
  // on (at the churchyard the aim names, the stair down to the crypt first), and never where someone the aim names
  // stands (the priest who owes for the catacombs, at her shrine): the cold review's search as an interface tax.
  private static onward(screen: Screen): boolean {
    return screen.exits.some(e => !e.visited && e.local && !e.blocked);
  }
  private static offered(leaves: Choice[], r: Reading, schemas: string[]): Choice | undefined {
    return leaves.find(c => schemas.includes(r.schema.get(c.command!) ?? ''));
  }
  private static fee(c: Choice): string {
    const fee = c.note?.split(' · ')[0];
    return fee && /coin$/.test(fee) ? `, ${fee}` : '';
  }
  private static priced(c: Choice): string {
    const fee = c.note?.split(' · ')[0];
    return `${c.label.charAt(0).toLowerCase()}${c.label.slice(1)}${fee && /coin$/.test(fee) ? `, ${fee}` : ''}`;
  }
  // A way: the one the aim names, one toward it, the way back when there is something to get away from, a way about
  // the place not yet taken, the first thing to try on a way barred.
  private static way(c: Choice, screen: Screen, at: { r: Reading; back: boolean; lightless?: boolean }): Candidate[] {
    const exit = screen.exits.find(e => c.id === e.id || c.id.startsWith(`${e.id}/`)), r = at.r;
    if (!exit) { return []; }
    const dest = exit.destination.id, tried = c.id !== exit.id && !!exit.blocked;
    const first = tried && this.firstTry(c, exit);
    // A way not yet taken from a place an aim names is the way on into what it is about (the stair down from the
    // churchyard, to the crypt the priest's trouble is in), when no known way is pointed off elsewhere.
    // Not while what it is about is here to be dealt with (the rats' run, not the old drain past it).
    const present = [...screen.things, ...screen.people].some(t => r.named.has(t.id));
    const on = exit.local && !exit.visited && !exit.blocked && dest !== r.back && !present
      && (r.named.has(r.here) ? 'toward' as const : r.held.has(r.here) ? 'held' as const : undefined);
    const toward = r.toward.get(exit.id) ?? (on || undefined);
    // A way about the place not yet taken is worth taking by day; at night, the way to a bed.
    const up = at.lightless && ['ascend', 'leave'].includes(exit.transition ?? '');
    const whys: Why[] = [...(at.back && dest === r.back || up) && !c.disabled ? ['retreat' as const] : [],
      // Not back to a place the aim names that the company has been, from another it names: down in the cellar under
      // the corn-store the rats are in, the stair up had led as "your aim".
      // Nor to one it left having done nothing there, with nothing done since (see CompanyRecall.idle).
      ...r.named.has(dest) && !(r.named.has(r.here) && exit.visited) && !r.idle?.has(dest) ? ['named' as const] : [],
      ...toward ? [toward] : [], ...r.held.has(dest) && !r.idle?.has(dest) ? ['held' as const] : [],
      ...this.inward(c, exit.id, r),
      ...r.needs.night && dest === r.needs.bed ? ['night' as const] : [],
      ...exit.local && !exit.visited && !r.needs.night ? ['unvisited' as const] : [], ...first ? ['unlooked' as const] : [],
      // An author's own way through what bars it, open to this company (a thief's pick of the corn-store padlock had
      // been only under Every way: Mission 19).
      // After the place's own acts (the notice before a padlock), unless an aim is about what lies behind it.
      ...tried && !c.disabled && c.command && r.authored.has(c.command) && !r.done.has(c.command)
        ? [r.named.has(dest) || r.held.has(dest) ? 'own' as const : 'unlooked' as const] : []];
    // A try on a way barred (look at the portcullis) is something done there, not a way. Slipping past who keeps it is
    // that danger's own gentle way, led with it: a thief had found it only under Look… (Mission 20, round 2, B 88).
    const kind = tried ? 'act' as const : exit.bearing ? 'step' as const : 'way' as const;
    const slip = tried && !c.disabled && r.schema.get(c.command ?? '') === 'slip_past' ? r.args.get(c.command!)?.[3] : undefined;
    if (slip) { whys.unshift('danger'); }
    // A way into the next hex is set out on from the map, as a journey there (see HexBoundary): led with, it is that
    // journey, never the way's own command, which the campaign refuses (the travel-contract review, 9 November).
    return [this.candidate(c, { exit: exit.id, kind, whys, r, ...slip ? { subject: slip } : {}, ...exit.crosses && !tried ? { command: `travel:${dest}` } : {},
      notes: { retreat: dest === r.back ? 'the way you came' : 'up, toward the light', named: 'your aim', toward: 'toward your aim', held: 'another aim',
        deeper: 'further in', onward: r.inward.has(`^${exit.id}`) ? 'back out' : 'toward the rest of it',
        night: 'a bed for the night', unlooked: exit.blocked ?? '' }, visited: exit.visited,
      pointed: r.pointed.has(dest) })];
  }
  // Into a site, or further in: the way itself, never a risk taken to get through (a trap's switch); back from a dead
  // end toward the rest of it, after what the room has to do (see Glance.inward).
  private static inward(c: Choice, exit: string, r: Reading): Why[] {
    if (c.id !== exit || c.risk) { return []; }
    return r.inward.has(exit) ? ['deeper'] : r.inward.has(`~${exit}`) || r.inward.has(`^${exit}`) ? ['onward'] : [];
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
      pointed: r.pointed.has(d.id), whys: [...r.named.has(d.id) && !r.idle?.has(d.id) ? ['named' as const] : [],
        ...r.toward.has(`travel:${d.id}`) ? [r.toward.get(`travel:${d.id}`)!] : [],
        ...r.held.has(d.id) && !r.idle?.has(d.id) ? ['held' as const] : [], ...visited.has(d.id) ? [] : ['unvisited' as const]],
      notes: { named: 'your aim', held: 'another aim', toward: 'toward your aim' } }));
  }
  // A journey to where the aim shown is, further than the ways from here, by the way the company knows (as far as it
  // is known), unless it goes only as far as here: a far aim had been set out for from the map alone (the owner, 31
  // October). Not another aim held: two such, each shown where it names the place, sent a company back and forth
  // between the edges of two wild countries (REV-08).
  private static journeys(screen: Screen, r: Reading): Candidate[] {
    // Not while a site the company is at has ways in not yet taken: it is gone into before it is left (the owner, 4
    // November: deep in a barrow the page had led with setting out for town).
    // Only from within a site: from a town, a barrow a step off the green is no reason not to set out where the aim is
    // (the owner, 9 November: a letter for Elmham, and the page had led into the barrow by the green).
    if (r.inward.size && screen.path.some(p => p.kind === 'site')) { return []; }
    const near = new Set((screen.around ?? []).map(d => d.id)), here = screen.place.name.toLowerCase();
    // Named by the aim is named in anything in it: an aim names a work's rooms and its site, never the place it is
    // set out for by (Lunalac's reading-glass named every room of it, and nothing led toward it: OWN-56).
    // The towns the country's roads go to are set out for as any other (a letter for Elmham, by the ford road).
    const journeys = [...screen.destinations ?? [], ...(screen.roads ?? [])
      .filter(d => !(screen.destinations ?? []).some(x => x.id === d.id))];
    return journeys.filter(d => !near.has(d.id) && this.within(d.id, r.named, r) && !r.idle?.has(d.id)
      && d.toward?.toLowerCase() !== here).map(d => ({ choice: `travel:${d.id}`, command: `travel:${d.id}`,
      kind: 'travel' as const, order: 0, label: `Set out ${d.toward ? 'toward' : 'for'} ${d.name}`, minutes: d.minutes,
      marks: Marks.journey(screen.elapsed, d.minutes) ? [Marks.dusk] : [], whys: ['named' as const],
      notes: { named: 'your aim' } }));
  }
  // What the company does by itself: light a light in the dark, tend whoever is hurt, eat when hungry, camp at night
  // in the open or weary, rest when hurt, search for a sign or where the aim is, and the place's own acts.
  private static yours(c: Choice, screen: Screen,
    at: { r: Reading; threat: boolean; lightless: boolean; threats?: Set<string> }): Candidate[] {
    const r = at.r, n = r.needs, kind = this.kind(c, r);
    const lit = at.lightless && kind === 'wait'
      ? (c.children ?? []).find(k => r.schema.get(k.command ?? '') === 'wait_for_light') : undefined;
    const mended = kind === 'tend' && [...n.hurt].some(id => c.id === `mend:${id}`);
    const whys: Why[] = [...kind === 'light' ? ['dark' as const] : [], ...lit ? ['dark' as const] : [],
      ...mended ? ['hurt' as const] : [], ...kind === 'eat' && n.hungry && n.rations > 0 ? ['hungry' as const] : [],
      ...kind === 'camp' && ((n.night && !n.settled) || n.weary) ? ['exposed' as const] : [],
      ...kind === 'rest' && n.hurt.size > 0 && !at.threat ? ['hurt' as const] : [],
      ...kind === 'search' && r.signs.has('') ? ['sign' as const] : [],
      ...kind === 'search' && r.named.has(r.here) && !r.done.has(c.command ?? '') && !this.onward(screen)
        && !screen.people.some(p => r.named.has(p.id)) ? ['named' as const] : [],
      ...this.ownWhy([c], r), ...this.answers(c, at) ? ['danger' as const] : [],
      ...r.schema.get(c.command ?? '') === 'lie_still' ? ['helpless' as const] : []];
    // A light lit in the dark says nothing more: the page says there is no light above it (M19-57).
    return [this.candidate(c, { kind, whys, r, notes: { ...lit ? { dark: 'until first light' } : {},
      helpless: 'you cannot move', hungry: 'you are hungry', exposed: n.weary ? 'you are weary' : 'night in the open', named: 'where your aim is',
      hurt: kind === 'tend' ? c.note ?? '' : 'you are hurt' }, ...lit?.command ? { command: lit.command } : {} })];
  }
  // Whether something the company can do of itself answers a danger here: its success changes a threat's standing
  // (a cleric's rite of rest puts out the raiser's candle and sends him off), as talking them round or fighting them
  // does; it is led with beside those (it had been offered and never led, so a calling's own way went unseen).
  private static answers(c: Choice, at: { r: Reading; threats?: Set<string> }): boolean {
    const touched = c.command ? at.r.touches?.get(c.command) : undefined;
    return !!touched && [...at.threats ?? []].some(t => touched.has(t));
  }
  // One of the place's own acts not done here (not a topic: what is asked of someone is theirs).
  private static ownWhy(choices: Choice[], r: Reading): Why[] {
    return choices.some(c => c.command && (c.own || r.authored.has(c.command)) && !r.speakers.has(c.command)
      && !r.done.has(c.command)) ? ['own'] : [];
  }
  // A thing at a place the aim names with something of its author's own to do, not yet done: what the aim is about
  // there (the fresh ruts on the road the father went out by, which had been one of four things by the road, under a
  // Search here led with as "where your aim is": Mission 19).
  private static there(s: SceneSubject, leaves: Choice[], r: Reading): boolean {
    return s.kind !== 'person' && !s.danger && r.named.has(r.here) && this.ownWhy(leaves, r).length > 0;
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
    notes?: Candidate['notes']; command?: string; for?: string; visited?: boolean; pointed?: boolean }): Candidate {
    const command = at.command ?? this.command(c);
    return { choice: c.id, label: c.label, ...command ? { command } : {}, ...at.for ? { for: at.for } : {},
      ...at.subject ? { subject: at.subject } : {},
      ...at.exit ? { exit: at.exit } : {}, kind: at.kind, whys: at.whys, ...at.notes ? { notes: at.notes } : {},
      order: 0, marks: c.marks ?? [], ...c.minutes ? { minutes: c.minutes } : {},
      ...this.risky(c) ? { risk: true } : {},
      ...c.own ? { own: true } : {}, ...command && at.r.done.has(command) ? { known: true } : {},
      ...at.visited !== undefined ? { visited: at.visited } : {}, ...at.pointed ? { pointed: true } : {},
      ...c.disabled ? { barred: true } : {} };
  }
}
