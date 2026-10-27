import { describe, expect, it } from 'bun:test';
import { Pellam, home } from './support/pellam';

// Who the protagonist is changes what they can do on the ice: not a number on a roll, but another way through
// (doc/adventures/liberty-of-the-ice/06-builds.md). Each journey is one person, alone. The two principal approaches,
// for a liar and for a plain strong back, are in test/liberty-of-the-ice.test.ts; the thief's and the scholar's
// settlements there too.
const as = (classId: string, backgroundId: string) => Pellam.start(home, 'lisk', Pellam.one(classId, backgroundId));

describe('The Liberty of the Ice: who you are', () => {
  it('a priest is lent the old register as one of the cloth, for nothing, and reads the alderman\'s first wedding', async () => {
    const g = await as('cleric', 'acolyte'), before = g.gold();
    await g.fixture('cleric');
    expect(g.knows('gosling_wed')).toBe(true);
    expect(g.gold()).toBe(before);
    const lay = await Pellam.start();
    await lay.play('go:swan_lane', 'Shake on a penny a stair', 'go:freezeland', 'Ask her for your purse back', 'go:chapel', 'Ask Parson Doody whether');
    expect(lay.j.offers('as one of the cloth')).toBe(false);
  }, 300000);

  it('a ranger reads the snow by the black hole, sees the drowned walked away, and goes up to the bear as to one in a wood', async () => {
    const g = await as('ranger', 'hunter');
    await g.fixture('ranger', 'in');
    expect(g.knows('tracks_read')).toBe(true);
    expect(g.knows('not_drowned')).toBe(true);
    await g.fixture('ranger', 'bear');
    expect(g.holds('bearTried', 'party')).toBe(true);
  }, 300000);

  it('a plain farmhand with no charm finds the drowned alive, and wins the Silver Tongue with the truth', async () => {
    const g = await as('warrior', 'farmer');
    await g.fixture('commoner');
    expect(g.knows('hired_sold')).toBe(true);
    expect(g.holds('benchTruth', 'party')).toBe(true);
    expect(g.holds('broomTold', 'broom')).toBe(true);
    expect(g.holds('benchWon', 'party')).toBe(true);
    // Kemble heard it too: Harker will not now take that face at his Ring, nor believe it a squire.
    expect(g.holds('harkerWary', 'harker')).toBe(true);
  }, 400000);

  it('a scholar reads the debtor\'s counterpart, and at the Landing shows the Reeve a three made into thirty', async () => {
    const g = await as('mage', 'scholar');
    await g.fixture('counterpart');
    expect(g.knows('gant_altered')).toBe(true);
    expect(g.holds('gantVoided', 'gant')).toBe(true);
    expect(g.holds('harkerForger', 'harker')).toBe(true);
  }, 400000);
});
