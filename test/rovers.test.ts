import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Glanced } from './support/glanced';

// Who goes about the open country comes upon a company crossing it (the owner's blocking report of 11 November:
// ordinary exploration felt empty; seventy of eighty stretches round Thornhaven held nothing, and nothing came to
// them). A few rovers to a country, each ranging over the stretches near its own; one comes by day, said as it comes,
// and is led with for what it has to give; a danger ranges only away from the roads and the towns.
describe('the rovers of a country', () => {
  it('go about the open country, few, each over the stretches near its own', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const roams = s.campaign.world.related('region__roams'), rovers = new Set(roams.map(r => r.args[0]));
    expect(rovers.size).toBeGreaterThan(0);
    // Six of the wild, one band of footpads on a stretch of the roads (OR-321: roads with a little more danger), and
    // one that goes about only in the dark (OR-1235: danger at night, a little).
    expect(rovers.size).toBeLessThanOrEqual(8);
    expect(roams.every(r => /^region__t\d+$/.test(r.args[1]!))).toBe(true);
  }, 120000);
  it('comes to a company waiting where one goes about, says so, and is led with', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, roams = c.world.related('region__roams');
    // A rover of the day (not the night's band) on a stretch not its own, whose fortune there today is to come
    // (at most ten, the least any rover asks): a road's roll is the band's fortune for the day since OR-1345.
    const fortune = (r: string, at: string) => c.world.number({ kind: 'call', name: 'fortune', args: [r, at] });
    const [rover, there] = roams.find(r => r.args[1] !== r.args[0]!.replace('__wr', '__t') && !/n$/.test(r.args[0]!)
      && fortune(r.args[0]!, r.args[1]!) <= 10)!.args as [string, string];
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', there) }]));
    for (let i = 0; i < 30 && c.world.one('at', rover) !== there; i++) { await s.perform('wait'); }
    expect(c.world.one('at', rover)).toBe(there);
    const g = Glanced.of(s), who = g.screen.people.find(p => p.id === rover);
    expect(who).toBeDefined();
    expect(g.glance.acts.some(a => a.subject === rover && a.aspects.length > 0)).toBe(true);
  }, 120000);
});
