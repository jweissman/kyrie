import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';

// The courier's letter is for someone in the next town on: from inside a taproom on the way, where no journey is set
// out on (CN-02), the way out into the town is the aim's. In c3's Roaring Chalice nothing had been gold, the aim
// named Glen and no place, and the walk lost seventeen turns there (Gate 1's generated tier, 15 November).
describe('the courier\'s letter', () => {
  it('leads out of a taproom on the way toward the town it is for', async () => {
    const s = await DrawnWorld.start('c3', { origin: 'courier', party: [{ name: 'Wynn', raceId: 'human',
      classId: 'mage' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    // Into the town, and in at the inn, as the walk went.
    for (const to of [/^the bailey/, /^the taproom/]) {
      const exit = ScreenModel.build(c).exits.find(e => to.test(e.destination.name))!;
      await s.leg(exit.acts.find(a => a.command)!.command!);
    }
    const screen = ScreenModel.build(c), offer = Narrator.leaf(c, screen).glance!.offer!;
    expect(screen.place.id).toBe('region__s1_taproom');
    const gold = offer.primary.filter(o => o.aspects.includes('undertaking')).map(o => o.label);
    expect(gold).toHaveLength(1);
    expect(gold[0]).toMatch(/^Out to /);
  }, 120000);
});
