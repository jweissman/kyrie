import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { RegionWoods } from '../../src/world/region-woods';
import type { Settlement } from '../../src/world/region-writer';
import { ModuleWriter } from '../../src/lang/module-writer';

// The old woods go on without the company (register OR-641; the owner's direction of 25 November, §3: "repeatable,
// with conditions that depend on the weather"), by the world's own clock and not by drawing again: woundwort picked on
// the old ride comes up again some dawns later; the old boar killed, a young one takes its wallow some nights after;
// rain shows the boar's runs to anyone; and once the company has been down under the stones, the next wet or windy
// day brings an oak down across the ride with a ring in its roots. The woods as data/generation/town/woods.kyrt
// writes them (RegionWoods), in a fragment: a heart, the one who buys what the woods give, a sky, and nowhere else.
const woods = (sky: string) => [
  'Place n "Newmeet" is settlement at 0, 0.',
  'Place n_green "the market-place" is room within n at 1, 1 outdoors.',
  'Place elsewhere "somewhere else" is room.',
  'Person n_innkeeper "Sable" at n_green { Role "herb-wife". Ancestry human. Peaceable. }',
  `Thing sky "the sky" at n is scenery { State weather_fair "Fair.". State weather_${sky} "${sky}.". }`,
  `Initially Assert state(sky, weather_fair).`,
  ...RegionWoods.lines({ id: 'n', name: 'Newmeet' } as Settlement,
    { w: 'n_ud', site: 'the old dead', old: 'the Barrow-Kin', sky: ['fair', sky] }),
].join('\n');
const days = async (t: Tiny, n: number) => {
  for (let i = 0; i < n; i++) { await t.play('?Wait until dark', '?Wait until first light'); }
};
describe('the old woods', () => {
  it('grow their woundwort back on the ride some dawns after it is picked', async () => {
    const t = await Tiny.start(`${woods('rainy')}\nCompany party "You" of 1 at n_wood_ride.\nGoal false.`);
    await t.play('Search here', '^Take');
    expect(t.world.one('at', 't__n_wood_herbs2')).toBe('t__elsewhere');
    await days(t, 4);
    expect(t.world.one('at', 't__n_wood_herbs2')).toBe('t__n_wood_ride');
    expect(t.journey.seen()).toMatch(/come up again/);
  });
  it('show the boar\'s runs in the rain, and bring an oak down in bad weather once the company has been under them', async () => {
    // A mage, who has no woodcraft to see the runs by in fair weather.
    const t = await Tiny.start(`${woods('rainy')}\nCompany party "You" of 1 at n_ud.
      Initially Assert knows(party, n_wood_door). Initially Assert knows(party, n_wood_stones_known).\nGoal false.`,
    { party: [{ name: 'Ama', raceId: 'human', classId: 'mage' } as never] });
    await t.play('>t__n_wood_ride');
    const tracks = () => t.world.test(ModuleWriter.call('knows', 'party', 't__n_wood_tracks'));
    expect([tracks(), t.world.one('at', 't__n_wood_windfall_ring')]).toEqual([false, 't__elsewhere']);
    t.campaign.commitWorld(t.world.apply([
      { kind: 'retract', call: ModuleWriter.call('state', 't__sky', 't__weather_fair') },
      { kind: 'assert', call: ModuleWriter.call('state', 't__sky', 't__weather_rainy') }]));
    await t.play('>t__n_wood_burners', '>t__n_wood_ride');
    expect(tracks()).toBe(true);
    expect(t.world.one('at', 't__n_wood_windfall_ring')).toBe('t__n_wood_ride');
    expect(t.journey.seen()).toMatch(/An oak has come down across the ride/);
  });
  it('have a young boar in the old one\'s wallow some nights after it is killed', async () => {
    const t = await Tiny.start(`${woods('rainy')}\nCompany party "You" of 1 at n_wood_wallow.
      Initially Assert established(n_wood_tracks). Initially Assert knows(party, n_wood_tracks).\nGoal false.`,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 6 } as never] });
    await t.journey.fight('^Attack');
    await t.play('>t__n_wood_ride');
    await days(t, 6);
    expect(t.world.one('at', 't__n_wood_young')).toBe('t__n_wood_wallow');
  });
});
