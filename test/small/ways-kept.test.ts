import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { ScreenModel } from '../../src/ui/screen-model';
import { PassageModel } from '../../src/ui/passage-model';
import { ObservationText } from '../../src/lang/observation-text';
import { ModuleWriter } from '../../src/lang/module-writer';
import { WorldReads } from '../../src/lang/world-reads';
import type { Campaign } from '../../src/campaign/campaign';
import type { Change } from '../../src/lang/module';

// The ways from a place are kept from one world to the next while nothing they read has been written (OR-91: the
// whole open country's ways had been read again for every act). Kept, they must never be stale: a world that writes
// what a way reads (the tide come over the lane) has its screen say so, and one that writes only what no way reads
// (the company's coin) has the very ways it had.
class Ford {
  static async start(): Promise<Campaign> {
    return (await PlaySession.start('test/fixtures/ford-road/campaign.json', 'ways-kept', NodeBundleSource.shared,
      [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }, { name: 'Bran', raceId: 'human', classId: 'warrior' }]))
      .campaign;
  }
  static ways(c: Campaign, from: string) {
    return new PassageModel(c.world, c.playerActor!, ObservationText.presented(c.world)).ways(from);
  }
  // How the screen has the way to the copse.
  static lane(c: Campaign) {
    return ScreenModel.build(c).exits.find(e => e.destination.id === 'world__copse')?.passage;
  }
  static change(c: Campaign, ...changes: Change[]) { c.commitWorld(c.world.apply(changes)); }
  static call(name: string, ...args: string[]) { return ModuleWriter.call(name, ...args); }
}
describe('the ways from a place, kept from one world to the next', () => {
  it('are the same ways where nothing they read was written, and read again where it was', async () => {
    const c = await Ford.start(), green = 'world__green', ways = Ford.ways(c, green);
    expect(Ford.lane(c)).toBe('open');
    Ford.change(c, { kind: 'set', call: Ford.call('quantity', 'party', 'gold'),
      value: { kind: 'number', value: 9 } });
    expect(Ford.ways(c, green)).toBe(ways);
    // The tide moved onto the lane and come in: the lane is barred, on the screen too.
    Ford.change(c, { kind: 'retract', call: Ford.call('on', 'world__tide', 'world__causeway') },
      { kind: 'assert', call: Ford.call('on', 'world__tide', 'world__lane') },
      { kind: 'retract', call: Ford.call('state', 'world__tide', 'world__out') },
      { kind: 'assert', call: Ford.call('state', 'world__tide', 'world__in') });
    expect(Ford.ways(c, green)).not.toBe(ways);
    expect(Ford.ways(c, green).find(w => w.passage === 'world__lane')?.status).toBe('blocked');
    expect(Ford.lane(c)).not.toBe('open');
    // And gone out again, open.
    Ford.change(c, { kind: 'retract', call: Ford.call('state', 'world__tide', 'world__in') },
      { kind: 'assert', call: Ford.call('state', 'world__tide', 'world__out') });
    expect(Ford.lane(c)).toBe('open');
  }, 60000);
  it('say what they read inside a reading that keeps them, and that a reading of everything keeps nothing', async () => {
    const c = await Ford.start(), green = 'world__green';
    Ford.ways(c, green);
    const kept = WorldReads.of(() => Ford.ways(c, green));
    expect(kept.reads).toContain('connects');
    expect(WorldReads.of(() => c.world.view).reads).toBeUndefined();
  }, 60000);
});
