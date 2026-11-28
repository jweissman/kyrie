import { readFileSync } from 'node:fs';
import { SingleModule } from '../../src/campaign/single-module';
import { Journey } from '../../src/session/journey';
import { Horizon } from './horizon';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { ArrivalAttention, type AttentionReason } from '../../src/presentation/arrival-attention';
import type { Glance } from '../../src/presentation/glance-types';
import { ModuleWriter } from '../../src/lang';
import type { PlaySession } from '../../src/session/play-session';

// A track of places, each with one thing to meet on coming to it (test/fixtures/single/arrivals.kyr), and the page's
// own verdict on each arrival: the oracle ArrivalAttention is held to.
export class Arrivals {
  static readonly file = 'test/fixtures/single/arrivals.kyr';
  static async start(): Promise<PlaySession> {
    // Keep the cold session: Tiny.start draws a page, which warms the revision cache these specs exercise.
    const horizon = new Horizon(['inhabitants', 'probing', 'services']);
    const one = SingleModule.source(readFileSync(this.file, 'utf8'), { rules: horizon.manifest, own: horizon.canonless,
      party: [{ name: 'Wynn', raceId: 'human', classId: 'warrior' }] });
    return (await horizon.within(() => Journey.start(one.campaign, 'journey', { source: one.source }))).session;
  }
  // The company coming back along the track, for the words said only then (returning).
  static returning(s: PlaySession) {
    const held = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('arrivals__returning', 'party') }]));
  }
  // The way along a passage of the track, as the page offers it.
  static way(s: PlaySession, passage: string): string {
    return PlayerFrame.of(s.campaign).rows.find(r => r.choice.id.startsWith(`go(arrivals__${passage},`))!.choice.id;
  }
  // What the page would ask for here: the whole screen built and the narrator's leaf, its glance read, as Travel had
  // read it on every leg where something was said (Travel.weighty until 25 November). No glance asks for everything.
  static shown(s: PlaySession): AttentionReason[] {
    return this.read(Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).glance) ?? ['threat'];
  }
  // The glance's own reading of what it offers: an act that is no way, journey, wait or fight, for an aim, a gain, a
  // danger, a marvel or someone's company; or something seen here worth looking into (a sign, a thing not yet looked
  // at), an answer waited on, a warning, led with. A word to be had of someone passing, or the life of a place, is not.
  private static readonly material: Record<string, AttentionReason> = { undertaking: 'aim', payoff: 'payoff',
    danger: 'threat', wonder: 'wonder', companionship: 'companion' };
  private static readonly noticed: Record<string, AttentionReason> = { sign: 'sign', unlooked: 'unlooked',
    answer: 'answer', warned: 'warning' };
  static read(glance: Glance | undefined): AttentionReason[] | undefined {
    if (!glance) { return undefined; }
    const acts = [...glance.offer?.primary ?? [], ...glance.offer?.rest ?? []]
      .filter(o => !['go', 'journey', 'wait', 'fight'].includes(o.type));
    const seen = [...acts.flatMap(o => o.aspects.flatMap(a => this.material[a] ?? [])),
      ...glance.acts.filter(a => !a.exit).flatMap(a => this.noticed[a.why] ?? [])];
    return seen.filter((r, i) => seen.indexOf(r) === i);
  }
  // What the glance carries as asking the player here (Glance.asks: ArrivalAttention's), without building the page.
  static glanced(s: PlaySession): AttentionReason[] { return ArrivalAttention.asks(s.campaign); }
  // How many pages and leaves are built while a run goes, counted where they are built.
  static async built(run: () => Promise<unknown>): Promise<{ screens: number; leaves: number }> {
    const count = { screens: 0, leaves: 0 };
    const build = ScreenModel.build.bind(ScreenModel), leaf = Narrator.leaf.bind(Narrator);
    ScreenModel.build = ((...a: Parameters<typeof build>) => { count.screens++; return build(...a); }) as typeof build;
    Narrator.leaf = ((...a: Parameters<typeof leaf>) => { count.leaves++; return leaf(...a); }) as typeof leaf;
    try { await run(); } finally { ScreenModel.build = build; Narrator.leaf = leaf; }
    return count;
  }
}
