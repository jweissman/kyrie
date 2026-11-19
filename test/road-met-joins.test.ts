import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';

// The very first choices (the owner, 19 November, AT-08): help someone or not, and go with companions or alone. The
// one met on the way into the first town, helped, would come along: at the inn, asked, willing, and taken on; not
// asked of one robbed or walked past.
describe('the one met on the way in', () => {
  it('helped, would come along from the inn, and is taken on', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    // At the town's inn (the taproom), where the one met goes on to.
    const c = s.campaign, room = c.module.entities.find(e => /_taproom$/.test(e.id) && e.space)!.id;
    const at = (who: string, p: string) => [
      ...c.world.one('at', who) ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', who, c.world.one('at', who)!) }] : [],
      { kind: 'assert' as const, call: ModuleWriter.call('at', who, p) }];
    const ask = () => PlayerView.choices(c).find(x => /^Ask the wagoner whether he would come/.test(x.choice.name));
    c.commitWorld(c.world.apply([...at('party', room), ...at('origin__carter', room)]));
    expect(ask()).toBeUndefined();
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('origin__wayIn', 'origin__cart_righted') }]));
    expect(ask()).toBeDefined();
    await s.leg(ask()!.choice.id);
    const take = PlayerView.choices(c).find(x => /^Ask the wagoner to join the company/.test(x.choice.name));
    expect(take).toBeDefined();
    await s.leg(take!.choice.id);
    expect(c.world.test(ModuleWriter.call('travelsWith', 'origin__carter', 'party'))).toBe(true);
  }, 120000);
});
