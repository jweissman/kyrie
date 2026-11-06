import { describe, expect, it } from 'bun:test';
import { Bowl, L } from './support/low-water';

// Low Water, what the company is for (doc/imbar/adventures/low-water.md): the shipped warrior, bard and cleric (Edda,
// Corin, Thale), played by the labels a player sees. Nothing here is given, put or asserted.
const toWard = [...Bowl.arrive, '^To Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing'];

describe('Low Water, the cleric\'s office', () => {
  it('lets the shipped cleric still the Reflected by name, with no hymn learned and no bell fetched, and takes the approach back by two', async () => {
    const j = await Bowl.start('office');
    await j.play(...toWard, '=375');
    expect(j.measure(L('approach'), L('bowl'))).toBe(3);
    expect(j.holds('carries', 'party', L('ear_bell'))).toBe(false);
    expect(Bowl.knows(j, 'remainders_tones')).toBe(false);
    expect(j.offers('Say the office of the dead over the Reflected')).toBe(true);
    await j.play('Say the office of the dead over the Reflected');
    expect(j.measure(L('approach'), L('bowl'))).toBe(1);
    expect(j.holds(L('reflectedStilled'), L('bowl'))).toBe(true);
    expect(j.holds(L('officeSaid'), 'party')).toBe(true);
    expect(Bowl.pages(j)).toMatch(/own voice, once, very quietly: the name/);
    expect(j.offers('Say the office of the dead over the Reflected')).toBe(false);
  }, 300000);
  it('is not offered to a company that has no cleric, which has the hymn and the bell and nothing else', async () => {
    const j = await Journey_start();
    await j.play(...toWard, '=375');
    expect(j.measure(L('approach'), L('bowl'))).toBe(3);
    expect(j.offers('Say the office of the dead')).toBe(false);
  }, 300000);
});

describe('Low Water, Isaura at the water', () => {
  it('lets the truth send her up to sign the Finding alone, and the kindness keep her beside the company, unsigned', async () => {
    const t = await Bowl.start('isaura-truth');
    await t.play(...toWard, '=375');
    expect(t.holds('travelsWith', 'isaura', 'party')).toBe(true);
    expect(Bowl.pages(t)).toMatch(/Isaura Vant has stopped walking/);
    await t.play('Ask Isaura what she sees at the water', 'Tell her it is what the Office will make of her');
    expect(t.holds(L('isauraToldTruth'), 'isaura')).toBe(true);
    expect(t.holds(L('isauraSigns'), 'isaura')).toBe(true);
    expect(t.holds('travelsWith', 'isaura', 'party')).toBe(false);
    expect(t.at(L('isaura'))).toBe(L('office_hall'));
    expect(t.offers('Tell her it is only the water')).toBe(false);
    const k = await Bowl.start('isaura-kind');
    await k.play(...toWard, '=375', 'Ask Isaura what she sees at the water', 'Tell her it is only the water');
    expect(k.holds(L('isauraToldKindly'), 'isaura')).toBe(true);
    expect(k.holds(L('isauraSigns'), 'isaura')).toBe(false);
    expect(k.holds('travelsWith', 'isaura', 'party')).toBe(true);
    expect(k.offers('Tell her it is what the Office will make of her')).toBe(false);
  }, 300000);
});

describe('Low Water, what the company hears', () => {
  it('has the warrior count the bailiffs, the bard hear the nave and the Moot Hall, and the cleric the Ward well, once each', async () => {
    const j = await Bowl.start('voices');
    await j.play(...Bowl.arrive, '^To Measures Square');
    await j.play('>nave');
    expect(j.holds(L('heardNave'), 'party')).toBe(true);
    await j.play('>quill_outer');
    expect(j.holds(L('heardBailiffs'), 'party')).toBe(true);
    await j.play('>moot_hall');
    expect(j.holds(L('heardMoot'), 'party')).toBe(true);
    await j.play('>ward_well');
    expect(j.holds(L('heardWardWell'), 'party')).toBe(true);
    expect(Bowl.pages(j).match(/Three chairs face the room/g)?.length).toBe(1);
  }, 300000);
  it('says none of it to a company without the calling', async () => {
    const j = await Journey_start();
    await j.play(...Bowl.arrive, '^To Measures Square', '>nave', '>quill_outer');
    expect(j.holds(L('heardNave'), 'party')).toBe(false);
    expect(j.holds(L('heardBailiffs'), 'party')).toBe(true);
    expect(j.holds(L('heardWardWell'), 'party')).toBe(false);
  }, 300000);
});

// A company of a warrior, a thief and a mage: no bard, no cleric.
async function Journey_start() {
  const { Journey } = await import('../src/session/journey');
  return Journey.start('data/campaigns/low-water.campaign.json', 'no-cleric', {
    party: [{ name: 'Edda', raceId: 'human', classId: 'warrior' }, { name: 'Fenn', raceId: 'human', classId: 'thief' },
      { name: 'Ivo', raceId: 'human', classId: 'mage' }] });
}
