import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';

class Fixture {
  static async source(installation = 'one') {
    const rules = await Promise.all(ModuleBundle.world.map(async name => [
      `data/rules/${name}.kyr`, await Bun.file(`data/rules/${name}.kyr`).text(),
    ]));
    return new MemoryBundleSource({ ...Object.fromEntries(rules),
      'campaign.json': JSON.stringify({ version: 1, name: 'Streams', modules: [{ id: installation, bundle: 'module.json' }] }),
      'module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
      'site.kyr': `Module stable_site "Stable clearing" {
        Place clearing "Clearing" is room.
        Company party "Party" of 1 at clearing.
        Person wolf "Wolf" at clearing { Species wolf. }
        Item token "a dagger" is dagger at clearing.
        Goal false.
      }`,
    });
  }
}

describe('random identities', () => {
  it('keeps creature draws and encounter initiative stable when an installation is renamed', async () => {
    const a = await Campaign.load('campaign.json', 'streams', await Fixture.source('one'));
    const b = await Campaign.load('campaign.json', 'streams', await Fixture.source('renamed'));
    expect(a.state.creatures.map(c => [c.name, c.raceId, c.classId, c.base]))
      .toEqual(b.state.creatures.map(c => [c.name, c.raceId, c.classId, c.base]));
    const aa = a.available().find(a => a.resolve?.name === 'combat')!;
    const bb = b.available().find(a => a.resolve?.name === 'combat')!;
    const ab = a.encounterBattle(aa.id), ba = b.encounterBattle(bb.id);
    expect(ab.events.find(e => e.type === 'initiative')?.order.map(x => x.roll))
      .toEqual(ba.events.find(e => e.type === 'initiative')?.order.map(x => x.roll));
  });
  it('isolates an encounter from an unrelated resolved pickup and preserves it across restore', async () => {
    const a = await Campaign.load('campaign.json', 'streams', await Fixture.source());
    const b = await Campaign.load('campaign.json', 'streams', await Fixture.source());
    const take = b.available().find(a => a.resolve?.name === 'acquire')!;
    expect(take).toBeDefined();
    b.execute(take.id);
    const restored = Campaign.restore(b.save(true));
    const attack = a.available().find(a => a.resolve?.name === 'combat')!;
    const first = a.encounterBattle(attack.id), afterPickup = b.encounterBattle(attack.id);
    const afterRestore = restored.encounterBattle(attack.id);
    expect(first.events).toEqual(afterPickup.events);
    expect(afterPickup.events).toEqual(afterRestore.events);
  });
});
