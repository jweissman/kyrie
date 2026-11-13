import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Instruments of observation, earned and honest (the owner, 14 November: RI-04). The sky is read only in the open:
// its moon by anyone at night, the sign rising this month (Imbar's sky, a sign a month) only by one who reads the
// stars (lore, or wayfinding); by day it bears on nothing, and under a roof or the ground there is none. The
// provisions are counted exactly, and bear on the moment as night comes on. A field on the fifth of Haysel at dusk,
// a barn beside it, and a mage and a warrior to read the sky.
const field = `
  Place field "the stubble field" is room at 0, 0 outdoors.
  Place barn "the barn" is room at 1, 0.
  Passage door "the barn door" is path between field and barn.
  Company party "You" of 1 at field.`;
const at = (calling: string) => Tiny.start(field, { party: [{ name: 'Wat', raceId: 'human', classId: calling }],
  calendar: { year: 1312, month: 6, day: 5 } });
describe('the company\'s instruments', () => {
  it('read the sky by night to one who knows it, the moon to anyone, and nothing by day or indoors', async () => {
    const mage = await at('mage'), warrior = await at('warrior');
    const sky = (t: Tiny) => t.leaf.instruments!.find(i => i.id === 'sky');
    // By day, nothing to read, and it bears on nothing.
    expect(sky(mage)).toMatchObject({ said: 'Daylight.', relevant: false });
    for (const t of [mage, warrior]) { await t.play('Wait › Until dark'); }
    expect(sky(mage)).toMatchObject({ emblem: 'sign_scythe', relevant: true });
    expect(sky(mage)!.said).toMatch(/moon.*, and the Scythe rising\.$/);
    expect(sky(warrior)!.said).not.toMatch(/Scythe/);
    expect(sky(warrior)!.said).toMatch(/moon/);
    // Under a roof, no sky.
    await mage.play('To the barn');
    expect(sky(mage)).toBeUndefined();
  });
  it('count the provisions exactly, and bring them forward as night comes on', async () => {
    const t = await at('warrior'), food = () => t.leaf.instruments!.find(i => i.id === 'provisions')!;
    expect(food().said).toMatch(/^Food for \\d+ days?|^No food/);
    await t.play('Wait › Until dark');
    expect(food().relevant).toBe(true);
  });
});
