import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';
import { Tiny } from '../support/tiny';

// Haggling (the owner, 15 November: a skill check and a discount): one argument with a trader over everything on the
// shelf, once (OR-1852: a haggle for each ware had made a store's trade twenty-one rows longer than its wares). A good
// argument takes a coin off each ware, a poor one adds a coin to each and ends the matter. In the trade probe a scholar
// sells three torches for two coin: one haggle is offered, whatever the roll then no more, and every torch is priced
// by it.
describe('haggling over a price', () => {
  it('is offered once for the trader, and every ware is then priced by what the argument left it', async () => {
    const t = await Tiny.start(readFileSync('test/fixtures/probes/trade/site.kyr', 'utf8'),
      { horizon: ['services'], seed: 'journey',
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    const j = Journey.of(t.session);
    const haggles = () => j.choices().filter(c => /^Haggle\b/.test(c.label));
    expect(haggles().map(c => c.label)).toEqual([expect.stringMatching(/^Haggle with Teodor Halm · .* · one try$/)]);
    const halm = /^haggle_wares\(([^,)]+)/.exec(haggles()[0]!.command ?? '')![1]!;
    await j.play(haggles()[0]!.label);
    expect(haggles()).toEqual([]);
    const prices = t.session.campaign.world.related('soldBy').filter(r => r.args[1] === halm)
      .map(r => j.measure('price', r.args[0]!));
    expect(prices.length).toBe(3);
    // Every torch moved the same way: one coin, or three.
    expect(new Set(prices).size).toBe(1);
    expect([1, 3]).toContain(prices[0]!);
    const gold = j.measure('quantity', 'party', 'gold');
    const buy = j.choices().find(c => /^Buy a torch/.test(c.label))!;
    await j.play(buy.label);
    expect(gold - j.measure('quantity', 'party', 'gold')).toBe(prices[0]!);
  }, 30000);
});
