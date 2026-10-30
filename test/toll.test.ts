import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// Running a toll is going on along the road past the bar without paying. In a1 the lord's reeve keeps the bar at the
// bridge over the Deepwater, where paths go off into five woods and fens: a company that came over the bridge from
// Sedgebrook and turned off into Oakhurst (Wǽttún and Eikwudu, before the heartland's places had Common names) was
// outlawed for it, and riders sent after it. Turning off the road, or back the way it came, is not running the toll;
// going on to Millholm is.
class Toll {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s3_green') }]));
    // Over the bridge from Sedgebrook, to the bar.
    await s.perform('go(region__road_s2_s3_on,region__s2_s3_way)');
    return s;
  }
  static outlawed(s: PlaySession) {
    return s.campaign.module.entities.some(e => e.id.endsWith('__chief')
      && s.campaign.world.test(ModuleWriter.call('hostile', e.id, 'party')));
  }
}

describe('the lord\'s toll at the bridge', () => {
  it('is not run by turning off the road into the wood, nor by turning back', async () => {
    const wood = await Toll.start();
    await wood.perform('go(region__z3_way2,region__z3_deep)');
    expect(Toll.outlawed(wood)).toBe(false);
    const back = await Toll.start();
    await back.perform('go(region__road_s2_s3_on,region__s3_green)');
    expect(Toll.outlawed(back)).toBe(false);
  }, 120000);
  // Played in cov7: up to the bar from the town, off by a track to a barrow and back, and home down the same road,
  // and the lord's riders were waiting at the inn for "a company that turned on his toll". A way off the road leaves
  // the company on the side of the bar it came from.
  it('is not run by going off the road and back, then home the way it came; and is, going on', async () => {
    for (const [on, outlawed] of [['region__road_s2_s3_on,region__s3_green', false],
      ['region__road_s2_s3,region__s2_green', true]] as const) {
      const s = await Toll.start();
      await s.perform('go(region__z3_way2,region__z3_deep)');
      await s.perform('go(region__z3_way2,region__s2_s3_way)');
      await s.perform(`go(${on})`);
      expect([on, Toll.outlawed(s)]).toEqual([on, outlawed]);
    }
  }, 120000);
  it('is run by going on along the road without paying', async () => {
    const s = await Toll.start();
    await s.perform('go(region__road_s2_s3,region__s2_green)');
    expect(Toll.outlawed(s)).toBe(true);
  }, 60000);
});
