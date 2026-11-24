import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';
import { Attest } from '../../src/presentation/attest';
import { Indicator } from '../../src/presentation/indicator';
import { Undertakings } from '../../src/presentation/undertakings';
import { Stakes } from '../../src/ui/stakes';
import { StockOpenings } from '../../src/world/stock-openings';
import type { Aspect } from '../../src/presentation/glance-types';
import type { Objective, Predicate } from '../../src/lang/module';
import type { PlaySession } from '../../src/session/play-session';
import { AsMeant } from '../../test/support/as-meant';
import { GoldenWalk } from '../../test/support/golden-walk';
import { HonestPlayer } from '../../test/support/honest-player';
import { BoredomCensus } from '../boredom-census';
import { DifferenceCensus } from '../difference-census';
import { NoviceCountry } from '../novice-country';
import type { CampaignEvent } from '../../src/campaign/campaign';

// A turn as the Atlas drew it: its rows' colours by tone (the runner's rows, each by the one indicator its aspects
// make: Indicator), whether none was coloured, and the coloured rows the glance attests nothing for (Attest). A turn in
// a fight's own frame is the fight's menu, not the Atlas, and is kept apart.
export interface Turned { tones: Record<string, number>; none: boolean; unwitnessed: string[]; fight: boolean }
// An aim held on the walk: its template (DifferenceCensus.key), its structural kind (what its condition asks), the
// minutes travelled while it was followed, whether it was seen through, and by an arrival alone.
export interface AimRead {
  id: string; key: string; kind: string; text: string; travelled: number; done: boolean; arrived: boolean;
  anchor?: string;
  // Taken up in the first town, and whether by investigation (a question asked of someone, a search, a check) or
  // handed out (a notice read, a word on arriving, a rule): the owner, 24 November, "initial quests folded behind
  // investigation checks rather than just given out constantly". Unsaid for the aims held as the walk began.
  town?: 'investigated' | 'handed';
}
// Someone who came to matter on the walk: one who joined the company, or someone an aim was about.
export interface Mattered { id: string; name: string; why: 'joined' | 'anchor' }
export interface Walked {
  name: string; seed: string; minutes: number; turns: Turned[]; fights: number; aims: AimRead[]; people: Mattered[];
}
interface State { s: PlaySession; w: Walked; aims: Map<string, AimRead>; from: number; start: Set<string>;
  town?: string }

