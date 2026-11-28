import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from './support/tiny';

// Gosse's Company's second pass (GOS-15): `Called` had named a band of beasts and not of people ("the first of the
// weir-rats"), and a proud band's price was asked in the singular ("The weir-rats takes it"). Both read as a band now.
describe('a band of people', () => {
  it('is called by its names, and paid as many', async () => {
    const j = (await Tiny.start(readFileSync('test/fixtures/probes/called-band/site.kyr', 'utf8'),
      { horizon: ['inhabitants'], seed: 'journey',
        party: [{ name: 'Pip', raceId: 'human', classId: 'thief' }] })).journey;
    const ids = j.campaign.readout.inhabitants['calledband__sons'] ?? [];
    expect(j.campaign.readout.creatures.filter(c => ids.includes(c.id)).map(c => c.name)).toEqual(['Abel', 'Cain', 'Seth']);
    await j.play('Wait a while');
    expect(j.offers("Pay Skell's sons the price named")).toBe(true);
    expect(await j.play('Pay')).toContain("You pay Skell's sons, and are let be.");
  }, 60000);
});
