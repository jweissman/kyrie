import type { Aspect, Facet, Lens, LensAct, Lensed, Mark, Promoted, Tier, Why } from '../presentation/glance-types';
import type { Scene } from './scene';
import type { Choice } from './choice-list';
import { Attending } from './attention';
import { Aspects } from '../presentation/aspects';
import { Emphasis } from '../presentation/emphasis';
import { Indicator } from '../presentation/indicator';

// What a choice is, as far as leading with it goes: talking to someone, an act on someone or something, an attack, a
// way (a step across the open country apart), a journey about the town, lighting a light, waiting, studying (preparing
// spells, spending a level), searching, camping, resting, eating, tending, or anything else the company does.
export type Kind = 'talk' | 'act' | 'attack' | 'way' | 'step' | 'travel' | 'light' | 'wait' | 'study' | 'search'
  | 'camp' | 'rest' | 'eat' | 'tend' | 'other';
// One choice the page draws where the company stands, with every reason it might be led with (see Affordances).
export interface Candidate {
  // The page's own id for it (an opener for what is nested under one: a topic under "Talk to Wat").
  choice: string; label: string; command?: string; for?: string; subject?: string; exit?: string;
  kind: Kind; whys: Why[];
  // Someone the company has not yet met (spoken with, or answered by).
  unmet?: true;
  // The reason's words, by reason ("your brother", "the way you came").
  notes?: Partial<Record<Why, string>>;
  // For an opener, the act within it each reason is for, by reason (the topic that teaches, the asking to come along).
  leaves?: Partial<Record<Why, string>>;
  // Where it is drawn among the rest (the authored order: people in the module's order, ways in the headings').
  order: number; marks: Mark[];
  minutes?: number; risk?: boolean; own?: boolean;
  // Never led, not even bare: a way into a keeper beyond the company, met there, its aim set aside (AimAside); an act
  // done here with nothing happened since (LedAgain, OR-417).
  held?: true;
  // Doing it teaches the company something (Choice.teaches): the place's own such act (a notice read) is drawn blue.
  teaches?: boolean;
  // Done before, nothing new about it; a way to somewhere been; a way the lines told now name.
  known?: boolean; visited?: boolean; pointed?: boolean;
  // Not to be led with at all: disabled, on a companion, on the dead.
  barred?: boolean;
  // An opener with a focus (a riddle read on a door), the commands of its rows: read there, never led loose beside it.
  holds?: string[];
  // The ways of one choice it is one of, by choice, itself among them (see Alternatives): led together or not at all.
  together?: string[];
}
// Where the company stands: a danger here, someone warning it off, in the dark with no light, in a settlement or a
// site (where a way not yet taken is worth leading with), in the open country (where the ways are the compass).
// down: someone of the company is senseless (no hit points); dying: so, and not dead yet, whom a rest may kill.
// aimed: an aim is followed.
export interface Situation { threat: boolean; warned: boolean; dark: boolean; settled: boolean; open: boolean;
  down?: boolean; dying?: boolean; aimed?: boolean }

// Chooses the few choices a place leads with (OWN-18, OWN-19; the cold review's affordance facets): urgent first (an
// answer owed, a danger, a warning, the dark), then what the aim names, then what the company needs, then what the
// place itself offers that is new, and a way not yet taken. At most four, three of them besides talk, never padded;
// at most one for each subject
// (a danger may take two and the way back), two ways, and one of the place's own acts. Pure and deterministic.
// A candidate as it is weighed: every reason it is drawn by (all), those it may be led with for (whys), the best.
interface Fit { c: Candidate; all: Why[]; whys: Why[]; best: Why }
// What the four have taken so far: ways, the place's own acts, talks (plates), rows past one of a choice's ways
// (extra), and places by subject.
interface Taken { ways: number; own: number; plates: number; extra: number; by: Map<string, number> }

