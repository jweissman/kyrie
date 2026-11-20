import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { PlaySession } from '../../../src/session/play-session';
import { Journey } from '../../../src/session/journey';
import { RunnerFind } from '../../support/runner-find';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The corn-store's second cause (the variety study's
// experiment, doc/architecture/mission-22/variety-study/experiment.md): the same trouble on the notice, but no rat. The
// merchant's apprentice lets a buyer's men up the drain by night. w5's first town draws it (Shayavor, Caw's
// chandlery; m1's until keyed draws, MT-14). What is shown first is the swept path; the crux is a night's watch and a
// word, never a fight; the word chosen is what the house comes to; and left alone, the lad runs, said wherever the
// company is.
const job = 'region__s1_u_apprentice_job';
const all = (s: Said) => [...s.offer.primary, ...s.offer.rest].map(o => o.label);
const said = (s: Said) => s.scene.lines.join(' ');
class Store {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'w5', '--origin', 'wanderer',
      '--as', 'human/thief/Wat']));
    return { journey, r: new Runner(journey.session) };
  }
  static async walk(r: Runner, s: Said, ...to: RegExp[]): Promise<Said> {
    for (const label of to) { s = await RunnerFind.act(r, s, label); }
    return s;
  }
  // The same game, from where it stands, to try another way (a save kept and opened again).
  static fork(j: Journey) {
    const session = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())));
    return { journey: Journey.of(session), r: new Runner(session) };
  }
}
describe('Choice & Consequence › A trouble with more than one cause', () => {
  it('finds no rat under the corn-store: a swept path first, then a night\'s watch and a word decide it', async () => {
    const { journey: j, r } = await Store.start();
    let s = await Store.walk(r, r.said() as Said, /^To the market/, /^Read the notice/);
    expect(said(s)).toContain('GRAIN going from the old corn-store, a sack a night. Rats, says Caw.');
    s = await Store.walk(r, s, /chandlery/, /^Ask Caw about the rats in the corn-store$/);
    expect(said(s)).toContain('never a hole gnawed in one of them');
    const given = Store.fork(j);
    s = await Store.walk(r, s, /^To the market/, /^To the old corn-store/, /^Down to the corn-store cellar/,
      /light a candle/);
    // Shown before the crux: no droppings, and a path swept to the hole in the wall.
    expect(said(s)).toMatch(/A broom has swept a path through it/);
    expect(j.holds('knows', 'party', 'region__s1_u_apprentice_swept')).toBe(true);
    expect(all(s).some(l => /ratsbane|Sleep over the rats|firebomb/.test(l))).toBe(false);
    s = await Store.walk(r, s, /^Wait until dark/, /^Wait in the dark of the cellar/);
    expect(said(s)).toMatch(/holding the lantern up, is the apprentice of Caw/);
    // Two words, two houses: kept, the lad stays and tells of the drain; marched up, he is turned out.
    const marched = Store.fork(j);
    j.roll('pass');
    s = await Store.walk(r, s, /^Tell the apprentice it ends tonight/);
    expect(j.holds('region__s1_u_apprentice_kept', job)).toBe(true);
    s = await Store.walk(r, s, /^Up to the old corn-store/, /chandlery/, /^Tell Caw the grain will stop going/);
    expect(said(s)).toMatch(/Six, for a thing I.m not to know/);
    s = await Store.walk(r, s, /^Ask the apprentice about the old drain/);
    expect(j.holds('knows', 'party', 'region__s1_u_drain_warm')).toBe(true);
    let m = await Store.walk(marched.r, marched.r.said() as Said, /^Take the apprentice up to Caw/);
    m = await Store.walk(marched.r, m, /^Up to the old corn-store/, /chandlery/, /^Ask Caw for the ten coin/);
    expect(said(m)).toMatch(/I.d sooner it had been rats/);
    expect([marched.journey.holds('region__s1_u_apprentice_exposed', job),
      marched.journey.holds('at', 'region__s1_u_apprentice', 'region__s1_shop')]).toEqual([true, false]);
    // No fight was had for it, in either house.
    expect([j, marched.journey].map(x => x.campaign.events.some(e => e.combat.some(c => c.type === 'attack')))).toEqual([false, false]);
    // Left alone, the lad runs within two days, and it is told where the company is.
    for (const wait of ['Wait until dark', 'Wait until first light', 'Wait until dark']) {
      await given.journey.step(wait);
    }
    expect(given.journey.campaign.events.map(e => e.response).join(' '))
      .toContain('Word goes round Shayavor: the apprentice of Caw is gone in the night');
    expect(given.journey.holds('region__s1_u_apprentice_fled', job)).toBe(true);
  }, 240000);
});
