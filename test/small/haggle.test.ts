import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';
import { Tiny } from '../support/tiny';

// Haggling (the owner, 15 November: a skill check and a discount): the price of a ware on a shelf is argued once;
// a good argument takes a coin off it, a poor one adds a coin and ends the matter for that ware. In the trade probe a
// scholar sells torches for two coin: each ware can be haggled over once, whatever the roll, and then no more. It is
// the trader's, beside what they sell ("Haggle for a torch"), not the ware's own row (the owner's playtest, 25 Nov).
describe('haggling over a price', () => {
  it('is offered once for each ware, and the ware is then bought, at what the argument left it', async () => {
    const t = await Tiny.start(readFileSync('test/fixtures/probes/trade/site.kyr', 'utf8'),
      { horizon: ['services'], seed: 'journey',
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    const j = Journey.of(t.session);
    const haggles = () => j.choices().filter(c => /^Haggle (with Teodor Halm )?for a torch/.test(c.label));
    expect(haggles().length).toBeGreaterThan(0);
    const first = haggles()[0]!;
    expect(first.label).toMatch(/one try/);
    await j.play(first.label);
    // That torch's price is argued: its haggle is offered no more (another torch's may be).
    expect(j.choices().some(c => c.command === first.command)).toBe(false);
    const gold = j.measure('quantity', 'party', 'gold');
    const buy = j.choices().find(c => /^Buy › A torch/.test(c.label))!;
    await j.play(buy.label);
    // The company paid one of 1, 2 or 3 coin, never nothing.
    expect(gold - j.measure('quantity', 'party', 'gold')).toBeGreaterThanOrEqual(1);
    expect(gold - j.measure('quantity', 'party', 'gold')).toBeLessThanOrEqual(3);
  }, 30000);
});
