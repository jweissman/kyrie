import { describe, expect, it } from 'bun:test';
import { Pellam, home } from './support/pellam';

// The small adventures of the Frost Fair, each by more than one way where it has more than one, and each leaving
// something behind that the Landing, the wedding, the night or the morning after reads.
const as = (classId: string, backgroundId: string) => Pellam.start(home, 'lisk', Pellam.one(classId, backgroundId));

describe('The Liberty of the Ice: small adventures', () => {
  it('Absolute, by honey: a crock from Bel walked backward up Freezeland Street to the stake', async () => {
    const g = await Pellam.start();
    await g.fixture('bear-honey');
    expect(g.holds('bearCalmed', 'absolute')).toBe(true);
    expect(g.at('absolute')).toBe('pellam__bear_stake');
  }, 300000);

  it('Absolute, by the bear-ward\'s tune: a performer dances him home, which a performer alone is offered', async () => {
    const g = await Pellam.start();
    await g.fixture('bear-fiddle');
    expect(g.holds('bearCalmed', 'absolute')).toBe(true);
    const plain = await as('warrior', 'laborer');
    await plain.fixture('bear-fiddle', 'in').catch(() => undefined);
    expect(plain.j.offers('Play Absolute the tune')).toBe(false);
  }, 400000);

  it('Sir Lionel Gant, by night: led off the ice when the bailiffs have gone home, into the Clink, and his coat given', async () => {
    const g = await Pellam.start();
    await g.fixture('gant-clink');
    expect(g.holds('gantSafe', 'gant')).toBe(true);
    expect(g.holds('gantCoatGiven', 'gant')).toBe(true);
  }, 300000);

  it('the alderman\'s first wedding: a rhyme, a register, a name shown and a word told, and Bel at the Ice Chapel at noon', async () => {
    const g = await Pellam.start();
    await g.fixture('gosling');
    expect(g.knows('gosling_wed')).toBe(true);
    expect(g.holds('goslingWedsBel', 'gosling')).toBe(true);
    expect(g.holds('witnessFree', 'gosling')).toBe(true);
    expect(g.holds('weddingDone', 'lisk')).toBe(true);
    expect(g.holds('goslingHarker', 'gosling')).toBe(false);
  }, 400000);

  it('Mr. Icicle: seen at the press at night, kept, told of the printer, and married to him at eleven on the last morning', async () => {
    const g = await Pellam.start();
    await g.fixture('thessaly');
    expect(g.holds('thessalyAlly', 'thessaly')).toBe(true);
    expect(g.holds('thessalyWedsNoll', 'thessaly')).toBe(true);
    expect(g.holds('witnessFree', 'gosling')).toBe(true);
  }, 400000);

  it('the Perpetual Frost Company: a scholar shows the Exchange why a tub is not a river, Harker is short of coin, and Quarle makes frost-cream', async () => {
    const g = await as('mage', 'scholar');
    await g.fixture('quarle');
    expect(g.holds('frostCrashed', 'lisk')).toBe(true);
    expect(g.holds('harkerShort', 'harker')).toBe(true);
    expect(g.holds('quarleCream', 'quarle')).toBe(true);
  }, 300000);

  it('the Liars\' Bench: a lie told to the Reeve, and told again the next night if it had no stone in it', async () => {
    const g = await Pellam.start();
    await g.fixture('bench');
    expect(g.holds('benchTried', 'party') || g.holds('benchWon', 'party')).toBe(true);
  }, 400000);

  it('the watermen: told what Harker does on their ice, they bring sledges for nothing, and a thief empties the bondhouse by the front door', async () => {
    const g = await as('thief', 'smuggler');
    await g.fixture('sledges');
    expect(g.holds('tredgoldAngry', 'tredgold')).toBe(true);
    expect(g.holds('sledgesReady', 'lisk')).toBe(true);
    expect(g.holds('hiredFled', 'lisk')).toBe(true);
    expect(g.holds('channelCut', 'lisk')).toBe(false);
  }, 400000);

  it('Callow\'s question, answered his way: he slips his hand in the second night, and the hand is broken at the Landing', async () => {
    const g = await Pellam.start();
    await g.fixture('callow-slips');
    expect(g.holds('saidChanges', 'party')).toBe(true);
    expect(g.holds('callowSlipped', 'callow')).toBe(true);
    expect(g.holds('handBroken', 'callow_bargain')).toBe(true);
  }, 400000);

  it('Ursel: the purse lifted back, the Flashes at dusk, her brother found in the hulk, her question at the Ice Chapel, and the hand landed', async () => {
    const g = await as('thief', 'cutpurse');
    await g.fixture('ursel');
    expect(g.holds('skated', 'party')).toBe(true);
    expect(g.holds('urselMet', 'dickon')).toBe(true);
    expect(g.holds('urselAsked', 'party')).toBe(true);
    expect(g.holds('handfastLanded', 'party')).toBe(true);
  }, 400000);

  it('a careless word: Abel told of the dry berth on the hulk tells Harker\'s people, and the searchers take Dickon in the second night', async () => {
    const g = await Pellam.start();
    await g.fixture('leak');
    expect(g.holds('toldOf', 'abel', 'hidden_hulk')).toBe(true);
    expect(g.holds('harkerKnows', 'hidden_hulk')).toBe(true);
    expect(g.holds('dickonTaken', 'dickon')).toBe(true);
  }, 400000);

  it('Mr. Icicle\'s column: the ledger given to Thessaly at the press, and the Frost Gazette on every booth by noon', async () => {
    const g = await Pellam.start();
    await g.fixture('gazette');
    expect(g.holds('gazetteGiven', 'lisk')).toBe(true);
    expect(g.holds('gazettePrinted', 'lisk')).toBe(true);
    expect(g.page).toMatch(/WHERE THE FARM IN THE HILLS IS/);
  }, 400000);

  it('a lie told to Kemble as a secret sends the searchers up onto the downs, and the Reach is empty in the second night', async () => {
    const g = await Pellam.start();
    await g.fixture('kemble');
    expect(g.holds('liedToKemble', 'party')).toBe(true);
    expect(g.holds('searchersDiverted', 'lisk')).toBe(true);
    expect(g.at('searchers')).not.toBe('pellam__black_reach');
  }, 400000);

  it('Absolute at the wedding: calmed with honey, walked up Freezeland Street, and the wedding put off until the spring', async () => {
    const g = await Pellam.start();
    await g.fixture('bear-wedding');
    expect(g.holds('bearAtWedding', 'absolute')).toBe(true);
    expect(g.holds('weddingBroken', 'lisk')).toBe(true);
    expect(g.holds('witnessFree', 'gosling')).toBe(true);
  }, 400000);

  it('Harker tests the Squire on the second day, and the answer is the one the real shepherd gave; and late, he tells why he hires', async () => {
    const g = await Pellam.start();
    await g.fixture('beck');
    expect(g.knows('harker_hired')).toBe(true);
    expect(g.holds('harkerTested', 'party')).toBe(true);
    expect(g.holds('testAnswered', 'party')).toBe(true);
    expect(g.measure('conviction', 'harker', 'squire_claim')).toBeGreaterThanOrEqual(5);
  }, 400000);
});

