import { OpenCommand, type Receipt } from './open-command';
import { AimSaid } from '../presentation/aim-said';
import type { CreatureGenerationContext } from '../content';
import { Costs } from '../costs';
import { Campaign, type CampaignEvent, type CampaignSave } from '../campaign/campaign';
import type { Assembly } from '../campaign/load-cache';
import type { BundleSource } from '../campaign/bundle-source';
import type { Battle } from '../battle';
import type { Command } from '../model';
import { Tactics } from '../tactics';
import { PlayerView } from '../presentation/player-view';
import { Telling, type Voiced } from '../narrative/telling';
import { Barks } from '../narrative/barks'; import { RuleWords } from '../narrative/rule-words';
import { CombatTelling } from '../ui/combat-telling';
import type { Memorial } from '../memorial';
import { Crossing } from '../campaign/crossing';
import { Travel, type Journeyed } from './travel';
import { HexBoundary } from '../hex-boundary';
import { Undertakings } from '../presentation/undertakings'; import { HeldLead } from '../presentation/held-lead';
import { Digest } from './digest';
import { SessionFocus, type Focused, type Told } from './session-focus';
import { Focusing, type Focus, type Conversation } from './focus';
import type { TalkLine } from '../frame/talk-lines';

// digest: what the game was after it (see Digest).
export interface TranscriptStep { command: string; combat?: Command[]; digest?: string }
export interface Transcript {
  version: 1; party?: CreatureGenerationContext[]; scenario: string; seed: string;
  steps: TranscriptStep[]; complete: boolean;
  // A generated world's: what it was drawn for, so that it can be drawn again to replay the steps (see DrawnWorld).
  drawn?: Drawn;
}
// standing: which of the scenarios every first country holds this one holds, by id (all, unless said): for a spec of
// something else, so that what stands in every country does not move under it (the register's AB-13, R88).
export interface Drawn { party: CreatureGenerationContext[]; terrain?: string; origin?: string; memorial?: Memorial;
  // The debt's chain fixed (salvage, carry, recover: see DebtShapes), as an author fixes a dimension of a kit.
  standing?: string[]; chain?: string;
  // A stock opening chosen at creation, begun in ahead of the origin (see StockOpenings): none where none was chosen.
  opening?: string;
  // Its far placements held back until first neared (see PendingPlacements): a replay draws it so again.
  lazy?: boolean }
// Chooses the next command for the player's side. Must return one of battle.legalCommands().
export type CombatController = (battle: Battle) => Promise<Command>;
// Version 2 carries the focus and the conversation under way (OR-1451), so that a game taken up again mid-talk opens on
// the same talk, its questions put and its new replies as they were; version 1 resumes at the place.
export interface SessionCheckpoint {
  version: 1 | 2; transcript: Transcript; save: CampaignSave; focus?: Focus; conversation?: Conversation }

export interface Expander { expand(campaign: Campaign): Promise<unknown> }
export type { Receipt } from './open-command';

