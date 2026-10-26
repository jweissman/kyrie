import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView, type ActionFeedback } from '../../src/presentation/action-feedback';
import { FictionalTime } from '../../src/presentation/fictional-time';
import { ScreenModel } from '../../src/ui/screen-model';
import { CombatModel } from '../../src/ui/combat-model';
import { Tactics } from '../../src/tactics';
import type { Battle } from '../../src/battle';
import type { Command } from '../../src/model';
import type { Screen } from '../../src/ui/screen-types';
import { Creation } from './creation';
import { Frontier } from '../../src/world/frontier';
import type { Campaign, CampaignEvent } from '../../src/campaign/campaign';
import { Scenarios } from '../scenarios';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { PlayTranscript } from './transcript';
import type { Entry, Frame, Leaf, Message, Request, SaveSummary } from './protocol';
import { SaveCodec } from './save-codec';
import { KeptGame, type Keyed, type KeptState, type Whole, type WorldPart } from './kept-game';
import { Narrator, type Told } from '../../src/presentation/narrator';
import { Obituary } from '../../src/narrative/obituary';
import { Endings } from '../../src/lang/endings';
import { BandNames } from '../../src/narrative/band-names';
import { Travel } from '../../src/session/travel';
import { Itineraries } from '../../src/ui/itinerary';
import { BuildStamp } from '../../src/session/build-stamp';
import { ChoiceList } from '../../src/ui/choice-list';

// A journey as it goes: each leg as it was told, and the frame the last one left.
interface Trail { legs: NonNullable<Frame['travel']>['legs']; last?: Frame }
// What setting out asks for: the campaign (or the generated region), and who comes, and why.
type Starting = Omit<Extract<Request, { kind: 'begin' }>, 'kind'>;


