import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { FictionalTime } from '../../src/presentation/fictional-time';
import { ScreenModel } from '../../src/ui/screen-model';
import { CombatModel } from '../../src/ui/combat-model';
import { Tactics } from '../../src/tactics';
import type { Battle } from '../../src/battle';
import type { Command } from '../../src/model';
import type { Screen } from '../../src/ui/screen-types';
import { Creation } from './creation';
import { Frontier } from '../../src/world/frontier';
import { Scenarios } from '../scenarios';
import { PlayTranscript } from './transcript';
import type { Entry, Frame, Leaf, Member, Message, Request, SaveSummary } from './protocol';
import { SaveCodec } from './save-codec';
import { KeptGame, type Keyed, type KeptState, type Whole, type WorldPart } from './kept-game';
import { Narrator, type Told } from '../../src/presentation/narrator';
import { Obituary } from '../../src/narrative/obituary';
import type { Memorial } from '../../src/world/memorial';


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
  private readonly creation = new Creation();
  constructor(private readonly post: (message: Message) => void) {}
  async handle(request: Request): Promise<unknown> {
    switch (request.kind) {
      case 'catalog': return Creation.catalog();
      case 'setting': return this.creation.setting(request.campaign);
      case 'world': return this.creation.generate(request.seed, request.terrain);
      case 'preview': return Creation.preview(request.party, request.generated);
      case 'begin': return this.begin(request);
      case 'resume': return this.resume(request.saved, request.world);
      case 'perform': return this.perform(request.command, { said: request.said, move: request.move,
        named: !!request.named });
      case 'fight': this.fight(request.choice); return null;
      case 'checkpoint': return this.session ? JSON.stringify(this.session.checkpoint(true)) : null;
    }
  }
  private async begin(r: { campaign: string; seed: string; party: Member[]; terrain?: string; origin?: string;
    memorial?: Memorial }): Promise<Frame> {
    this.post({ kind: 'progress', stage: 'Drawing the world' });
    const origin = await this.creation.origin(r.campaign, r.seed, r.party,
      { ...r.terrain ? { terrain: r.terrain } : {}, ...r.origin ? { origin: r.origin } : {},
        ...r.memorial ? { memorial: r.memorial } : {} });
    this.post({ kind: 'progress', stage: 'Placing its people' });
    // An origin makes the protagonist what it says (their background, what they carry): the world's telling of them.
    this.session = await PlaySession.start(origin.path, r.seed, origin.source, r.origin ? undefined : r.party);
    this.frontier = r.campaign === Creation.generated ? new Frontier(r.seed, Scenarios.source()) : undefined;
    this.log = []; this.opening = []; this.screen = undefined; this.told = undefined; this.country = undefined;
    this.crossed = false; this.world = undefined;
    return this.settled();
  }
  // A game kept in this browser (packed), or a save file: a checkpoint, with or without the page's telling of it.
  // A game kept in this browser is its state and the world it names, kept apart (see KeptGame).
  private async resume(text: string, world?: string): Promise<Frame> {
    const parsed = JSON.parse(await SaveCodec.unpack(text)) as KeptState | Whole | SessionCheckpoint;
    const part = world ? JSON.parse(await SaveCodec.unpack(world)) as WorldPart : undefined;
    const saved = KeptGame.join(parsed, part);
    this.session = PlaySession.resume(saved.checkpoint);
    // The world it came with is kept already: known by the same key, and by the module the campaign now holds.
    const live = this.session.checkpoint(true).save;
    this.world = 'version' in parsed && parsed.version === 2 && part ? { key: parsed.world, kept: true,
      part: { ...part, module: live.module, ...live.definition ? { definition: live.definition } : {} },
      index: KeptGame.index(part.base ?? []) } : undefined;
    const t = saved.checkpoint.transcript;
    this.frontier = Frontier.generated(t.scenario) ? new Frontier(t.seed, Scenarios.source()) : undefined;
    this.log = (saved.log ?? []).map((e, i) => ({ ...e, id: e.id ?? i, notes: e.notes ?? [] }));
    this.opening = []; this.screen = undefined; this.told = undefined; this.country = undefined;
    this.crossed = true;
    return this.settled();
  }
  private async perform(command: string, context: { said: string; move: boolean; named: boolean }): Promise<Frame> {
    const session = this.session;
    if (!session) { throw new Error('No game is under way'); }
    const campaign = session.campaign, before = PlayerView.observe(campaign), started = performance.now();
    try {
      const event = await session.perform(command, this.controller);
      const after = PlayerView.observe(campaign), feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      this.log.push(PlayTranscript.entry(event, feedback, { ...context, id: this.next(), moved,
        place: after.location?.id ?? '', placeName: after.location?.name ?? '', elapsed: event.elapsed }));
      // A choice made from an opened list is echoed as the action it was ("You buy a torch for Bran").
      const said = context.named || context.said.includes(' › ') ? feedback.attempt : context.said;
      this.told = { event, feedback, said, moved };
      // Coming to a march-stone draws the country beyond it, the first time: some seconds, once, said while it lasts.
      if (this.frontier?.drawing(campaign)) { this.post({ kind: 'progress', stage: 'The country beyond is being drawn' }); }
      if (this.frontier) { await this.frontier.expand(campaign); }
    } finally { this.turn = undefined; this.opening = []; this.spent = performance.now() - started; }
    return this.settled();
  }
  private next(): number { return this.log.reduce((n, e) => Math.max(n, e.id + 1), 0); }
  // The fight's controller: the page turns to the fight, opening with what started it, and waits for a choice.
  readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    // A fight begins where the company now is (it may have just come there), not where the page last showed it.
    if (!this.opening.length) { this.opening = this.begun(); this.screen = undefined; }
    this.turn = { battle, resolve };
    this.post({ kind: 'frame', frame: this.frame() });
  });
  // What was seen and said in the moment the company was set upon, if it was.
  private begun(): string[] {
    const last = this.session?.campaign.events.at(-1);
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
      const save = JSON.stringify(KeptGame.split(checkpoint, world, this.log.slice(-80)));
      const fresh = world.kept ? undefined : { key: world.key, text: await SaveCodec.pack(world.text!) };
      this.post({ kind: 'saved', save: await SaveCodec.pack(save), summary: this.summary(), ...fresh ? { world: fresh } : {} });
      world.kept = true; world.text = undefined;
    } catch { /* a command began before the game could be kept; it is kept after that one */ }
  }
  private world?: Keyed & { kept: boolean; text?: string };
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
      ...this.turn ? { combat: CombatModel.build(this.turn.battle) } : {},
      opening: this.opening.filter(Boolean),
      ...this.screen.running ? {} : { ending: Obituary.of(campaign) },
      chronicle: PlayerView.chronicle(campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })),
      transcript: session.transcript };
  }
}
