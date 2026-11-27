import { Portraits } from '../../src/ui/portraits';
import { CompanyPortraits } from '../../src/paintings/company-portraits';
import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view'; import { PlayerFrame } from '../../src/presentation/player-frame';
import { ActionFeedbackView, type ActionFeedback } from '../../src/presentation/action-feedback';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { Undertakings } from '../../src/presentation/undertakings';
import { ScreenModel } from '../../src/ui/screen-model';
import { CombatModel } from '../../src/ui/combat-model';
import { Tactics } from '../../src/tactics'; import { Pressing } from '../../src/pressing'; import { FoeIntents } from '../../src/foe-intents';
import type { Battle } from '../../src/battle';
import type { Command } from '../../src/model';
import type { Screen } from '../../src/ui/screen-types';
import { Creation } from './creation';
import { EngineCreation, type CreationState } from './engine-creation';
import type { CreationChoice } from '../../src/creation/creation-flow'; import { Foregone } from '../../src/ui/foregone';
import { EngineStarts, type Starting } from './engine-starts';
import { EngineForesight } from './engine-foresight';
import { FirstChoice } from '../../src/creation/first-choice';
import { Frontier } from '../../src/world/frontier';
import type { Campaign, CampaignEvent } from '../../src/campaign/campaign';
import { Scenarios } from '../scenarios';
import { PlayTranscript } from './transcript';
import type { Entry, Frame, Leaf, Message, Request } from '../../src/creation/protocol';
import { SaveCodec } from './save-codec';
import { KeptGame, type Keyed } from './kept-game';
import { Narrator, type Told } from '../../src/presentation/narrator';
import { SceneBudget } from '../../src/presentation/scene-budget';
import { Prologue } from '../../src/presentation/prologue';
import { FightBegun } from '../../src/presentation/fight-begun';
import { Obituary } from '../../src/narrative/obituary';
import { BandNames } from '../../src/narrative/band-names';
import { Travel } from '../../src/session/travel';
import { Itineraries } from '../../src/ui/itinerary'; import { TravelQuestion } from '../../src/presentation/travel-question';
import { BuildStamp } from '../../src/session/build-stamp';
import { Oracle, type OracleAct } from '../../src/presentation/oracle';
import { ChoiceList } from '../../src/ui/choice-list'; import { MenuTree } from '../../src/frame/menu-tree';
import { Likenesses } from '../../src/presentation/likenesses';
import { Glance } from '../../src/presentation/glance'; import { DangerAhead } from './danger-ahead'; import { DangerSense } from '../../src/presentation/danger-sense';
import { BoundJourney } from './bound-journey'; import { LegTold, type LegPassed } from './leg-told'; import { Earned } from '../../src/lang/index';

// A journey as it goes: each leg as it was told, and the frame the last one left, if it left one. passed: where the
// last leg was told by its receipt, the host as it was before it (see passed), for the frame built where it ends.
interface Trail { legs: NonNullable<Frame['travel']>['legs']; last?: Frame; passed?: { country?: string; recap: boolean } }

