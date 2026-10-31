import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Countries } from '../src/world/countries';
import { ProvincePlay } from './support/province-play';

// The Lull in a generated world (doc/adventures/the-lull), a province of the first country (Gate B:
// one country, every adventure in it): an ordinary wanderer hears of the Lull from whoever keeps travellers in a town
// of the country, walks the road to its way in, and comes to the march road at Sixways.
describe('The Lull in the world', () => {
  it('is a province of every first country, its way in on the country\'s own land', () => {
    expect(Countries.provinces.some(c => c.id === 'lull')).toBe(true);
    expect(Countries.marches.some(c => c.id === 'lull')).toBe(false);
  });

  it('is heard of in the country, walked into by its road, and keeps its own sennight', async () => {
    const { s, c, told, came, k } = await ProvincePlay.enter('l127', 'lull',
      { origin: 'wanderer', region: { terrain: 'forest' }, party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    expect(told).toContain('one day in seven');
    expect(c.installed).toContain('plull');
    const j = Journey.of(s);
    expect(c.world.one('at', 'party')).toBe(k('march_road'));
    expect(came).toMatch(/a hamlet of one street/);
    // The board by the pump counts the days to the Lull; the stone waits for it; the road goes down at six.
    await j.play('Sixways street$');
    expect(j.page).toMatch(/LULL IN \d/);
    await j.play('To the Fold-stone$');
    expect(j.matches("To the Tump's shoulder").length).toBe(0);
    await j.play('Sit down by the Fold-stone');
    expect(j.matches("To the Tump's shoulder").length).toBe(1);
    expect(j.page).toMatch(/another road, going down/);
    await j.play("To the Tump's shoulder", 'To Linger green');
    expect(c.world.test({ kind: 'call', name: k('cameIn'), args: ['party'] })).toBe(true);
    expect(j.page).toMatch(/Long Table/);
  }, 900000);

  it('played through to the Seventh Day in the world, closes its chapter and not the book, and is changed when walked back into', async () => {
    const { s, c, k } = await ProvincePlay.enter('l127', 'lull',
      { origin: 'wanderer', region: { terrain: 'forest' }, party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    const holds = (name: string, ...args: string[]) => c.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
    const j = Journey.of(s);
    const file = await Bun.file('test/fixtures/the-lull/seventh.json').json() as Record<string, string[]>;
    for (const steps of Object.values(file)) { await j.play(...steps); }
    expect(holds('outcomeSeventh', 'lull_country')).toBe(true);
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([k('seventh_day')]);
    expect(c.running).toBe(true);
    // The word in the country behind it is old news now.
    expect(c.world.related('stale').length).toBeGreaterThan(0);
    // Come back to it a day later: the bridge stands, the road is open on an ordinary day, the stone says so.
    await j.play('=+60', 'To Linger green', "To the Tump's shoulder", 'To the Fold-stone');
    expect(j.page).toMatch(/AND THEN MONDAY/);
    await j.play("To the Tump's shoulder", 'To Linger green', 'To the end of the Shift Bridge');
    expect(j.page).toMatch(/goes over the mill-leat again/);
    expect(j.page).toMatch(/Monday, and After|weighbridge house/);
  }, 900000);
});
