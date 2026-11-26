import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { GoldContinuity } from '../scripts/gold-continuity';

// a1's debt after Ironkeep (OR-130, from OR-60; mission-22/onboarding-diagnosis.md: one steel coin found, the gold
// walked the company out into "open fields north-west of Mistshaw", then led with nothing). Followed by its gold, and
// past a stated frontier by the first way further in, as a player exploring the keep would, the gold never leads out
// of the keep to the fields or the roads, and the steel coin is still its step at the gate-passage.
class Debt {
  static readonly out = /open fields|the road between|the landing|Set out for/;
  static further(s: Said) {
    return [...s.offer.primary, ...s.offer.rest].find(o => /^(Into|To|Down|Through) /.test(o.label)
      && !Debt.out.test(o.label));
  }
}
describe('the debt, at Ironkeep', () => {
  it('leads through the keep and never out of it into the open fields', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--as', 'human/warrior/Wenna',
      '--origin', 'debt', '--chain', 'salvage']));
    const r = new Runner(journey.session), golds: string[] = [];
    let s = await GoldContinuity.followed(r, r.said()), arrived = false;
    for (let t = 0; t < 16; t++) {
      s = await GoldContinuity.followed(r, s);
      const gold = GoldContinuity.gold(s), next = gold ?? Debt.further(s);
      if (arrived && gold) { golds.push(gold.label); }
      if (!next) { break; }
      let n = await r.ask(JSON.stringify({ act: next.id }));
      while (!('error' in n) && n.moment === 'fight') { n = await r.ask(JSON.stringify({ act: 'fight:through' })); }
      s = GoldContinuity.said(n);
      if (s.at?.startsWith('region__w6')) { arrived = true; }
    }
    expect(arrived).toBe(true);
    expect(golds).toContain('Collect a steel coin for Wenna');
    expect(golds.filter(l => Debt.out.test(l))).toEqual([]);
  }, 240000);
});
