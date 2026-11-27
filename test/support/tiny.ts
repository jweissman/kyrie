import { SingleModule } from '../../src/campaign/single-module';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import type { CreatureGenerationContext } from '../../src/content';
import type { LandChart } from '../../src/lang/module';
import type { CalendarStart } from '../../src/campaign/calendar';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { Narrator, type Leaf } from '../../src/presentation/narrator';
import type { Glance } from '../../src/presentation/glance-types';
import { Undertakings } from '../../src/presentation/undertakings';
import { ScreenModel } from '../../src/ui/screen-model';
import { Itineraries } from '../../src/ui/itinerary';
import { Costs, type Tally } from '../../src/costs';
import type { Screen } from '../../src/ui/screen-types';
import { Earned } from '../../src/lang/index';
import { Horizon } from './horizon';

// The smallest world a rule can be proved in (Mission 21, Phase 0): one Kyr module written in the spec (see
// SingleModule), on the shared rules, started in a tenth of a second in a process that has started one (0.22 s warm
// and 0.53 s cold in a fresh one: it still installs the canon and the shared rules) where a generated country takes
// seven to ten; on a horizon, the kernel of the shared rules and the packages named, it starts in a fraction of that,
// and a read beyond its horizon fails as one: see Horizon). Its ids
// are the module's own under `t__` (a place `yard` is `t__yard`); its company must be `party`. What it plays is the
// engine's and the page's own: a Journey by the labels a player sees, the glance the page leads with, the screen it is
// drawn from. A rule proved here needs no Westernesse; what only Westernesse proves (that its generators write what
// the rule then reads) stays in the confidence suite beside it.
//   const t = await Tiny.start(`Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.`);
//   const t = await Tiny.start(kyr, { horizon: ['needs'] });   the kernel and food and sleep, and nothing else
export class Tiny {
  leaf!: Leaf;
  screen!: Screen;
  // What its start crossed (see Costs): a tiny world draws no country and composes no world.
  costs: Tally = {};
  private horizon?: Horizon;
  private constructor(readonly journey: Journey) { this.look(); }
  // The module's body (or a whole `Module t "…" { … }`), the company's members, and any other rules it reads; and the
  // land of its place `region` where it has one drawn by hand, its open country as places t0, t1… (see LandModel).
  // horizon: the packages of the shared rules it is proved among, beyond the kernel (rules: the whole set, by default).
  static async start(kyr: string, options: { party?: CreatureGenerationContext[]; rules?: string[];
    horizon?: string[]; seed?: string; chart?: LandChart; calendar?: CalendarStart; canon?: string[]; own?: boolean;
    night?: 'none'; currency?: string; earned?: boolean } = {}): Promise<Tiny> {
    if (options.horizon && options.rules) { throw new Error('A tiny world takes a horizon or its rules, not both'); }
    const horizon = options.horizon && new Horizon(options.horizon);
    const started = () => Tiny.started(kyr, horizon
      ? { ...options, rules: horizon.manifest, own: options.own ?? horizon.canonless } : options);
    const tiny = horizon ? await horizon.within(started) : await started();
    tiny.horizon = horizon;
    return tiny;
  }
  private static async started(kyr: string, options: Parameters<typeof SingleModule.source>[1] & { seed?: string;
    earned?: boolean }): Promise<Tiny> {
    const mark = Costs.mark(), { source, campaign } = SingleModule.source(kyr, options);
    const session = await PlaySession.start(campaign, options.seed ?? 'tiny', source);
    // The earned stage (OR-1245): every surface earned at once, for a rule of the map or the lenses proved here.
    if (options.earned) { Earned.grant(session.campaign); }
    const tiny = new Tiny(Journey.of(session, true));
    tiny.costs = Costs.since(mark);
    return tiny;
  }
  // What it does, a read beyond its horizon said as one (see Horizon).
  private within<T>(work: () => Promise<T>): Promise<T> { return this.horizon ? this.horizon.within(work) : work(); }
  get session(): PlaySession { return this.journey.session; }
  get campaign() { return this.journey.campaign; }
  get world() { return this.campaign.world; }
  get glance(): Glance { return this.leaf.glance!; }
  // What the page leads with in gold: the next step of the one aim followed (the owner, 12 November), and nothing else.
  get gold() { return this.glance.acts.filter(a => a.continues || a.aspects.includes('undertaking')); }
  where(who = 'party'): string | undefined { return this.journey.at(who); }
  // The aim chosen in the notes (Follow this), by its id in the module, or none.
  follow(aim?: string): this {
    Undertakings.follow(this.campaign, aim === undefined ? undefined : `t__${aim}`);
    return this.look();
  }
  // Steps by the labels a player sees (see Journey), then the page as it is drawn after them.
  async play(...steps: string[]): Promise<this> {
    return this.within(async () => { await this.journey.play(...steps); return this.look(); });
  }
  // A command by its id, as the page sends it, told as the page tells it.
  async perform(command: string): Promise<this> {
    const c = this.campaign, before = PlayerView.observe(c), event = await this.within(() => this.session.leg(command));
    const moved = before.location?.id !== c.world.one('at', c.playerActor ?? 'party');
    // Charted, as the page's frame is (Itineraries.charted): the page draws the map from it.
    this.screen = Itineraries.charted(c, ScreenModel.build(c));
    this.leaf = Narrator.leaf(c, this.screen, { event, feedback: ActionFeedbackView.read(c, event, before),
      said: command, moved });
    return this;
  }
  look(): this {
    this.screen = Itineraries.charted(this.campaign, ScreenModel.build(this.campaign));
    this.leaf = Narrator.leaf(this.campaign, this.screen);
    return this;
  }
}
