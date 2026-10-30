import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Hume, alone, h } from './support/hume';

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
