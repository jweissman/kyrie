import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Countries } from '../src/world/countries';
import { ProvincePlay } from './support/province-play';

// Behind the Wainscot in a generated world (doc/adventures/behind-the-wainscot), a province of its first country
// (Gate B: one country, every adventure in it): an ordinary wanderer hears of Hollins from whoever keeps travellers in
// a town of the country, and walks the moor road down into Bootscrape.
describe('Behind the Wainscot in the world', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'hollins')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'hollins')).toBe(false);
  });

  it('is heard of in the country, and walked into down the moor road, where the Lady has come home', async () => {
    const { s, c, told, came, rid } = await ProvincePlay.enter('kite', 'hollins',
      { origin: 'wanderer', party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    expect(told).toContain('ratcatcher');
    expect(c.installations.find(m => m.id === rid)?.chapter).toBe(true);
    const k = (id: string) => `${rid}__${id}`;
    const j = Journey.of(s);
    expect(c.world.one('at', 'party')).toBe(k('march_road'));
    expect(came).toMatch(/windows in it, each window as tall as a church/);
    await j.play('To Bootscrape street');
    expect(j.page).toMatch(/WANTED, A RATCATCHER/);
    await j.play('To the top of the doorstep', 'by the Slot', 'To the Letterdrift');
    expect(j.page).toMatch(/three hundred years of letters/);
  }, 900000);
});
