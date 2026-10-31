import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Countries } from '../src/world/countries';
import { ProvincePlay } from './support/province-play';

// Fair Weather in a generated world, a province of its first country (Gate B: one country, every adventure in it): an
// ordinary wanderer hears of the Gannet Reach from whoever keeps travellers in a town of the country, walks the road
// to its way in, and comes to the coast road above Skeel.
describe('Fair Weather in the world', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'skeel')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'skeel')).toBe(false);
  });

  it('heard of in the country, and walked into by its road as a chapter of the world', async () => {
    const { s, c, told, came, rid, k } = await ProvincePlay.enter('wren', 'skeel',
      { origin: 'wanderer', region: { terrain: 'mountain' }, party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    // Whoever keeps travellers tells of the Reach, its wreck, and the dog.
    expect(told).toContain("They say there's a dog");
    expect(c.installations.find(m => m.id === rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    expect(c.world.one('at', 'party')).toBe(k('coast_road'));
    expect(came).toMatch(/nine miles of shining water, or of shining sand/);
    // Its clock begins the next morning: the tide-board and the Court run from then, and the Court rises without the
    // company, closing the Reach's chapter and not the book.
    await j.play('^To Fore Street', '^Into the Admiral', 'Talk to Mother Jago', 'about the wreck');
    expect(j.page).toMatch(/walks straight onto Scarth Bank like a cow onto a cart/);
    for (let i = 0; i < 120 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${rid}__wreck`]);
    expect(c.running).toBe(true);
    // Coming back up Fore Street after: the Constancy's saint is on the Reeve's gable, and the Holm is Jack Cawse's.
    await j.play('^Out to Fore Street');
    expect(j.page).toMatch(/CONSTANT AND TRUE/);
    expect(c.world.one('at', `${rid}__cawse`)).toBe(`${rid}__lamp_room`);
  }, 900000);
});
