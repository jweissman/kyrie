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
import type { Entry, Frame, Member, Message, Request, SaveSummary } from './protocol';
import { SaveCodec } from './save-codec';

interface Saved { checkpoint: SessionCheckpoint; log?: Entry[] }

// The engine's side of play. It holds the one PlaySession, carries out what the player chose, and answers with a
// frame: everything the page draws. A fight pauses on each of the company's turns until the page sends a choice.
export class EngineHost {
  private session?: PlaySession;
  // A generated world goes on past its edges: the country beyond is drawn when the company first comes to one.
  private frontier?: Frontier;
  private log: Entry[] = [];
  private opening: string[] = [];
  private screen?: Screen;
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
      case 'resume': return this.resume(request.saved);
      case 'perform': return this.perform(request.command, { said: request.said, move: request.move,
        named: !!request.named });
      case 'fight': this.fight(request.choice); return null;
      case 'checkpoint': return this.session ? JSON.stringify(this.session.checkpoint()) : null;
    }
  }
  private async begin(r: { campaign: string; seed: string; party: Member[]; terrain?: string }): Promise<Frame> {
    this.post({ kind: 'progress', stage: 'Drawing the world' });
    const origin = await this.creation.origin(r.campaign, r.seed, r.party, r.terrain);
    this.post({ kind: 'progress', stage: 'Placing its people' });
    this.session = await PlaySession.start(origin.path, r.seed, origin.source, r.party);
    this.frontier = r.campaign === Creation.generated ? new Frontier(r.seed, Scenarios.source()) : undefined;
    this.log = []; this.opening = []; this.screen = undefined;
    return this.settled();
  }
  // A game kept in this browser (packed), or a save file: a checkpoint, with or without the page's telling of it.
  private async resume(text: string): Promise<Frame> {
    const parsed = JSON.parse(await SaveCodec.unpack(text)) as Saved | SessionCheckpoint;
    const saved: Saved = 'checkpoint' in parsed ? parsed : { checkpoint: parsed };
    this.session = PlaySession.resume(saved.checkpoint);
    const t = saved.checkpoint.transcript;
    this.frontier = Frontier.generated(t.scenario) ? new Frontier(t.seed, Scenarios.source()) : undefined;
    this.log = (saved.log ?? []).map((e, i) => ({ ...e, id: e.id ?? i, notes: e.notes ?? [] }));
    this.opening = []; this.screen = undefined;
    return this.settled();
  }
  private async perform(command: string, context: { said: string; move: boolean; named: boolean }): Promise<Frame> {
    const session = this.session;
    if (!session) { throw new Error('No game is under way'); }
    const campaign = session.campaign, before = PlayerView.observe(campaign);
    try {
      const event = await session.perform(command, this.controller);
      const after = PlayerView.observe(campaign), feedback = ActionFeedbackView.read(campaign, event, before);
      const moved = before.location?.id !== after.location?.id;
      this.log.push(PlayTranscript.entry(event, feedback, { ...context, id: this.next(), moved,
        place: after.location?.id ?? '', placeName: after.location?.name ?? '', elapsed: event.elapsed }));
      // Coming to a march-stone draws the country beyond it, the first time: a second or two, once.
      if (this.frontier) { await this.frontier.expand(campaign); }
    } finally { this.turn = undefined; this.opening = []; }
    return this.settled();
  }
  private next(): number { return this.log.reduce((n, e) => Math.max(n, e.id + 1), 0); }
  // The fight's controller: the page turns to the fight, opening with what started it, and waits for a choice.
  readonly controller = (battle: Battle) => new Promise<Command>(resolve => {
    if (!this.opening.length) { this.opening = this.begun(); }
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
    this.screen = ScreenModel.build(this.session!.campaign);
    const frame = this.frame();
    setTimeout(() => { void this.keep(); }, 0);
    return frame;
  }
  private async keep() {
    if (!this.session || this.turn) { return; }
    try {
      const save = JSON.stringify({ checkpoint: this.session.checkpoint(), log: this.log.slice(-80) });
      this.post({ kind: 'saved', save: await SaveCodec.pack(save), summary: this.summary() });
    } catch { /* a command began before the game could be kept; it is kept after that one */ }
  }
  private summary(): SaveSummary {
    const campaign = this.session!.campaign, place = PlayerView.observe(campaign).location?.name ?? '';
    return { title: campaign.module.name.split(': ')[0]!, where: place.charAt(0).toUpperCase() + place.slice(1),
      when: FictionalTime.at(campaign.state.elapsed),
      company: campaign.state.party.map(m => m.name).filter(Boolean).join(', ') };
  }
  private frame(): Frame {
    const session = this.session!, campaign = session.campaign;
    this.screen ??= ScreenModel.build(campaign);
    // A generated world is named on the page for the region the company is in, as it goes on past the first.
    const region = this.frontier && this.screen.path.find(p => p.kind === 'region')?.name;
    return { title: region ?? this.screen.title.split(' — ')[0]!, screen: this.screen, entries: this.log.slice(-120),
      ...this.turn ? { combat: CombatModel.build(this.turn.battle) } : {},
      opening: this.opening.filter(Boolean),
      chronicle: PlayerView.chronicle(campaign)
        .map(e => ({ at: FictionalTime.at(e.at), text: e.text, detail: e.detail })),
      transcript: session.transcript };
  }
}
