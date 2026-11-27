import { appendFile } from 'node:fs/promises';
import type { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { PlayerFrame } from '../presentation/player-frame';
import { ActionFeedbackView } from '../presentation/action-feedback';
import type { Continuance } from '../presentation/aim-continuity';
import { Narrator, type Exchange, type Leaf, type Told } from '../presentation/narrator';
import type { Lens, Successor } from '../presentation/glance-types';
import type { ActType, Bearing } from '../presentation/offer';
import { ScreenModel } from '../ui/screen-model';
import type { Screen } from '../ui/screen-types';
import { Typography } from '../presentation/typography';
import { AimSaid } from '../presentation/aim-said';
import { Undertakings } from '../presentation/undertakings';
import { Promises } from '../presentation/promises';
import { TerminalScene, type Turned } from './terminal-scene';
import { PlayTool } from './play-tool';
import { TerminalWalk, type Presented } from './terminal-walk';
import { RunnerFight } from './runner-fight';
import { RunnerCreation } from './runner-creation';
import { RunnerLines } from './runner-lines';
import { RunnerAmid } from './runner-amid';
import { RunnerPayoff } from './runner-payoff';
import { RunnerLed } from './runner-led';
import { Glance } from '../presentation/glance';
import { Promotion } from '../ui/promotion';
import { RunnerOffer, type Kept } from './runner-offer';
import { DoableJourneys } from '../presentation/doable-journeys';
import { Itineraries } from '../ui/itinerary';
import { RunnerTalks } from './runner-talks';
import { MenuTree } from '../frame/menu-tree';
import { QuestionAsked } from '../frame/question-asked';
import type { Question } from '../frame/talk-question';
import { PackSaid } from '../presentation/pack-said';
import { RunnerAgain } from './runner-again';
import { RunnerEnding } from './runner-ending';
import type { CampaignEvent } from '../campaign/campaign-types';
import { Obituary } from '../narrative/obituary';
import { FightBegun } from '../presentation/fight-begun';
import { ChoiceIds } from '../ui/choice-ids';

// One choice as the runner offers it: its id is the command that does it, the real choice id (PlayerView), so that an
// agent acts on what the page and the terminal would have it act on.
// opens: an opener's rows, where it is one: taken, it opens (it does nothing of its own: TB-12).
// says: an opener's focus, what opening it reads out whole (the speaking door's riddle: Doable's Row.says).
// aside: what the row says before it is chosen, of a fight that could be lost: its odds and the help to be had (CL-52).
// id: the engine's own row's (Doable's), as every client names it (MT-18, AT-13); does: the command taking it does,
// which may be asked for in its place (the cold plays' kept lines ask by command). An opener does nothing: it opens.
// note: what is said beside it, as the page says it (Row.note): who takes it, its price, its time (OR-687).
export interface Offered { id: string; label: string; does?: string; aspects: string[]; type: ActType; minutes?: number;
  marks: string[]; bearing?: Bearing; opens?: Offered[]; says?: string; aside?: string; note?: string }
// What the runner says on each turn: how it was come to (arriving somewhere, what came of an act, or looked at on
// purpose), the scene's lines as the terminal tells them, the four led with and the rest, the aim and what is needed.
// scene.prose: of its lines, the narration alone (not the heading nor the aim and what is needed), as the scene
// budget counts it (TerminalWalk).
export interface Said { turn: number; moment: 'arrive' | 'outcome' | 'inspect' | 'fight';
  scene: { lines: string[]; prose: string[] };
  // lenses: the rest as the page keeps it (RunnerOffer: the place's own first, the gear and the journeys last), the
  // rest that, flat, in the same order.
  // more: how many of a lens are folded out of the rest, there to be looked at through it ({"lens":"journeys"}: CL-33;
  // {"lens":"pack"}, what is done with the things carried: CL-67).
  offer: { primary: Offered[]; rest: Offered[]; lenses?: Partial<Record<Kept, Offered[]>>;
    more?: Partial<Record<Kept, number>> };
  aim?: string; aims?: Aim[]; need?: string[]; next?: Next;
  amid?: true; broken?: string[]; end?: true; ending?: { title: string; lines: string[] };
  // How the aim followed goes on from here (Glance.continuance): its step, or what stands, in words, never nothing.
  going?: { kind: string; act?: string; said?: string };
  // What the company has to spend, every turn (cold play 2, CL-06: no turn had said what was in the purse).
  purse?: { coin: number; rations: number };
  // Who goes with the one who plays, each by their calling and how hurt: a hireling's calling had been met first in a
  // fight's menu (cold play 2, CL-08).
  company?: string[];
  // And the one who plays, as the page's own card says them: a cold player had not been told who they were beyond the
  // drove (cold play 3, CL-26).
  you?: string;
  // Of the four, those that act on the aim followed's next step (the glance's lead, US-07; see RunnerLed).
  led?: string[];
  // Instruments (the experience measures): where the company stands, what the act just done changed beyond time and
  // position, and, come back where a bond was made or a fact learned, how much of it still holds.
  at?: string; changed?: string[]; kept?: { held: number; of: number } }
// What pulls once an aim is seen through (Succession): its words, and the act that takes it up, or the aim to follow.
export interface Next { text: string; act?: string; label?: string; follow?: string }
// An aim held, as the Notes list it: following one (as Follow this does) takes no time.
// story: the title of the adventure it is part of; none, a miscellaneous aim (see Stories).
export interface Aim { id: string; text: string; story?: string; followed?: true }
// What an agent may send: an act by its id, a lens to look through, the place looked at whole, every choice, or an aim
// to follow (none, to follow none).
// follow: an aim by its id, or by the number the scene says it by ("· follow 1": cold play 2, CL-11).
export type Asked = { act: string } | { lens: Lens | 'journeys' | 'pack' } | { look: true } | { more: true }
  | { follow: string | number | null };

// A runner for agents playing blind (the owner, 14 November: TB-05): the terminal's own projection (the leaf, the
// glance, the terminal's scene) as JSON lines, one per turn, and acts taken by their real ids. Nothing of the world is
// given that the page and the terminal do not give; nothing is simulated apart. Errors are said, not thrown: an act
// that is not offered, a line that is not JSON.
//   bin/kyrie run --world a1 --origin debt --as human/warrior/Brann [--transcript out.jsonl]
export class Runner {
  private n = 0;
  private told?: Told;
  private payoff = new RunnerPayoff();
  private scene = new TerminalScene();
  private fight = new RunnerFight();
  private again = new RunnerAgain();
  // since: how long the story was as it began (see FightBegun), and its words.
  private doing?: { act: string; before: ReturnType<typeof PlayerView.observe>; leg: Promise<CampaignEvent>;
    since: number; label?: string };
  // Whom the company is talking with is the session's (PlaySession.focus, OR-1451), as for every client.
  private get with(): string | undefined {
    const focus = this.session.focus;
    return focus.kind === 'talk' ? focus.with : undefined;
  }
  // The turn as it stands, built once until anything is done: its screen, its glance and its choices' words (OR-91:
  // the screen had been built up to five times a turn, most of an act's time). Kept while the world it was built of
  // is the world (a world changed is a new one: an act, or a change made from outside, as a spec's coin).
  // Its rows are the frame's, read by the screen, the glance and the runner's own account alike (see PlayerFrame).
  // charted: the same turn with the map's journeys laid, worked out only where the map is asked for (its journeys
  // looked through, or one of them set out on): an ordinary turn's lays only the aim's (Itineraries.charted).
  private now?: { world: object; frame: PlayerFrame; screen: Screen; glance?: { of: Leaf['glance'] };
    charted?: { screen: Screen; glance: Leaf['glance'] } };
  // The narrator's leaf the last turn said was told from, for a review of the journey (src/cli/journey-review.ts).
  private leafed?: Leaf;
  get leaf(): Leaf | undefined { return this.leafed; }
  // What came of the last act, as the turn was told from it (serve's view of the same turn: the parity measure).
  get last(): Told | undefined { return this.told; }
  constructor(private current: PlaySession) {}
  get session(): PlaySession { return this.current; }
  // Every presentation said so far, as a terminal walk keeps them, for the scene budget (TerminalWalk.budget).
  get scenes(): Presented[] { return this.scene.told.map(t => ({ ...t, sentences: TerminalWalk.count(t.lines) })); }
  private get campaign() { return this.session.campaign; }
  // A journey just made, said as the page's host says it (EngineHost.travel, Glance.came): where it came, or why it
  // stopped short ("You are weary", "Night has come on"), which the runner and the terminal had not said (GR-02).
  private seenJourney?: object;
  private journeyed(leaf: Leaf, screen: Screen): Leaf {
    const done = this.session.journeyed;
    if (!done || done === this.seenJourney || !leaf.glance) { return leaf; }
    this.seenJourney = done;
    const to = screen.place.name, travel = { to, arrived: done.arrived, legs: [{ place: to, at: screen.clock }],
      ...done.stopped ? { stopped: done.stopped } : {} };
    return done.arrived ? leaf : { ...leaf, glance: Glance.came(leaf.glance, travel) };
  }
  // The turn as it stands: arriving (the first, and after a move), or what came of the last act.
  said(turned: Turned = !this.told || this.told.moved ? 'arrive' : 'act'): Said {
    const c = this.campaign, now = this.standing, screen = now.screen;
    const leaf = this.journeyed(this.scene.leaf(c, screen, this.told), screen);
    now.glance = { of: leaf.glance }; this.leafed = leaf;
    // The question asked of the turn told (the session's focus: a talk's rows, as every client has them).
    const question = c.running ? QuestionAsked.settle(this.session, { screen, leaf }) : undefined;
    const lines = this.scene.lines(screen, leaf, turned, turned === 'act' && !!this.with).filter(l => l.trim());
    const g = leaf.glance, aim = AimSaid.of(screen, g?.aim);
    const { offer } = c.running ? this.offer(screen, g, question) : { offer: RunnerEnding.offer(this.session) };
    const led = RunnerLed.of(now.frame, screen, offer.primary, { lead: g?.lead, rest: offer.rest, gilt: (g?.acts ?? [])
      .filter(a => a.facets?.includes('aimed') && Promotion.continuing.includes(a.why)).map(a => a.choice) });
    return { turn: this.n, moment: turned === 'arrive' ? 'arrive' : turned === 'act' ? 'outcome' : 'inspect',
      scene: { lines, prose: this.scene.told.at(-1)?.lines ?? [] }, offer, ...led.length ? { led } : {},
      purse: { coin: screen.purse.coin, rations: screen.purse.rations }, ...Runner.company(screen),
      ...aim ? { aim: Typography.plain(aim.text) } : {}, ...Runner.aims(screen),
      ...g?.need?.length ? { need: g.need } : {}, ...g?.continuance ? { going: Runner.going(g.continuance) } : {},
      ...g?.next ? { next: Runner.next(g.next) } : {},
      ...RunnerAmid.of(c, screen) ? { amid: true as const } : {}, ...this.instruments(screen, turned),
      ...Runner.promised(screen), ...c.running ? {} : Runner.ended(c) };
  }
  // Whether the scene itself offers a row doing an act, or by its id (a journey the aim's, laid for the scene).
  private lays(act: string): boolean {
    const { offer: o, under } = this.offer(this.standing.screen, this.glanced());
    return RunnerOffer.flat([...o.primary, ...o.rest, ...under]).some(x => x.id === act || x.does === act);
  }
  private static aims(screen: Screen): Pick<Said, 'aims'> {
    return screen.aims?.length ? { aims: screen.aims.map(a => ({ id: a.id, text: Typography.plain(a.text),
      ...a.story ? { story: a.story.title } : {}, ...a.followed ? { followed: true as const } : {} })) } : {};
  }
  private static going(c: Continuance): NonNullable<Said['going']> {
    return { kind: c.kind, ...'witness' in c ? { act: c.witness } : {}, ...c.said ? { said: c.said } : {} };
  }
  private static company(screen: Screen): Pick<Said, 'company' | 'you'> {
    const [you, ...rest] = (screen.party ?? []).map(m => `${m.name}, ${m.line}, ${m.hp} of ${m.maxHp}`);
    return { ...you ? { you } : {}, ...rest.length ? { company: rest } : {} };
  }
  // The story's end as the page's last page tells it (AB-04: an agent had been left with an empty offer and no word of
  // how it came to it).
  private static ended(c: PlaySession['campaign']): Pick<Said, 'end' | 'ending'> {
    const { title, lines } = Obituary.ending(c);
    return { end: true, ending: { title, lines } };
  }
  private instruments(screen: Screen, turned: Turned): Pick<Said, 'at' | 'changed' | 'kept'> {
    const changed = this.told && turned !== 'look' ? RunnerPayoff.changed(this.told.event, this.told.said) : [];
    const kept = this.told?.moved && turned === 'arrive' ? this.payoff.back(this.campaign, screen.place.id) : undefined;
    return { at: screen.place.id, ...changed.length ? { changed } : {}, ...kept ? { kept } : {} };
  }
  // The glance's own offer (Offers.scene) as rows that can be done (RunnerOffer, from Doable): its four and its rest;
  // in a talk, the question's rows alone (RunnerTalks.asked), every act of the place still to be asked for.
  private offer(screen: Screen, g: Leaf['glance'], question?: Question) {
    const made = RunnerOffer.of(screen, g, this.names(), this.with);
    const asked = question?.talk ? RunnerTalks.asked(question, RunnerOffer.flat([...made.offer.primary,
      ...made.offer.rest, ...made.under])) : undefined;
    const out = asked ? { ...made, offer: { primary: asked, rest: [] }, under: [...made.offer.primary,
      ...made.offer.rest, ...made.under] } : made;
    this.again.keep(RunnerOffer.flat([...out.offer.primary, ...out.offer.rest, ...out.under]));
    return out;
  }
  // A row by its id, by what it does, or by the id an older build kept it by (its place among its siblings: ChoiceIds).
  private static row<T extends { id: string; does?: string }>(all: T[], id: string): T | undefined {
    const kept = all.find(x => x.id === id) ?? all.find(x => x.does === id);
    if (kept) { return kept; }
    const now = ChoiceIds.resolve(id, all.map(x => x.id));
    return now === undefined ? undefined : all.find(x => x.id === now);
  }
  // The command a row offered now does, asked by the engine's id or by the command (as the step above finds it), for a
  // client given commands (a page's kyrieMono.act); the id as it is where nothing offered answers it.
  does(id: string): string {
    const screen = this.standing.screen, { offer: o, under } = this.offer(screen, this.glanced());
    const all = RunnerOffer.flat([...o.primary, ...o.rest, ...under]);
    return Runner.row(all, id)?.does ?? id;
  }
  // Why an act asked for is not offered, where the page knows (cold play 3, CL-21: talk_to the boy refused, saying
  // nothing): someone here is talked to by their row; one not here cannot be.
  private static why(screen: Screen, act: string): string {
    const p = /^talk_to\(([^)]+)\)$/.exec(act)?.[1];
    if (!p) { return ''; }
    return screen.people.some(x => x.id === p) ? ` (talk to them by talk:${p})` : ' (they are not here)';
  }
  private static next(n: Successor): Next {
    return { text: Typography.plain(n.text), ...n.command ? { act: n.command } : {},
      ...n.label ? { label: Typography.plain(n.label) } : {}, ...n.aim ? { follow: n.aim } : {} };
  }
  // What the screen shows and the game does not keep (Promises.broken, CO-15): a Gate 1 blocker, said with the turn.
  private static promised(screen: Screen): { broken?: string[] } {
    const broken = Promises.broken(screen);
    return broken.length ? { broken } : {};
  }
  // Every choice's words, by its id.
  private names(): Map<string, string> {
    return this.standing.frame.names;
  }
  private get standing(): NonNullable<Runner['now']> {
    const world = this.campaign.world;
    if (this.now?.world !== world) {
      const frame = PlayerFrame.of(this.campaign);
      this.now = { world, frame, screen: ScreenModel.build(this.campaign, frame) };
    }
    return this.now;
  }
  // The turn as the map has it: its screen charted, glanced at as the page's map is (see now).
  private chart(): NonNullable<NonNullable<Runner['now']>['charted']> {
    const now = this.standing;
    if (now.charted) { return now.charted; }
    const screen = Itineraries.charted(this.campaign, now.screen);
    return now.charted = { screen, glance: Narrator.leaf(this.campaign, screen, this.told).glance };
  }
  private glanced(): Leaf['glance'] {
    const now = this.standing;
    return (now.glance ??= { of: Narrator.leaf(this.campaign, now.screen, this.told).glance }).of;
  }
  // What came of the last act as the narrator types it (someone's words, the telling, an event, a change), for the
  // journey reader's step inspector (src/cli/journey-capture.ts); none on arriving at the start.
  exchange(): Exchange | undefined {
    const c = this.campaign;
    return this.told && Narrator.leaf(c, this.standing.screen, this.told).exchange;
  }
  // A line from an agent, answered by what the turn then says, or an error.
  async ask(line: string): Promise<Said | { error: string }> {
    let asked: Asked;
    try { asked = JSON.parse(line) as Asked; } catch { return { error: `not JSON: ${line}` }; }
    if (!this.campaign.running) { return this.ended(asked); }
    // In a fight, a look, a lens or every choice is the fight, every move of it (OR-690: "every choice" had answered
    // the place out of the fight, with no rows).
    if (this.fight.fighting && !('act' in asked) && !('follow' in asked)) {
      return { turn: this.n, moment: 'fight', scene: { lines: this.fight.lines(), prose: [] }, offer: this.fight.offer() };
    }
    if ('look' in asked) { return this.said('look'); }
    if ('lens' in asked) { return this.lensed(asked.lens); }
    if ('more' in asked) { return this.said(); }
    if ('follow' in asked) { return this.follow(asked.follow); }
    if (!('act' in asked) || typeof asked.act !== 'string') { return { error: `nothing asked: ${line}` }; }
    if (this.fight.fighting) {
      return this.fight.choose(asked.act) ? this.went()
        : { error: `not offered in the fight: ${asked.act}${this.fight.whose(asked.act)}` };
    }
    // A journey asked for that the scene does not lay is the map's: asked of the turn charted (see chart).
    const mapped = /^(travel|map):/.test(asked.act) && !this.lays(asked.act) ? this.chart() : undefined;
    const screen = mapped?.screen ?? this.standing.screen, g = mapped?.glance ?? this.glanced();
    const { offer: o, under } = this.offer(screen, g, this.asking(screen));
    // What pulls next is offered too, by its own act.
    // And what is under each person's talk, offered as it is on the page (see RunnerTalks), and under an opener.
    const all = RunnerOffer.flat([...o.primary, ...o.rest, ...under]);
    const offered = all.flatMap(x => [x.id, ...x.does ? [x.does] : []]).concat(g?.next?.command ?? []);
    // The row asked for, by its id or by what it does; and what taking it does.
    // Asked by an id a turn offered, the same act as the turn offers it now (RunnerAgain: OR-686).
    const again = this.again.find(all, asked.act);
    if (again !== asked.act) { return this.ask(JSON.stringify({ act: again })); }
    const row = Runner.row(all, asked.act), act = row?.does ?? asked.act;
    // Turning to someone with acts held within their talk takes no time: by the engine's holder (<person>#talk) where
    // it does nothing of its own (a companion's, which only holds; one the four lead for an act does that act: TB-01),
    // or by talk:<person>, the cold plays' kept lines' (an alias of focus:talk:<person>, the session's own: OR-1451).
    const holder = row?.id === asked.act && !row.does ? /^(.+)#talk$/.exec(asked.act)?.[1] : undefined;
    const turned = /^talk:(.+)$/.exec(asked.act)?.[1] ?? holder;
    if (turned) { return this.focused(`focus:talk:${turned}`); }
    if (act.startsWith('focus:')) { return this.focused(act); }
    // Talking to the one already talked with greets no one again: it turns back to what is said (the owner's ruling,
    // OR-1451: "Talk to" turns and greets in one act only when not already talking).
    if (this.with && act === `talk_to(${this.with})`) { return this.focused(`focus:talk:${this.with}`); }
    // The map opens at any place a journey goes from here (map:<place>), led with or not, as the page's map does.
    const at = /^map:(.+)$/.exec(asked.act)?.[1];
    if (at && offered.includes(`travel:${at}`)) { return this.lensed('journeys', `travel:${at}`); }
    // A journey to where a way already goes is that way (one act, one row: Doable.once), asked for by either.
    const way = !offered.includes(asked.act) && asked.act.startsWith('travel:')
      ? all.find(x => x.does && DoableJourneys.reached(x.does)[0] === asked.act) : undefined;
    if (way) { return this.ask(JSON.stringify({ act: way.id })); }
    if (!offered.includes(asked.act)) { return { error: `not offered: ${asked.act}${Runner.why(screen, asked.act)}` }; }
    // An opener taken opens: its rows offered, no time (the page draws them; the runner had done its first).
    if (row?.opens) { return this.opened(row, screen); }
    // One the four lead with across the country opens the map at where it goes, as the page charts it: the runner's
    // map is its journeys, that one first, set out on from there (DoableJourneys: chart).
    const charted = /^view:map(?::(.+))?$/.exec(act);
    if (charted) { return this.lensed('journeys', charted[1] && `travel:${charted[1]}`); }
    // An aim chosen to follow: the session's own command, no event of the world to be told.
    if (act.startsWith('follow:')) { this.now = undefined; await this.session.leg(act); return this.said('look'); }
    // Whether the company goes on talking after it is the session's (Focusing.after: a plea to Wat, made in his talk,
    // is said in it with its dice: test/small/talk-roll-said).
    this.doing = { act, before: PlayerView.observe(this.campaign), since: this.campaign.history.length,
      label: this.names().get(act), leg: this.lead(act) };
    return this.went();
  }
  // Anything asked once the story has ended is answered with the ending, and what it offers done (CL-53: a look after
  // a death had never been answered).
  private async ended(asked: Asked): Promise<Said | { error: string }> {
    if (!('act' in asked) || asked.act !== RunnerEnding.again.id) { return this.said('look'); }
    if (!RunnerEnding.can(this.session)) { return { error: `not offered: ${asked.act}` }; }
    this.current = await RunnerEnding.begin(this.session);
    this.payoff = new RunnerPayoff(); this.scene = new TerminalScene(); this.fight = new RunnerFight();
    this.told = undefined; this.now = undefined; this.doing = undefined;
    this.n++;
    return this.said('arrive');
  }
  // An act set going: what stood before it is let go.
  private lead(act: string): Promise<CampaignEvent> {
    this.now = undefined;
    return this.session.leg(act, this.fight.controller);
  }
  // The act going on: its next turn of a fight, if one began, else what came of it.
  private async went(): Promise<Said | { error: string }> {
    const doing = this.doing!;
    let out: Awaited<ReturnType<RunnerFight['next']>>;
    try { out = await this.fight.next(doing.leg); }
    catch (e) {
      this.doing = undefined;
      return { error: `could not be done: ${doing.act}: ${e instanceof Error ? e.message : String(e)}` };
    }
    // Each turn of a fight chosen is a turn of the runner's: the number had stood still through a whole fight, so
    // that thirty fight turns were all turn 30 (cold play 2, CL-11).
    if ('turn' in out) {
      this.n++;
      const lines = this.fight.lines(() => FightBegun.lines(this.campaign, doing.since, doing.label));
      return { turn: this.n, moment: 'fight', scene: { lines, prose: [] }, offer: this.fight.offer() };
    }
    const event = out.done as CampaignEvent, before = doing.before;
    this.doing = undefined;
    const moved = before.location?.id !== this.campaign.world.one('at', this.campaign.playerActor ?? 'party');
    const feedback = this.fight.closed(ActionFeedbackView.read(this.campaign, event, before));
    this.told = { event, feedback, said: doing.act, moved };
    this.now = undefined;
    if (before.location?.id) { this.payoff.note(before.location.id, RunnerPayoff.changed(event, doing.act)); }
    this.n++;
    return this.said();
  }
  // An aim followed, or none: no world act, no time.
  // Not while a fight is on, as the page has no aims to follow in one: the session is busy with the fight, and a follow
  // there had thrown and ended the runner (the beat map replaying cold play 5, 19 November: CL-62).
  private async follow(by: string | number | null): Promise<Said | { error: string }> {
    if (this.fight.fighting) { return { error: 'not offered in the fight: an aim is followed once it is over' }; }
    const aims = this.standing.screen.aims ?? [];
    const id = typeof by === 'number' ? aims[by - 1]?.id ?? String(by) : by;
    if (id !== null && !aims.some(a => a.id === id)) { return { error: `no aim: ${id}` }; }
    this.now = undefined;
    if (id !== null) { await this.session.leg(`follow:${id}`); } else { Undertakings.follow(this.campaign); }
    return this.said('look');
  }
  // A lens looked through: no world act, no time; its acts as the offer, each as the scene offers it (Offers ranks a
  // lens as it ranks any surface of its own).
  // The journeys' lens is every journey, those the rest keeps first, as the page's map holds them (CL-33); opened at a
  // place (first: a row led with across the country, Row.chart), its journey first.
  private lensed(lens: Lens | 'journeys' | 'pack', first?: string): Said | { error: string } {
    const screen = this.standing.screen, g = this.glanced();
    if (lens === 'pack') {
      const all = this.offer(screen, g).pack, lines = PackSaid.lines(screen);
      return { turn: this.n, moment: 'inspect', scene: { lines, prose: [] },
        offer: { primary: all.slice(0, 4), rest: all.slice(4) } };
    }
    if (lens === 'journeys') {
      const map = this.chart(), every = this.offer(map.screen, map.glance).journeys;
      const all = [...every.filter(o => o.does === first), ...every.filter(o => o.does !== first)];
      return { turn: this.n, moment: 'inspect', scene: { lines: [], prose: [] },
        offer: { primary: all.slice(0, 4), rest: all.slice(4) } };
    }
    if (!g?.lenses[lens]) { return { error: `no lens: ${String(lens)}` }; }
    // The things lens says what the company carries too, as the page's pack does (OR-688).
    const lines = lens === 'things' ? PackSaid.lines(screen) : [];
    return { turn: this.n, moment: 'inspect', scene: { lines, prose: [] },
      offer: RunnerOffer.lensed(screen, g, this.names(), lens) };
  }
  // A command of the focus (focus:…: turned to someone, a page of the talk, its wares): the session's own, no time.
  // Turned to someone, as the page opens the talk: who is spoken to and what can be seen of them now, with what can
  // be said to them, not the place again ("Talk to the factor" had told the green whole: cold play 4, CL-49).
  private async focused(command: string): Promise<Said | { error: string }> {
    try { await this.session.leg(command); } catch (e) { return { error: `not offered: ${command}: ${e instanceof Error ? e.message : String(e)}` }; }
    const said = this.said('look'), who = this.with, screen = this.standing.screen;
    const p = who && command.startsWith('focus:talk:') ? screen.people.find(x => x.id === who) : undefined;
    if (!p) { return { ...said, moment: 'inspect' }; }
    const seen = (p.says?.length ? p.says : [p.name]).map(l => Typography.plain(l));
    return { ...said, moment: 'inspect', scene: { lines: [`${p.name.split(', ')[0]}:`, ...seen], prose: seen } };
  }
  // The question the turn as it stands asks (the session's focus), its frame told as the turn was.
  private asking(screen: Screen): Question | undefined {
    return this.with ? MenuTree.question({ screen, leaf: this.leafed ?? { glance: this.glanced() } as Leaf },
      this.session.focus, this.session.conversation) : undefined;
  }
  private opened(opener: Offered, screen: Screen): Said {
    const rows = opener.opens ?? [], g = this.glanced(), says = opener.says ? [Typography.plain(opener.says)] : [];
    const four = opener.says ? rows.length : 4, primary = rows.slice(0, four);
    const led = opener.says ? RunnerLed.of(this.standing.frame, screen, primary, { lead: g?.lead }) : [];
    return { turn: this.n, moment: 'inspect', scene: { lines: [`${opener.label}:`, ...says], prose: says },
      at: screen.place.id, offer: { primary, rest: rows.slice(four) }, ...led.length ? { led } : {},
      ...Runner.aims(screen), ...g?.continuance ? { going: Runner.going(g.continuance) } : {} };
  }
  // The runner on stdio: a turn said on starting and after every line read; the transcript kept, if asked for.
  static async main(args: string[]): Promise<number> {
    const options = PlayTool.parse(args.filter((a, i) => a !== '--transcript' && args[i - 1] !== '--transcript'));
    const kept = args.includes('--transcript') ? args[args.indexOf('--transcript') + 1] : undefined;
    if (!options.world && !options.campaign) { console.error(`${PlayTool.usage} [--create] [--transcript out.jsonl]`); return 1; }
    // --create on a world: the life made from the real entry point, through the engine's own requests (Gate 1).
    const lines = new RunnerLines(), creating = !!options.world && !options.as && args.includes('--create');
    const session = creating ? await new RunnerCreation(lines, out => Runner.say(out, kept)).begin(options.world!)
      : (await PlayTool.start(options)).journey.session;
    const runner = new Runner(session);
    await Runner.say(runner.said(), kept);
    for (let line = await lines.next(); line !== null; line = await lines.next()) {
      const out = await runner.ask(line);
      await Runner.say(out, kept);
    }
    return 0;
  }
  // A turn said on stdout, and kept in the transcript, if one is asked for.
  private static async say(out: unknown, kept?: string) {
    const text = JSON.stringify(out);
    console.log(text);
    if (kept) { await appendFile(kept, `${text}\n`); }
  }
}
