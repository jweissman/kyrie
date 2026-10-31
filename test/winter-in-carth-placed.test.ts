import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Countries } from '../src/world/countries';
import { ProvincePlay } from './support/province-play';

// A Winter in Carth in a generated world, a province of its first country (Gate B: one country, every adventure in
// it): an ordinary wanderer hears of Gaunt from whoever keeps travellers in a town of the country, walks the road to
// its way in, and comes to the Penitent's Cross, where a beadle sits with his foot in his hat.
describe('A Winter in Carth in the world', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'gaunt')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'gaunt')).toBe(false);
  });

  it('heard of in the country, and walked into by its road as a chapter of the world', async () => {
    const { s, c, told, came, rid } = await ProvincePlay.enter('g5', 'gaunt',
      { origin: 'wanderer', region: { terrain: 'frost' }, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    // Whoever keeps travellers tells of Gaunt and its heretic.
    expect(told).toContain("where they'll sell you somebody else's penance by the day");
    expect(c.installations.find(m => m.id === rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    expect(c.world.one('at', 'party')).toBe(`${rid}__cross_road`);
    expect(came).toMatch(/FOR THE FAULTS OF ANOTHER/);
    await j.play('Talk to Beadle', 'Ask the beadle what the commission', 'Take Ninian Hern into your custody');
    expect(j.page).toMatch(/My custodian/);
    // Left to itself, Ash Day comes; the chapter closes on an ending, and the world goes on.
    for (let i = 0; i < 120 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${rid}__put_out`]);
    expect(c.running).toBe(true);
  }, 600000);
});
