import { afterEach, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { QuietWatches } from '../src/campaign/quiet-watches';
import { FreshSeeds } from '../src/world/fresh-seeds';
import { AutoplayRun } from '../src/autoplay/run';
import type { WatchHost } from '../src/campaign/watch-loop';
import type { Campaign } from '../src/campaign/campaign';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';

// A watch on a route computes only what something written since could change (OR-721: QuietWatches), held to the old
// way: the same journeys played with every watch computed whole (QuietWatches.afresh), and played as the game plays
// them. After every act's watches (every leg of every journey among them) the world holds the same facts and measures,
// every creature's record is the same and so is the campaign's own state; at the end the log is the same; and every
// stop, every line the runner says and every step the automated player takes, is the same. Over the warrior's golden
// walk, two seeded worlds (a1, b2) and two of the reference game's (s0, and a new life's fresh seed): 67 legs in all.
interface Played { lines: string[]; acts: string[] }
class Watched {
  static acts: string[] = [];
  static record(host: WatchHost) {
    const { relations, measures } = host.world.view, { creatures, current } = host.tickState;
    const facts = relations.map(f => `${f.name}(${f.args.join(',')})`).sort().join(' ');
    const values = measures.map(m => `${m.call.name}(${m.call.args.join(',')})=${m.value}`).sort().join(' ');
    const kept = JSON.stringify({ creatures: creatures.snapshot, current: { ...current, world: undefined } });
    this.acts.push(`${current.elapsed} ${Bun.hash(facts)} ${Bun.hash(values)} ${Bun.hash(kept)}`);
  }
  static begin(afresh: boolean) {
    QuietWatches.afresh = afresh; this.acts = [];
    QuietWatches.witness = host => this.record(host);
  }
  static log(c: Campaign): string { return String(Bun.hash(JSON.stringify(c.history))); }
  static async walk(afresh: boolean): Promise<Played> {
    this.begin(afresh);
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), lines: string[] = [];
    for (const line of GoldenWalk.lines()) { lines.push(JSON.stringify(await AsMeant.ask(r, line))); }
    lines.push(this.log(journey.session.campaign));
    return { lines, acts: this.acts };
  }
  static async seeded(seed: string, policy: 'expedition' | 'gold', afresh: boolean): Promise<Played> {
    this.begin(afresh);
    const r = await AutoplayRun.run({ seed, origin: 'wanderer', policy, steps: 30,
      protagonist: { name: 'Wenna', raceId: 'dwarf', classId: 'cleric' } });
    const steps = r.steps.map(s => JSON.stringify(s));
    return { lines: [String(r.failure?.message), ...steps, JSON.stringify(r.metrics.watches)], acts: this.acts };
  }
}
const same = (kept: Played, whole: Played) => {
  for (const [i, act] of kept.acts.entries()) { expect({ i, act }).toEqual({ i, act: whole.acts[i]! }); }
  expect(kept.acts.length).toBe(whole.acts.length);
  for (const [i, line] of kept.lines.entries()) { expect({ i, line }).toEqual({ i, line: whole.lines[i]! }); }
  expect(kept.lines.length).toBe(whole.lines.length);
};
describe('a quiet watch, passed over where nothing it reads was written', () => {
  afterEach(() => { QuietWatches.afresh = false; QuietWatches.witness = undefined; });
  it('leaves the world as every watch computed whole leaves it, at every act of the golden walk', async () => {
    const whole = await Watched.walk(true), kept = await Watched.walk(false);
    same(kept, whole);
    expect(kept.acts.length).toBeGreaterThan(GoldenWalk.lines().length);
  }, 300000);
  it('leaves it so over seeded worlds and the reference game\'s, played by the automated player', async () => {
    let n = 0;
    // An expedition's temper over a1 and b2 (6 and 18 legs of journeys); the gold followed in the reference game's
    // (7, 19).
    const runs = [['a1', 'expedition'], ['b2', 'expedition'], ['s0', 'gold'],
      [FreshSeeds.seed(() => `quiet${n++}`), 'gold']] as const;
    for (const [seed, policy] of runs) {
      const whole = await Watched.seeded(seed, policy, true), kept = await Watched.seeded(seed, policy, false);
      same(kept, whole);
      expect([seed, kept.acts.length > 20]).toEqual([seed, true]);
    }
  }, 600000);
});
