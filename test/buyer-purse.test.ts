import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from './support/tiny';

// Low Water's 14 and 15 (AUT-10): Halm bought finds and held no coin, so the page never offered him one, and said
// nothing; and a person who sells and is no trader was not on the page. One who buys has coin to buy with, ten times
// the most they pay, unless the module gives them their own: here a scholar who is no trader, and a carter given three.
describe('one who buys', () => {
  it('has coin to buy with, unless given their own, and one who sells is on the page though no trader', async () => {
    const j = (await Tiny.start(readFileSync('test/fixtures/probes/trade/site.kyr', 'utf8'),
      { horizon: ['services'], seed: 'journey',
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] })).journey;
    expect(j.offers('Teodor Halm, a scholar: Buy a torch')).toBe(true);
    expect([j.measure('quantity', 'trade__halm', 'gold'), j.measure('quantity', 'trade__dace', 'gold')]).toEqual([50, 3]);
    await j.play('coil of rope: Take');
    expect(j.offers('Dace, a carter: Sell a coil of rope')).toBe(false);
    await j.play('Teodor Halm, a scholar: Sell a coil of rope');
    expect(j.measure('quantity', 'party', 'gold')).toBe(25);
  }, 30000);
});