// Host-neutral play loop shared by the browser, CLI replay and tests. Kyr remains the sole rules authority:
// commands are resolved through PlayerView, executed by Campaign, and combat steps through Battle.
export class PlaySession {
  private steps: TranscriptStep[];
  // A command open: resolved and not yet ended (OpenCommand's own phase, the one account of it).
  private get busy(): boolean { return !!this.last && !this.last.ended; }
  // One for each command performed in this session (not kept in a save: a resumed game's revision is its steps).
  readonly receipts: Receipt[] = [];
  // The last command, by its phases (MT-24: OpenCommand), for whoever asks how far it went.
  last?: OpenCommand;
  // What the game was last kept at: its receipts and the journey it holds (see keeping).
  private keptAt?: string;
  // Whether there is anything to keep since the game was last kept: a command committed (a receipt), or the journey
  // the host holds, which its save holds, changed (MT-24's second step: the host keeps at a receipt, not after every
  // message it answers). at: what kept marks it kept at.
  keeping(bound: unknown): string | undefined {
    const at = `${this.receipts.length} ${JSON.stringify(bound ?? null)}`;
    return at === this.keptAt ? undefined : at;
  }
  kept(at: string): void { this.keptAt = at; }
  // The last journey set out on (travel:), leg by leg, for a client that tells its legs as the page does.
  journeyed?: Journeyed;
  readonly scenario: string;
  readonly seed: string;
  private complete: boolean;
  private party?: CreatureGenerationContext[];
  private drawn?: Drawn;
  // What the world draws as the company goes (the country beyond a march-stone, see Frontier): drawn as part of the
  // command, so that the same commands replayed draw the same world.
  private expander?: Expander;
  // What the company attends to, and the conversation under way (SessionFocus): the session's, not the world's.
  private attending: SessionFocus;
  private constructor(readonly campaign: Campaign, history: Omit<Transcript, 'version'>, focused?: Focused) {
    this.attending = new SessionFocus(focused);
    this.party = structuredClone(history.party); this.drawn = structuredClone(history.drawn);
    this.scenario = history.scenario; this.seed = history.seed;
    this.steps = structuredClone(history.steps); this.complete = history.complete;
  }
  static start(...a: Parameters<typeof PlaySession.starting>): Promise<PlaySession> {
    return Costs.timed('session', () => PlaySession.starting(...a), { id: a[0] });
  }
  private static async starting(scenario: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[] | Assembly): Promise<PlaySession> {
    const at: Assembly = Array.isArray(party) ? { party } : party ?? {};
    return new PlaySession(await Campaign.load(scenario, seed, source, at),
      { scenario, seed, steps: [], complete: true, ...(at.party ? { party: at.party } : {}) });
  }
  // handed: the checkpoint is the session's own from now on (owned), and was kept by this engine (trusted).
  static resume(checkpoint: SessionCheckpoint, handed: { owned?: boolean; trusted?: boolean } = {}): PlaySession {
    if (checkpoint.version !== 1 && checkpoint.version !== 2) { throw new Error('Unsupported session checkpoint'); }
    const { focus, conversation } = checkpoint, focused = checkpoint.version === 2 && focus
      ? { focus, ...conversation ? { conversation } : {} } : undefined;
    const t = checkpoint.transcript, session = new PlaySession(Campaign.restore(checkpoint.save, handed), t, focused);
    // Kept by this build, it is what its own record says it was after its last step (see Digest).
    const last = t.steps.at(-1)?.digest;
    if (handed.trusted && last && last !== Digest.of(session.campaign)) {
      throw new Error('This game is not what its own record says it was: it cannot be opened as it was kept.');
    }
    return session;
  }
  // A bare Kyr save has no command history; continuing from it yields an incomplete transcript.
  static fromSave(save: CampaignSave, scenario = 'imported'): PlaySession {
    return new PlaySession(Campaign.restore(save), { scenario, seed: save.state.seed, steps: [], complete: false });
  }
  // A copy of the game to play on beside it (a what-if: the page's lens turned to someone, an act tried), its history
  // its own; as a checkpoint resumed would be, without the round trip (see Campaign.copy).
  copy(): PlaySession {
    if (this.busy) { throw new Error('Copy only between campaign commands'); }
    return new PlaySession(this.campaign.copy(), this.transcript, this.attending.kept);
  }
  // What the company attends to (Focus), and the conversation under way: the session's own (OR-1451).
  get focus(): Focus { return this.attending.focus; }
  get conversation(): Conversation | undefined { return this.attending.conversation; }
  // The frame a client last told and the question asked of it, and the lines it told the conversation with
  // (QuestionAsked.settle, src/frame: every client reads its question so).
  get told(): Told | undefined { return this.attending.before; }
  tell(lines: TalkLine[]): void { this.attending.told(lines); }
  questioned(told: Told): void { this.attending.asked(told); }
  get transcript(): Transcript {
    return { version: 1, ...(this.party ? { party: structuredClone(this.party) } : {}), scenario: this.scenario,
      seed: this.seed, ...(this.drawn ? { drawn: structuredClone(this.drawn) } : {}),
      steps: structuredClone(this.steps),
      complete: this.complete };
  }
  get acting(): boolean { return this.busy; }
  extend(expander: Expander): this { this.expander = expander; return this; }
  drawnFor(drawn: Drawn): this { this.drawn = structuredClone(drawn); return this; }
  // live: to be written out at once, so not copied (see Campaign.save).
  // The game between commands: one taken while a command is under way (the country beyond it still being drawn) held
  // its effects but not its step (the independent review's A2).
  checkpoint(live = false): SessionCheckpoint {
    if (this.busy) { throw new Error('Save only between campaign commands'); }
    const { focus, conversation } = this.attending.kept;
    return { version: 2, transcript: this.transcript, save: this.campaign.save(true, live), focus,
      ...conversation ? { conversation } : {} };
  }
  // A step as a player takes it, for a scripted journey (a spec's, a driver's) and for the terminal, which plays every
  // choice through it (a 1:1 player of the same system: workflow-parity.md): a way into the next hex is set out on
  // from the map, a leg of a journey there (Campaign.travelling), and anything else is done as it is. The page's own
  // path is perform, which has no such leave (the architecture review §7.3: this had said it was never a player's).
  // A journey (travel:place), as the page sets out on one from the map: leg by leg (Travel.go), its last told.
  async leg(command: string, controller: CombatController = PlaySession.auto): Promise<CampaignEvent> {
    if (command.startsWith('travel:')) {
      // Each leg's fight is the player's, as on the page: the terminal's journeys had fought it for them (Wynn struck
      // at Tenebraetumulo's door with no choice put: M21's playability investigation).
      const done = await Travel.go({ campaign: this.campaign, perform: this.travelled.bind(this, controller) },
        command.slice('travel:'.length));
      this.journeyed = done;
      // None taken: a wait, where the company can wait; else what was last told (one held where it lies cannot).
      const held = !PlayerView.only(this.campaign, PlaySession.waits).some(c => c.choice.id === 'wait');
      const last = done.legs.at(-1)?.event ?? (held ? this.campaign.history.at(-1) : undefined);
      // Told with what its legs before brought (see Travel.way): a copy, not the campaign's record.
      const way = Travel.way(done);
      return last ? way.length ? { ...last, way } : last : this.perform('wait', controller);
    }
    if (command.startsWith('follow:') || Focusing.is(command)) { return this.perform(command, controller); }
    const to = this.whither(command);
    return to ? this.campaign.crossing.travelling(to, () => this.perform(command, controller))
      : this.perform(command, controller);
  }
  // Whether the company can wait: the wait's rows alone, not the whole frame (PlayerView.only).
  private static readonly waits: ReadonlySet<string> = new Set(['wait']);
  // A leg of a journey, as Travel.go takes it (its words aside), its fight the controller's.
  private travelled(controller: CombatController, command: string, _said: string, id: string): Promise<CampaignEvent> {
    return this.perform(command, controller, id);
  }
  // Where an offered command goes, if it goes anywhere; and, for a driver of the page's engine, where it goes if that
  // is into another hex, which the page sets out on as a journey (a travel request), never as the command itself.
  whither(command: string): string | undefined {
    const id = PlayerView.resolve(this.campaign, command), action = this.campaign.offered().find(a => a.id === id);
    return action && Crossing.whither(action);
  }
  crosses(command: string): string | undefined {
    const to = this.whither(command), from = this.campaign.world.one('at', this.campaign.playerActor ?? 'party');
    return to && from && HexBoundary.crosses(this.campaign.module, from, to) ? to : undefined;
  }
  // id: the act the command is of, where the one who asks has it already (a journey's leg, its way's row: OR-1361).
  async perform(command: string, controller = PlaySession.auto, id?: string): Promise<CampaignEvent> {
    if (this.busy) { throw new Error('A command is already in progress'); }
    if (command.startsWith('follow:') || Focusing.is(command)) { return this.aside(command); }
    const { id: act, aims } = Costs.time('resolve', () => this.resolving(command, id));
    const ahead = this.attending.ahead(this.campaign, act);
    // Open from resolved to committed: no save, no frame meanwhile.
    this.campaign.command = act;
    const open = this.last = new OpenCommand(command);
    const combat: Command[] = [], barked: Voiced[] = [], fights: Battle[] = [];
    try {
      const event = await this.campaign.executeAsync(act, async battle => {
        // What fighters said in the fights before is not said again in this one (see Barks).
        battle.heard(Barks.before([...this.campaign.history.flatMap(e => e.voiced ?? []), ...barked]));
        while (!battle.state.outcome) {
          const actor = battle.state.combatants.find(f => f.id === battle.state.actor)!;
          const legal = battle.legalCommands();
          const player = battle.playerControls(actor.id);
          const chosen = player ? await this.asked(controller, battle) : battle.chosen();
          if (!legal.some(c => c.actor === chosen.actor && c.ability === chosen.ability
            && c.target === chosen.target)) {
            throw new Error('Illegal combat command');
          }
          if (player) { combat.push({ ...chosen }); }
          battle.step(chosen);
        }
        barked.push(...CombatTelling.barks(battle.events, battle.state)); fights.push(battle);
      });
      open.reach('executed');
      // Everything that comes of the command after the world's own act is one with it: what comes after (the country
      // beyond drawn and installed), what the company is told of it, its undertakings, its step in the transcript and
      // the words marked told. If any of them fails, the campaign is put back as it was before the command and its
      // step taken out, and nothing of it is kept (Mission 15's independent audit, F3; MT-24, the architectural
      // review's Finding C: after the telling, a failure had kept the world's change without its step).
      const kept = this.steps.length;
      let voiced: Voiced[], words: ReturnType<typeof RuleWords.tell>;
      try {
        if (this.expander) { await Costs.timed('expand', () => this.expander!.expand(this.campaign)); }
        open.reach('expanded');
        // What the company is told of it, in the voice tables' words, kept with the command so it is not said again.
        ({ words, voiced } = Costs.time('tell', () => {
          const words = RuleWords.tell(this.campaign, event);
          return { words, voiced: [...barked, ...words.told, ...Telling.tell(this.campaign, event)] };
        }));
        open.reach('told');
        Costs.time('aims', () => Undertakings.after(this.campaign, aims));
        open.reach('settled');
        const digest = Costs.time('digest', () => Digest.of(this.campaign));
        this.steps.push({ command, ...combat.length ? { combat } : {}, digest });
        if (voiced.length || words.unsaid.length) { this.campaign.told(voiced, words.unsaid); }
      } catch (error) { this.steps.length = kept; this.campaign.undo(); throw error; }
      this.attending.after(this.campaign, { command, event, ahead, fought: fights.length > 0 });
      if (voiced.length || words.unsaid.length) { event.voiced = voiced; }
      if (words.unsaid.length) { event.unsaid = words.unsaid; }
      this.receipts.push(open.receipt(this.steps.length, event.result));
      return event;
    } catch (error) {
      this.receipts.push(open.receipt(this.steps.length, 'undone'));
      throw error;
    } finally { this.campaign.closeCommand(); this.resumed(); }
  }
  // The command's action, and the aims held before it; the step of the aim to follow, done, takes the aim up first
  // (one row, one act: HeldLead, OR-466).
  private resolving(command: string, known?: string): { id: string; aims: string[] } {
    const id = known ?? PlayerView.resolve(this.campaign, command);
    const takes = HeldLead.taken(this.campaign, command, this.campaign.operator(id));
    if (takes) { this.follow(takes); }
    return { id, aims: Undertakings.held(this.campaign).map(o => o.id) };
  }
  // An aim set aside, gone back to where it has a step, read from the frame now the command has ended.
  private resumed() { Costs.time('aims', () => Undertakings.resume(this.campaign)); }
  // A fight's turn put to the player's controller: while it waits, the fight's page may be drawn (Campaign.fighting).
  private async asked(controller: CombatController, battle: Battle): Promise<Command> {
    this.campaign.fighting = true;
    try { return await controller(battle); } finally { this.campaign.fighting = false; }
  }
  // An aim chosen to follow (the glance offers it as an act: HeldActs.follow): no time passes and no world fact
  // changes, so it is told as a command and kept in the steps, for the browser, the terminal and a replay alike.
  private follow(aim: string): CampaignEvent {
    // `follow:` alone lets the aim go (none is followed again); else the aim must be one held now (a stale one is
    // refused).
    if (aim && !Undertakings.held(this.campaign).some(o => o.id === aim)) { throw new Error(`No aim ${aim} is held`); }
    Undertakings.follow(this.campaign, aim || undefined);
    this.steps.push({ command: `follow:${aim}`, digest: Digest.of(this.campaign) });
    // The aim in the words the screen gives it (its aims are these), not a whole screen built for them: the page builds
    // the screen as the command ends, and every follow had built it twice (OR-91).
    const view = PlayerView.observe(this.campaign), aims = Undertakings.shown(this.campaign, view.objectives ?? [],
      view.location?.id ?? '').aims, text = aims?.find(a => a.id === aim)?.text ?? aim;
    return { action: 'follow', elapsed: 0, changes: [], result: 'success', combat: [],
      response: aim ? `You set your mind to it: ${AimSaid.title(text)}.` : 'You set your mind to nothing in particular.' };
  }
  // A command of the session's own, no act of the world: an aim followed (follow:), or the focus (focus:…), whose
  // steps are kept as follow:'s are, so that a replay reaches the same focus; told as no event of the world.
  private aside(command: string): CampaignEvent {
    const done = Focusing.is(command) ? this.focusing(command) : this.follow(command.slice('follow:'.length));
    this.last = new OpenCommand(command);
    this.receipts.push(this.last.receipt(this.steps.length, done.result));
    return done;
  }
  private focusing(command: string): CampaignEvent {
    this.attending.command(command, this.campaign);
    this.steps.push({ command, digest: Digest.of(this.campaign) });
    return { action: 'focus', elapsed: this.campaign.history.at(-1)?.elapsed ?? 0, changes: [], result: 'success',
      combat: [] };
  }
  static auto(this: void, battle: Battle): Promise<Command> {
    return Promise.resolve(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
  }
  static scripted(commands: Command[]): CombatController {
    return PlaySession.next.bind(undefined, structuredClone(commands));
  }
  private static next(this: void, queue: Command[], _battle: Battle): Promise<Command> {
    const next = queue.shift();
    return next ? Promise.resolve(next) : Promise.reject(new Error('Transcript ended during combat'));
  }
  async replay(steps: TranscriptStep[]): Promise<void> {
    for (const [i, step] of steps.entries()) {
      const controller = PlaySession.scripted(step.combat ?? []);
      // A step kept was done when it was played: a way into the next hex kept was a journey's leg, and is again (a
      // game kept before the campaign held the rule replays as it was played).
      await this.leg(step.command, controller);
      const recorded = this.steps[this.steps.length - 1]!;
      if ((recorded.combat?.length ?? 0) !== (step.combat?.length ?? 0)) {
        throw new Error(`Transcript combat for ${step.command} did not match the encounter`);
      }
      if (step.digest && recorded.digest !== step.digest) {
        throw new Error(`The replay came out otherwise than the game it replays, at step ${i + 1} (${step.command})`);
      }
    }
  }
  // Canonical, host-independent result used for CLI/browser parity.
  canonical(): string {
    return JSON.stringify({ transcript: this.transcript, save: this.campaign.save(true),
      view: PlayerView.observe(this.campaign), chronicle: PlayerView.chronicle(this.campaign) });
  }
}
