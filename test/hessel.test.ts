import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// The Banns at Hessel (doc/adventures/banns-at-hessel), played by the labels a player sees from the steps in
// test/fixtures/hessel. The campaign starts on the south road at eight in the morning on watch 0, the first day of
// the Season's last four; the third reading of the banns is at eleven on the third day (watch 306); the Closing Ball
// is the fourth night from seven (watch 498); the Season ends at noon on the fifth day (watch 600).
const alone = 'data/campaigns/hessel.campaign.json';
const build = (name: string) => `test/fixtures/hessel/${name}.campaign.json`;
const steps = (name: string): string[] => {
  const phases = JSON.parse(readFileSync(`test/fixtures/hessel/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return Array.isArray(phases) ? phases : Object.values(phases).flat();
};
const h = (id: string) => `hessel__${id}`;
export class Hessel {
  static async start(campaign = alone, seed = 'h1') { return new Hessel(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string) { return this.play(...steps(name)); }
  // Waits on to the Season's end, or to a watch, an hour at a time: the book closes at noon on the fifth day.
  async until(watch = 700) {
    while (!this.ending().length && this.j.watch() < watch) {
      const c = this.j.find('^Wait › An hour') ?? this.j.find('^Wait › A while');
      if (!c) { break; }
      await this.j.perform(c.command, c.label);
    }
    return this;
  }
  holds(name: string, ...args: string[]) { return this.j.holds(h(name), ...args.map(a => a === 'party' ? a : h(a))); }
  knows(fact: string) { return this.j.holds('knows', 'party', h(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(h(name), ...args.map(h)); }
  state(thing: string, value: string) { return this.j.holds('state', h(thing), h(value)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]!.replace(/^hessel__/, '')); }
  at(who: string) { return this.j.campaign.world.one('at', h(who))?.replace(/^hessel__/, ''); }
  gold() { return this.j.measure('quantity', 'party', 'gold'); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page}`).join('\n'); }
}

