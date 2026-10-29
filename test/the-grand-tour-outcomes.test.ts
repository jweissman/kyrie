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
    // The coffin goes off the rail all the same, and the House sends its chaplain.
    await g.play('>sennet__winch_floor', 'Go up in the basket, a friend', '>sennet__balustrade', '=day 3 12:05');
    expect(g.page).toContain('Brother Amis');
    expect(g.at('quance')).toBe('sennet__offstage');
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

  it('the Letter: a burglar picks the Dowager\'s escritoire by night, and the North Wind, given Ysabeau\'s letter, renews the gift', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('thief', 'burglar', 'elf', 'Wren'));
    await g.fixture('outcomes', 'letter');
    expect(g.holds('escritoirePicked', 'party')).toBe(true);
    expect(g.holds('sealBroken', 'party')).toBe(true);
    expect(g.holds('giftRenewed', 'sennet_bay')).toBe(true);
    expect(g.carries('north_feather')).toBe(true);
    await g.until(1015);
    // On the seventh night the Rector, with three petals, goes down to the keel and cannot take it.
    expect(g.holds('rectorBalked', 'quance')).toBe(true);
    expect(g.holds('cloudgateFell', 'sennet_bay')).toBe(false);
    expect(g.ending()).toEqual(['sennet__end_letter']);
  }, 600000);

  it('Kept Above: holding three petals of the Rose, the Tourist takes the Dowager\'s purse to keep the keel\'s secret', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', 'fire', 'fabian_earth', 'whelm');
    await g.fixture('outcomes', 'kept_above');
    expect(g.holds('bribed', 'party')).toBe(true);
    expect(g.gold()).toBeGreaterThanOrEqual(100);
    await g.until(1015);
    expect(g.holds('keelTried', 'quance')).toBe(false);
    expect(g.ending()).toEqual(['sennet__end_kept_above']);
  }, 600000);

  it('First Through: the petals given to the Rector, the Tourist stands aside at the keel on the seventh night', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate');
    await g.fixture('outcomes', 'accomplice');
    expect(g.holds('accomplice', 'party')).toBe(true);
    expect(g.holds('firstThrough', 'party')).toBe(true);
    expect(g.holds('rectorThrough', 'quance')).toBe(true);
    await g.until(1015);
    expect(g.holds('cloudgateFell', 'sennet_bay')).toBe(true);
    expect(g.ending()).toEqual(['sennet__end_accomplice']);
  }, 600000);

  it('the Keepsake: Mercy taken up the chain in a water-butt to see the lanterns, the Dowager on her knees, and sorry', async () => {
    const g = await Sennet.start();
    await g.play(...steps('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate', 'air'));
    await g.fixture('outcomes', 'lanterns');
    expect(g.holds('mercySawLanterns', 'mercy')).toBe(true);
    expect(g.holds('imogenSorry', 'imogen')).toBe(true);
    expect(g.holds('giftRenewed', 'sennet_bay')).toBe(true);
    // The Rector heard it too, and came for Perrin at two; the company was in the bell.
    expect(g.knows('rector_came')).toBe(true);
    expect(g.holds('perrinDead', 'party')).toBe(false);
    expect(g.page).toContain('Another night');
    await g.until(1015);
    expect(g.ending()).toEqual(['sennet__end_gift_renewed']);
  }, 600000);

  it('the same night, but the company stays up in the Air: the Rector comes to the air-bell at two, and nobody is there', async () => {
    const g = await Sennet.start();
    await g.play(...steps('tour', 'fire', 'fabian_earth', 'whelm', 'cloudgate', 'air'));
    await g.play(...steps('outcomes', 'lanterns').slice(0, -4), '=day 5 07:10', '>sennet__landing_stage',
      'Go down in the basket', '>sennet__fish_stairs');
    expect(g.holds('rectorHunted', 'quance')).toBe(true);
    expect(g.holds('perrinDead', 'party')).toBe(true);
    expect(g.page).toContain('on the bottom now');
  }, 600000);

  it('the Tour Unfinished: the Fire petal won and kept, and nothing else done; the Rector never has three', async () => {
    const g = await Sennet.start();
    await g.fixture('tour', 'fire');
    await g.until(1015);
    expect(g.holds('keelTried', 'quance')).toBe(false);
    expect(g.holds('cloudgateFell', 'sennet_bay')).toBe(false);
    expect(g.ending()).toEqual(['sennet__end_unopened']);
  }, 600000);
});