// The walked runs scripts/quantity reads (see quantity.md): the warrior's golden walk (its kept lines through the
// runner, as the quality gate plays it), and the gold-follower (HonestPlayer: the page's lead, every step) on each
// seed, from its first town (Iscoed's from its stock opening, as a new life begins there).
export class QuantityWalks {
  static readonly as = 'human/warrior/Wenna';
  static async golden(): Promise<Walked> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const st = this.state(journey.session, 'golden walk', 'iscoed'), r = new Runner(journey.session);
    for (const line of GoldenWalk.lines()) {
      const before = this.before(st), said = await AsMeant.ask(r, line);
      if ('error' in said) { continue; }
      this.after(st, before, r, said);
    }
    return this.done(st);
  }
  static async gold(seed: string, steps = 80): Promise<Walked> {
    const opening = seed === 'iscoed' ? GoldenWalk.opening : StockOpenings.none;
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', this.as, '--opening', opening]));
    const s = journey.session, st = this.state(s, `gold-follower ${seed}`, seed), h = new HonestPlayer(s);
    const r = new Runner(s);
    for (let i = 0; i < steps && s.campaign.running; i++) {
      const before = this.before(st);
      if (!await h.step().catch(() => false)) { break; }
      this.after(st, before, r, r.said());
    }
    return this.done(st);
  }
  private static state(s: PlaySession, name: string, seed: string): State {
    const c = s.campaign, w: Walked = { name, seed, minutes: 0, turns: [], fights: 0, aims: [], people: [] };
    const here = c.world.one('at', c.playerActor ?? 'party') ?? '';
    const town = NoviceCountry.containing(c, here, 'settlement')?.id;
    return { s, w, aims: new Map(), from: c.history.length, start: new Set(c.readout.partyIds),
      ...town ? { town } : {} };
  }
  private static before(st: State) {
    const c = st.s.campaign, held = Undertakings.held(c);
    this.hold(st, held);
    return { at: BoredomCensus.here(st.s), minute: BoredomCensus.minutes(st.s), history: c.history.length,
      held: new Set(held.map(o => o.id)), followed: Undertakings.followed(c, held)?.id };
  }
  private static after(st: State, b: ReturnType<typeof QuantityWalks.before>, r: Runner, said: Said) {
    const c = st.s.campaign, moved = BoredomCensus.here(st.s) !== b.at, took = BoredomCensus.minutes(st.s) - b.minute;
    const events = c.history.slice(b.history), held = Undertakings.held(c), now = new Set(held.map(o => o.id));
    if (moved && b.followed) { st.aims.get(b.followed)!.travelled += took; }
    const arrivedOnly = moved && events.every(e => /^(go|travel|enter|leave|wait|ascend|descend)\b/.test(e.action));
    for (const id of b.held) {
      const a = st.aims.get(id)!;
      if (!now.has(id) && !a.done) { a.done = true; a.arrived = arrivedOnly; }
    }
    this.hold(st, held, events);
    st.w.turns.push(this.turned(r, said));
  }
  // Every aim held, kept once it is first held, with whoever it is about.
  private static hold(st: State, held: Objective[], events?: CampaignEvent[]) {
    const c = st.s.campaign, here = c.world.one('at', c.playerActor ?? 'party') ?? '';
    const inTown = !!events && !!st.town && NoviceCountry.containing(c, here, 'settlement')?.id === st.town;
    // Not the life's own errand, its origin's (the drove's, on iscoed), which is what it came for.
    const origin = st.s.transcript.drawn?.origin;
    for (const o of held.filter(x => !st.aims.has(x.id))) {
      const own = Stakes.own(o) || (!!origin && o.id.startsWith(`${origin}__`));
      const anchor = Stakes.target(c, o).subject;
      st.aims.set(o.id, { id: o.id, key: DifferenceCensus.key(o.id), kind: this.kind(o.when), text: o.text,
        travelled: 0, done: false, arrived: false, ...anchor ? { anchor } : {},
        ...inTown && !own ? { town: this.investigated(c, events!) ? 'investigated' as const : 'handed' as const } : {} });
    }
  }
  static readonly looking = new Set(['search', 'look_closely', 'examine']);
  // Whether the acts that gave an aim were investigation: a check, a search, a look closer, or a question asked of
  // someone that only something learned first opens (a Topic that knows of something, or answers a question put). A
  // question offered to anyone who walks in ("Ask Cyril about the old quarry") is the job handed out by its label.
  private static investigated(c: PlaySession['campaign'], events: CampaignEvent[]): boolean {
    return events.some(e => {
      const op = c.operator(e.action);
      return !!op && (!!op.resolve || this.looking.has(op.schema ?? '') || (!!op.speaker && (!!op.answers
        || this.learned(op.requires))));
    });
  }
  // Whether a condition asks that something be known (not that it is not).
  private static learned(p: Predicate): boolean {
    if ('name' in p) { return p.name === 'knows'; }
    if (p.kind === 'and' || p.kind === 'or') { return this.learned(p.left) || this.learned(p.right); }
    return false;
  }
  private static done(st: State): Walked {
    const c = st.s.campaign, w = st.w, events = c.history.slice(st.from);
    w.fights = events.filter(e => e.combat.some(x => x.type === 'initiative')).length;
    w.minutes = events.length ? BoredomCensus.minutes(st.s) - this.first(st) : 0;
    w.aims = [...st.aims.values()];
    w.people = this.mattered(st);
    return w;
  }
  // The minute the walk began at (the clock as the start stood, read back from its first event's).
  private static first(st: State): number {
    const c = st.s.campaign, e = c.history[st.from];
    return e ? e.elapsed * 10 : BoredomCensus.minutes(st.s);
  }
  private static mattered(st: State): Mattered[] {
    const c = st.s.campaign, byId = new Map(c.module.entities.map(e => [e.id, e.name]));
    const joined = c.readout.partyIds.filter(id => !st.start.has(id)).map(id => ({ id,
      name: c.readout.creatures.find(k => k.id === id)?.name ?? id, why: 'joined' as const }));
    const anchors = [...new Set(st.w.aims.flatMap(a => a.anchor ? [a.anchor] : []))]
      .filter(id => id !== c.playerActor && !st.start.has(id))
      .map(id => ({ id, name: byId.get(id) ?? id, why: 'anchor' as const }));
    return [...joined, ...anchors];
  }
  // The rows of a turn by the Atlas's colours, and those the glance attests nothing for.
  static turned(r: Runner, said: Said): Turned {
    const g = r.leaf?.glance, rows = RunnerOffer.flat([...said.offer.primary, ...said.offer.rest]);
    const fight = said.moment === 'fight' || rows.some(o => o.id.startsWith('fight:'));
    const tones: Record<string, number> = {}, unwitnessed: string[] = [];
    for (const o of fight ? [] : rows) {
      const tone = Indicator.of({ aspects: o.aspects as Aspect[] }).tone;
      if (!tone) { continue; }
      tones[tone] = (tones[tone] ?? 0) + 1;
      if (!this.keys(o).some(k => Attest.witness(g, k))) { unwitnessed.push(`${tone} ${o.label}`); }
    }
    return { tones, none: !fight && !Object.keys(tones).length, unwitnessed, fight };
  }
  // The ids a row's witness may stand under: its own, its command's, the choice it was made of (an exit's way, a
  // journey on the map), and the one it is inside.
  private static keys(o: { id: string; does?: string }): string[] {
    const id = o.id.replace(/\/\d+:.*$/, ''), does = o.does ?? '';
    return [o.id, id, does, does.replace(/^view:map:/, 'travel:'), id.replace(/^map:/, 'travel:'),
      `subject:${id.replace(/#.*$/, '')}`, ...does ? [does.replace(/\(.*$/, '')] : []].filter(Boolean);
  }
  // What an aim's condition asks, by the relations it reads: to kill, to fetch or bring, to tell or learn, to reach
  // or find, to see someone through, or a story's own stage (a relation of its own, none of these).
  static readonly kinds: [string, RegExp][] = [['kill', /^(dead|slain|defeated|killed|cleared|down|destroyed)/i],
    ['fetch', /^(carries|owns|ownedItem|holds|has|quantity|recovered|returned|brought|delivered|gave|given)/i],
    ['tell', /^(told|reported|knows|learned|heard|warned|asked)/i],
    ['reach', /^(at|visited|arrived|found|reached|been|seen|entered)/i],
    ['escort', /^(travelsWith|memberOf|follows|escorted|rescued|freed|joined)/i]];
  static kind(p: Predicate): string {
    const names = this.names(p).map(n => n.replace(/^[\w-]+__/, ''));
    const found = [...new Set(names.flatMap(n => this.kinds.filter(([, re]) => re.test(n)).map(([k]) => k)))].sort();
    return found.length ? found.join('+') : 'stage';
  }
  private static names(p: Predicate): string[] {
    if ('name' in p) { return [p.name]; }
    if (p.kind === 'not') { return this.names(p.value); }
    if (p.kind === 'and' || p.kind === 'or') { return [...this.names(p.left), ...this.names(p.right)]; }
    if (p.kind === 'compare') {
      return [p.left, p.right].flatMap(v => v.kind === 'call' ? [v.name] : v.kind === 'count' ? this.names(v.of) : []);
    }
    return [];
  }
}
