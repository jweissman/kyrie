import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { PlaySession } from '../../../src/session/play-session';
import { Journey } from '../../../src/session/journey';
import { RunnerFind } from '../../support/runner-find';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The corn-store's third cause (the variety study's
// experiment, doc/architecture/mission-22/variety-study/experiment.md): something at the grain, and it is a girl run
// from the mill, living in the crawl behind the cellar wall. kite's first town draws it (Newmeet, Falkor's
// herb-shop; mere's until keyed draws, MT-14). Shown first: a child's bare prints; the crux is a coaxing (bread held
// out), never a blow; where she is sent is what the merchant and the priest say after; and left two days, the
// merchant lays poison, and she is gone.
const job = 'region__s1_u_runaway_job';
const said = (s: Said) => s.scene.lines.join(' ');
class Store {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'kite', '--origin', 'wanderer',
      '--as', 'human/warrior/Wat']));
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
  it('finds a child at the corn-store\'s grain: her prints first, then bread, not a blow, and where she is sent', async () => {
    const { journey: j, r } = await Store.start();
    let s = await Store.walk(r, r.said() as Said, /^To the market/, /^Read the notice/);
    expect(said(s)).toContain('Something at the grain in the old corn-store, nights, and the bread off the sill.');
    s = await Store.walk(r, s, /herb-shop/, /^(Ask Falkor|Talk to Falkor — ask) about what is at the grain$/);
    expect(said(s)).toMatch(/Two days, mind\. Then I lay poison under the grain myself/);
    const given = Store.fork(j);
    s = await Store.walk(r, s, /^To the market/, /^To the old corn-store/, /^Down to the corn-store cellar/,
      /light a torch/);
    expect(said(s)).toMatch(/a child.s bare prints/);
    s = await Store.walk(r, s, /^To the crawl behind the cellar wall/);
    expect(said(s)).toMatch(/She will be down the hole at the back if you come a step nearer/);
    s = await Store.walk(r, s, /^Hold out bread to the girl/);
    expect(j.holds('region__s1_u_runaway_trusts', job)).toBe(true);
    // Where she is sent: to the shrine, or up to the merchant.
    const handed = Store.fork(j);
    s = await Store.walk(r, s, /^Send the girl to Carmine/, /^To the corn-store cellar/, /^Up to the old corn-store/,
      /herb-shop/, /^Tell Falkor what has been at the grain/);
    expect(said(s)).toMatch(/A child\. On my corn, all winter/);
    // Kept, she tells what she saw below: the letters on the drain's keystone, the vault's way.
    s = await Store.walk(r, s, /^To the market/, /^To the shrine/,
      /^(Ask the girl|Talk to the girl — ask) what she saw down below/);
    expect(j.holds('knows', 'party', 'region__s1_u_letters')).toBe(true);
    s = await Store.walk(r, s, /^Take your leave/, /^Ask Carmine about the girl from the corn-store/);
    expect(said(s)).toMatch(/She has asked twice whether you will come back/);
    let h = await Store.walk(handed.r, handed.r.said() as Said, /^Take the girl up to Falkor/,
      /^To the corn-store cellar/, /^Up to the old corn-store/, /^To the market/, /^To the shrine/,
      /^Ask Carmine about the girl from the corn-store/);
    expect(said(h)).toMatch(/Back at the mill\. You did what you were paid for/);
    h = await Store.walk(handed.r, h, /herb-shop/, /^Ask Falkor for the ten coin/);
    expect(handed.journey.holds('region__s1_u_paid', job)).toBe(true);
    expect([j, handed.journey].map(x => x.campaign.events.some(e => e.combat.some(c => c.type === 'attack'))))
      .toEqual([false, false]);
    // Left alone two days, the poison is laid as the merchant said, told where the company is, and she is gone.
    for (const wait of ['Wait until dark', 'Wait until first light', 'Wait until dark', 'Wait until first light',
      'Wait until dark']) { await given.journey.step(wait); }
    expect(given.journey.campaign.events.map(e => e.response).join(' '))
      .toContain('Word comes round Newmeet: Falkor has laid poison under the grain');
    expect([given.journey.holds('region__s1_u_runaway_lost', job),
      given.journey.holds('at', 'region__s1_u_runaway', 'region__s1_u_warren')]).toEqual([true, false]);
  }, 240000);
});