export class Promotion {
  static readonly cap = 3;
  // With whoever there is to talk to.
  static readonly all = 4;
  // Each reason's tier and its place in it. In the dark the light comes before any danger: a light to hand had been
  // led after "Attack" beside the beetles, and a walker fought blind and died (the laboratory, 15 November).
  static readonly tiers: Record<Why, [Tier, number]> = {
    helpless: [0, -2], dark: [0, -1], answer: [0, 0], danger: [0, 1], warned: [0, 2], retreat: [0, 4], opened: [0, 5],
    advance: [1, -1], bound: [1, 0], kin: [1, 1], help: [1, 2], about: [1, 2], named: [1, 3], toward: [1, 4],
    held: [1, 5],
    deeper: [1, 6],
    hungry: [2, 0], hurt: [2, 1], night: [2, 2], exposed: [2, 3],
    companion: [3, -3], spoils: [3, -2], owed: [3, -2], means: [3, -1], life: [3, 0], own: [3, 1], sign: [3, 2],
    // Whoever is spoken to leads after one who would come along, a payment, what was won (CL-49).
    talking: [3, -1.5], asked: [3, 3],
    unlooked: [3, 4], wonder: [3, 0],
    onward: [3, 5], out: [3, 5], leads: [3, 5], entry: [3, -4],
    unvisited: [4, 0], way: [4, 1], present: [4, 2],
  };
  static pick(cands: Candidate[], s: Situation): Promoted[] {
    // Someone perceived along a way is the places lens's to rank (Go…), not a reason to lead the place with going to
    // look (the scene's four keep what is here: the notice, the dog's sign); a town entered from its country keeps it.
    // But a way led with for another reason still bears whoever is perceived along it (the owner, 19 November: a way
    // led with in Explore, a companion there, and no companion on its row): all, the reasons it is drawn by.
    const eligible = cands.filter(c => !c.barred && !c.held).map(c => ({ c, all: this.allowed(c, s) }))
      .map(x => ({ ...x, whys: x.all.filter(w => w !== 'companion' || !this.way(x.c) || x.c.whys.includes('entry')) }))
      .filter(x => x.whys.length).map(x => ({ ...x, best: this.best(x.whys) }));
    // A risk of the place's own (skittles) is led with only when there is nothing else.
    const choices = new Set(eligible.map(x => x.c.choice));
    const fit = eligible.filter(x => !(x.c.own && x.c.risk && x.best === 'own' && choices.size > 1));
    // Of the place's own acts, its own (the notice of jobs on the well-post) before a thing's found in it (a forged
    // seal's receipt): the town's offer to everyone first (the integration of the adventure branch).
    fit.sort((a, b) => this.ranked(a) - this.ranked(b) || Number(a.c.kind === 'attack') - Number(b.c.kind === 'attack')
      || this.found(a) - this.found(b) || a.c.order - b.c.order);
    const lone = new Set(fit.map(x => x.c.subject ?? x.c.choice)).size === 1;
    const picked = this.marked(fit, s, lone).map(x => this.promoted(x.c, x.best, x.all));
    return this.continued(this.lit(picked.length ? picked : this.bare(cands), s));
  }
  // Someone to talk to is led with as well, two at most, and they take none of the three places (after the notice at
  // Millholm the three job-givers had taken them all, and only the map was led: M19-24); four in all, never padded
  // (the owner, 12 November: a taproom had led with two things, though several there had something for the company).
  // And the aim's own next step, by type (see AimAdvances), has a place though the three are taken: at
  // Gefeohtgaet's door the hobs' two acts and the way back had filled them, the search under the door-stone the
  // dead man's map marks was only under `all`, and the gold went to the parley (M21's playability list, PL-19).
  private static fill(fit: Fit[], s: Situation, lone: boolean): Fit[] {
    const picked: Fit[] = [], taken: Taken = { ways: 0, own: 0, plates: 0, extra: 0, by: new Map<string, number>() };
    let stepped = false;
    for (const x of fit) {
      if (picked.length >= this.all) { break; }
      const step = !stepped && x.whys.includes('advance');
      // The ways of one choice are led side by side, or none of them: one place of the three, a row each (OR-242).
      const ways = this.choice(x, fit, picked);
      if (ways === null || (ways.length && !this.together(x, ways, picked, { taken, s, lone }))) { continue; }
      if (ways.length) { continue; }
      if (x.c.kind !== 'talk' && picked.length - taken.plates - taken.extra >= this.cap && !step) { continue; }
      // Not the one spoken to, whose talk leads while it is had: Owain's word and the hand on the green had held both
      // plates, and the reeve's questions stood in the rest while she was spoken to (cold play 4, CL-49; MT-15).
      if (x.c.kind === 'talk' && taken.plates >= 2 && x.best !== 'talking') { continue; }
      if (!this.room(x, picked.map(p => p.c), { taken, s, lone })) { continue; }
      if (x.c.kind === 'talk') { taken.plates++; }
      const subject = x.c.subject ?? x.c.choice;
      taken.by.set(subject, (taken.by.get(subject) ?? 0) + 1);
      if (this.way(x.c)) { taken.ways++; }
      if (x.best === 'own') { taken.own++; }
      stepped ||= x.whys.includes('advance');
      picked.push(x);
    }
    return picked;
  }
  // Of one of the ways of a choice, all of them, as eligible, in their order; none where it is no choice's (empty), and
  // null where they are not all to be had here, or are led already.
  private static choice(x: Fit, fit: Fit[], picked: Fit[]): Fit[] | null {
    const ids = x.c.together;
    if (!ids) { return []; }
    if (picked.some(p => ids.includes(p.c.choice))) { return null; }
    const ways = ids.map(id => fit.find(f => f.c.choice === id));
    return ways.every(w => !!w) ? ways as Fit[] : null;
  }
  // The ways of a choice taken together, where there is room for them all: one place of the three (one subject's, one
  // of the place's own) and a row each among the four.
  private static together(x: Fit, ways: Fit[], picked: Fit[], at: { taken: Taken; s: Situation; lone: boolean }):
    boolean {
    const { taken } = at, subject = x.c.subject ?? x.c.choice;
    if (picked.length + ways.length > this.all || picked.length - taken.plates - taken.extra >= this.cap
      || !this.room(x, picked.map(p => p.c), at)) { return false; }
    taken.by.set(subject, (taken.by.get(subject) ?? 0) + 1);
    taken.own++; taken.extra += ways.length - 1;
    picked.push(...ways);
    return true;
  }
  // What the Atlas marks outweighs what it does not (the owner, 19 November, AT-11: "a matching opportunity beneath a
  // lens … should outweigh at least non-atlas-indicated items"): of what is here to be done (below the urgent, the aim
  // and need), a marked act left out takes an unmarked one's place where the four lose nothing for it, never fewer
  // rows nor fewer marked (a first try ranked marked first, and at kite's road "Help him" shut out both the wagoner's
  // talk and his cart by the one-a-person and one-own rules).
  private static marked(fit: Fit[], s: Situation, lone: boolean): Fit[] {
    let pool = fit, out = this.fill(pool, s, lone);
    for (const m of fit.filter(x => this.opportunity(x) && this.bears(x))) {
      if (out.includes(m)) { continue; }
      for (const u of [...out].reverse().filter(x => this.opportunity(x) && !this.bears(x))) {
        const tried = this.fill(pool.filter(x => x !== u), s, lone);
        if (tried.includes(m) && tried.length >= out.length && this.borne(tried) > this.borne(out)) {
          pool = pool.filter(x => x !== u); out = tried; break;
        }
      }
    }
    // And among what is here to be done, the marked first; the urgent, the aim and need where they rank.
    return out.map((x, i) => ({ x, i })).sort((a, b) => this.weight(a.x) - this.weight(b.x) || a.i - b.i).map(o => o.x);
  }
  private static weight(x: Fit): number { return !this.opportunity(x) ? 0 : this.bears(x) ? 1 : 2; }
  // What is here to be done: below the urgent, the aim and need, and not whoever the company is speaking with, whose
  // talk leads while it is had (CL-49; the golden route's Gwil Pryce, his boats, the scratch full run of 20 November).
  private static opportunity(x: Fit): boolean { return this.tiers[x.best][0] >= 3 && x.best !== 'talking'; }
  private static bears(x: Fit): boolean { return this.aspects(x.c, x.best, x.whys).length > 0; }
  private static borne(xs: Fit[]): number { return xs.filter(x => this.bears(x)).length; }
  // In the dark with an aim followed, the light is the aim's next step: nothing else can be done until it is made, and
  // the gold had gone out on every dark threshold the aim led over (the laboratory's blind walks: 89 turns of 2,520
  // with an aim followed and nothing leading to it, most of them in a cellar or a crypt before the candle).
  private static lit(acts: Promoted[], s: Situation): Promoted[] {
    if (!s.dark || !s.aimed || acts.some(a => a.aspects.includes('undertaking'))) { return acts; }
    const light = acts.find(a => a.why === 'dark');
    return light ? acts.map(a => a === light ? { ...a, aspects: ['undertaking' as const, ...a.aspects] } : a) : acts;
  }
  // The attention lenses over the one scene (CN-01, CN-05): for each, its promoted acts, at most four, ranked as the
  // resting scene's are and from the same candidates, and the rest of its acts in the scene's order. Gold stays on the
  // glance's own next step (acts), wherever it falls: a lens never makes another act the aim's.
  static lenses(cands: Candidate[], scene: Scene, s: Situation, acts: Promoted[]): Record<Lens, Lensed> {
    const at = { cands, scene, s, next: acts.find(a => a.continues)?.choice, led: acts,
      kinds: new Map(scene.subjects.map(x => [x.id, x.kind])),
      // The company's own acts, as the scene has them: not the place's own (a notice read, a word put to someone).
      company: new Set(scene.you.filter(c => !c.own).map(c => c.id)) };
    return { things: this.lensed('things', at), people: this.lensed('people', at), places: this.lensed('places', at),
      time: this.lensed('time', at) };
  }
  private static lensed(lens: Lens, at: { cands: Candidate[]; scene: Scene; s: Situation; next?: string;
    kinds: Map<string, string>; company: Set<string>; led: Promoted[] }): Lensed {
    const mine = at.cands.filter(c => this.lens(c, at) === lens && !c.barred);
    const ranked = mine.map(c => ({ c, whys: this.allowed(c, at.s) })).filter(x => x.whys.length)
      .map(x => ({ ...x, best: this.best(x.whys) }))
      .sort((a, b) => this.ranked(a) - this.ranked(b) || a.c.order - b.c.order).slice(0, this.all);
    // The company's own acts in the time lens are its own (subject yourself); the waits are no one's.
    // What is done at a thing on a way is about that thing, wherever else it was found.
    const ways = new Map((lens === 'things' ? this.onWays(at.scene) : []).map(a => [a.choice, a]));
    // And a look at it from the way ("To the hall — look at the speaking door"), by the way it is on.
    const onWay = new Map([...ways.values()].map(a => [a.choice.split('/')[0]!, a.subject]));
    const promoted = ranked.map(x => {
      const p = this.gilded(this.promoted(x.c, x.best, x.whys), at.next);
      const on = ways.get(p.choice)?.subject ?? onWay.get(p.choice.split('/')[0]!);
      return on && !p.subject ? { ...p, subject: on }
        : lens === 'time' && !p.subject && !this.waits.includes(x.c.kind) ? { ...p, subject: 'yourself' } : p;
    });
    const led = new Set(promoted.map(p => p.choice));
    const listed = this.rest(lens, mine.filter(c => !led.has(c.choice)), at.scene).map(a => ways.get(a.choice) ?? a);
    const all = [...listed, ...[...ways.values()]
      .filter(a => !led.has(a.choice) && !listed.some(x => x.choice === a.choice))];
    // Then the lens's own acts in its own order, up to four in all, never one that cannot be done now: a kitchen's
    // Wat, with a topic and no aim, had left the people lens empty, his talk only in the rest (14 November).
    // Each with its own marks, as any act is drawn (the drop at the ledge had lost its "no coming back").
    const marks = new Map(at.cands.map(c => [c.choice, c.marks]));
    const fill = all.filter(a => !a.disabled).slice(0, Math.max(0, this.all - promoted.length))
      .map(a => this.gilded(this.present(a, marks.get(a.choice) ?? []), at.next));
    const shown = new Set([...led, ...fill.map(a => a.choice)]);
    const four = [...promoted, ...fill], others = all.filter(a => !shown.has(a.choice));
    const opened = this.opened([...four, ...others], at.scene);
    // What the scene led with that this lens does not draw and that will not wait, kept above it (OR-240): its places
    // are the four's, and what of the lens's own it puts out of them goes first among the rest, drawn still.
    const kept = this.kept(at.led, [...four, ...others, ...Object.values(opened.leaves ?? {}).flat()]);
    const out = four.slice(0, this.all - kept.length), rest = [...four.slice(out.length), ...others];
    const aspects = [...Emphasis.precedence, ...Indicator.iconed].filter(a => out.some(p => p.aspects.includes(a)));
    return { promoted: out, rest, ...opened, aspects, ...kept.length ? { kept } : {} };
  }
  // Of the acts the resting scene led with, those a lens keeps in sight where it draws them nowhere: what will not wait
  // (a danger, the dark, an answer owed) and what carries the aim followed on (its gold, its step), two at most, as
  // the four drew them. What is only worth doing here waits for the lens to be put away: kept too, the lens of whoever
  // is here would have drawn the four again and none of them (the gatehouse's Talk, the boat's two ways and the ways
  // out). A row drawn by its opener or its command is drawn.
  private static kept(led: Promoted[], drawn: { choice: string; command?: string }[]): Promoted[] {
    const ids = new Set(drawn.flatMap(a => [a.choice, ...a.command ? [a.command] : []]));
    return led.filter(a => (a.continues || a.tier === 0 || this.continuing.includes(a.why)) && !ids.has(a.choice)
      && !(a.command && ids.has(a.command)) && !(a.for && ids.has(a.for))).slice(0, 2);
  }
  // What is done at a thing on a way (a tripwire, a portcullis, a riddle door's words), not going by it: the things
  // lens's, with the thing as its subject, or the way where it names none (round 13's lens gap, the aesthetic line's
  // AtHand.onWays until this held it).
  private static onWays(scene: Scene): LensAct[] {
    const acts = Attending.all([...scene.near, ...scene.far]).filter(c => c.command && !c.moves
      && !/^(go|enter|travel)\(|^travel:/.test(c.command));
    // Each by the way it is on (its id's head), the thing on it as a look or a try there names it (an authored change
    // names its change, not the thing).
    const things = new Map(acts.flatMap(c => c.targets?.[0] && !/^change_thing/.test(c.does ?? '')
      ? [[this.wayOf(c), c.targets[0]] as const] : []));
    return acts.map(c => ({ choice: c.id, label: c.alone || c.label, command: c.command!,
      subject: things.get(this.wayOf(c)) ?? c.targets?.[0] ?? this.wayOf(c),
      ...c.disabled ? { disabled: c.disabled } : {} }));
  }
  private static wayOf(c: Choice): string {
    return c.id.split('/')[0]!;
  }
  // Of an opener among them (a talk, a look, whose own command is only its first), the acts within it, each to be
  // done by its own: "Kick the chest" had been reachable only from the page's own look.
  private static opened(acts: { choice: string; command?: string }[], scene: Scene): Pick<Lensed, 'leaves'> {
    const choices = new Map([...scene.subjects.flatMap(x => x.choices), ...scene.you].map(c => [c.id, c]));
    const leaves = Object.fromEntries(acts.filter(a => choices.get(a.choice)?.children?.length)
      .map(a => [a.choice, Attending.all(choices.get(a.choice)!.children!).filter(c => c.command)
        .map(c => ({ choice: c.id, label: c.alone || c.label, command: c.command!,
          ...c.disabled ? { disabled: c.disabled } : {} }))]));
    return Object.keys(leaves).length ? { leaves } : {};
  }
  private static present(a: LensAct, marks: Mark[]): Promoted {
    return { choice: a.choice, ...a.command ? { command: a.command } : {}, ...a.subject ? { subject: a.subject } : {},
      label: a.label, why: 'present', facets: ['here'], tier: 4, aspects: [], marks };
  }
  // Which lens an act is in: the ways, the waiting acts, and what is done about a thing or about someone.
  private static lens(c: Candidate, at: { kinds: Map<string, string>; company: Set<string> }): Lens | undefined {
    if (['way', 'step', 'travel'].includes(c.kind)) { return 'places'; }
    // The waits, and the company's own acts (a light lit or put out, spells prepared, a hurt tended, a meal): they take
    // time, and are the time lens's after the waits (the coordinator's ruling, 14 November: they had been in no lens,
    // only on the old Wait page). Anything else of no one here is among things: a search, the place's own acts (a
    // look at Wren's ferry had been led first in time at Reedwake quay).
    if ([...this.waits, ...this.owns].includes(c.kind)) { return 'time'; }
    if (!c.subject) {
      return c.kind === 'attack' ? undefined : at.company.has(c.choice) && c.kind !== 'search' ? 'time' : 'things';
    }
    const kind = at.kinds.get(c.subject);
    return !kind || kind === 'companion' ? undefined : kind === 'thing' ? 'things' : 'people';
  }
  // The rest, in the scene's order; for time, each waiting act itself (a while, an hour, until dark, and watch).
  private static rest(lens: Lens, cands: Candidate[], scene: Scene): LensAct[] {
    const sorted = cands.toSorted((a, b) => this.first(lens, a) - this.first(lens, b) || a.order - b.order);
    if (lens === 'time') { return this.timed(sorted, scene); }
    return sorted.map(c => ({ choice: c.choice, label: c.label, ...c.command ? { command: c.command } : {},
      ...c.subject ? { subject: c.subject } : {} }));
  }
  private static readonly waits: Kind[] = ['wait', 'rest', 'camp'];
  private static readonly owns: Kind[] = ['light', 'tend', 'study', 'eat'];
  // Each waiting act itself, the shorter first, no one's; then the company's own acts as the scene has them, each one
  // act (an opener among them, Dori's spells to prepare, keeps its acts in the lens's leaves), the company's own.
  private static timed(cands: Candidate[], scene: Scene): LensAct[] {
    const mine = scene.you.filter(c => cands.some(x => x.choice === c.id));
    const waiting = new Set(cands.filter(x => this.waits.includes(x.kind)).map(x => x.choice));
    const waits = Attending.all(mine.filter(c => waiting.has(c.id))).filter(c => c.command)
      .toSorted((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0)).map(c => this.act(c));
    const own = mine.filter(c => !waiting.has(c.id) && (c.command || c.children?.length))
      .map(c => ({ ...this.act(c), subject: 'yourself' }));
    return [...waits, ...own];
  }
  private static act(c: Choice): LensAct {
    return { choice: c.id, label: c.alone || c.label, ...c.command ? { command: c.command } : {},
      ...c.disabled ? { disabled: c.disabled } : {} };
  }
  // Each lens's own order: talk first among people; looking and searching first among things; the near ways before the
  // journeys elsewhere among places (a town's green had 45 ways and 27 journeys in no order: PB-03); a fight last.
  private static readonly firsts: Record<Lens, Kind[]> = { people: ['talk'], things: ['study', 'search'],
    places: ['way', 'step'], time: [] };
  private static first(lens: Lens, c: Candidate): number {
    return this.firsts[lens].includes(c.kind) ? 0 : c.kind === 'attack' ? 2 : 1;
  }
  // Gold only on the glance's own next step.
  private static gilded(p: Promoted, next: string | undefined): Promoted {
    if (p.choice === next) { return { ...p, continues: true }; }
    const aspects = p.aspects.filter(a => a !== 'undertaking');
    const rest = Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'continues')) as Promoted;
    return { ...rest, aspects: aspects.length || !p.aspects.length ? aspects : ['exploration'] };
  }
  // Where nothing is led with, the ways on, two at most, by the order the quiet row keeps (the way the aim goes, a way
  // the lines name, one not yet taken, then the rest): a gallery with nothing more to do in it had shown nothing at
  // all, and the way up was only under Go… (round 7, both players).
  // A way led plain, for no reason but that it is the way on (see AimContinuity.townward).
  static wayOn(c: Candidate): Promoted { return this.promoted(c, 'way', ['way']); }
  // The way out toward where the next true lead is, said as that (see AimContinuity.townward; OR-411).
  static wayOut(c: Candidate): Promoted { return this.promoted(c, 'out', ['out']); }
  private static bare(cands: Candidate[]): Promoted[] {
    return cands.filter(c => !c.barred && !c.held && (c.kind === 'way' || c.kind === 'travel'))
      .sort((a, b) => this.placed(a) - this.placed(b) || a.order - b.order).slice(0, 2)
      .map(c => this.promoted(c, 'way', ['way']));
  }
  // Of what is led with, the one that carries the followed aim on, where any does: the first of the aim's, as ranked
  // (the owner's play of 11 November: exactly one prominent choice is the truthful continuation of the aim followed,
  // where a next step is known; none is invented where none is).
  // What the aim names comes before a way toward it, the journey set out on, kin, and what merely stands where the aim
  // is (the shrine's tower had been marked, and the priest the aim says to ask had not: the owner, 11 November).
  // What the aim waits on, done here, before any way toward it: a reached waypoint is never left for one further on
  // (the owner, 12 November: the dead man's box found, the gold had gone on into the cave).
  static readonly continuing: Why[] = ['advance', 'named', 'toward', 'bound', 'kin', 'about'];
  private static continuance(a: Promoted): number {
    const i = this.continuing.indexOf(a.advances ? 'advance' : a.why);
    return i < 0 ? this.continuing.length : i;
  }
  // The followed aim's next step is the one act in its gold: any other it bears on is led for what else it is, or as
  // something worth going to see (the owner, 12 November: gold on the ways and the looking at once had named no next
  // step, and the thread was lost).
  // And it is first of the four, wherever it was ranked (the owner, 18 November: "If a golden option exists, it should
  // be first").
  static continued(acts: Promoted[]): Promoted[] {
    const next = acts.filter(a => a.aspects.includes('undertaking'))
      .sort((a, b) => this.continuance(a) - this.continuance(b))[0];
    return this.goldFirst(acts.map(a => {
      if (a === next) { return { ...a, continues: true as const }; }
      const rest = Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'continues')) as Promoted;
      if (!a.aspects.includes('undertaking')) { return a.continues ? rest : a; }
      const aspects = a.aspects.filter(x => x !== 'undertaking');
      const inside = rest.inside?.map(x => ({ ...x, aspects: x.aspects.filter(y => y !== 'undertaking') }))
        .filter(x => x.aspects.length);
      // The way back is neutral, as a need is (see Aspects): not "worth a look" for having been the aim's way.
      return { ...rest, aspects: aspects.length || a.why === 'retreat' ? aspects : ['exploration'], ...inside ? { inside } : {} };
    }));
  }
  private static goldFirst(acts: Promoted[]): Promoted[] {
    const i = acts.findIndex(a => a.continues);
    return i <= 0 ? acts : [acts[i]!, ...acts.slice(0, i), ...acts.slice(i + 1)];
  }
  // Whether there is room for one more of its kind: never twice the same choice; one for each subject (a danger two,
  // and so may a place with nothing else); two ways; one of the place's own; a way not yet taken only while fewer than
  // two are led with, and none of them an act: beside Bran's line to read, "To the taproom of the Stone Horn" had led
  // from the third turn on for no reason a player could see (cold plays 2 and 3, CL-25).
  private static room(x: { c: Candidate; best: Why }, picked: Pick<Candidate, 'choice' | 'exit'>[],
    at: { taken: Taken; s: Situation; lone: boolean }):
    boolean {
    const c = x.c, subject = c.subject ?? c.choice;
    if (picked.some(p => p.choice === c.choice)) { return false; }
    // One for each way: not going into Gaudumport and looking closer at its door, open now, both (OWN-57's play).
    if (c.exit && picked.some(p => p.exit === c.exit)) { return false; }
    const most = (at.s.threat && x.best === 'danger') || at.lone ? 2 : 1;
    if ((at.taken.by.get(subject) ?? 0) >= most) { return false; }
    if (this.way(c) && !['retreat', 'opened'].includes(x.best) && at.taken.ways >= 2) { return false; }
    if (x.best === 'own' && at.taken.own >= 1) { return false; }
    return x.best !== 'unvisited' || picked.length - at.taken.plates < 2 && picked.length === at.taken.plates + at.taken.ways;
  }
  // The reasons it may be led with for, as what it is allows: never a wait (but for first light, in the dark with
  // nothing to give light), or studying; a step across the country only toward the aim shown (REV-08: from the edge of
  // the known into the wild country it lies in); a search only for a sign of the place's or what the aim waits on; a
  // camp or a rest only for what the company needs; a way not yet taken only in a settlement or site, and not with a
  // danger or a warning.
  private static allowed(c: Candidate, s: Situation): Why[] {
    if (c.kind === 'study') { return []; }
    // A question asked once more ("Ask Bask again about …") tells only what was told: never led with, whatever aim it
    // is about (a player following the page had asked a merchant the same rumour a hundred and sixty times).
    if (c.command && /_again(\(|$)/.test(c.command)) { return []; }
    // Someone down, no way on or further in is led, only back, to a light or to a bed: the gold had led on into the
    // embalmers' room with the bard senseless (round 8, N).
    if (s.down && ['way', 'travel', 'step'].includes(c.kind)) {
      return c.whys.filter(w => ['retreat', 'night', 'dark', 'exposed', 'hurt'].includes(w));
    }
    if (c.kind === 'step') { return c.whys.filter(w => w === 'toward'); }
    // In the dark, a way the company has not taken is not led with for anything: it cannot be seen. The gnawed hole out
    // of the pitch-dark corn-store cellar had been gold beside "Light a torch" (M21's PL-10; round 12, A, T39).
    if (s.dark && this.way(c) && c.visited === false) { return c.whys.filter(w => w === 'retreat'); }
    // Something done already is not led with again because another aim names whom it is done with: the page had led a
    // follower to lodge and to work for its keep at the same inn, turn and turn about, for days (the follower's 160).
    // A town not yet been to, entered from its own country, is new though the company is not in a settlement.
    const whys = c.whys.filter(w => (w !== 'unvisited' || (s.settled || c.whys.includes('entry')) && !s.threat && !s.warned)
      && !(c.known && w === 'held'));
    if (c.kind === 'wait') { return whys.filter(w => w === 'dark'); }
    // Or for what the aim followed waits on, hidden here (the dead man's box under the door-stone): that had been
    // reckoned the aim's step and then dropped here, and the gold led on into the keep (test/small/gold-thread). Not
    // for being made where the aim is: that is gone from Affordances (M21's PL-08).
    if (c.kind === 'search') { return whys.filter(w => w === 'sign' || w === 'named' || w === 'advance'); }
    // Nor a rest or a camp while one of the company lies senseless and not dead: at a rest they come round or die where
    // they fell, and the rest led with had killed the one who played (OR-683, cold play 2); the way back is led.
    if (c.kind === 'camp' || c.kind === 'rest') { return s.dying ? [] : whys.filter(w => this.tiers[w][0] === 2); }
    return whys;
  }
  // Where it is drawn among the rest: by its best reason, but an attack the company's own reckoning calls deadly after
  // the way back from it (a lone warrior led to attack the hobs' raiding party, "beyond you", fell: Mission 20).
  private static ranked(x: { c: Candidate; best: Why }): number {
    return this.rank(x.best) + (x.c.kind === 'attack' && x.c.marks.some(m => m.danger === 'deadly') ? 5 : 0);
  }
  private static found(x: { c: Candidate; best: Why }): number { return Number(x.best === 'own' && !!x.c.subject); }
  private static best(whys: Why[]): Why { return [...whys].sort((a, b) => this.rank(a) - this.rank(b))[0]!; }
  private static rank(w: Why): number { const [tier, n] = this.tiers[w]; return tier * 10 + n; }
  private static way(c: Candidate): boolean { return ['way', 'travel', 'step'].includes(c.kind); }
  // What it is led with for, and what of it is pressing, aimed, new or only known.
  // A candidate led with as the aim's step, where the lead says it is and nothing promoted was (see AimContinuity).
  static gild(c: Candidate): Promoted { return this.promoted(c, 'advance', ['advance', ...c.whys]); }
  // Whether it may be led with at all here, for any reason (see allowed): a way into the dark with nothing to see by
  // may not, whatever the aim (test/small/dark-ahead).
  static eligible(c: Candidate, s: Situation): boolean {
    return this.allowed({ ...c, whys: [...c.whys, 'advance'] }, s).length > 0;
  }
  private static promoted(c: Candidate, why: Why, whys: Why[]): Promoted {
    const tiers = new Set(whys.map(w => this.tiers[w][0]));
    // Further into a site is not the aim's (see Glance.inward).
    const aimed = whys.some(w => w !== 'deeper' && this.tiers[w][0] === 1);
    const facets: Facet[] = ['here', ...aimed ? ['aimed' as const] : [],
      ...tiers.has(0) || tiers.has(2) ? ['urgent' as const] : [], ...tiers.has(3) || tiers.has(4) ? ['new' as const] : [],
      ...c.known ? ['known' as const] : []];
    // A way led with for another reason says too who is perceived along it, so that its icon is borne out by its words
    // (the owner, 17 November: a lens's companion icon and no one named on its rows).
    const own = c.notes?.[why], along = why !== 'companion' && this.way(c) ? c.notes?.companion : undefined;
    const note = own && along ? `${own}, and ${along}` : own ?? along;
    const inside = this.inside(c, [why, ...whys.filter(w => w !== why)]);
    return { choice: c.choice, ...inside.length ? { inside } : {}, ...c.command ? { command: c.command } : {},
      ...c.for ? { for: c.for } : {},
      ...c.subject ? { subject: c.subject } : {}, ...c.unmet ? { unmet: true as const } : {},
      ...c.exit ? { exit: c.exit } : {}, label: c.label, why, facets, tier: this.tiers[why][0],
      aspects: this.aspects(c, why, whys), ...note ? { note } : {}, marks: c.marks,
      ...whys.includes('entry') ? { enters: true as const, afar: true as const } : {},
      ...whys.includes('advance') && why !== 'advance' ? { advances: true as const } : {} };
  }
  // What it is to the company. What is worth a look that teaches it something (the notice on the well-post, read; the
  // dead man's tablet) is something to learn, blue, not only something worth a look (the owner, 12 November: a bare
  // link that "clearly gives you a clue"); nothing else is (see Aspects).
  private static aspects(c: Candidate, why: Why, whys: Why[]): Aspect[] {
    return Aspects.of([why, ...whys.filter(w => w !== why)], c.marks, c.visited === true, !!c.teaches);
  }
  // Of an opener, each act within it a reason is for, with the aspects those reasons give it, best first: so that what
  // its likeness is drawn as is found again within it (the owner, 12 November: a blue pip, and no blue question).
  // borne: an act inside that bears what the opener is drawn as and nothing it is led for (the place's own act: AT-07),
  // so that no client does the opener by it (see Doable.row).
  static inside(c: Candidate, whys: Why[]): { command: string; aspects: Aspect[]; borne?: true }[] {
    const out: { command: string; aspects: Aspect[]; borne?: true }[] = [];
    for (const w of whys) {
      const command = c.leaves?.[w], aspect = Aspects.by[w], borne = w === 'own';
      // What is next to ask whoever is spoken to is found inside their talk, drawn by nothing of its own.
      if (!command || (!aspect && w !== 'talking')) { continue; }
      const at = out.find(x => x.command === command);
      if (!at) {
        out.push({ command, aspects: aspect ? [aspect] : [], ...borne ? { borne: true as const } : {} });
        continue;
      }
      if (aspect && !at.aspects.includes(aspect)) { at.aspects.push(aspect); }
      if (!borne) { delete at.borne; }
    }
    return out;
  }
  // The quiet row of ways under the acts, none of them led with already: those the aims name, those the lines told now
  // name, those not yet taken (nearest first), then the rest; three at most. In the open country, the compass.
  static ways(cands: Candidate[], picked: Promoted[], s: Situation): string[] {
    const led = new Set(picked.map(p => p.choice));
    const ways = cands.filter(c => !c.barred && !led.has(c.choice) && (s.open ? c.kind === 'step'
      : c.kind === 'way' || c.kind === 'travel'));
    if (s.open && ways.length) { return ways.sort((a, b) => a.order - b.order).map(c => c.choice); }
    return ways.sort((a, b) => this.placed(a) - this.placed(b)
      || (this.placed(a) === 2 ? (a.minutes ?? 0) - (b.minutes ?? 0) : 0) || a.order - b.order)
      .slice(0, this.cap).map(c => c.choice);
  }
  private static placed(c: Candidate): number {
    return c.whys.some(w => this.tiers[w][0] === 1) ? 0 : c.pointed ? 1 : !c.visited ? 2 : 3;
  }
}