// The engine's side of play. It holds the one PlaySession, carries out what the player chose, and answers with a
// frame: everything the page draws. A fight pauses on each of the company's turns until the page sends a choice.
export class EngineHost {
  private session?: PlaySession;
  // A generated world goes on past its edges: the country beyond is drawn when the company first comes to one.
  private frontier?: Frontier;
  private log: Entry[] = [];
  private opening: string[] = [];
  private screen?: Screen;
  // The last command, as the narrator tells it until the next; and the country the company was last in, so that
  // coming into another is marked.
  private told?: Told;
  private country?: string;
  private crossed = false;
  // How long the last command took the engine, before the screen was built and told.
  private spent = 0;
  private turn?: { battle: Battle; resolve: (c: Command) => void };
  // The last fight the company chose in, held on its page once it has ended, until the player goes on.
  private fought?: Battle;
  private readonly creation = new Creation();
  // The command under way, if any, which a checkpoint waits for.
  private working: Promise<unknown> = Promise.resolve();
  // Which game the host plays: one begun or opened is the next. A command that ends after another game has begun
  // writes nothing into it, and a fight it is in is fought on by the game's tactics (the architecture review's A2: a
  // new game took the old command's journal entry). The game a command is under way in, while it is.
  private game = 0;
  private busy?: number;
  constructor(private readonly post: (message: Message) => void) {}
  warm() { setTimeout(() => void ModuleBundle.warmRules(Scenarios.source()).catch(() => undefined), 0); }
  async handle(request: Request): Promise<unknown> {
    switch (request.kind) {
      case 'catalog': return Creation.catalog();
      case 'setting': return this.creation.setting(request.campaign);
      case 'world': return this.creation.generate(request.seed, request.terrain);
      case 'preview': return Creation.preview(request.party, request.generated);
      case 'begin': return this.begin(request);
      case 'ready': this.prepare(request); return null;
      case 'resume': return this.resume(request.saved, request.world);
      case 'perform':
        return this.command(() => this.perform(request.command));
      case 'fight': this.fight(request.choice); return null;
      case 'travel': return this.command(() => this.travel(request.destination));
      case 'kept': this.acknowledged(request.key, request.ok); return null;
      // The page's download waits for the command under way (the independent review's A2).
      // With the story so far, so that a game opened from the file has its Story page (the review's A24).
      case 'checkpoint': await this.working;
        return this.session ? JSON.stringify({ checkpoint: this.session.checkpoint(true), log: this.log }) : null;
      case 'story': return this.log;
    }
  }
  // A start made ready while the player reads the page, for the choices as they then stood.
  private ready?: { key: string; started: Promise<PlaySession> };
  private prepare(r: Starting) {
    const key = EngineHost.key(r);
    if (this.ready?.key === key) { return; }
    const started = this.start(r);
    started.catch(() => { if (this.ready?.started === started) { this.ready = undefined; } });
    this.ready = { key, started };
  }
  private static key(r: Starting): string {
    return JSON.stringify([r.campaign, r.seed, r.party, r.terrain ?? null, r.origin ?? null, r.memorial ?? null]);
  }
  private async start(r: Starting): Promise<PlaySession> {
    const at = { ...r.terrain ? { terrain: r.terrain } : {}, ...r.origin ? { origin: r.origin } : {},
      ...r.memorial ? { memorial: r.memorial } : {} };
    const origin = await this.creation.origin(r.campaign, r.seed, r.party, at);
    // An origin makes the protagonist what it says (their background, what they carry): the world's telling of them.
    const session = await PlaySession.start(origin.path, r.seed, origin.source, r.origin ? undefined : r.party);
    // A generated world keeps what it was drawn for, so that its transcript can be replayed (see DrawnWorld).
    return r.campaign === Creation.generated ? session.drawnFor({ party: r.party, ...at }) : session;
  }
  private async begin(r: Starting): Promise<Frame> {
    const game = this.abandon();
    this.post({ kind: 'progress', stage: 'Drawing the world' });
    const ready = this.ready?.key === EngineHost.key(r) ? this.ready.started : undefined;
    this.ready = undefined;
    this.post({ kind: 'progress', stage: 'Placing its people' });
    const session = await (ready?.catch(() => this.start(r)) ?? this.start(r));
    if (game !== this.game) { throw new Error('Another game was begun meanwhile.'); }
    this.session = session;
    this.frontier = r.campaign === Creation.generated ? new Frontier(r.seed, Scenarios.source()) : undefined;
    if (this.frontier) { this.session.extend({ expand: this.widening(game) }); }
    this.log = []; this.opening = []; this.screen = undefined; this.told = undefined; this.country = undefined;
    this.crossed = false; this.world = undefined;
    return this.settled();
  }
  // A game kept in this browser (packed), or a save file: a checkpoint, with or without the page's telling of it.
  // A game kept in this browser is its state and the world it names, kept apart (see KeptGame).
  private async resume(text: string, world?: string): Promise<Frame> {
    const game = this.abandon();
    const parsed = JSON.parse(await SaveCodec.unpack(text)) as KeptState | Whole | SessionCheckpoint;
    const unpacked = world ? await SaveCodec.unpack(world) : undefined;
    const part = unpacked ? JSON.parse(unpacked) as WorldPart : undefined;
    // A state is opened only with the world it was kept against (the architecture review's A3: an old world, kept
    // beside a state of a newer one, opened unchecked and played on without the country the company stood in).
    if ('version' in parsed && parsed.version === 2 && unpacked && KeptGame.key(unpacked) !== parsed.world) {
      throw new Error('The world this game was kept with is not the one kept beside it in this browser. The game can '
        + 'be opened from a save file, or a new one begun from the title page.');
    }
    if (game !== this.game) { throw new Error('Another game was begun meanwhile.'); }
    const saved = KeptGame.join(parsed, part), kept = 'version' in parsed && parsed.version === 2;
    // Parsed here for this alone, it is handed over; one this very build kept (state and world) is not checked again.
    // One kept by another build is checked as it is opened, and if it cannot be, the player is told why.
    const trusted = kept && parsed.build === BuildStamp.current;
    try { this.session = PlaySession.resume(saved.checkpoint, { owned: true, trusted }); } catch (error) {
      if (trusted) { throw error; }
      throw new Error(`This game was kept by an earlier edition of Kyr, and this one cannot open it (${
        error instanceof Error ? error.message : String(error)}). A new game can be begun from the title page.`);
    }
    // The world it came with is kept already: known by the same key, and by the module the campaign now holds.
    const live = this.session.checkpoint(true).save;
    this.world = 'version' in parsed && parsed.version === 2 && part ? { key: parsed.world, kept: true,
      part: { ...part, module: live.module, ...live.definition ? { definition: live.definition } : {} },
      index: KeptGame.index(part.base ?? []) } : undefined;
    const t = saved.checkpoint.transcript;
    this.frontier = Frontier.generated(t.scenario) ? new Frontier(t.seed, Scenarios.source()) : undefined;
    if (this.frontier) { this.session.extend({ expand: this.widening(game) }); }
    this.log = (saved.log ?? []).map((e, i) => ({ ...e, id: e.id ?? i, notes: e.notes ?? [] }));
    this.opening = []; this.screen = undefined; this.told = undefined; this.country = undefined;
    this.crossed = true;
    return this.settled();
  }
  // What was done, as the engine words it: a way by the label the screen it last sent gave it, anything else by what
  // the action was (see PlayTranscript.entry).
  private said(command: string): { said: string; move: boolean; named: boolean } {
    const way = ChoiceList.command(ChoiceList.ways(this.screen?.exits ?? []).choices, command);
    return way ? { said: way.label, move: true, named: false } : { said: '', move: false, named: true };
  }
  private async perform(command: string, context = this.said(command)): Promise<Frame> {
    const session = this.session, game = this.game;
    if (!session) { throw new Error('No game is under way'); }
    const campaign = session.campaign, before = PlayerView.observe(campaign), started = performance.now();
    this.fought = undefined;
    try {
      const event = await session.perform(command, this.controlling(game));
      if (game !== this.game) { throw new Error('That game is no longer under way.'); }
      const after = PlayerView.observe(campaign), feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      this.log.push(PlayTranscript.entry(event, feedback, { ...context, id: this.next(), moved,
        place: after.location?.id ?? '', placeName: after.location?.name ?? '', elapsed: event.elapsed }));
      // A choice made from an opened list is echoed as the action it was ("You buy a torch for Bran").
      const said = context.named || context.said.includes(' › ') ? feedback.attempt : context.said;
      this.told = { event, feedback: this.fought ? EngineHost.unfought(feedback) : feedback, said, moved };
    } finally {
      if (game === this.game) { this.turn = undefined; this.opening = []; this.spent = performance.now() - started; }
    }
    return this.settled();
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
    if (turn) { turn.resolve(Tactics.choose(turn.battle.state, turn.battle.legalCommands())); }
    return ++this.game;
  }
  // The fight's controller for a command of one game: the page's while that game is played, and its tactics after.
  private controlling(game: number) { return this.control.bind(this, game); }
  private control(game: number, battle: Battle): Promise<Command> {
    return game === this.game ? this.controller(battle)
      : Promise.resolve(Tactics.choose(battle.state, battle.legalCommands()));
  }
  // A journey along known ways: each leg the command the page offers for it, told as it is made; the frame it ends
  // with says each leg (where it came, when, how the way went, what came of it), and why it stopped if it did.
  private async travel(destination: string): Promise<Frame> {
    const session = this.session;
    if (!session) { throw new Error('No game is under way'); }
    const trail: Trail = { legs: [] };
    const done = await Travel.go({ campaign: session.campaign, perform: this.leg.bind(this, trail) }, destination);
    const frame = trail.last ?? this.settled(), legs = trail.legs;
    const to = Itineraries.plan(session.campaign, destination)?.name
      ?? session.campaign.module.entities.find(e => e.id === destination)?.name ?? destination;
    return { ...frame, travel: { to, arrived: done.arrived, legs, ...done.stopped ? { stopped: done.stopped } : {} } };
  }
  // One leg of a journey, done as the page does a way chosen, and kept as it was told.
  private async leg(trail: Trail, command: string, said: string): Promise<CampaignEvent> {
    const last = await this.perform(command, { said, move: true, named: false });
    trail.last = last;
    trail.legs.push({ place: last.screen.place.name, at: last.screen.clock, journey: last.leaf.journey ?? [],
      lines: (last.leaf.exchange?.lines ?? []).map(l => l.text) });
    return this.session!.campaign.history.at(-1)!;
  }
  // A fight held on its own page is not told again at the place it was fought in: only what was witnessed meanwhile.
  private static unfought(feedback: ActionFeedback): ActionFeedback {
    return { ...feedback, immediate: feedback.immediate.filter(t => t.startsWith('You witness: ')) };
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
  readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    // A fight begins where the company now is (it may have just come there), not where the page last showed it.
    if (!this.opening.length) { this.opening = this.begun(); this.screen = undefined; }
    this.turn = { battle, resolve };
    this.fought = battle;
    this.post({ kind: 'frame', frame: this.frame() });
  });
  // What was seen and said in the moment the company was set upon, if it was.
  private begun(): string[] {
    const last = this.session?.campaign.history.at(-1);
    const seen = [...(last?.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text),
      ...(last?.response ? [last.response] : [])];
    return seen.length ? [...new Set(seen)] : [''];
  }
  // The companion's choice, as one of the commands the fight allows them now; none, and they fight on their own.
  private fight(choice?: string) {
    const turn = this.turn;
    if (!turn) { return; }
    const [ability, target] = (choice ?? '').split('>'), battle = turn.battle, legal = battle.legalCommands();
    const chosen = choice ? legal.find(c => c.actor === battle.state.actor && c.ability === ability
      && (!target || c.target === target)) : Tactics.choose(battle.state, legal);
    if (!chosen) { throw new Error('That is no longer possible.'); }
    this.turn = undefined;
    turn.resolve(chosen);
  }
  // A frame once a command is done, with the game to keep in this browser sent after it.
  private settled(): Frame {
    const started = performance.now();
    this.screen = ScreenModel.build(this.session!.campaign);
    const built = performance.now(), frame = this.frame(), told = performance.now();
    this.fought = undefined;
    frame.timing = { engine: Math.round(this.spent), screen: Math.round(built - started),
      narrative: Math.round(told - built) };
    this.spent = 0;
    this.saving();
    return frame;
  }
  // The game is kept after every command, once its frame has gone to the page, so the page never waits on it.
  private saving() { setTimeout(() => { void this.keep(); }, 0); }
  // What changed is kept after every command; the world it happened in, only when it is new.
  private async keep() {
    if (!this.session || this.turn) { return; }
    try {
      const checkpoint = this.session.checkpoint(true), world = this.worldOf(checkpoint);
      const save = JSON.stringify(KeptGame.split(checkpoint, world, this.log, this.session.campaign.world));
      // The world goes with the state until the page says it has kept it (see acknowledged).
      const fresh = world.kept || world.sent ? undefined : { key: world.key, text: await SaveCodec.pack(world.text!) };
      this.post({ kind: 'saved', save: await SaveCodec.pack(save), summary: this.summary(), key: world.key,
        ...fresh ? { world: fresh } : {} });
      if (fresh) { world.sent = true; }
    } catch (error) {
      // A command begun before the game could be kept: it is kept after that one. Anything else is said to the page.
      if (this.busy !== this.game) { this.post({ kind: 'unkept', reason: error instanceof Error ? error.message : String(error) }); }
    }
    this.ahead();
  }
  // The country beyond a march-stone a step away, drawn and parsed while the player reads (see Frontier.prepare); one
  // at a time, and what goes wrong is left for the crossing itself to say.
  private preparing?: Promise<void>;
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
  // The world a checkpoint is played in, keyed by its contents: the same until the country grows.
  private worldOf(checkpoint: SessionCheckpoint) {
    const { module, definition } = checkpoint.save;
    if (this.world?.part.module === module && this.world.part.definition === definition) { return this.world; }
    this.world = { ...KeptGame.keyed(checkpoint), kept: false };
    return this.world;
  }
  private summary(): SaveSummary {
    const campaign = this.session!.campaign, place = this.screen?.place.name ?? '';
    return { title: campaign.module.name.split(': ')[0]!, where: place.charAt(0).toUpperCase() + place.slice(1),
      when: FictionalTime.at(campaign.readout.elapsed),
      company: campaign.fighters.map(m => m.name).filter(Boolean).join(', ') };
  }
  // The page's telling: the narrator's, with a heading when the game opens and when the company comes into a country
  // it was not in before.
  private leaf(): Leaf {
    const campaign = this.session!.campaign, screen = this.screen!;
    const leaf = Narrator.leaf(campaign, screen, this.told);
    const country = screen.path.find(p => p.kind === 'region')?.name;
    // The opening is headed with the chapter its origin names ("Coming home"), or the country's name.
    const chapter = campaign.module.entities.find(e => /(^|__)chapter$/.test(e.type))?.name;
    if (!this.told && !this.crossed) { leaf.heading = { kind: 'opening', title: chapter ?? screen.title.split(' — ')[0]! }; }
    else if (country && this.country && country !== this.country) { leaf.heading = { kind: 'country', title: country }; }
    if (this.told || this.crossed) { this.crossed = true; }
    this.country = country;
    return leaf;
  }
  private frame(): Frame {
    const session = this.session!, campaign = session.campaign;
    this.screen ??= ScreenModel.build(campaign);
    // A generated world is named on the page for the region the company is in, as it goes on past the first.
    const region = this.frontier && this.screen.path.find(p => p.kind === 'region')?.name;
    return { title: region ?? this.screen.title.split(' — ')[0]!, screen: this.screen, entries: this.log.slice(-120),
      leaf: this.leaf(),
      ...this.turn ? { combat: CombatModel.build(this.turn.battle, BandNames.of(campaign)) }
        : this.fought && this.told && this.screen.running
          ? { combat: CombatModel.ended(this.fought, this.told.event.combat, BandNames.of(campaign)) } : {},
      opening: this.opening.filter(Boolean),
      ...this.screen.running ? {} : { ending: Endings.reached(campaign.world, campaign.installations)
        ?? Obituary.of(campaign) },
      chronicle: PlayerView.chronicle(campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })),
      transcript: session.transcript };
  }
}