describe('The Liberty of the Ice: the second pass', () => {
  it('the second night on foot: Kemble drunk at the Lamb and the watermen told, hired on the last morning, and the wolves on the sledge road driven off with a fleece-brand', async () => {
    const g = await as('warrior', 'laborer');
    await g.fixture('wolves', 'hired');
    expect(g.holds('kembleDrunk', 'party')).toBe(true);
    expect(g.knows('hired_sold')).toBe(true);
    expect(g.holds('tredgoldAngry', 'tredgold')).toBe(true);
    expect(g.holds('inBondhouse', 'party')).toBe(true);
    await g.fixture('wolves', 'inside');
    expect(g.at('wolves')).toBe('pellam__sledge_road');
    expect(g.page).toMatch(/four shapes are sitting in a row/);
    await g.fixture('wolves', 'wolves');
    expect(g.holds('wolvesDriven', 'lisk')).toBe(true);
    expect(g.holds('hiredFled', 'lisk')).toBe(true);
    await g.fixture('wolves', 'end');
    expect(g.ending()).toEqual(['pellam__flight']);
  }, 400000);

  it('the wolves fed: a bucket of the ox\'s offal thrown upwind on the sledge road, after the Book of Frosts read at the Watermen\'s Hall', async () => {
    const g = await Pellam.start();
    await g.fixture('offal');
    expect(g.knows('book_of_frosts')).toBe(true);
    expect(g.knows('reeve_hanged')).toBe(true);
    expect(g.holds('wolvesFed', 'lisk')).toBe(true);
    expect(g.at('wolves')).toBe('pellam__limbo');
  }, 400000);

  it('the Statute of Servants: told by the verger, laid before Alderman Gosling for Dickon Cobb, and nailed to Harker\'s door in the thaw', async () => {
    const g = await Pellam.start();
    await g.fixture('statute', 'in');
    expect(g.knows('statute_servants')).toBe(true);
    expect(g.knows('harker_candle')).toBe(true);
    expect(g.knows('gallowmoor_known')).toBe(true);
    expect(g.holds('statuteLaid', 'lisk')).toBe(true);
    await g.fixture('statute', 'end');
    expect(g.page).toMatch(/Statute of Servants, for one Dickon Cobb/);
  }, 400000);

  it('Ursel at night: why she never shakes, where she learned to lie, and Tansy Hobb from her own parish', async () => {
    const g = await as('thief', 'cutpurse');
    await g.fixture('ursel-night');
    expect(g.knows('ursel_father')).toBe(true);
    expect(g.knows('ursel_bench')).toBe(true);
    expect(g.knows('ursel_hobbs')).toBe(true);
    expect(g.measure('urselTrust', 'ursel')).toBeGreaterThanOrEqual(3);
  }, 400000);

  it('a hand shaken in the Ring and walked away from is fetched to the bondhouse the same afternoon', async () => {
    const g = await as('warrior', 'laborer');
    await g.fixture('fetched');
    expect(g.holds('hiredFetched', 'party')).toBe(true);
    expect(g.at('party')).toBe('pellam__bond_floor');
  }, 400000);
  it('paid men: Kemble\'s key off his chain at the Lamb, the searchers paid to walk the downs road, and old Fowke sat with till he sleeps', async () => {
    const g = await Pellam.start();
    await g.fixture('paid');
    expect(g.holds('searchersDiverted', 'lisk')).toBe(true);
    expect(g.holds('sodden', 'fowke')).toBe(true);
    expect(g.holds('state', 'bond_lock', 'open')).toBe(true);
    expect(g.at('party')).toBe('pellam__bond_floor');
  }, 400000);
  it('Harker\'s one chance: told at supper of his hiring, told to Ursel at night, and asked by her at the Landing', async () => {
    const g = await Pellam.start();
    await g.fixture('harker-ursel');
    expect(g.knows('harker_hired')).toBe(true);
    expect(g.knows('ursel_father')).toBe(true);
    expect(g.knows('ursel_knows_harker')).toBe(true);
    expect(g.holds('urselAskedHarker', 'lisk')).toBe(true);
    expect(g.page).toMatch(/I remember the hands/);
  }, 400000);
});
