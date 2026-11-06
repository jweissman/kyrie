import { describe, expect, it } from 'bun:test';
import { Hollins } from './support/hollins';

// Behind the Wainscot: the layer added in the broad pass (doc/imbar/adventures/hollins.md): voices by calling, the
// Winders'
// account (the eleven notches), the warrior's word to the Regiment, and the small depth and outward links.
describe('Behind the Wainscot: the Winders\' account and the warrior\'s word', () => {
  it('speaks to a warrior at the Long Clock, in the Hall, and at the Fort, and posts the quiet minute', async () => {
    const g = await Hollins.start();
    await g.play('To Bootscrape street', 'Into the Mat', '=10:10', 'Talk to Mrs Pyecroft', 'Ask Mrs Pyecroft about the position', 'Take Mrs', 'Take your leave',
      'Out to Bootscrape street', 'To the top of the doorstep', 'by the Slot', 'To the Letterdrift', 'To the Hall floor');
    expect(g.page).toMatch(/claw-marks|scored in long parallel strokes/);
    await g.play('To the foot of the Long Clock');
    expect(g.page).toMatch(/set a garrison by it/);
    expect(g.page).toMatch(/whale-oil, old brass, and wet wool/);
    await g.play('Search here');
    expect(g.knows('notch_tally')).toBe(true);
    expect(g.page).toMatch(/eleven of them, evenly spaced/);
    // The Market's quiet minute is posted before it is reached.
    await g.play('To the Hall floor', 'To the Skirting');
    expect(g.page).toMatch(/STALLS CLOSE AT TEN PAST FOUR FOR ONE MINUTE/);
  }, 240000);

  it('lets a warrior with the Regiment\'s word order it to stand easy, years before the Lady could', async () => {
    const g = await Hollins.start();
    await g.fixture('regiment');
    // The fixture marches the Regiment on Mrs Pyecroft; a company that does not tell the Captain that has the order
    // instead.
    const h = await Hollins.start();
    const steps = (await Bun.file('test/fixtures/hollins/regiment.json').json() as { in: string[] }).in;
    await h.play(...steps.slice(0, steps.indexOf('Tell Captain Ordinance')));
    expect(h.knows('regiment_orders')).toBe(true);
    expect(h.holds('regimentMarched', 'regiment')).toBe(false);
    expect(h.offered('Give the Regiment the order to stand easy')).toBe(true);
    await h.play('Give the Regiment the order to stand easy');
    expect(h.holds('orderedEasy', 'party')).toBe(true);
    expect(h.holds('standDown', 'regiment')).toBe(true);
    expect(h.page).toMatch(/Regiment\. The war is over\. The Colonel is home\. Stand easy/);
  }, 300000);

  it('does not offer the order before the Captain has given his orders', async () => {
    const h = await Hollins.start();
    const steps = (await Bun.file('test/fixtures/hollins/regiment.json').json() as { in: string[] }).in;
    await h.play(...steps.slice(0, steps.indexOf('Talk to Captain Ordinance')));
    expect(h.offered('Give the Regiment the order to stand easy')).toBe(false);
  }, 300000);

  it('tells the Lady the eleven notches, and she gives her chart of the northern coast, and the twelfth is scratched after', async () => {
    const g = await Hollins.start();
    await g.fixture('freehold', 'hired', 'saltash', 'hearth', 'readers', 'trap', 'answer');
    expect(g.holds('ladyKnows', 'lady')).toBe(true);
    await g.play('To the Library floor', 'To the Hall floor', 'To the foot of the Long Clock', 'Search here');
    expect(g.knows('notch_tally')).toBe(true);
    await g.play('To the Hall floor', 'To the Library floor', 'To the chart table');
    expect(g.at('lady')).toBe('hollins__chart_table');
    await g.play('Talk to the Lady', 'Tell the Lady about the eleven notches');
    expect(g.page).toMatch(/I was eleven\. I meant to do the twelfth/);
    expect(g.holds('notchesTold', 'lady')).toBe(true);
    expect(g.j.holds('holding', 'party', 'hollins_lady_map_kind')).toBe(true);
    await g.play('=day 11 02:00');
    expect(g.page).toMatch(/The twelfth notch was scratched at the foot of the Long Clock/);
  }, 600000);

  it('reads a world event on the Lady\'s chart, and says who might come in from outside', async () => {
    const closed = await Hollins.start();
    await closed.play('To Bootscrape street', 'Into the Mat', 'Talk to Jory', 'Ask Jory Mudge who comes to Bootscrape from outside');
    expect(closed.page).toMatch(/lamp-keeper.s cousin/);
  }, 120000);
});
