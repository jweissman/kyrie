import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import tower from '../../data/generation/works/great_watchtower.kyrt' with { type: 'text' };

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
    for (const t of [mage, warrior]) { await t.play('Wait until dark'); }
    expect(sky(mage)).toMatchObject({ emblem: 'sign_scythe', name: 'Scythe', relevant: true });
    expect(sky(mage)!.said).toMatch(/moon.*, and the Scythe rising\.$/);
    // What it reports is said beside it, and what the sign named means (TP-04).
    expect(sky(mage)).toMatchObject({ label: 'Sky' });
    expect(sky(mage)!.gloss).toMatch(/moon's age.*Scythe: /);
    expect(sky(warrior)!.gloss).not.toMatch(/Scythe/);
    expect(sky(warrior)!.said).not.toMatch(/Scythe/);
    expect(sky(warrior)!.said).toMatch(/moon/);
    // Under a roof, no sky.
    await mage.play('To the barn');
    expect(sky(mage)).toBeUndefined();
  });
  // The sign chosen at creation is the one made's, kept on them (OR-13: it had reached no creature, and a world
  // started under any sign was the same), and the sky names it as theirs when it rises.
  it('keep the sign the one made was born under, and name it as theirs when it rises', async () => {
    const born = (sign: string) => Tiny.start(field, { party: [{ name: 'Wat', raceId: 'human', classId: 'mage', sign }],
      calendar: { year: 1312, month: 6, day: 5 } });
    const scythe = await born('sign_scythe'), bear = await born('sign_bear');
    expect(scythe.campaign.readout.creatures.find(c => c.name === 'Wat')!.sign).toBe('sign_scythe');
    for (const t of [scythe, bear]) { await t.play('Wait until dark'); }
    const said = (t: Tiny) => t.leaf.instruments!.find(i => i.id === 'sky')!.said;
    expect(said(scythe)).toMatch(/, and the Scythe rising, your own sign\.$/);
    expect(said(bear)).toMatch(/, and the Scythe rising\.$/);
    await expect(born('sign_nowhere')).rejects.toThrow(/Unknown sign/);
  });  it('lets Astronomy earned in the world read the rising sign', async () => {
    const t = await Tiny.start(`${field}
      Initially Assert granted(party, lore).
      Initially Set grantedUntil(party, lore) to 6.
      ${tower.slice(tower.indexOf('  Thing {w}_rings'), tower.indexOf('  Person {w}_reckoner'))
        .replaceAll('{w}_orrery', 'field').replaceAll('{w}', 'tower')}`,
    { party: [{ name: 'Wat', raceId: 'human', classId: 'warrior' }],
      calendar: { year: 1312, month: 6, day: 5 } });
    await t.play('Turn the orrery on to tonight, by the count', 'Wait until dark');
    expect(t.journey.holds('granted', 'party', 'lore')).toBe(false);
    expect(t.journey.holds('granted', 'party', 'astronomy')).toBe(true);
    const sky = t.leaf.instruments!.find(i => i.id === 'sky')!;
    expect(sky).toMatchObject({ emblem: 'sign_scythe', relevant: true });
  });  it('count the provisions exactly, and bring them forward as night comes on', async () => {
    const t = await at('warrior'), food = () => t.leaf.instruments!.find(i => i.id === 'provisions')!;
    expect(food().said).toMatch(/^Food for \\d+ days?|^No food/);
    await t.play('Wait until dark');
    expect(food().relevant).toBe(true);
  });
});
