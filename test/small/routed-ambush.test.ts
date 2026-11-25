import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Travel } from '../../src/session/travel';
import { DeepSounds } from '../../src/world/deep/deep-sounds';
import type { DeepLayout } from '../../src/world/deep/deep-layout';

// A journey through a deep site into what lies in wait (register SI-01): the careful walks died on the second level by
// a routed move into an ambush, the sign at the way's mouth told and walked past, the journey taking the way for the
// player. A way whose mouth shows that something lies in wait in there is the player's to take, asked, not the
// journey's, as a way that goes one way only is (PT-17): the journey stops at its mouth and says what was seen. The
// ambush is kept: taken by hand, the way still leads into it. The sign and the fact are the generator's own lines.
const layout: DeepLayout = { site: 's', levels: [], links: [{ id: 'arch', a: 'hall', b: 'lair', kind: 'passage',
  name: 'the arch', minutes: 2 }] };
const lines = DeepSounds.lines(layout, { id: 'spiders', room: 'lair', temperament: 'ambush' }).join('\n');
const world = `
  Place stair "the stair-foot" is room at 0, 0 underground.
  Place hall "the hall" is room at 1, 0 underground.
  Place lair "the side chamber" is room at 2, 0 underground.
  Place far "the far gallery" is room at 3, 0 underground.
  Passage steps "the steps" is passage between stair and hall.
  Passage arch "the arch" is passage between hall and lair.
  Passage gallery "the gallery" is passage between lair and far.
  Place den "a crack in the rock" is room at 9, 9 underground.
  Person spiders "the spiders" at den { Role "spiders". Species spider. Numbers 2. Level 1. Temperament ambush. Lair lair. }
  Company party "You" of 1 at stair.
${lines}
  Goal false.`;
const go = async () => {
  const t = await Tiny.start(world, { party: [{ name: 'Wynn', raceId: 'human', classId: 'warrior' }] });
  const traveller = { campaign: t.campaign, perform: (command: string) => t.session.leg(command) };
  // The way walked once, out and back, before anything had come to lie in wait there.
  for (const leg of ['go(t__steps,t__hall)', 'go(t__arch,t__lair)', 'go(t__gallery,t__far)', 'go(t__gallery,t__lair)',
    'go(t__arch,t__hall)', 'go(t__steps,t__stair)']) { await t.session.leg(leg); }
  const c = t.campaign;
  c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 't__spiders', 't__den') },
    { kind: 'assert', call: ModuleWriter.call('at', 't__spiders', 't__lair') }]));
  return { t, done: await Travel.go(traveller, 't__far') };
};
describe('a journey toward a way into an ambush', () => {
  it('stops at its mouth where the sign is seen, and says so', async () => {
    const { t, done } = await go();
    expect(t.where()).toBe('t__hall');
    expect(done.arrived).toBe(false);
    expect(done.stopped).toBe('Something lies in wait beyond the arch');
    expect(done.legs.some(l => l.event.combat.length)).toBe(false);
  });
  it('keeps the ambush: the way taken by hand still leads into it', async () => {
    const { t } = await go();
    const event = await t.session.leg('go(t__arch,t__lair)');
    expect(!!event.prelude || event.combat.length > 0).toBe(true);
  });
});
