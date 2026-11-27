import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { RegionWoods } from '../../../src/world/region-woods';
import type { Settlement } from '../../../src/world/region-writer';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The stones in sight (the owner's playtest of
// 27 November: "a proper dungeon was hard to find, and I went in circles trying to find a point of interest"; OR-1501).
// The reference game's first dungeon is a named, seen place, never found by circling: by day the fallen stones are in
// sight from the old ride, with a deer-path up to them, whoever has asked anyone or not; and standing among them the
// way down between two of them is in plain sight, nothing searched for. Asked about the woods, the herb-wife's word
// leads straight there (the aim's gold to the stones, then down), not round by the shrine-keeper's question, which
// tells what lies under them, not the way. The woods as data/generation/town/woods.kyrt writes them (RegionWoods), in
// a fragment: a heart, the herb-wife, the shrine-keeper, and nowhere else.
const woods = [
  'Place n "Newmeet" is settlement at 0, 0.',
  'Place n_green "the market-place" is room within n at 1, 1 outdoors.',
  'Place elsewhere "somewhere else" is room.',
  'Person n_innkeeper "Sable" at n_green { Role "herb-wife". Ancestry human. Peaceable. }',
  'Person n_priest "Ida" at n_green { Role "shrine-keeper". Ancestry human. Peaceable. }',
  ...RegionWoods.lines({ id: 'n', name: 'Newmeet' } as Settlement, { w: 'n_ud', site: 'the old dead', old: 'the Barrow-Kin' }),
  'Company party "You" of 1 at n_green.', 'Goal false.',
].join('\n');
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name, args });
describe('World › The stones in sight', () => {
  it('shows the stones from the ride, and the way down between them, to one who has asked nobody', async () => {
    const t = await Tiny.start(woods);
    const knows = (f: string) => t.world.test(call('knows', 'party', `t__n_${f}`));
    const ways = () => t.journey.choices().map(c => c.command).filter(c => c.startsWith('go('));
    await t.play('>t__n_wood_edge', '>t__n_wood_ride');
    expect(knows('wood_stones_known')).toBe(true);
    expect(t.journey.seen()).toMatch(/Grey stones lie in a broken row/);
    expect(ways().some(w => w.endsWith(',t__n_wood_stones)'))).toBe(true);
    await t.play('>t__n_wood_stones');
    // Seen, not searched for: the steps between the stones, and the way down them.
    expect(t.journey.seen()).toMatch(/onto steps of dressed stone/);
    expect([knows('wood_door'), knows('ud_named')]).toEqual([true, false]);
    expect(ways().some(w => w.endsWith(',t__n_ud)'))).toBe(true);
    expect(t.campaign.history.some(e => e.action.startsWith('search'))).toBe(false);
  });
  // And among them the woods' one marvel (violet, the Atlas's wonder, met above ground: OR-1506): a stone that hums,
  // listened at, with the door the shrine-keeper asks after cut in its face.
  it('has a humming stone among them, whose cut door is the shrine-keeper\'s answer', async () => {
    const t = await Tiny.start(woods);
    await t.play('>t__n_wood_edge', '>t__n_wood_ride', '>t__n_wood_stones');
    expect(t.glance.acts.some(a => a.subject === 't__n_wood_doorstone' && a.aspects.includes('wonder'))).toBe(true);
    await t.play('^Listen at it');
    expect(t.journey.seen()).toMatch(/humming, very low/);
    expect(t.world.test(call('knows', 'party', 't__n_wood_mark'))).toBe(true);
  });
  it('leads the herb-wife\'s word straight to the stones and down, not round by the shrine', async () => {
    const t = await Tiny.start(woods);
    // The woods seen above the green first, the ground for asking after them (OR-1680).
    await t.play('Wait a while', 'Ask Sable about the old woods');
    const aims = () => t.campaign.module.objectives!.filter(o => t.world.test(o.when)).map(o => o.id);
    expect(aims()).toEqual(['t__n_wood_go']);
    await t.play('>t__n_wood_edge', '>t__n_wood_ride', '>t__n_wood_stones');
    expect(aims()).toEqual(['t__n_wood_below']);
    await t.play('>t__n_ud');
    expect(t.where()).toBe('t__n_ud');
    expect(aims()).toEqual([]);
    // What the shrine-keeper tells is what lies under them: the place's name, which the way down never needed.
    expect(t.world.test(call('knows', 'party', 't__n_ud_named'))).toBe(false);
  });
});