describe('The Banns at Hessel', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign(alone, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('left alone: the banns stand, the bridegroom walks past his bride to his wife on the church steps, and Mrs Cherrett does not wake', async () => {
    const g = await Hessel.start();
    await g.fixture('alone');
    await g.until();
    expect(g.holds('bannsDone', 'ebbas')).toBe(true);
    expect(g.holds('weddingBroken', 'ebbas')).toBe(true);
    expect(g.holds('gone', 'cherrett')).toBe(true);
    expect(g.ending()).toEqual(['seasons_end']);
    // Nobody spoke at the third reading, and nobody moved Carth House, the chairmen or the drops.
    expect(g.holds('strike', 'chairmen')).toBe(false);
    expect(g.page).toMatch(/Ismay Cherrett goes home unmarried, jilted at the altar/);
    expect(g.page).toMatch(/tonight at two someone will come up the Parade/);
    expect(g.page).toMatch(/WHO COOKED FOR THE DELVE CUT/);
  }, 120000);

  it('the Rooms, for a bard: the apology in form, the grandson in Lady Wenlock\'s arms, the drops stopped by Ismay, the blessing, and the last minuet', async () => {
    const g = await Hessel.start();
    await g.fixture('rooms');
    await g.until();
    // The banns withdrawn in a drawing room, not stopped in church.
    expect(g.holds('grandmother', 'lady_wenlock')).toBe(true);
    expect(g.holds('bannsStopped', 'ebbas')).toBe(false);
    expect(g.holds('bannsWithdrawn', 'ebbas')).toBe(true);
    // Mr Twiss won by form, and by the chairmen's warning; the household admitted.
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(true);
    expect(g.measure('twissFavour', 'twiss')).toBeGreaterThanOrEqual(3);
    expect(g.holds('faresRestored', 'chairmen')).toBe(true);
    // The drops stopped by someone she loves asking; Ismay and Kit blessed; Mopsa's yes.
    expect(g.holds('stoppedBy', 'cherrett', 'ismay')).toBe(true);
    expect(g.holds('cherrettBlessesKit', 'cherrett')).toBe(true);
    expect(g.holds('mopsaYes', 'party')).toBe(true);
    expect(g.holds('cherrettDanced', 'cherrett')).toBe(true);
    expect(g.ending()).toEqual(['last_dance']);
    expect(g.page).toMatch(/I believe I have the honour of the last minuet/);
    expect(g.page).toMatch(/Lady Wenlock has taken the lease of a house in Quay Lane/);
  }, 180000);

  it('the Old Town, for a thief: with the chairmen, water for the drops, Hetty up the aisle, Celia out by the window to her mother, and Hartopp in his boots', async () => {
    const g = await Hessel.start(build('thief'), 'o1');
    await g.fixture('oldtown');
    await g.until();
    expect(g.holds('stoodWith', 'party')).toBe(true);
    expect(g.holds('strike', 'chairmen')).toBe(false);
    expect(g.holds('swapped', 'cherrett')).toBe(true);
    expect(g.holds('stoppedByHetty', 'ebbas')).toBe(true);
    expect(g.holds('celiaMetMother', 'celia')).toBe(true);
    expect(g.holds('hartoppBarred', 'hartopp')).toBe(true);
    // Nothing of the Rooms' way: Mr Twiss never moved, no grandson shown, the household still barred.
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(false);
    expect(g.holds('grandmother', 'lady_wenlock')).toBe(false);
    expect(g.ending()).toEqual(['morning_after']);
    expect(g.page).toMatch(/He’s mine. We were married in Bristol/);
    expect(g.page).toMatch(/No boots after six/);
  }, 180000);

  it('the Road to Orm, for a ranger: the stile, the shepherd\'s child, the sheep-path, the College, and the door of Carth House opened by the hand that shut it', async () => {
    const g = await Hessel.start(build('ranger'), 'r1');
    await g.fixture('orm');
    await g.until();
    expect(g.holds('saidTruth', 'party')).toBe(true);
    expect(g.holds('childTreated', 'party')).toBe(true);
    expect(g.holds('otteryLicensed', 'ottery')).toBe(true);
    expect(g.holds('stoppedBy', 'cherrett', 'ottery')).toBe(true);
    expect(g.holds('celiaWell', 'celia')).toBe(true);
    expect(g.holds('carthReunited', 'carth')).toBe(true);
    expect(g.j.holds('travelsWith', h('ottery'), 'party')).toBe(true);
    expect(g.ending()).toEqual(['morning_after']);
    expect(g.page).toMatch(/opens the door of Carth House with his own hand/);
    expect(g.page).toMatch(/Dr Ottery is on the road with you/);
  }, 180000);

  it('gossip as a weapon: a lie about the canals at the Pump Room breaks the match by dinner, and Mrs Cherrett learns who told it', async () => {
    const g = await Hessel.start();
    await g.fixture('gossip');
    expect(g.holds('public', 'rumour_ruin')).toBe(true);
    expect(g.holds('bannsWithdrawn', 'ebbas')).toBe(true);
    expect(g.holds('legs', 'party')).toBe(false);
    expect(g.page).toMatch(/You told the town I was ruined/);
    await g.until();
    expect(g.ending()).toEqual(['turned_away']);
  }, 180000);

  it('the Ball, unchecked: Rupert\'s secret told to Mrs Scrope, and Hartopp stands up with Ismay twice running, which in Hessel is a promise', async () => {
    const g = await Hessel.start();
    await g.fixture('claims');
    expect(g.holds('scandal', 'wenlock')).toBe(true);
    expect(g.holds('hartoppClaims', 'ismay')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Ismay Cherrett goes home engaged to Dr Hartopp/);
  }, 180000);

  it('the Ball, warned: Mr Twiss told she is not betrothed stops the band and sends Hartopp out', async () => {
    const g = await Hessel.start();
    await g.fixture('warned');
    expect(g.holds('hartoppClaims', 'ismay')).toBe(false);
    expect(g.holds('hartoppBarred', 'hartopp')).toBe(true);
    expect(g.page).toMatch(/The Rule is the Rule/);
  }, 180000);

  it('for a warrior, Signor Brocca carried up the Parade puts Mr Twiss in debt, and the debt lifts the bar', async () => {
    const g = await Hessel.start(build('warrior'), 'w1');
    await g.fixture('brocca');
    expect(g.holds('broccaDone', 'brocca')).toBe(true);
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(true);
  }, 180000);

  it('the footman bribed: Mr Twiss finds the household at the side door, and turns it away for good', async () => {
    const g = await Hessel.start(build('warrior'), 'w1');
    await g.fixture('fitch');
    expect(g.holds('twissOffended', 'party')).toBe(true);
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(false);
    expect(g.page).toMatch(/is not admitted to these Rooms/);
  }, 180000);

  it('the door opened to the knock by a stranger: she turns round on the step, and does not come again', async () => {
    const g = await Hessel.start(build('thief'), 'd3');
    await g.fixture('doorway');
    expect(g.holds('received', 'party')).toBe(true);
    expect(g.holds('nanFled', 'nan')).toBe(true);
    expect(g.holds('carthReunited', 'carth')).toBe(false);
    await g.until();
    expect(g.page).toMatch(/Nobody knocks at Carth House at two in the morning any more/);
  }, 180000);

  it('a licence bought blank at Orm, filled in by Mr Pyne for a chairman and an heiress, and a wedding at nine', async () => {
    const g = await Hessel.start();
    await g.fixture('licence');
    expect(g.holds('cherrettBlessesKit', 'cherrett')).toBe(true);
    expect(g.holds('kitEngaged', 'kit')).toBe(true);
    expect(g.holds('married', 'couple_kit')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Ismay Cherrett was married to Christopher Danby, chairman/);
  }, 240000);

  it('on the road, comfort said at the stile and Ottery let go north at the gate of Orm: he does not come back', async () => {
    const g = await Hessel.start(build('ranger'), 'r1');
    await g.fixture('orm-north');
    expect(g.holds('saidComfort', 'party')).toBe(true);
    expect(g.holds('otteryGone', 'ottery')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Dr Ottery went north from the gate of Orm/);
  }, 240000);

  it('brought back unlicensed, Ottery remembers that hope is a physic, and halves the dose instead of stopping it', async () => {
    const g = await Hessel.start(build('ranger'), 'r1');
    await g.fixture('orm-back');
    expect(g.holds('otteryFugitive', 'ottery')).toBe(true);
    expect(g.holds('halved', 'cherrett')).toBe(true);
    expect(g.holds('dosed', 'cherrett')).toBe(true);
    await g.until();
    expect(g.holds('gone', 'cherrett')).toBe(false);
    expect(g.page).toMatch(/physicks the Old Town without a licence/);
  }, 240000);

  it('Mopsa\'s house: Mrs Cherrett\'s forty and Mr Twiss\'s character, and a card in the window', async () => {
    const g = await Hessel.start();
    await g.fixture('lease');
    expect(g.holds('mopsaFunded', 'mopsa')).toBe(true);
    expect(g.holds('mopsaHouse', 'mopsa')).toBe(true);
    expect(g.page).toMatch(/NO PHYSICIANS/);
  }, 240000);

  it('kept on the second morning and opened again, the Season goes on to the same end', async () => {
    const all = steps('rooms'), at = all.indexOf('Take a bed and supper');
    const whole = await Hessel.start(); await whole.play(...all); await whole.until();
    const split = await Hessel.start(); await split.play(...all.slice(0, at));
    const back = new Hessel(Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint())))));
    await back.play(...all.slice(at)); await back.until();
    expect(back.ending()).toEqual(whole.ending());
    expect(back.j.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(back.holds('cherrettDanced', 'cherrett')).toBe(whole.holds('cherrettDanced', 'cherrett'));
  }, 300000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Hessel.start(build('thief'), 'twice'), b = await Hessel.start(build('thief'), 'twice');
    const some = steps('oldtown').slice(0, 40);
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 240000);
});
