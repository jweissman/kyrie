import { describe, expect, it } from 'bun:test';
import type { Journey } from '../src/session/journey';
import { City, Q } from './support/quittance';

// The Scuttled Barge (doc/adventures/quittance/quests/barge.md), continued from quittance-barge.test.ts: the others on
// the Reach (the owner, the two salvor crews, Mr Orpwood) and what they say of the Margaret.
const person = (name: string, classId: string) => ({ name, raceId: 'human', classId });
const plain = {};
const start = (seed: string, party: object = plain, way: string[] = City.honest) =>
  City.start(seed, party).then(async j => { await j.play(...way); return j; });
const has = (j: Journey, relation: string, ...args: string[]) => City.has(j, relation, ...args);
const ruling = (j: Journey) => j.measure(Q('bg_ruling'), Q('lamprey'));

describe('The Scuttled Barge: the others on the Reach', () => {
  it('the owner is not moved by evidence: the count and the manifest laid before her change nothing', async () => {
    const j = await start('d', { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] });
    await j.play('>quittance__lighter_stairs', 'tally-board: Examine', '>quittance__lamprey_floor', 'manifest: Examine', 'Set the Margaret.s manifest');
    expect(City.knows(j, 'bg_count_short')).toBe(true);
    await j.play('>quittance__mere_wharf', 'Lay the manifest and the count');
    expect(City.page(j)).toContain('weather');
    expect(has(j, 'bg_veasey_yielded', 'party')).toBe(false);
    expect(City.knows(j, 'd_barge_girl')).toBe(false);
    // The count is good for a salvage, and for the Captain; it is not a key to the cellar.
    await j.play('>quittance__sluice_room');
    expect(j.offers('Down to the Sluice-tap')).toBe(false);
  }, 300000);

  it('Nan Grindle and Josiah Skell talk of their claims', async () => {
    const j = await start('d', plain);
    await j.play('>quittance__salvor_yard', 'Talk to Nan', 'Ask Nan Grindle for the Yard', 'Ask Grindle why Skell');
    expect(City.said(j)).toContain('pump');
    expect(j.offers('how the Yard is faring')).toBe(false);
    await j.play('>quittance__skell_yard', 'Talk to Josiah', 'Ask Josiah Skell about his claim', 'Ask Skell what is under');
    expect(City.said(j)).toContain('Rain');
    expect(j.offers('how Skell and Sons are faring')).toBe(false);
  }, 300000);

  it('and, once the Margaret is called as agreed, of how they fare; the Stairs, which were not asked, have an opinion', async () => {
    const j = await start('d', { party: [person('Bran', 'warrior'), person('Orrin', 'mage'), person('Lys', 'bard')] });
    await j.play('>quittance__salvor_yard', 'Examine', '>quittance__lighter_stairs', 'tally-board: Examine',
      '>quittance__lamprey_floor', 'manifest: Examine', 'Set the Margaret.s manifest', '>quittance__dree_room', 'Bargain Captain Dree down', 'Strike a bargain');
    expect(ruling(j)).toBe(3);
    await j.play('>quittance__salvor_yard', 'Ask Nan Grindle how the Yard is faring');
    expect(City.said(j)).toContain('lightermen');
    await j.play('>quittance__skell_yard', 'Ask Skell how Skell and Sons are faring');
    expect(City.said(j)).toContain('complain');
    await j.play('>quittance__lamprey_floor', 'Ask Mr Orpwood how the Margaret stands');
    expect(City.said(j)).toContain('right size');
    await j.play('>quittance__lighter_stairs');
    expect(City.page(j)).toContain('nods to you');
  }, 400000);

  it('Orpwood, asked what he will call it, says; asked about the Margaret after she is called, he says that too', async () => {
    const j = await start('d', plain);
    await j.play('>quittance__lamprey_floor', 'Talk to Mr Orpwood', 'Ask Mr Orpwood how he will call');
    expect(City.said(j)).toContain('second day');
    expect(j.offers('as a colleague')).toBe(false);
    await j.play('=day 3 12:10');
    expect(ruling(j)).toBe(1);
    await j.play('>quittance__lamprey_floor');
    expect(j.offers('Ask Mr Orpwood how the Margaret stands')).toBe(false);
  }, 300000);
});
