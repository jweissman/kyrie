import { describe, expect, it } from 'bun:test';
import { Journey } from '../../src/session/journey';

// Haggling (the owner, 15 November: a skill check and a discount): the price of a ware on a shelf is argued once;
// a good argument takes a coin off it, a poor one adds a coin and ends the matter for that ware. In the trade probe a
// scholar sells torches for two coin: each ware can be haggled over once, whatever the roll, and then no more.
describe('haggling over a price', () => {
  it('is offered once for each ware, and the ware is then bought, at what the argument left it', async () => {
    const j = await Journey.start('test/fixtures/probes/trade/probe.campaign.json');
    const haggles = () => j.choices().filter(c => /^Haggle with Teodor Halm over the price of a torch/.test(c.label));
    const before = haggles().length;
    expect(before).toBeGreaterThan(0);
    expect(haggles()[0]!.label).toMatch(/one try/);
    await j.play(haggles()[0]!.label);
    expect(haggles().length).toBe(before - 1);
    const gold = j.measure('quantity', 'party', 'gold');
    const buy = j.choices().find(c => /^Buy › A torch/.test(c.label))!;
    await j.play(buy.label);
    // The company paid one of 1, 2 or 3 coin, never nothing.
    expect(gold - j.measure('quantity', 'party', 'gold')).toBeGreaterThanOrEqual(1);
    expect(gold - j.measure('quantity', 'party', 'gold')).toBeLessThanOrEqual(3);
  }, 30000);
});
