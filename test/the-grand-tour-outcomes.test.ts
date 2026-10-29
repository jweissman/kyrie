import { describe, expect, it } from 'bun:test';
import { Sennet, steps } from './support/sennet';

// The Grand Tour's other ends (doc/adventures/the-grand-tour/08-playtests.md): each played by the labels a player sees,
// from test/fixtures/sennet/outcomes.json, by a company the route suits. The end each reaches is the one its choices
// earn, and the city after it is the one those choices left.
describe('The Grand Tour, other ends', () => {
  it('left alone: the rivals win the courts, the House\'s divers the Whelm, and the Rector brings Cloudgate down', async () => {
    const g = await Sennet.start();
    await g.until(1015);
    // The rivals' Fire and Earth went to her desk, the divers brought the Water, and the keel gave her the Air.
    expect(['fire_petal', 'earth_petal', 'water_petal', 'air_petal'].every(p => g.holds('rectorHas', p))).toBe(true);
    expect(g.holds('rectorTookKeel', 'quance')).toBe(true);
    expect(g.holds('cloudgateFell', 'sennet_bay')).toBe(true);
    expect(g.holds('perrinDead', 'party')).toBe(true);
    expect(g.ending()).toEqual(['sennet__end_second_whelming']);
  }, 600000);

  it('the Coming Down: a bard who warns the Whelm, then takes the petal out of the keel, and rides the hill down', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', 'fire', 'fabian_earth');
    await g.fixture('outcomes', 'coming_down');
    expect(g.holds('whelmEmptied', 'sennet_bay')).toBe(true);
    expect(g.holds('cloudgateFell', 'sennet_bay')).toBe(true);
    expect(g.holds('perrinDead', 'party')).toBe(false);
    expect(g.carries('air_petal')).toBe(true);
    expect(g.page).toContain('From on it, it is not slow at all');
    await g.play('>sennet__promenade');
    expect(g.page).toContain('The Promenade is a beach');
    await g.until(g.watch + 150);
    expect(g.ending()).toEqual(['sennet__end_coming_down']);
  }, 600000);

  it('the Undertow: a labourer-warrior with no petals opens the Door from below in a day, by the Whelm\'s leave', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('warrior', 'laborer', 'human', 'Brann'));
    await g.fixture('outcomes', 'undertow');
    expect(g.holds('engineLeave', 'party')).toBe(true);
    expect(g.holds('perrinMoved', 'party')).toBe(true);
    expect(g.holds('openedBelow', 'sennet_bay')).toBe(true);
    expect(g.holds('firstThrough', 'party')).toBe(true);
    expect(g.holds('rectorBarred', 'quance')).toBe(true);
    expect(g.holds('whelmHostile', 'party')).toBe(false);
    expect(['fire_petal', 'earth_petal', 'water_petal', 'air_petal'].some(p => g.carries(p))).toBe(false);
    await g.until(g.watch + 150);
    expect(g.ending()).toEqual(['sennet__end_undertow']);
  }, 600000);

  it('Found Out: an acolyte with no petals and no silver tongue puts two witnesses before the Watch by the second morning', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('cleric', 'acolyte', 'human', 'Ama'));
    await g.fixture('outcomes', 'found_out');
    expect(g.knows('late_basket')).toBe(true);
    expect(g.knows('chapter_rewritten')).toBe(true);
    expect(g.knows('quance_pushed')).toBe(true);
    await g.play('=+7');
    expect(g.holds('rectorTaken', 'quance')).toBe(true);
    expect(g.watch).toBeLessThan(200);
    await g.until(1015);
    expect(g.ending()).toEqual(['sennet__end_found_out']);
  }, 600000);

  it('the Rector\'s Door: the obedient Tourist hands her all four petals, and she goes through first and does not come back', async () => {
    const g = await Sennet.start();
    await g.play(...steps('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate', 'air', 'made'));
    await g.fixture('outcomes', 'rectors_door');
    expect(g.holds('rectorThrough', 'quance')).toBe(true);
    expect(g.holds('firstThrough', 'party')).toBe(false);
    expect(g.holds('madeSet', 'sennet_bay')).toBe(true);
    await g.until(g.watch + 150);
    expect(g.ending()).toEqual(['sennet__end_rectors_door']);
  }, 600000);
});
