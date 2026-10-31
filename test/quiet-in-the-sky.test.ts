import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';

// The Quiet in the Sky (doc/adventures/the-quiet-in-the-sky), played by the labels a player sees from the steps in
// test/fixtures/quiet-in-the-sky. The company comes up the valley road into Larum at eight on the first morning
// (watch 0). The story is counted from the first time the company stands in Ysgard; at the first Hour after that (six in
// the evening) Torold names the Testing for the fourth morning: day 5 when the company goes up on day 1.
const home = 'data/campaigns/the-quiet-in-the-sky.campaign.json';
const thief = 'test/fixtures/quiet-in-the-sky/thief.campaign.json';
const k = (id: string) => `larum__${id}`;
class Larum {
  private constructor(readonly j: Journey) {}
  static async start(campaign = home, seed = 'q1') { return new Larum(await Journey.start(campaign, seed)); }
  async fixture(name: string, ...only: string[]) {
    const file = await Bun.file(`test/fixtures/quiet-in-the-sky/${name}.json`).json() as Record<string, string[]>;
    for (const [phase, steps] of Object.entries(file)) {
      if (only.length && !only.includes(phase)) { continue; }
      await this.j.play(...steps);
    }
  }
  async play(...steps: string[]) { return this.j.play(...steps); }
  holds(name: string, ...args: string[]) {
    return this.j.campaign.world.test({ kind: 'call', name: k(name), args: args.map(a => a === 'party' ? a : k(a)) });
  }
  knows(fact: string) { return this.j.campaign.world.test({ kind: 'call', name: 'knows', args: ['party', k(fact)] }); }
  at(who: string) { return this.j.campaign.world.one('at', who === 'party' ? who : k(who)); }
  measure(name: string, ...args: string[]) { return this.j.measure(k(name), ...args.map(a => a === 'party' ? a : k(a))); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]!); }
  get page() { return this.j.page; }
}

describe('The Quiet in the Sky', () => {
  it('lints clean', async () => {
    const findings = await KyrLint.campaign(home, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 120000);

  it('opens in Larum: the quiet, the ballad, the widow in the loft, the second cup, and Jory up through the White', async () => {
    const g = await Larum.start();
    await g.fixture('larum', 'larum');
    expect(g.knows('quiet_heard')).toBe(true);
    expect(g.knows('ballad_read')).toBe(true);
    expect(g.knows('widow_heard')).toBe(true);
    expect(g.knows('ned_overdue')).toBe(true);
    expect(g.knows('white_known')).toBe(true);
    expect(g.at('party')).toBe(k('snow_gate'));
    expect(g.page).toMatch(/no column for breathing/);
  }, 300000);

  it('the boy who comes in at noon is the guide\'s son, and the Oven takes him', async () => {
    const g = await Larum.start();
    await g.fixture('larum', 'larum', 'up');
    expect(g.knows('ned_dead')).toBe(true);
    expect(g.page).toMatch(/Exactly noon/);
    await g.play('To the southern Field', 'To Trophy Row', 'Into the Oven', 'Ask Grimbold whether Ned');
    expect(g.holds('nedHome', 'ned')).toBe(true);
    expect(g.at('ned')).toBe(k('oven'));
  }, 300000);

  it('the cold adds up out of doors on the Field, warns, and comes off by the Oven', async () => {
    const g = await Larum.start();
    await g.play('^To Larum street', "Into the guide's house", 'Pay Jory Whitlock six coin', 'To the southern Field', '=+18');
    expect(g.measure('chill', 'party')).toBeGreaterThanOrEqual(18);
    expect(g.page).toMatch(/stupid and white at the tips/);
    await g.play('To Trophy Row', 'Into the Oven', '=+6');
    expect(g.measure('chill', 'party')).toBe(0);
  }, 300000);

  it('Halt: the law learned by fault, the truth shown at the ring, bread risen, a marriage, and Hild brave', async () => {
    const g = await Larum.start();
    await g.fixture('halt');
    expect(g.holds('mabScarred', 'mab')).toBe(true);
    expect(g.knows('living_kills')).toBe(true);
    expect(g.holds('truthSpoken', 'field_country')).toBe(true);
    expect(g.holds('breadRisen', 'grimbold')).toBe(true);
    expect(g.holds('wedded', 'mab')).toBe(true);
    expect(g.holds('joryMet', 'jory')).toBe(true);
    expect(g.holds('hildResolved', 'hild')).toBe(true);
    expect(g.holds('testingOff', 'field_country')).toBe(true);
    expect(g.ending()).toEqual([k('ending_halt')]);
    expect(g.page).toMatch(/It is only chosen/);
    expect(g.page).toMatch(/HALT, for those who come in with no hour/);
  }, 900000);

  it('the Daily: gone up once and left alone, the Testing is fought, everyone gets up, and Larum hears the sky again', async () => {
    const g = await Larum.start();
    await g.fixture('daily');
    expect(g.holds('testingHeld', 'field_country')).toBe(true);
    expect(g.ending()).toEqual([k('ending_daily_unseen')]);
    expect(g.page).toMatch(/iron on iron, thousands of it/);
  }, 600000);

  it('the Kept Fear: Hild asks, the breather promises, and one man of Even does not get up', async () => {
    const g = await Larum.start(thief);
    await g.fixture('fear');
    expect(g.holds('hildPromised', 'hild')).toBe(true);
    expect(g.holds('trueDeathAtTesting', 'field_country')).toBe(true);
    expect(g.ending()).toEqual([k('ending_fear')]);
    expect(g.page).toMatch(/what it is made of/);
  }, 900000);

  it('the Long Quiet: the name on the Tooth, a grave in Larum churchyard, the bell rung for him, and the truth never told', async () => {
    const g = await Larum.start();
    await g.fixture('quiet');
    expect(g.knows('halvard_cut')).toBe(true);
    expect(g.holds('buriedLarum', 'torold')).toBe(true);
    expect(g.holds('truthSpoken', 'field_country')).toBe(false);
    expect(g.ending()).toEqual([k('ending_quiet')]);
    expect(g.page).toMatch(/now he knows for whom/);
  }, 900000);
});
