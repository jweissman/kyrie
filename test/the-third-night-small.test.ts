import { describe, expect, it } from 'bun:test';
import { Wrayford, build, w } from './support/wrayford';

// The Third Night's small adventures, each played by the labels a player sees from the steps in test/fixtures/wrayford,
// and each checked for what it changed in the city and what it leads to later.

describe('The Third Night: the Liberty', () => {
  it('the hide, judged by its brand, and the bear-ward\'s boy sent home by a drover\'s whistle: the Abbess obliged, the knife given', async () => {
    const g = await Wrayford.start();
    await g.fixture('liberty', 'tull', 'court');
    expect(g.knows('hide_brand')).toBe(true);
    expect(g.holds('hideFor', 'ham')).toBe(true);
    expect(g.holds('hamGrateful', 'party')).toBe(true);
    expect(g.measure('abbessRegard', 'abbess')).toBe(1);
    await g.fixture('liberty', 'bears');
    expect(g.holds('robinHome', 'robin')).toBe(true);
    expect(g.at('robin')).toBe(w('tull_shop'));
    expect(g.page).toMatch(/takes the Tull knife/);
    // A drover who owes you speaks for the city when the captain comes.
    await g.until(360);
    expect(g.holds('hamSpoke', 'ham')).toBe(true);
    expect(g.measure('captainView', 'sefton')).toBe(1);
  }, 240000);
});

describe('The Third Night: kindnesses', () => {
  it('a proud widow\'s husband\'s tools brought home, and a dead boy\'s ring on the girl who was to marry him', async () => {
    const g = await Wrayford.start();
    await g.fixture('kindness', 'win');
    expect(g.holds('toolsHome', 'win')).toBe(true);
    expect(g.holds('winClaimTold', 'win')).toBe(true);
    // Helping her, you hear about a shirt that stank of lamp-oil: a thread of the mystery.
    expect(g.knows('pinch_shirt')).toBe(true);
    await g.fixture('kindness', 'ring');
    // A herdsman cannot argue a pawnbroker out of her ledger; eight coin can.
    expect(g.holds('triedPratt', 'party')).toBe(true);
    expect(g.holds('annisRing', 'annis')).toBe(true);
    expect(g.measure('temper', 'wray')).toBe(2);
  }, 240000);
});

describe('The Third Night: the offal cart', () => {
  it('for a monk: up the pier face, down on Pell\'s rope, into the Shambles before dawn, over the bridge by the Liberty\'s privilege', async () => {
    const g = await Wrayford.start(build('monk'));
    await g.fixture('cart', 'day1', 'night1');
    expect(g.holds('kempAgrees', 'party')).toBe(true);
    expect(g.at('wat_dead')).toBe(w('shambles'));
    await g.fixture('cart', 'dawn');
    expect(g.at('joss_dead')).toBe(w('tanyards'));
    expect(g.holds('cartFound', 'wray')).toBe(false);
    expect(g.holds('seenAtRail', 'party')).toBe(false);
    await g.fixture('cart', 'over');
    expect(g.holds('buriedByNight', 'wray')).toBe(true);
    await g.until(440);
    expect(g.ending()).toEqual([w('earth')]);
  }, 240000);
});

describe('The Third Night: the night of the rising', () => {
  it('for a thief: the flask in the ash, Pinch cornered, his day-book stolen, and the captain told at supper; she spares Maudie', async () => {
    const g = await Wrayford.start(build('thief'));
    await g.fixture('mystery', 'ash', 'pinch');
    expect(g.holds('pinchCowed', 'pinch')).toBe(true);
    expect(g.holds('ruling', 'ruled_tithe')).toBe(true);
    expect(g.knows('daybook_read')).toBe(true);
    expect(g.knows('fire_pinch')).toBe(true);
    expect(g.holds('inchboldNoted', 'party')).toBe(true);
    await g.fixture('mystery', 'captain');
    expect(g.holds('captainPinch', 'party')).toBe(true);
    expect(g.measure('captainView', 'sefton')).toBeGreaterThanOrEqual(2);
    await g.until(440);
    expect(g.holds('maudieTaken', 'maudie')).toBe(true);
    expect(g.holds('maudieHanged', 'maudie')).toBe(g.measure('captainView', 'sefton') < 3);
    expect(g.holds('pinchGone', 'pinch')).toBe(true);
  }, 240000);
});
