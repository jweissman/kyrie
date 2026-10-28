import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Low Water's 14 and 15 (AUT-10): Halm bought finds and held no coin, so the page never offered him one, and said
// nothing; and a person who sells and is no trader was not on the page. One who buys has coin to buy with, ten times
// the most they pay, unless the module gives them their own: here a scholar who is no trader, and a carter given three.
describe('one who buys', () => {
  it('has coin to buy with, unless given their own, and one who sells is on the page though no trader', async () => {
    const j = await Journey.start('test/fixtures/probes/trade/probe.campaign.json');
    expect(j.offers('Teodor Halm, a scholar: Buy a torch')).toBe(true);
    expect([j.measure('quantity', 'p__halm', 'gold'), j.measure('quantity', 'p__dace', 'gold')]).toEqual([50, 3]);
    await j.play('coil of rope: Take');
    expect(j.offers('Dace, a carter: Sell a coil of rope')).toBe(false);
    await j.play('Teodor Halm, a scholar: Sell a coil of rope');
    expect(j.measure('quantity', 'party', 'gold')).toBe(25);
  }, 30000);
});
