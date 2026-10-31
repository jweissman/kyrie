import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Countries } from '../src/world/countries';
import { ProvincePlay } from './support/province-play';

// The Quiet in the Sky in a generated world (doc/adventures/the-quiet-in-the-sky), a province of its first country
// (Gate B: one country, every adventure in it): an ordinary wanderer hears of Larum from whoever keeps travellers in a
// town of the country, walks the road to its way in, and comes up the valley road.
describe('The Quiet in the Sky in the world', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'larum')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'larum')).toBe(false);
  });

  it('is heard of in the country, walked into up the valley road, and goes on after its chapter closes', async () => {
    const { s, c, told, came, rid } = await ProvincePlay.enter('q335', 'larum',
      { origin: 'wanderer', region: { terrain: 'marsh' }, party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    // Whoever keeps travellers tells of the hamlet, and the quiet.
    expect(told).toContain("can't sleep for the quiet");
    expect(c.installations.find(m => m.id === rid)?.chapter).toBe(true);
    const k = (id: string) => `${rid}__${id}`;
    const holds = (name: string, ...args: string[]) => c.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
    const j = Journey.of(s);
    expect(c.world.one('at', 'party')).toBe(k('march_road'));
    expect(came).toMatch(/turf-roofed houses/);
    // Up to the Field with nothing but what the world gave: the Teller has no column for breathing.
    await j.play('To Larum street', "Into the guide's house", 'Pay Jory Whitlock six coin');
    expect(c.world.one('at', 'party')).toBe(k('snow_gate'));
    expect(j.page).toMatch(/no column for breathing/);
    expect(holds('cameUp', 'party')).toBe(true);
    // Left alone, the Testing is fought without the company, everyone gets up, and the Daily comes back; the chapter
    // closes, the world goes on, and Larum hears the sky again.
    await j.play('Through to the White', 'To the foot of the Pass', 'To Larum street', 'Into the Hark', '=+900');
    expect(holds('outcomeDaily', 'field_country')).toBe(true);
    expect(c.running).toBe(true);
    expect(c.world.related('stale').length).toBeGreaterThan(0);
    expect(j.page).toMatch(/iron on iron/);
    // Walked back up afterwards: the Daily on the Field, and where Halt was, nothing.
    await j.play('Out to Larum street', 'To the foot of the Pass', 'To the White', 'Through to the Coming-in');
    expect(j.page).toMatch(/roar of the Daily/);
    await j.play('To the southern Field', 'To Trophy Row');
    expect(j.page).toMatch(/churned snow/);
    if (process.env.LARUM_TRANSCRIPT) {
      await Bun.write('doc/adventures/the-quiet-in-the-sky/playtest/world-wanderer.txt',
        j.taken.map(t => t.page).join('\n\n').replace(/(\[Wait › An hour\] An hour passes\.\n\n)+/g, '[… waited many hours …]\n\n'));
    }
  }, 900000);
});
