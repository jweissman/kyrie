import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { RegionWoods } from '../../../src/world/region-woods';
import type { Settlement } from '../../../src/world/region-writer';
import { DeepMechanisms } from '../../../src/world/deep/deep-mechanisms';
import type { MechanismWords } from '../../../src/world/deep/deep-purposes';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The way made sure (the cold-play review's
// Wave 2, "compress the secured descent": doc/design/cold-play-8-to-8-5-2026-11-27.md; Descents). The first
// expedition finds the way down through the old woods and under the stones, and levers the barrow's counterweight free;
// on the second, the green offers the way down that work made sure, and one act takes the company there, by the same
// legs and the same time, leg by leg; and from the foot of that stair the way out is the same way up (OR-1862). The
// woods as data/generation/town/woods.kyrt writes them (RegionWoods), and the barrow's counterweight as the deep sites
// write it (DeepMechanisms), in a fragment.
const winch: NonNullable<MechanismWords['winch']> = { kind: 'stair', thing: "the portal stone's counterweight",
  seized: 'The counterweight hangs jammed in its slot, wedged with fallen stone.',
  turning: 'The counterweight runs free in its slot.', free: 'Lever the jammed counterweight free',
  shut: 'A portal stone stands down across the stair, as heavy as a house-wall.', climb: 'the gap over the portal stone' };
const gear = DeepMechanisms.lines({ site: 'n_ud', levels: [], links: [{ id: 'n_back__n_foot', a: 'n_back', b: 'n_foot',
  kind: 'stair', name: 'the stair behind the portal stone', minutes: 3, mechanism: 'winch', between: true }] },
{ fate: '', oldup: '' }, { winch }).map(l => l.replace(/\bseized\b/g, 'jammed'));
const world = [
  'Place n "Newmeet" is settlement at 0, 0.',
  'Place n_green "the market-place" is room within n at 1, 1 outdoors.',
  'Place elsewhere "somewhere else" is room.',
  'Person n_innkeeper "Sable" at n_green { Role "herb-wife". Ancestry human. Peaceable. }',
  'Person n_priest "Ida" at n_green { Role "shrine-keeper". Ancestry human. Peaceable. }',
  ...RegionWoods.lines({ id: 'n', name: 'Newmeet' } as Settlement, { w: 'n_ud', site: 'the old dead', old: 'the Barrow-Kin' }),
  'Place n_mouth "the forecourt" is room within n at 1, 8 underground.',
  'Place n_back "the back-stone" is room within n at 1, 9 underground.',
  'Place n_foot "the foot of the stair" is room within n at 1, 10 underground.',
  'Passage n_in "the way in" is tunnel between n_ud and n_mouth taking 2 minutes.',
  'Passage n_long "the long passage" is tunnel between n_mouth and n_back taking 6 minutes.',
  ...gear, 'Company party "You" of 1 at n_green.', 'Goal false.',
].join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
describe('World › The way made sure', () => {
  it('takes a second expedition down to where the first made sure, in one act, by the same legs', async () => {
    const t = await Tiny.start(world, { party, horizon: ['inhabitants', 'probing', 'belongings'] });
    // The first expedition: through the woods and under the stones, room by room, and the counterweight levered free.
    await t.play('>t__n_wood_edge', '>t__n_wood_ride', '>t__n_wood_stones', '>t__n_back');
    await t.play('Lever the jammed counterweight free', '>t__n_foot');
    const first = t.campaign.history.filter(e => e.action.startsWith('go(')).map(e => e.action.split(',')[1]);
    // From the foot of the stair the way out is the way the company made sure, gone up (OR-1862).
    expect(t.glance.compass?.out?.secured).toBe(true);
    // The stair under the stones is dark: the torch lit before setting out burns on the way down.
    await t.play('>t__n_green', '=day 2 08:00', 'a torch: Light');
    // The second, the next morning: one row, among the walks about the town, and one act.
    const row = [...t.glance.offer!.primary, ...t.glance.offer!.rest].find(o => o.command === 'travel:t__n_foot');
    expect(row?.label).toBe('Down to the foot of the stair');
    const from = t.campaign.history.length;
    await t.perform('travel:t__n_foot');
    expect(t.session.journeyed?.stopped).toBeUndefined();
    expect(t.where()).toBe('t__n_foot');
    const legs = t.campaign.history.slice(from).map(e => e.action.split(',')[1]);
    expect(legs).toEqual(first.slice(0, legs.length));
    expect(legs.at(-1)).toBe('t__n_back__n_foot');
    expect(JSON.stringify(t.leaf)).toContain('the foot of the stair');
  });
});
