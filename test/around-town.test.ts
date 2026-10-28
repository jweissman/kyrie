import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Travel } from '../src/session/travel';
import { GeneratedWorld } from './support/generated';

// Going about a town is not going back to its square every time (the owner's interim report: the same few places
// walked between, over and over): from a shop, the town's other places are offered, each walked to by the town's own
// ways, and the walk comes there.
describe('going about a town', () => {
  it('offers its other places from anywhere in it, and walks there', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's1_shop');
    const around = ScreenModel.build(c).around ?? [];
    const taproom = around.find(d => /taproom/.test(d.name))!;
    expect(taproom.legs.map(l => l.to)).toHaveLength(2);
    // Nothing a step away is offered twice: the green, from the shop, is a way about the place.
    expect(around.some(d => ScreenModel.build(c).exits.some(e => e.destination.id === d.id))).toBe(false);
    const done = await Travel.go({ campaign: c, perform: (command: string) => s.perform(command) }, taproom.id);
    expect([done.arrived, c.world.one('at', 'party')]).toEqual([true, taproom.id]);
  }, 120000);
});
