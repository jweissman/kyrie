import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { Undertakings } from '../../src/presentation/undertakings';
import { Travel } from '../../src/session/travel';

// The engine's one account of attention where a journey's leg comes (ArrivalAttention; platform-separation.md's
// immediate queue, step 2), read from the frame's rows and the projection, Travel's to stop by and the glance's to
// carry (Glance.asks): it gives the verdict the glance's own offers would (the old oracle: the screen and the
// narrator's leaf built whole, as Travel had built them), over a matrix of arrivals on one small track; and a journey
// along legs that ask nothing builds no page at all.
// Each case: the passage, where it comes, the reasons the leg holds, and whether the journey stops there.
const cases: [string, string, string[], boolean][] = [
  ['p1', 'quiet', ['said'], false],
  ['p2', 'meadow', ['aside'], false],
  ['p3', 'copse', ['said'], false],
  ['p4', 'rats', ['said', 'threat', 'warning', 'hostile'], true],
  ['p5', 'eased', ['said', 'tolerated'], false],
  ['p6', 'perch', ['said', 'companion'], true],
  ['p7', 'cache', ['said', 'payoff'], true],
  ['p8', 'stone', ['said', 'wonder'], true],
  ['p9', 'runs', ['said'], false],
  ['p10', 'well', ['said', 'aim'], true],
  ['p11', 'gate', ['said'], false],
  // Asked her question, gone back to the well and come again: an answer owed (Topic … answering).
  ['p11', 'well', [], false],
  ['p11', 'gate', ['said', 'answer'], true],
  // A band living off the road that steps out into it and warns the company off (roving.kyrt's road footpads): a
  // threat that blocks the way stops the journey (the lead's ruling, 25 November: walking on through it is a lie; the
  // fourth cold play's journey to Holyking now meets the footpads at the fen of Addermoss and stops there). The old
  // verdict agrees: the replay had walked past them only because its journey went another way (by the reed landing)
  // before 25 November, not because the glance read no danger in them.
  ['p12', 'road', ['said', 'threat', 'warning', 'hostile'], true],
];
describe('where a leg comes', () => {
  it('asks the player for what the page would, read from the rows and never from a page', async () => {
    const s = await Arrivals.start(), c = s.campaign, seen: unknown[] = [], expected: unknown[] = [];
    for (const [passage, to, reasons, stops] of cases) {
      if (to === 'well' && passage === 'p10') { Undertakings.follow(c, 'arrivals__water'); }
      if (to === 'well' && passage === 'p11') { await s.leg('arrivals__riddle'); Arrivals.returning(s); }
      const before = Travel.condition(c), way = Arrivals.way(s, passage);
      const event = await s.leg(way);
      const a = Travel.attention(c, event, before, { to: `arrivals__${to}`, way });
      const asks = Arrivals.glanced(s), shown = Arrivals.shown(s);
      // The oracle: what asks the player here, as the glance has it, and as the rows have it.
      seen.push([to, asks.length > 0, reasons.filter(r => a.reasons.includes(r as never)), a.requiresDecision]);
      expected.push([to, shown.length > 0, reasons, stops]);
    }
    expect(seen).toEqual(expected);
  });
  it('builds no page on a journey whose legs ask nothing', async () => {
    const s = await Arrivals.start();
    // Walked once, out and back, so that the way is known (KnownWays: ways from where the company has been).
    for (const p of ['p1', 'p2', 'p3', 'p3', 'p2', 'p1']) { await s.leg(Arrivals.way(s, p)); }
    Arrivals.returning(s);
    let done: Awaited<ReturnType<typeof Travel.go>> | undefined;
    const built = await Arrivals.built(async () => {
      done = await Travel.go({ campaign: s.campaign, perform: (command: string) => s.leg(command) }, 'arrivals__copse');
    });
    expect([done!.arrived, done!.legs.map(l => l.passed ?? '')])
      .toEqual([true, ['The wind has dropped', '', 'A rook calls from the copse']]);
    expect(built).toEqual({ screens: 0, leaves: 0 });
  });
});
