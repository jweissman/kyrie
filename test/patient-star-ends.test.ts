import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import phases from './fixtures/patient/journeys.json';

// The Patient Star, second pass (doc/history/activation/corpus/second-pass.md): the Crown acts when the
// Concord does
// not, the umber train can be met five ways, and the endings are exclusive. Played by the labels a player sees. The
// "late" fixtures start the Corbel at 1810 m (and give the Concord as called, the held-fed evidence known and 90
// crowns)
// because the real descent takes about six hundred days (five seconds of wall clock each) to reach it; the "covered"
// fixture starts the covering at 1060 of 1080 days. Everything else is the module's own rules, and the rebound and
// exile
// endings are played from the real start by the same phases as test/patient-star.test.ts's S3 and S4.
class P {
  static start(campaign: string) { return PlaySession.start(campaign, 'season', NodeBundleSource.shared); }
  static j(s: PlaySession) { return Journey.of(s); }
  static holds(s: PlaySession, name: string, ...args: string[]) { return s.campaign.world.test(ModuleWriter.call(`season__${name}`, ...args.map(a => `season__${a}`))); }
  static reached(s: PlaySession, e: string) { return s.campaign.world.test(ModuleWriter.call('reached', `season__${e}`)); }
  static measure(s: PlaySession, m: string, of: string) { return s.campaign.world.number(ModuleWriter.call(`season__${m}`, `season__${of}`)); }
}
const toCollarTop = ['To the Collar Road gate', 'To the market road', 'To the top of the Collar'];
const late = (n: 'a' | 'b') => `test/fixtures/patient/late/late-${n}.campaign.json`;

describe('The Patient Star: what the descent costs, and the Crown\'s train', () => {
  it('does nothing: the levy, the stocking, the closed Ring, and the Warden\'s decree, with the train on the Collar road', async () => {
    const s = await P.start(late('a'));
    const j = P.j(s);
    expect(P.holds(s, 'decreed', 'ghessil')).toBe(false);
    const said = await j.play('==+1200');
    expect(P.measure(s, 'strain', 'ghessil')).toBeGreaterThanOrEqual(2);
    expect(P.holds(s, 'decreed', 'ghessil')).toBe(true);
    expect(said).toContain('The Warden\'s storehouse at New Orrel begins loading umber');
    expect(said).toContain('the Crown, it seems, has chosen for it');
    expect(P.measure(s, 'coverWork', 'ghessil')).toBeGreaterThan(1);
    // The company comes up to the Collar after the train, into its warning.
    await j.play(...toCollarTop);
    expect(j.choices().some(c => /Have Elen lead the carts/.test(c.full))).toBe(true);
    expect(j.choices().some(c => /Have Tamsin draw the linchpins/.test(c.full))).toBe(true);
    expect(j.choices().some(c => /Have Dori ask the Waiting/.test(c.full))).toBe(true);
  }, 600000);

  for (const [name, label] of [['the thief draws the linchpins', 'Have Tamsin draw the linchpins'], ['the ranger leads them by the herd-way', 'Have Elen lead the carts'],
    ['the cleric sits the Waiting in the road', 'Have Dori ask the Waiting'], ['anyone pays the foreman', 'Pay the foreman forty crowns']] as const) {
    it(`turns the train: ${name}`, async () => {
      const s = await P.start(late('a'));
      const j = P.j(s);
      await j.play('==+1200', ...toCollarTop);
      expect(P.holds(s, 'decreed', 'ghessil')).toBe(true);
      await j.play(label);
      expect(P.holds(s, 'trainTurned', 'ghessil')).toBe(true);
      expect(P.holds(s, 'decreed', 'ghessil')).toBe(false);
      expect(P.measure(s, 'coverWork', 'ghessil')).toBe(1);
    }, 600000);
  }

  it('turns the train: the scholar reads the Crown\'s own charter', async () => {
    const s = await P.start(late('b'));
    const j = P.j(s);
    await j.play('==+1200', ...toCollarTop);
    await j.play('Have Mira read the foreman');
    expect(P.holds(s, 'trainTurned', 'ghessil')).toBe(true);
  }, 600000);

  it('lets the covering finish: The Pit Covered, and the Mutual\'s hall afterwards', async () => {
    const s = await P.start('test/fixtures/patient/late-covered/late-covered.campaign.json');
    const said = await P.j(s).play('==+3600');
    expect(P.holds(s, 'covered', 'ghessil')).toBe(true);
    expect(said).toContain('The Pit is covered');
    expect(P.reached(s, 'e_covered')).toBe(true);
  }, 600000);
});

describe('The Patient Star: the claims are exclusive', () => {
  it('Saro binds Ithmar tighter: Bound Tighter, the Corbel drawn up, the held alive', async () => {
    const s = await P.start('test/fixtures/patient/deep.campaign.json');
    const j = P.j(s);
    for (const n of ['quell_to_hour', 'hour', 'crown_and_reach', 'shaft', 'tip_and_back_to_stairhead', 'the_way', 'keeping_inward', 'keeping_outward'] as const) { await j.play(...phases[n]); }
    await j.play('Bind Ithmar tighter, Saro');
    expect(P.holds(s, 'rebound', 'corbel_site')).toBe(true);
    expect(P.reached(s, 'e_rebound')).toBe(true);
    expect(P.holds(s, 'covered', 'ghessil')).toBe(false);
  }, 900000);

  it('Saro holds the Heart and the citadel is cast out: Cast Out, the Corbel gone, the Keeping still bound', async () => {
    const s = await P.start('test/fixtures/patient/deep.campaign.json');
    const j = P.j(s);
    for (const n of ['corbel', 'masonry'] as const) { await j.play(...phases[n]); }
    expect(P.holds(s, 'exiled', 'corbel_site')).toBe(true);
    expect(P.reached(s, 'e_exiled')).toBe(true);
    expect(P.holds(s, 'rebound', 'corbel_site')).toBe(false);
  }, 900000);
});
