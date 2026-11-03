import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Gosse's Company's second pass (GOS-15): `Called` had named a band of beasts and not of people ("the first of the
// weir-rats"), and a proud band's price was asked in the singular ("The weir-rats takes it"). Both read as a band now.
describe('a band of people', () => {
  it('is called by its names, and paid as many', async () => {
    const j = await Journey.start('test/fixtures/probes/called-band/probe.campaign.json');
    const ids = j.campaign.readout.inhabitants['p__sons'] ?? [];
    expect(j.campaign.readout.creatures.filter(c => ids.includes(c.id)).map(c => c.name)).toEqual(['Abel', 'Cain', 'Seth']);
    await j.play('Wait › A while');
    expect(j.offers("Pay Skell's sons the price named")).toBe(true);
    expect(await j.play('Pay')).toContain("You pay Skell's sons, and are let be.");
  }, 60000);
});
