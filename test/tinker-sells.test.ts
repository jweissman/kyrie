import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { TradeModel } from '../src/ui/trade-model';

// A tinker sitting with wares spread on a blanket sells from it: a ten-foot pole, a crowbar, candles, a whetstone
// (play 7: the tinker sold nothing, though the page said the wares were there); and a merchant's shop has words of its
// own (a salt-house had none).
describe('a tinker, and a merchant\'s shop', () => {
  it('sells what is spread on the blanket', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
    const c = (await PlaySession.start(w.path, 'kite', w.source)).campaign;
    const tinker = c.module.entities.find(e => e.type === 'group' && / the tinker$/.test(e.name))!;
    const here = c.world.one('at', tinker.id)!, names = new Map(c.module.entities.map(e => [e.id, e.name]));
    const counter = TradeModel.at(c.world, here, names).find(t => t.id === tinker.id)!;
    expect(counter.sells.map(g => g.name)).toEqual(expect.arrayContaining(['Ten-foot pole', 'Crowbar']));
  }, 120000);
  it('gives a merchant\'s shop words of its own', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
    const c = (await PlaySession.start(w.path, 'kite', w.source)).campaign;
    const shops = c.module.entities.filter(e => /^region__s\d+_shop$/.test(e.id)).map(e => e.id);
    const scened = new Set((c.module.observations ?? []).filter(o => /_shop_scene$/.test(o.id)).map(o => o.place));
    expect(shops.length).toBeGreaterThan(0);
    expect(shops.filter(id => !scened.has(id))).toEqual([]);
  }, 120000);
});
