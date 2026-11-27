import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Undertakings } from '../src/presentation/undertakings';
import { Carriers } from '../src/ui/carriers';

// Selling what someone of the company has on or in hand is asked about first: a bard's only crossbow had gone at one
// key, and a companion's armour sat on the counter with the rest (round 7).
describe('a sale of what is in hand', () => {
  it('asks first, saying who would go without it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', chain: 'salvage', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, shop = c.world.one('at', 'region__s2_merchant')!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', shop) }]));
    const text = JSON.stringify(ScreenModel.build(c));
    expect(text).toContain('sell_ware(region__party_1__longsword');
    expect(text).toContain('"grave":"Ralf would go without it"');
  }, 120000);
  // Gold is a viable next step, not any act that raises the purse (the owner, 15 November: the debt's gold recommended
  // selling the weapon the company lives by). With the debt followed and the buyer at hand, nothing worn is led, and
  // nothing led is the sale of what is on or in hand.
  it('is never the gold of a debt', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', chain: 'salvage', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, shop = c.world.one('at', 'region__s2_merchant')!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', shop) }]));
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    const worn = Carriers.worn(c), led = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts;
    expect(worn.size).toBeGreaterThan(0);
    const done = (a: (typeof led)[number]) => [a.command ?? '', a.for ?? '', ...(a.inside ?? []).filter(x => x.aspects.includes('undertaking')).map(x => x.command)];
    const gear = led.filter(a => done(a).some(x => /^sell/.test(x) && [...worn].some(w => x.includes(w))));
    expect(gear.map(a => a.label)).toEqual([]);
  }, 120000);
});
