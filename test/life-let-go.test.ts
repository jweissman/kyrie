import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';
import { Runner } from '../src/cli/runner';

// A life let go once its first frame is told is let go whole (OR-1740): its campaign, its module and its world are
// collected, as a life never framed is. What an act would teach had been carried in one map of the process keyed by the
// act's text (Outcome.carried), each entry holding the module it was read in and the facts it picked, so that the last
// life framed stayed whole past its letting go: 50 MB above a life never framed on s0, and a spec that began several
// worlds in one worker kept the last of each. Read by the collector's own word (a FinalizationRegistry), not the heap's
// size, which a tiny world moves too little to tell.
class LetGo {
  static readonly party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
  // A topic that teaches, so that the frame foresees what an act would teach (Knowing, Outcome.foreseen).
  static readonly kyr = `
    Place yard "the yard" is room at 0, 0 outdoors.
    Company party "You" of 1 at yard.
    Goal false.
    Person ned "Ned Rook" at yard { Role "the ostler". Ancestry human. Peaceable. Pronouns he. }
    Entity road: fact "The road goes over the moor.".
    Topic ned_ask with ned "Ask Ned about the road" when true {
      Says "'Over the moor,' says Ned.". On discuss { Assert knows(actor, road). } }`;
  // A life begun, its first frame told as the terminal tells it, and only the collector's watch kept of it.
  static async framed(watch: FinalizationRegistry<string>): Promise<string[]> {
    const t = await Tiny.start(this.kyr, { horizon: [], party: this.party });
    const said = new Runner(t.session).said();
    const c = t.campaign, parts = { campaign: c, module: c.module, world: c.world, session: t.session };
    for (const [name, part] of Object.entries(parts)) { watch.register(part, name); }
    return said.offer.primary.map(o => o.label);
  }
  // The watch kept by the class while it watches: a registry no longer reachable is collected with what it watched,
  // and says nothing.
  private static watch?: FinalizationRegistry<string>;
  static async collected(): Promise<Set<string>> {
    const gone = new Set<string>();
    this.watch = new FinalizationRegistry<string>(name => gone.add(name));
    const offered = await this.framed(this.watch);
    expect(offered.length).toBeGreaterThan(0);
    for (let i = 0; i < 20 && gone.size < 4; i++) { await Bun.sleep(1); Bun.gc(true); }
    this.watch = undefined;
    return gone;
  }
}
describe('a life let go after its first frame', () => {
  it('is collected whole: its campaign, module, world and session', async () => {
    expect([...await LetGo.collected()].sort()).toEqual(['campaign', 'module', 'session', 'world']);
  });
});
