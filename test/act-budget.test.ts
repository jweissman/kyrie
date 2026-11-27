import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Runner, type Said } from '../src/cli/runner';

// What an ordinary act costs headless, whole (the engine's act, the screen, what the company perceives, the leaf):
// a ratchet under OR-91's targets (the owner, 19 November: the session's median under 20 ms; it was 280 ms on a1 at
// the baseline, doc/architecture/mission-22/perf/baseline-2026-11-19.md). a1's order cleric gives Eogan the brothers'
// letter, then asks him what he knows, one thing after another (scripts/act-costs.ts eogan). Timed only after the
// world is drawn and its first act done (the shared rules' parse and a first grounding are a start's, not an act's:
// on CI a probe timed with the cold parse inside it came to 2 044 ms against a budget of 2 000). Its measure is the
// clock's median over four questions (the fifth installs what he speaks of, an act of another kind); the process's
// own time is told beside it (more than the clock's: the collector and the compiler work on threads of their own).
// Locally 120 to 155 ms at perf-4 on a machine running another agent's tests, 230 to 275 at the baseline, 110 to 126
// at perf-5 (the screen's parts and the offered actions kept by what they read); on CI's shared runners the bound
// only says nothing has gone back to where it was.
class Asking {
  static cpu(): number { const u = process.cpuUsage(); return (u.user + u.system) / 1000; }
  static median(xs: number[]): number { return [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0; }
}
describe('an ordinary act, headless', () => {
  it('costs well under the baseline: asking Eogan what he knows, act by act', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'order', party: [{ name: 'Hamo', raceId: 'human',
      classId: 'cleric', backgroundId: 'doctor' }] }, NodeBundleSource.shared);
    const r = new Runner(s), first = r.said(), letter = [...first.offer.primary, ...first.offer.rest]
      .find(o => /^Give Eogan/.test(o.label))!;
    let said = await r.ask(JSON.stringify({ act: letter.id })) as Said;
    const spent: { label: string; cpu: number; ms: number }[] = [];
    for (let i = 0; i < 4; i++) {
      // The first of the four that is an act here: not following an aim (the engine's own row, which the runner had
      // dropped: MT-18), nor a journey, nor an opener.
      const o = said.offer.primary.find(x => !/^(follow|travel):/.test(RunnerOffer.act(x)) && !x.opens)!;
      const cpu = Asking.cpu(), began = performance.now();
      said = await r.ask(JSON.stringify({ act: RunnerOffer.act(o) })) as Said;
      spent.push({ label: o.label, cpu: Asking.cpu() - cpu, ms: performance.now() - began });
      expect(said.moment).toBe('outcome');
    }
    const asked = spent.filter(x => /^Ask Eogan/.test(x.label)), median = Asking.median(asked.map(x => x.ms));
    console.log(`  asking Eogan: median ${Math.round(median)} ms (${asked.map(x =>
      `${Math.round(x.ms)}/${Math.round(x.cpu)}`).join(', ')} ms, the clock's/the process's)`);
    expect(asked.length).toBeGreaterThanOrEqual(3);
    expect(median).toBeLessThan(process.env.CI ? 500 : 170);
  }, 120000);
});
