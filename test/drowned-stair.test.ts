import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// The foot of Ruberport's flooded stair (seed kin, the cold review of 1 November): under the water it is told as
// under the water, not as "a floor of grey silt, ridged where the water went out of it", which a company took for
// drained and found no way on; searched before the pump is started, it opens its way on all the same once the water
// is down.
describe('a drowned level', () => {
  it('is told as drowned until the water is down, and opens its way on then, searched before or not', async () => {
    const w = await WorldAssembler.assemble('kin', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kin', w.source);
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const foot = 'region__w8_drowned_stair_foot';
    const water = { kind: 'call', name: 'region__deepWater', args: ['region__w8_drowned'] };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', foot) }]));
    const take = async (re: RegExp) =>
      s.leg(PlayerView.choices(s.campaign).find(x => re.test(x.choice.name))!.choice.id);
    const seen = () => PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ');
    const ways = () => PlayerView.choices(s.campaign).some(x => /^Take the drift/.test(x.choice.name));
    await take(/^Light a torch/);
    expect(seen()).toContain('black water');
    expect(seen()).not.toContain('grey silt');
    await take(/^Search the foot of the stair/);
    expect(ways()).toBe(false);
    c.commit(c.world.apply([{ kind: 'set', call: water, value: { kind: 'number', value: 0 } }]));
    await s.perform('wait');
    expect(seen()).toContain('grey silt');
    expect(ways()).toBe(true);
  }, 120000);
});
