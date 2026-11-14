import { describe, expect, it } from 'bun:test';
import { p, toTheCity, actI, actII, actIVquick, actV, KP } from './support/kp';
import { Kept } from './support/kept';
import { toConcourse, actIII, type Route } from './support/kp3';

// The King's Players, played from the Trial's verdict to the last bow with no teleport: every step is a label the page
// offers. Each Act III route is a different unbroken play, and each Ending is reached at the end of one.
// The only forced throws are the single check that selects a route (the book says so, in `pass()`); the natural play
// forces nothing.
const ENDINGS: Array<[Route, string, boolean]> = [
  ['grave', 'grave', true], ['seat', 'seat', false], ['door', 'door', true], ['pebble', 'pebble', true], ['chain', 'chain', true],
  ['shamed', 'shamed', true], ['sea', 'sea', true], ['staged', 'staged', true], ['exile', 'exile', true], ['river', 'river', true],
];

// Every route's play to the Concourse on the morning the Edict is posted is the same play, forced where the book says
// (Acts I and II, the Mousetrap pointed): made once in the file and resumed for each route (see Kept.of), where each
// route had played it again before its Act III began.
const atConcourse = async () => new KP(await Kept.of('kp g1 to the Concourse, the Mousetrap pointed', async () => {
  const k = await toTheCity();
  await actI(k);
  await actII(k, 'point');
  expect(k.holds('bodyLies', 'pentrice')).toBe(true);
  await toConcourse(k);
  return k.j;
}));

describe("The King's Players: Pentrice to the last bow, one route per Ending", () => {
  for (const [route, ending, chorus] of ENDINGS) {
    it(`route ${route}: Acts I-V by labels, the Edict answered, and the book ends as "${ending}"`, async () => {
      const k = await atConcourse();
      k.quiet = true;
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
    k.natural = true; k.quiet = true;
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
