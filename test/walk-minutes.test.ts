import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Itineraries } from '../src/ui/itinerary';

// A walk about the town is said to take what it takes: the town's walks had counted every step as ten minutes, and
// said twenty to the quarry pit by the green, a minute and five off (round 7: "everything is 20 minutes"; the
// register's NM-09).
describe('a walk about the town', () => {
  it('is said to take the minutes it spends', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, around = Itineraries.around(c);
    expect(new Set(around.map(p => p.minutes)).size).toBeGreaterThan(2);
    const plan = around[0]!, before = c.readout.minutes ?? 0;
    expect(plan.minutes).toBeLessThan(20);
    await s.leg(`travel:${plan.id}`);
    expect(c.world.one('at', 'party')).toBe(plan.id);
    expect((c.readout.minutes ?? 0) - before).toBe(plan.minutes);
  }, 120000);
});
