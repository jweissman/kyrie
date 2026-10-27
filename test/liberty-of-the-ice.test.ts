import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { KyrLint } from '../src/cli/kyr-lint';
import { Pellam, build, home } from './support/pellam';

// The Liberty of the Ice (doc/adventures/liberty-of-the-ice): Pellam's Frost Fair, three days on the ice under its own
// law, played by the labels a player sees from the steps in test/fixtures/pellam. Each journey ends on the morning
// after the ice goes out (watch 420), on the ending its three days prepared.
describe('The Liberty of the Ice', () => {
  it('lints clean, played alone and as a chapter of a world', async () => {
    for (const c of [home, build('continuing')]) {
      const findings = await KyrLint.campaign(c, new NodeBundleSource());
      expect(findings.filter(f => f.level === 'error')).toEqual([]);
    }
  }, 120000);

  it('left alone: Callow dies in the stocks, Gant is taken, the bear goes through the ice, and the hired are landed', async () => {
    const g = await Pellam.start();
    await g.fixture('alone');
    expect(g.holds('callowDead', 'callow')).toBe(true);
    expect(g.holds('gantTaken', 'gant')).toBe(true);
    expect(g.holds('bearDead', 'absolute')).toBe(true);
    expect(g.holds('hiredLanded', 'lisk')).toBe(true);
    expect(g.holds('goslingHarker', 'gosling')).toBe(true);
    expect(g.ending()).toEqual(['pellam__landed']);
    expect(g.running).toBe(false);
  }, 300000);
});

describe('The Liberty of the Ice: the two ways into the bondhouse', () => {
  it('the Front Door, for a liar: the Squire believed, the bondhouse shown, the flock sold for the hired, and the hired given their hands back', async () => {
    const g = await Pellam.start();
    await g.fixture('long', 'in', 'court', 'supper');
    expect(g.holds('squireBelieved', 'harker')).toBe(true);
    expect(g.holds('stockShown', 'party')).toBe(true);
    expect(g.knows('bondbook_read')).toBe(true);
    await g.fixture('long', 'night', 'shake');
    expect(g.holds('indenturesTraded', 'party')).toBe(true);
    expect(g.holds('saidKnowing', 'party')).toBe(true);
    await g.fixture('long', 'landing');
    expect(g.holds('callowAcquitted', 'callow')).toBe(true);
    expect(g.holds('landed', 'flock_bargain')).toBe(true);
    expect(g.holds('hiredReleased', 'lisk')).toBe(true);
    await g.fixture('long', 'end');
    expect(g.ending()).toEqual(['pellam__long_con']);
  }, 400000);

  it('the Ring, for a plain warrior with no charm: hired, locked in, the bar off with the others, and out down the Reach on the first night', async () => {
    const g = await Pellam.start(home, 'lisk', Pellam.one('warrior', 'laborer'));
    await g.fixture('ring', 'hired');
    expect(g.holds('hiredHand', 'party')).toBe(true);
    expect(g.at('party')).toBe('pellam__bond_floor');
    await g.fixture('ring', 'inside');
    expect(g.knows('hired_sold')).toBe(true);
    expect(g.knows('beam_read')).toBe(true);
    expect(g.holds('tansyTold', 'tansy')).toBe(true);
    await g.fixture('ring', 'out');
    expect(g.holds('hiredFled', 'lisk')).toBe(true);
    await g.fixture('ring', 'end');
    expect(g.holds('melted', 'hire_bargain')).toBe(true);
    expect(g.ending()).toEqual(['pellam__flight']);
  }, 400000);
});

describe('The Liberty of the Ice: the other settlements', () => {
  it('the Score, for a thief: the purse lifted back, the Squire believed on fell wool, the half taken, and out past Harker\'s man', async () => {
    const g = await Pellam.start(home, 'lisk', Pellam.one('thief', 'cutpurse'));
    await g.fixture('score');
    expect(g.holds('earnestTaken', 'party')).toBe(true);
    expect(g.holds('urselTook', 'party')).toBe(false);
    expect(g.holds('melted', 'flock_bargain')).toBe(true);
    expect(g.ending()).toEqual(['pellam__score']);
  }, 400000);

  it('the Unswearing, for a scholar: Mr. Icicle\'s key, the ledger, the truth on the Liars\' Bench, and the law of the ice said properly', async () => {
    const g = await Pellam.start(home, 'lisk', Pellam.one('mage', 'scholar'));
    await g.fixture('unswearing');
    expect(g.holds('broomTold', 'broom')).toBe(true);
    expect(g.holds('knowingDoctrine', 'lisk')).toBe(true);
    expect(g.holds('unsworn', 'lisk')).toBe(true);
    expect(g.ending()).toEqual(['pellam__unswearing']);
  }, 400000);

  it('the Pillory: the Squire shakes, the real shepherd of Hawsfold meets Harker at the Ring, and the hand is cried at the Landing', async () => {
    const g = await Pellam.start();
    await g.fixture('pillory');
    expect(g.holds('squireExposed', 'party')).toBe(true);
    expect(g.holds('pilloried', 'party')).toBe(true);
    expect(g.ending()).toEqual(['pellam__pillory']);
  }, 400000);

  it('the Flock That Was: the Squire buys Abel Haws\'s real ewes, and the lie is landed true', async () => {
    const g = await Pellam.start();
    await g.fixture('flock');
    expect(g.holds('flockReal', 'party')).toBe(true);
    expect(g.holds('flockHonest', 'lisk')).toBe(true);
    expect(g.ending()).toEqual(['pellam__flock_that_was']);
  }, 400000);

  it('Hired: a hand shaken at the Ring and nothing done after it is landed with the rest', async () => {
    const g = await Pellam.start(home, 'lisk', Pellam.one('warrior', 'laborer'));
    await g.fixture('bound');
    expect(g.holds('landed', 'hire_bargain')).toBe(true);
    expect(g.ending()).toEqual(['pellam__bound']);
  }, 400000);

  it('Five Coin a Head: the drowned found in the hulk and sold to Kemble; the searchers take them in the second night', async () => {
    const g = await Pellam.start();
    await g.fixture('sold');
    expect(g.holds('drownedSold', 'party')).toBe(true);
    expect(g.holds('dickonTaken', 'dickon')).toBe(true);
    expect(g.ending()).toEqual(['pellam__sold']);
  }, 400000);
});
