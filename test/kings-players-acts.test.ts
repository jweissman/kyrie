import { describe, expect, it } from 'bun:test';
import { KP, p, toTheCity, actI, actII, actIVquick, actV } from './support/kp';
import { toConcourse, actIII, type Route } from './support/kp3';

// The King's Players, played from the Trial's verdict to the last bow with no teleport: every step is a label the page
// offers. Each Act III route is a different unbroken play, and each Ending is reached at the end of one.
// The only forced throws are the single check that selects a route (the book says so, in `pass()`); the natural play forces nothing.
const ENDINGS: Array<[Route, string, boolean]> = [
  ['grave', 'grave', true], ['seat', 'seat', false], ['door', 'door', true], ['pebble', 'pebble', true], ['chain', 'chain', true],
  ['shamed', 'shamed', true], ['sea', 'sea', true], ['staged', 'staged', true], ['exile', 'exile', true], ['river', 'river', true],
];

describe("The King's Players: Pentrice to the last bow, one route per Ending", () => {
  for (const [route, ending, chorus] of ENDINGS) {
    it(`route ${route}: Acts I-V by labels, the Edict answered, and the book ends as "${ending}"`, async () => {
      const k = await toTheCity();
      await actI(k);
      await actII(k, 'point');
      expect(k.holds('bodyLies', 'pentrice')).toBe(true);
      await toConcourse(k);
      await actIII(k, route);
      expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
      await actIVquick(k);
      expect(k.holds('wickGranted', 'rierdan')).toBe(true);
      await actV(k, { chorus });
      expect(k.reached()).toEqual([p(ending)]);
    }, 290000);
  }

  it('plays the Antigone act on natural dice: nothing forced, the Warden asked, whatever the dice give', async () => {
    const k = await toTheCity('g1');
    k.natural = true;
    await actI(k);
    await actII(k, 'point');
    await toConcourse(k);
    await actIII(k, 'shamed'); // one try at the King; on a failure the tragedy keeps its own appointments
    await k.play('=+144', '=+144', '=+144');
    expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
    await actIVquick(k);
    await actV(k, { chorus: true });
    expect(k.reached().length).toBe(1);
  }, 290000);
});
