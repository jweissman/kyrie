import type { CreatureGenerationContext } from '../content';
import { Campaign, type CampaignEvent, type CampaignSave } from '../campaign/campaign';
import type { BundleSource } from '../campaign/bundle-source';
import type { Battle } from '../battle';
import type { Command } from '../model';
import { Tactics } from '../tactics';
import { PlayerView } from '../presentation/player-view';
import { Telling } from '../narrative/telling';
import type { Memorial } from '../world/memorial';
import { Digest } from './digest';

// digest: what the game was after it (see Digest).
export interface TranscriptStep { command: string; combat?: Command[]; digest?: string }
export interface Transcript {
  version: 1; party?: CreatureGenerationContext[]; scenario: string; seed: string;
  steps: TranscriptStep[]; complete: boolean;
  // A generated world's: what it was drawn for, so that it can be drawn again to replay the steps (see DrawnWorld).
  drawn?: Drawn;
}
export interface Drawn { party: CreatureGenerationContext[]; terrain?: string; origin?: string; memorial?: Memorial }
// Chooses the next command for the player's side. Must return one of battle.legalCommands().
export type CombatController = (battle: Battle) => Promise<Command>;
export interface SessionCheckpoint { version: 1; transcript: Transcript; save: CampaignSave }

export interface Expander { expand(campaign: Campaign): Promise<unknown> }

// Host-neutral play loop shared by the browser, CLI replay and tests. Kyr remains the sole rules authority:
// commands are resolved through PlayerView, executed by Campaign, and combat steps through Battle.
export class PlaySession {
  private steps: TranscriptStep[];
  private busy = false;
  readonly scenario: string;
  readonly seed: string;
  private complete: boolean;
  private party?: CreatureGenerationContext[];
  private drawn?: Drawn;
  // What the world draws as the company goes (the country beyond a march-stone, see Frontier): drawn as part of the
  // command, so that the same commands replayed draw the same world.
  private expander?: Expander;
  private constructor(readonly campaign: Campaign, history: Omit<Transcript, 'version'>) {
    this.party = structuredClone(history.party); this.drawn = structuredClone(history.drawn);
    this.scenario = history.scenario; this.seed = history.seed;
    this.steps = structuredClone(history.steps); this.complete = history.complete;
  }
  static async start(scenario: string, seed: string, source: BundleSource,
    party?: CreatureGenerationContext[]): Promise<PlaySession> {
    return new PlaySession(await Campaign.load(scenario, seed, source, party),
      { scenario, seed, steps: [], complete: true, ...(party ? { party } : {}) });
  }
  // handed: the checkpoint is the session's own from now on (owned), and was kept by this engine (trusted).
  static resume(checkpoint: SessionCheckpoint, handed: { owned?: boolean; trusted?: boolean } = {}): PlaySession {
    if (checkpoint.version !== 1) { throw new Error('Unsupported session checkpoint'); }
    const t = checkpoint.transcript, session = new PlaySession(Campaign.restore(checkpoint.save, handed), t);
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
    return { version: 1, transcript: this.transcript, save: this.campaign.save(true, live) };
  }
  async perform(command: string, controller: CombatController = PlaySession.auto): Promise<CampaignEvent> {
    if (this.busy) { throw new Error('A command is already in progress'); }
    const id = PlayerView.resolve(this.campaign, command);
    this.busy = true;
    const combat: Command[] = [];
    try {
      const event = await this.campaign.executeAsync(id, async battle => {
        while (!battle.state.outcome) {
          const actor = battle.state.combatants.find(f => f.id === battle.state.actor)!;
          const legal = battle.legalCommands();
          const player = battle.playerControls(actor.id);
          const chosen = player ? await controller(battle) : battle.chosen();
          if (!legal.some(c => c.actor === chosen.actor && c.ability === chosen.ability
            && c.target === chosen.target)) {
            throw new Error('Illegal combat command');
          }
          if (player) { combat.push({ ...chosen }); }
          battle.step(chosen);
        }
      });
      // What comes of the command after it (the country beyond drawn and installed), and what the company is told of
      // it, are one with it and its step in the transcript: if either fails, the campaign is put back as it was before
      // the command, and nothing of it is kept (Mission 15's independent audit, F3).
      let voiced: ReturnType<typeof Telling.tell>;
      try {
        if (this.expander) { await this.expander.expand(this.campaign); }
        // What the company is told of it, in the voice tables' words, kept with the command so it is not said again.
        voiced = Telling.tell(this.campaign, event);
      } catch (error) { this.campaign.undo(); throw error; }
      this.steps.push({ command, ...combat.length ? { combat } : {}, digest: Digest.of(this.campaign) });
      if (voiced.length) { this.campaign.told(voiced); event.voiced = voiced; }
      return event;
    } finally { this.busy = false; }
  }
  static auto(this: void, battle: Battle): Promise<Command> {
    return Promise.resolve(Tactics.choose(battle.state, battle.legalCommands()));
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
      await this.perform(step.command, controller);
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