// The engine's side of play. It holds the one PlaySession, carries out what the player chose, and answers with a
// frame: everything the page draws. A fight pauses on each of the company's turns until the page sends a choice.
export class EngineHost {
  private session?: PlaySession;
  // A generated world goes on past its edges: the country beyond is drawn when the company first comes to one.
  private frontier?: Frontier;
  private log: Entry[] = [];
  // doing: the act under way, by its label (see begun).
  private opening: string[] = []; private doing?: string;
  // How long the story was when the command under way began: what was told before it did not start its fight.
  private began = 0; private screen?: Screen;
  // The last command, as the narrator tells it until the next; and the country the company was last in, so that
  // coming into another is marked. last: the last act and its timings, for the oracle (OR-1151).
  private told?: Told; private last?: OracleAct;
  private country?: string; private crossed = false;
  // Whether the page tells the game's opening apart, before the first place (see Prologue).
  private apart = false;
  // Whether the next page is the first of a game taken up again: it opens on what the company was about.
  private resumed = false;
  // How long the last command took the engine, before the screen was built and told.
  private spent = 0;
  private turn?: { battle: Battle; resolve: (c: Command) => void };
  // The last fight the company chose in, held on its page once it has ended, until the player goes on.
  private fought?: Battle;
  private readonly creation = new Creation(); private readonly made = new EngineCreation();
  private readonly starts = new EngineStarts(this.creation, m => this.post(m));
  private readonly foresight = new EngineForesight(this.creation, this.made, this.starts);
  // Idle at last: nothing more begun, and what was under way finished (a country drawn ahead, and the start it asks:
  // see EngineForesight.settled, EngineStarts.settled).
  async idle(): Promise<void> { await this.foresight.settled(); await this.starts.settled(); }
  // The command under way, if any, which a checkpoint waits for.
  private working: Promise<unknown> = Promise.resolve();
  // Which game the host plays: one begun or opened is the next. A command that ends after another game has begun
  // writes nothing into it, and a fight it is in is fought on by the game's tactics (the architecture review's A2: a
  // new game took the old command's journal entry). The game a command is under way in, while it is.
  private game = 0;
  private busy?: number;
  constructor(private readonly post: (message: Message) => void) {}
  // The game begun, for a client in the same process (the terminal) that plays it on the same session.
  get played(): PlaySession | undefined { return this.session; }
  warm() { this.starts.warmRules(); }
  async handle(request: Request): Promise<unknown> {
    // What a developer needs to reproduce what the player sees (the oracle, OR-1151): asked, it changes nothing, not
    // even the danger reckoned ahead is let go for it.
    if (request.kind === 'about') { return Oracle.of(BuildStamp.about, this.session, this.screen, this.last); }
    this.danger.stop();
    switch (request.kind) {
      case 'catalog': return Creation.catalog();
      case 'setting': return this.creation.setting(request.campaign);
      case 'world': case 'ahead': case 'seed': return this.foresight.asked(request);
      case 'beginning': return FirstChoice.step({ ...request.kept ? { kept: request.kept } : {} });
      case 'idle': await this.idle(); return null;
      case 'creation': return request.step ? this.chosen(request.step, request.value ?? '') : this.made.state();
      // Set out now (rolled): the life drawn whole from the flow's defaults, as the start made ahead was (OR-120).
      case 'set-out': return this.begin({ ...request.rolled ? this.made.rolled() : this.made.starting(),
        ...request.apart ? { apart: true } : {} });
      case 'preview': return Creation.preview(request.party, request.generated);
      case 'begin': return this.begin(request);
      case 'ready': this.starts.prepare(request); return null;
      case 'resume': return this.resume(request.saved, { world: request.world, apart: request.apart });
      case 'perform': return this.command(() => this.perform(request.command));
      case 'fight': this.pressing = !!request.through; this.fight(request.choice); return null;
      case 'travel': return this.command(() => this.travel(request.destination));
      case 'plan': return Itineraries.plan(this.session!.campaign, request.destination)?.legs.map(l => l.to) ?? null;
      // A journey given up: it is no longer held, nor shown.
      case 'unbind': this.bound = undefined; return this.frame();
      case 'kept': this.acknowledged(request.key, request.ok); return null;
      // The page's download waits for the command under way (the independent review's A2).
      // With the story so far, so that a game opened from the file has its Story page (the review's A24).
      // A save file says which build made it (COR-06: it had carried no stamp): it is checked as it is opened, as
      // any file brought in is, and one too old to open says whose it was.
      case 'checkpoint': await this.working;
        return this.session ? JSON.stringify({ build: BuildStamp.current, checkpoint: this.session.checkpoint(true),
          log: this.log, ...this.bound ? { bound: this.bound } : {} }) : null;
      // Every surface earned (the oracle's; a spec's earned stage, OR-1245), and the frame drawn again with them.
      case 'story': return this.log; case 'receipts': return this.session?.receipts ?? []; case 'earn': Earned.grant(this.session?.campaign); return this.session ? this.settled() : null;
    }
  }
  // A choice in the making of a life, and the start it now asks for made ready meanwhile (see EngineStarts.readying).
  private chosen(step: CreationChoice, value: string): CreationState {
    const state = this.made.choose(step, value); this.starts.readying(this.made.starting());
    return state;
  }
  private async begin(r: Starting): Promise<Frame> {
    const game = this.abandon();
    // Made ready while the player read the page: only what is left of it is waited for, and said as it goes.
    const session = await this.starts.take(r);
    this.starts.said('Telling where you are');
    if (game !== this.game) { throw new Error('Another game was begun meanwhile.'); }
    this.session = session;
    this.frontier = r.campaign === Creation.generated
      ? new Frontier(r.seed, Scenarios.source(), r.terrain ? { region: { terrain: r.terrain } } : {}) : undefined;
    if (this.frontier) { this.session.extend({ expand: this.widening(game) }); }
    this.log = []; this.opening = []; this.screen = undefined; this.told = undefined; this.country = undefined;
    this.crossed = false; this.world = undefined; this.apart = !!r.apart;
    return this.settled();
  }
  // A game kept in this browser (packed), or a save file: a checkpoint, with or without the page's telling of it.
  // A game kept in this browser is its state and the world it names, kept apart (see KeptGame).
  private async resume(text: string, { world, apart }: { world?: string; apart?: boolean } = {}): Promise<Frame> {
    const game = this.abandon(); this.foresight.drop();
    const { parsed, part } = await KeptGame.opened(text, world);
    if (game !== this.game) { throw new Error('Another game was begun meanwhile.'); }
    const saved = KeptGame.join(parsed, part), kept = 'version' in parsed && parsed.version === 2;
    // Parsed here for this alone, it is handed over; one this very build kept (state and world) is not checked again.
    // One kept by another build is checked as it is opened, and if it cannot be, the player is told why.
    const trusted = kept && parsed.build === BuildStamp.current;
    try { this.session = PlaySession.resume(saved.checkpoint, { owned: true, trusted }); } catch (error) {
      throw trusted ? error : KeptGame.unopened(parsed, error);
    }
    // The world it came with is kept already: known by the same key, and by the module the campaign now holds.
    const live = this.session.checkpoint(true).save;
    this.world = 'version' in parsed && parsed.version === 2 && part ? { key: parsed.world, kept: true,
      part: { ...part, module: live.module, ...live.definition ? { definition: live.definition } : {} },
      index: KeptGame.index(part.base ?? []) } : undefined;
    const t = saved.checkpoint.transcript, terrain = t.drawn?.terrain;
    this.frontier = Frontier.generated(t.scenario)
      ? new Frontier(t.seed, Scenarios.source(), terrain ? { region: { terrain } } : {}) : undefined;
    if (this.frontier) { this.session.extend({ expand: this.widening(game) }); }
    this.log = (saved.log ?? []).map((e, i) => ({ ...e, id: e.id ?? i, notes: e.notes ?? [] }));
    this.bound = saved.bound;
    this.opening = []; this.screen = undefined; this.told = undefined; this.country = undefined;
    // Kept before anything was done (the page left in its opening), it opens as it began, on its opening; there is
    // nothing to take up (reloaded in the opening, the place had said why the company came three times over: in the
    // recap, the place and the aim).
    const fresh = this.log.every(e => Prologue.kept(e));
    this.crossed = !fresh; this.resumed = !fresh; this.apart = fresh && !!apart;
    return this.settled();
  }
  // What was done, as the engine words it: a way by the label the screen it last sent gave it, anything else by what
  // the action was (see PlayTranscript.entry).
  private said(command: string): { said: string; move: boolean; named: boolean } {
    const way = ChoiceList.command(ChoiceList.ways(this.screen?.exits ?? []).choices, command);
    return way ? { said: way.label, move: true, named: false } : { said: '', move: false, named: true };
  }
  private async perform(command: string, context = this.said(command)): Promise<Frame> {
    const session = this.session;
    if (!session) { throw new Error('No game is under way'); }
    // An aim chosen to follow is the session's command like any other, no event of the world, but told in a line: the
    // first act of play had told nothing, the rows only reshuffling and one turning gold (M22's second review, OR-41).
    // Told on the frame alone, not as an act's telling: what the page leads with is the terminal's and the runner's
    // (test/action-identity), which no telling of what came before decides.
    if (command.startsWith('follow:')) {
      const event = await session.perform(command); this.told = undefined; this.saving();
      // And, as any act done where the company stands, the place it already said is held, not told again over it.
      const frame = this.settled(), g = frame.leaf.glanced;
      return event.response ? { ...frame, leaf: { ...frame.leaf, ...g ? { glanced: SceneBudget.held(g) } : {},
        exchange: { lines: [{ kind: 'telling', text: event.response }], notes: [], tone: 'act' } } } : frame;
    }
    await this.act(command, context);
    return this.settled();
  }
  // The command done and kept as told, its frame not yet built: what the company perceives after it.
  private async act(command: string, context: { said: string; move: boolean; named: boolean }) {
    const session = this.session!, game = this.game;
    const campaign = session.campaign, before = PlayerView.observe(campaign), started = performance.now();
    // Pressing on is for the fight it was pressed in: carried on, the next two fights at the hobs' hold, their chief's
    // among them, were fought out with no page at all (Mission 20's fourth round, F 144, 147).
    // A foregone fight (easily won) is one act: begun pressing, fought through unless it turns (see Foregone).
    this.fought = undefined; this.began = campaign.history.length; this.pressing = Foregone.is(this.screen, command);
    this.doing = PlayerFrame.of(campaign).row(command)?.choice.name;
    try {
      const event = await session.perform(command, this.controlling(game));
      if (game !== this.game) { throw new Error('That game is no longer under way.'); }
      const after = PlayerView.observe(campaign), feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      this.log.push(PlayTranscript.entry(event, feedback, { ...context, id: this.next(), moved,
        place: after.location?.id ?? '', placeName: after.location?.name ?? '', elapsed: event.elapsed }));
      // A choice made from an opened list is echoed as the action it was ("You buy a torch for Bran").
      const said = context.named || context.said.includes(' › ') ? feedback.attempt : context.said;
      const told = this.fought ? EngineHost.unfought(feedback, this.begun()) : feedback;
      this.told = { event, feedback: told, said, moved };
      this.last = { label: said || this.doing || command, command };
      return after;
    } finally {
      if (game === this.game) { this.turn = undefined; this.opening = []; this.spent = performance.now() - started; }
    }
  }
  // One command at a time in a game: another, while one is under way, is refused, and leaves that one as it was (a
  // fight waiting on the player went unanswerable, and every later command was refused: the review's A2).
  private command<T>(run: () => Promise<T>): Promise<T> {
    if (this.busy === this.game) { return Promise.reject(new Error('A command is already in progress')); }
    const game = this.busy = this.game;
    const done = run().finally(() => { if (this.busy === game) { this.busy = undefined; } });
    this.working = done.catch(() => undefined);
    return done;
  }
  // The game left for another: a fight of its that waits on the player is fought on by the game's tactics, so that its
  // command can end, and whatever it then does is written nowhere. The game begun or opened now.
  private abandon(): number {
    const turn = this.turn;
    this.turn = undefined; this.fought = undefined; this.busy = undefined; this.working = Promise.resolve();
    this.bound = undefined; this.last = undefined;
    if (turn) { turn.resolve(Tactics.choose(turn.battle.state, turn.battle.plain(turn.battle.legalCommands()))); }
    return ++this.game;
  }
  // The fight's controller for a command of one game: the page's while that game is played, and its tactics after.
  private controlling(game: number) { return this.control.bind(this, game); }
  private control(game: number, battle: Battle): Promise<Command> {
    return game === this.game ? this.controller(battle)
      : Promise.resolve(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
  }
  // A journey along known ways: each leg the command the page offers for it, told as it is made; the frame it ends
  // with says each leg (where it came, when, how the way went, what came of it), and why it stopped if it did.
  // Where the company set out for and has not come to: held until it arrives, sets out for somewhere else, or gives
  // it up, and kept with the game, so that every page says where it is going and how far it has still to go (the
  // owner's interim report: a destination set out for was forgotten as soon as the journey stopped).
  private bound?: string;
  // The aim followed when it was set out on: a journey set out on for another aim is not gone on with once the aim
  // followed has changed (after the father's cart was found, the page led on to Mistshaw "where you set out for").
  private boundFor?: string;
  private travelling = false;
  private async travel(destination: string): Promise<Frame> {
    const session = this.session;
    if (!session) { throw new Error('No game is under way'); }
    const trail: Trail = { legs: [] };
    this.bound = destination;
    this.boundFor = Undertakings.aimedAt(session.campaign, destination);
    // Kept once it ends, not after every leg (each a whole game written out: AX-05, a journey of four legs had kept
    // the game five times).
    this.travelling = true;
    // Its frame built where it ends, before what it was bound for is let go, as the last leg's had been.
    const done = await Travel.go({ campaign: session.campaign, perform: this.leg.bind(this, trail) }, destination)
      .then(d => { this.ended(trail); return d; }).finally(() => { this.travelling = false; this.saving(); });
    const plan = Itineraries.plan(session.campaign, destination);
    // Come there, or with no way on known from where it stopped, nothing is held: the page had said "Go on to …
    // (0 minutes)" after a set-out that found no way, and going on only said so again (the navigation review).
    if (done.arrived || !plan) { this.bound = undefined; }
    // Each leg as it was told, and what it brought that its telling does not (water gone round: see Travel.found).
    const legs = trail.legs.map((l, i) => ({ ...l,
      journey: [...l.journey, ...done.legs[i] ? Travel.found(done.legs[i]) : []] }));
    const frame = trail.last ?? this.settled();
    const to = plan?.name ?? Travel.named(session.campaign, destination) ?? 'where you set out for';
    const travel = { to, arrived: done.arrived, legs, ...done.stopped ? { stopped: done.stopped } : {} };
    // The journey is one line of the glance where it ends; its legs stay with the place's full telling.
    const glance = frame.leaf.glance && Glance.came(frame.leaf.glance, travel);
    // Its menu worked out again over the glance as it now is.
    return glance ? MenuTree.framed({ ...frame, leaf: { ...frame.leaf, glance }, travel }) : { ...frame, travel };
  }
  // One leg of a journey, done as the page does a way chosen, and kept as it was told: by its receipt (LegTold), where
  // it tells all the page tells of it; else by its frame, built whole. wholeLegs: every leg by its frame, as before
  // the receipt (AX-05), the oracle the receipt is held equal to (test/journey-receipt).
  wholeLegs = false;
  private async leg(trail: Trail, command: string, said: string): Promise<CampaignEvent> {
    const view = await this.act(command, { said, move: true, named: false });
    const passed = this.wholeLegs ? undefined : LegTold.of(this.session!.campaign, this.told!, view);
    if (passed) { this.passed(trail, passed); } else { this.framed(trail, this.settled()); }
    return this.session!.campaign.history.at(-1)!;
  }
  private framed(trail: Trail, last: Frame, at = trail.legs.length) {
    trail.last = last; trail.passed = undefined;
    trail.legs[at] = { place: last.screen.place.name, id: last.screen.place.id, at: last.screen.clock,
      journey: last.leaf.journey ?? [], lines: (last.leaf.exchange?.lines ?? []).map(l => l.text) };
  }
  // A leg told by its receipt leaves the host as its frame would have (see leaf): the country it came into, the told
  // marked, a recap let go; and the journey held let go where its aim is no longer followed (see journeying). What it
  // was before is kept, for the frame built where the journey ends.
  private passed(trail: Trail, { country, ...told }: LegPassed) {
    trail.passed = { ...this.country ? { country: this.country } : {}, recap: this.resumed };
    trail.last = undefined; trail.legs.push(told);
    this.screen = undefined; this.country = country; this.crossed = true; this.resumed = false;
    if (this.bound && this.session!.campaign.running && !BoundJourney.held(this.session!.campaign, this.bound,
      this.boundFor)) { this.bound = undefined; }
  }
  // Where the journey ends, after a leg told by its receipt: that leg's frame, built as it would have been then.
  private ended(trail: Trail) {
    const passed = trail.passed;
    if (!passed) { return; }
    this.country = passed.country; this.resumed = passed.recap;
    this.framed(trail, this.settled(), trail.legs.length - 1);
  }
  // A fight held on its own page is not told again at the place it was fought in (see ActionFeedbackView.fought).
  // A fought act told after its fight: what the fight opened on is not told again (GR-05).
  private static unfought(feedback: ActionFeedback, opened: string[]): ActionFeedback {
    return ActionFeedbackView.fought(feedback, [], [], opened);
  }
  private next(): number { return this.log.reduce((n, e) => Math.max(n, e.id + 1), 0); }
  // Coming to a march-stone draws the country beyond it, the first time: some seconds, once, said while it lasts. It
  // is drawn as part of the command (see PlaySession.extend), so a replay of the game draws it too.
  private widening(game: number) { return this.widen.bind(this, game, this.frontier); }
  private async widen(game: number, frontier: Frontier | undefined, campaign: Campaign) {
    if (game === this.game && frontier?.drawing(campaign)) {
      this.post({ kind: 'progress', stage: 'The country beyond is being drawn' });
    }
    return frontier?.expand(campaign);
  }
  // The fight's controller: the page turns to the fight, opening with what started it, and waits for a choice.
  // Pressed on to its end (the cold review's REV-16: a fight decided, then clicked through blow by blow): each turn of
  // the company's fought by its own tactics, until the fight ends or the engine's one rule stops it (see PressOn),
  // which says why (Pressing.halted).
  private pressing = false; private readonly pressed = new Pressing();
  readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    // A fight begins where the company now is (it may have just come there), not where the page last showed it.
    if (!this.opening.length) { this.opening = this.begun(); this.screen = undefined; }
    const pressed = this.pressed.next(battle, this.pressing, this.session && BandNames.of(this.session.campaign));
    if (pressed.command) { resolve(pressed.command); return; }
    this.pressing = false;
    this.turn = { battle, resolve }; this.fought = battle; this.post({ kind: 'frame', frame: this.frame() });
    // The fight's standing reckoned after the frame has gone (OR-1351), the frame sent again where it moved.
    DangerSense.later(battle, () => { if (this.turn?.battle === battle) { this.post({ kind: 'frame', frame: this.frame() }); } });
  });
  // What the fight opens on (see FightBegun); the page's opening is never empty once the fight has begun.
  private begun(): string[] {
    const said = this.session ? FightBegun.lines(this.session.campaign, this.began, this.doing) : [];
    return said.length ? said : [''];
  }
  // The companion's choice, as one of the commands the fight allows them now; none, and they fight on their own.
  private fight(choice?: string) {
    const turn = this.turn;
    if (!turn) { return; }
    const [ability, target] = (choice ?? '').split('>'), battle = turn.battle, legal = battle.legalCommands();
    const chosen = choice ? legal.find(c => c.actor === battle.state.actor && c.ability === ability
      && (!target || c.target === target)) : Tactics.choose(battle.state, battle.plain(legal));
    if (!chosen) { throw new Error('That is no longer possible.'); }
    this.turn = undefined; turn.resolve(chosen);
  }
  // A frame once a command is done, with the game to keep in this browser sent after it.
  private settled(): Frame {
    const started = performance.now();
    this.screen = ScreenModel.build(this.session!.campaign, PlayerFrame.of(this.session!.campaign));
    const built = performance.now(), frame = this.frame(), told = performance.now();
    this.fought = undefined;
    frame.timing = { engine: Math.round(this.spent), screen: Math.round(built - started),
      narrative: Math.round(told - built), ...this.starts.phases };
    this.last = Oracle.timed(this.last, frame.timing);
    this.starts.phases = {}; this.spent = 0;
    if (!this.travelling) { this.saving(); }
    return frame;
  }
  // The aim the player chose to follow, kept with the game; the page drawn again for it, nothing else done.
  // The game is kept once its frame has gone to the page, so the page never waits on it: at a receipt, a command
  // committed (MT-24), or the journey held changed, and not again for a message that committed nothing (a frame
  // drawn again, a story asked for): it had been kept twice for every act.
  private saving() { setTimeout(() => { void this.keep(); }, 0); }
  // What changed is kept; the world it happened in, only when it is new.
  private async keep() {
    if (!this.session || this.turn) { return; }
    const at = this.session.keeping(this.bound);
    try {
      if (!at) { this.ahead(); this.danger.start(this.session); return; }
      // Marked kept before it is packed: a second keep asked meanwhile (a followed aim's) finds nothing to keep.
      this.session.kept(at);
      const checkpoint = this.session.checkpoint(true), world = this.worldOf(checkpoint);
      const save = JSON.stringify({ ...KeptGame.split(checkpoint, world, this.log, this.session.campaign.world),
        ...this.bound ? { bound: this.bound } : {} });
      // The world goes with the state until the page says it has kept it (see acknowledged).
      const fresh = world.kept || world.sent ? undefined : { key: world.key, text: await SaveCodec.pack(world.text!) };
      this.post({ kind: 'saved', save: await SaveCodec.pack(save), summary: KeptGame.summary(this.session.campaign,
        this.screen?.place.name ?? '', this.frontier && this.session.seed), key: world.key,
        ...fresh ? { world: fresh } : {} });
      if (fresh) { world.sent = true; }
    } catch (error) {
      if (at) { this.session.kept(''); }
      // A command begun before the game could be kept: it is kept after that one. Anything else is said to the page.
      if (this.busy !== this.game) { this.post({ kind: 'unkept', reason: error instanceof Error ? error.message : String(error) }); }
    }
    this.ahead(); this.danger.start(this.session);
  }
  // The country beyond a march-stone a step away, drawn and parsed while the player reads (see Frontier.prepare); one
  // at a time, and what goes wrong is left for the crossing itself to say.
  // And what an act here could lead to, its danger reckoned while the player reads (see DangerAhead).
  private preparing?: Promise<void>; readonly danger = new DangerAhead();
  private ahead() {
    if (!this.frontier || !this.session || this.preparing) { return; }
    this.preparing = this.frontier.prepare(this.session.campaign).catch(() => undefined)
      .finally(() => { this.preparing = undefined; });
  }
  private world?: Keyed & { kept: boolean; sent?: boolean; text?: string };
  // What the page did with a world it was sent, or found missing beside a state it was sent: kept, it is not sent
  // again;
  // not kept (the browser's storage full), it goes with the next state (the review's A3: a world posted was taken for
  // kept, and a state of it then kept beside the world before).
  private acknowledged(key: string, ok: boolean) {
    const world = this.world;
    if (world?.key !== key) { return; }
    world.sent = false;
    // Not kept, it is drawn up again from the game as it is then (its text was let go once kept).
    if (ok) { world.kept = true; world.text = undefined; } else { this.world = undefined; }
  }
  // The world a checkpoint is played in, keyed by its contents: the same until the country grows, or the module does.
  private worldOf(checkpoint: SessionCheckpoint) {
    if (this.world && KeptGame.still(this.world, checkpoint)) { return this.world; }
    this.world = { ...KeptGame.keyed(checkpoint), kept: false };
    return this.world;
  }
  // The page's telling: the narrator's, with a heading when the game opens and when the company comes into a country
  // it was not in before.
  private leaf(): Leaf {
    const campaign = this.session!.campaign, screen = this.screen!, opening = !this.told && !this.crossed;
    const country = screen.path.find(p => p.kind === 'region')?.name;
    // The opening is headed with the chapter its origin names ("Coming home"), or the country's name. Where the page
    // tells it apart, before the first place (OWN-17), the chapter heads that, and the place does not say it again,
    // nor why the company came, nor how it came in; the story begins with it, once.
    const chapter = Prologue.title(campaign, screen);
    const prologue = opening && this.apart ? Prologue.of(campaign, screen, chapter) : undefined;
    const leaf = TravelQuestion.on(Narrator.leaf(campaign, screen, this.told, prologue?.opening), screen, campaign);
    // A fight held on its own page is told there, not again over the place; one foregone, fought through as one act
    // with no page, is told nowhere else (OP-03).
    if (this.fought && leaf.exchange?.tone === 'fight') { leaf.exchange = { ...leaf.exchange, held: true }; }
    if (prologue && !this.log.length) {
      this.log.push(Prologue.entry(prologue.told, screen));
    }
    if (prologue) { leaf.prologue = prologue.told; }
    else if (opening) { leaf.heading = { kind: 'opening', title: chapter }; }
    else if (country && this.country && country !== this.country) { leaf.heading = { kind: 'country', title: country }; }
    if (this.told || this.crossed) { this.crossed = true; }
    this.country = country;
    if (this.resumed) { this.resumed = false; leaf.recap = this.recap(screen); }
    return leaf;
  }
  // Taken up again, what the company is about and the last thing it did (a game continued after a reload gave no word
  // of either: the play-structure investigation's PT-36).
  private recap(screen: Screen): Leaf['recap'] {
    const aim = screen.objectives[0], last = this.log.findLast(e => e.said);
    return { ...aim ? { aim } : {}, ...last ? { last: { said: last.said!, told: last.lines[0] ?? '', at: last.at } } : {} };
  }
  private frame(): Frame {
    const session = this.session!, campaign = session.campaign;
    // The page draws the map from its frame: charted (Itineraries.charted), its leaf asked the map's question (leaf).
    this.screen = Itineraries.charted(campaign, this.screen ?? ScreenModel.build(campaign));
    // A generated world is named on the page for the region the company is in, as it goes on past the first.
    const region = this.frontier && this.screen.path.find(p => p.kind === 'region')?.name;
    // In a fight, the company's own by their one face, as on their pages and on the scene (Portraits.member, OR-1070).
    // A foe who is someone by their own likeness, as the company is (M19-78).
    const faces = new Map([...this.turn || this.fought ? Portraits.foes(campaign) : [],
      ...Portraits.company(this.screen.party)]);
    // The words each of the company is spoken of in, for what they say and do in a fight (see Barks).
    const said = new Map(this.screen.party.flatMap(m => {
      const words = m.ref ? /pron_(he|she|they)$/.exec(CompanyPortraits.said(campaign.world, m.ref) ?? '')?.[1] : undefined;
      return words ? [[m.id, words] as const] : [];
    }));
    // Told before the story is sent: the opening is the story's first entry (see leaf). The journey held is read after
    // the page is told (coming to it lets it go), and goes on first of what the glance leads with.
    const leaf = this.leaf(), going = this.journeying();
    if (leaf.glance) {
      leaf.glance = Likenesses.with(Glance.held(leaf.glance, { ...going.bound ? { bound: going.bound } : {},
        ...leaf.recap ? { resumed: true } : {}, elapsed: this.screen.elapsed }, this.screen), this.screen);
    }
    return MenuTree.framed({ title: region ?? this.screen.title.split(' — ')[0]!, screen: this.screen,
      entries: this.log.slice(-120), leaf,
      // A fight that ended the story is held too, ahead of the end: the last act chosen in it had gone unseen, the
      // page turning to the end as it was struck (the cold playtest's "my last strike's result never shown": CMB-02).
      ...this.turn ? { combat: { ...CombatModel.build(this.turn.battle, BandNames.of(campaign), faces,
        { said, quick: true }),
        ...this.pressed.halted ? { halted: this.pressed.halted } : {},
        coming: FoeIntents.lines(this.turn.battle, BandNames.of(campaign)) } }
        : this.fought && this.told
          ? { combat: CombatModel.ended(this.fought, this.told.event.combat,
            { called: BandNames.of(campaign), faces, said }) } : {},
      opening: this.opening.filter(Boolean),
      ...this.screen.running ? {} : { ending: Obituary.ending(campaign) },
      chronicle: PlayerView.chronicle(campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })),
      ...going, transcript: session.transcript });
  }
  // The journey held, as the page shows it: where to, the way on from here leg by leg and how long; or, come to it
  // (by whatever way), none.
  private journeying(): Pick<Frame, 'bound'> {
    const campaign = this.session!.campaign, id = this.bound;
    if (!id || !campaign.running) { return {}; }
    const held = BoundJourney.of(campaign, id, this.boundFor);
    if (!held) { this.bound = undefined; }
    return held ?? {};
  }
}
