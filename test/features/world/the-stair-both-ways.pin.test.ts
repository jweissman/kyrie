import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The stair says which way it goes (cold round
// E5, 28 November, OR-1859): at the fallen stones under the beeches the stair down had been offered as "Out to the
// stair under the fallen stones", the words the adit mouth below rightly says for the way up, so that a player going
// in read that they were leaving. A way's words say down where it goes down out of a place (the old woods, a site),
// up where it comes up out of the ground into one, and out only where it leaves at the same depth. The reference
// woods' stair as RegionWoods and the deep sites lay it: the stones a room of the woods, the stair's head a room under
// the town four storeys down, and the old dead a site of its own beyond it.
const kyr = ['Place nm "Newmeet" is settlement at 0, 0.',
  'Place wood "the old woods above Newmeet" is site within nm at 0, 4.',
  'Place ride "the old ride" is room within wood at 1, 1 outdoors.',
  'Place stones "the fallen stones under the beeches" is room within wood at 1, 0 outdoors.',
  'Place head "the stair under the fallen stones" is room within nm at 1, 7 underground 4 down.',
  'Place dead "the old dead under the old woods" is site within nm at 2, 7.',
  'Place adit "the adit level" is level within dead.',
  'Place mouth "the adit mouth" is room within adit at 0, 1 underground.',
  'Passage slope "the slope up to the stones" is path between ride and stones taking 30 minutes.',
  'Passage slot "the dark slot between the fallen stones" is stair between stones and head.',
  'Passage in "the way in" is tunnel between head and mouth taking 2 minutes.',
  'Company party "You" of 1 at stones.',
  'Goal false.'].join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
// The words of the way to a place, as every client draws them: the journey's rows and the engine's offer alike.
const words = (t: Tiny, to: string) => {
  const rows = t.journey.choices().filter(c => c.command === `go(t__party,t__${to})`);
  const offer = t.look().glance.offer;
  const offered = [...offer?.primary ?? [], ...offer?.rest ?? []].filter(o => o.choice === `exit:t__${to}`);
  return [...new Set([...rows, ...offered].map(r => r.label))];
};
describe('World › The stair says which way it goes', () => {
  it('goes down from the stones, up from its head, and out only from the adit mouth', async () => {
    const t = await Tiny.start(kyr, { party, horizon: [] });
    expect(words(t, 'head')).toEqual(['Down to the stair under the fallen stones']);
    expect(words(t, 'ride')).toEqual(['To the old ride']);
    await t.play('Down to the stair under the fallen stones');
    expect(t.where()).toBe('t__head');
    expect(words(t, 'stones')).toEqual(['Up to the fallen stones under the beeches']);
    expect(words(t, 'mouth')[0]).toMatch(/^Into the old dead under the old woods/);
    await t.play('^Into the old dead');
    expect(t.where()).toBe('t__mouth');
    // From the adit mouth the way to the stair's head leaves the old dead at the same depth: out, rightly.
    expect(words(t, 'head')).toEqual(['Out to the stair under the fallen stones']);
    await t.play('Out to the stair under the fallen stones', 'Up to the fallen stones under the beeches');
    expect(t.where()).toBe('t__stones');
  });
});
