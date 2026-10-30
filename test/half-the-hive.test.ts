import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Hume, alone, build, h } from './support/hume';

// Half the Hive's principal journeys, and what each must leave behind. The steps are in test/fixtures/half-the-hive;
// the helper and the calendar in test/support/hume.ts; the country in a generated world in
// test/half-the-hive-placed.test.ts.
describe('Half the Hive: the Searching, the Leaving and the Daughters', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign(alone, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('left alone: Moss goes into the Dell, the squire\'s flask calls the swarm to Larkhill, and the Escort is turned out', async () => {
    const g = await Hume.start();
    await g.until();
    expect(g.holds('mossHurt', 'moss')).toBe(true);
    expect(g.holds('left', 'larkhill')).toBe(true);
    expect(g.holds('flaskAt', 'larkhill')).toBe(true);
    // The lovers cross; nobody told them.
    expect(g.holds('goes', 'eben')).toBe(true);
    expect(g.holds('goes', 'linnet')).toBe(false);
    expect(g.holds('ivoTurnedOut', 'ivo')).toBe(true);
    expect(g.state('cell_candlish', 'killed')).toBe(true);
    expect(g.ending()).toEqual(['lark_owned']);
    expect(g.page).toMatch(/the property of L\. Corve, Esquire/);
    // The company never set foot in the Comb; the account does not pretend it did.
    expect(g.holds('named', 'party')).toBe(false);
  }, 300000);

  it('the Far Brow, for a ranger: the seventh Leaving found, the lovers told, the moth killed in the dark, a Drone\'s road, and a name', async () => {
    const g = await Hume.start();
    await g.fixture('far');
    expect(g.knows('lost_leaving')).toBe(true);
    expect(g.holds('hannetHasBee', 'hannet')).toBe(true);
    expect(g.holds('linnetKnows', 'linnet') && g.holds('ebenKnows', 'eben')).toBe(true);
    expect(g.holds('mothDead', 'deathshead')).toBe(true);
    expect(g.holds('keptWatch', 'party')).toBe(true);
    expect(g.holds('kestrelTurned', 'kestrel')).toBe(true);
    expect(g.holds('ivoSearcher', 'ivo')).toBe(true);
    expect(g.holds('left', 'far_brow')).toBe(true);
    expect(g.holds('walkedWith', 'party')).toBe(true);
    expect(g.holds('named', 'party')).toBe(true);
    expect(g.holds('goes', 'hannet')).toBe(true);
    expect(g.j.holds('promiseKept', h('carry_hannet'))).toBe(true);
    await g.until();
    expect(g.ending()).toEqual(['far_free']);
    expect(g.page).toMatch(/Both halves are alive/);
    expect(g.page).toMatch(/Ivo Gildersleeve is with you/);
  }, 300000);
});

describe('Half the Hive: other ways through', () => {
  it('the Dell, for a bard: the truce read in the chalk, the lovers stay, the Stair sung in, the cells caged, and the night of the Daughters kept', async () => {
    const g = await Hume.start(build('bard'));
    await g.fixture('dell');
    expect(g.holds('brockTruce', 'brocks')).toBe(true);
    expect(g.holds('left', 'chalk_dell')).toBe(true);
    expect(g.holds('stairLit', 'eben')).toBe(true);
    // Told only that Linnet would stay, Eben stays too; Pim takes the Mother.
    expect(g.holds('goes', 'eben')).toBe(false);
    expect(g.holds('goes', 'linnet')).toBe(false);
    expect(g.holds('goes', 'pim')).toBe(true);
    expect(g.holds('stayedForDaughters', 'party')).toBe(true);
    expect(g.holds('named', 'party')).toBe(true);
    expect(g.page).toMatch(/You stayed with us/);
    await g.until();
    expect(g.holds('castWent', 'brenna')).toBe(true);
    expect(g.ending()).toEqual(['dell_peace']);
    expect(g.page).toMatch(/are to be married at the Feast of the Lime/);
    expect(g.page).toMatch(/Garnock would have been proud/);
  }, 300000);

  it('the gift at Larkhill, for a thief: Nell heard out, Aldo visited, the squire named, and the flask uncorked on purpose', async () => {
    const g = await Hume.start(build('thief'));
    await g.fixture('gift');
    expect(g.knows('flask_known')).toBe(true);
    expect(g.holds('corveGives', 'corve')).toBe(true);
    expect(g.holds('forcedSwarm', 'party')).toBe(true);
    await g.until();
    expect(g.holds('left', 'larkhill')).toBe(true);
    expect(g.ending()).toEqual(['lark_gift']);
    expect(g.page).toMatch(/You chose for the bees/);
    expect(g.page).toMatch(/belongs to nobody, by a deed of gift/);
  }, 300000);
});

describe('Half the Hive: what goes wrong', () => {
  it('the eighth Leaving: a thief steals the squire\'s flask, tells on Nell Quarrie, and uncorks it in the Gallowtree', async () => {
    const g = await Hume.start(build('thief'));
    await g.fixture('gallow');
    expect(g.holds('nellBarred', 'nell')).toBe(true);
    expect(g.holds('flaskAt', 'gallowtree')).toBe(true);
    await g.until();
    expect(g.holds('left', 'gallowtree')).toBe(true);
    expect(g.ending()).toEqual(['gallow']);
    expect(g.page).toMatch(/whether they went on east/);
    expect(g.page).toMatch(/a mark on the door that the Comb reads/);
    expect(g.page).toMatch(/You chose for the bees/);
  }, 300000);

  it('in the open: the flask poured away and the brocks given their comb, and the dancing ends level, so she hangs in the lindens', async () => {
    const g = await Hume.start(build('thief'));
    await g.fixture('bivouac');
    expect(g.holds('pouredFlask', 'party')).toBe(true);
    expect(g.measure('tally', 'chalk_dell')).toBe(g.measure('tally', 'far_brow'));
    await g.until();
    expect(g.holds('left', 'high_wold')).toBe(true);
    expect(g.ending()).toEqual(['bivouac']);
  }, 300000);

  it('turned out: left alone, Ivo is given his cloak and loaf, and a wanderer at the Wold\'s edge can take him into the world', async () => {
    const g = await Hume.start();
    await g.fixture('ivo');
    expect(g.j.holds('travelsWith', h('ivo'), 'party')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Nobody tells you about the cloak/);
    expect(g.page).toMatch(/Ivo Gildersleeve is with you/);
  }, 300000);
});
