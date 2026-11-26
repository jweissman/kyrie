import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import type { CreatureStore } from '../src/creature-store';
import { RunnerFind } from './support/runner-find';

// A new verb, and how it is opened (round 9's diagnosis of the owner's OR-60: "or unlock new adventuring verbs"): the
// drill-yard named its lessons, "only to one who has done enough out in the world to have earned it", and never what
// would; asked for one, its master now says what earns it, then its fee, and paid, the technique is taught.
class Yard {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--origin', 'wanderer',
      '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    return { journey, r, s: r.said() as Said };
  }
  static act(r: Runner, s: Said, label: RegExp): Promise<Said> { return RunnerFind.act(r, s, label); }
}
describe('a lesson at the drill-yard', () => {
  it('says what earns it, then what it costs, and is taught once both are had', async () => {
    const { journey: j, r } = await Yard.start();
    let s = r.said() as Said;
    for (const to of [/^To the landing at/, /^Into the Lucky Phoenix/, /^To the drill-yard/]) {
      s = await Yard.act(r, s, to);
    }
    s = await Yard.act(r, s, /^Ask Ebba for a lesson$/);
    expect(s.scene.lines.join(' ')).toMatch(/Come back when you have done something out there.*Then 20 coin/);
    expect([...s.offer.primary, ...s.offer.rest].some(o => /^Train /.test(o.label))).toBe(false);
    const store = (j.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(j.campaign.readout.partyIds);
    try { lease.creatures[0]!.state.experience = 300; lease.commit(lease.creatures); } finally { lease.release(); }
    j.campaign.refreshProjection();
    s = await Yard.act(r, r.said() as Said, /^Ask Ebba for a lesson$/);
    expect(s.scene.lines.join(' ')).toMatch(/You have earned a lesson\. Come back with 20 coin/);
    j.coin(25);
    s = r.said() as Said;
    expect([...s.offer.primary, ...s.offer.rest].map(o => o.label)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Train Wenna in (Taunt|Riposte|Rapid Strike)/)]));
  }, 120000);
});
