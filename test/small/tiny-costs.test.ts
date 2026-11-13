import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Costs } from '../../src/costs';

// What a tiny world costs to start, as it crosses the engine's boundaries (see Costs; the owner, 14 November: a small
// test should fail, or conspicuously report, if its dependencies drag in full Westernesse). It installs its own module
// and the canon on the shared rules, generates its one member, and draws no country and composes no world. Its
// shared rules and the canon are what it still pays for (scripts/load-costs.ts: about 140 KB of Kyr, parsed once and
// kept): a world of one rule has no smaller start yet.
describe('a tiny world', () => {
  it('starts without drawing a country or composing a world, and installs only its own module and the canon', async () => {
    const t = await Tiny.start('Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.');
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
    expect(t.costs.install?.ids.sort()).toEqual(['canon', 't']);
    expect(t.costs.creature?.n).toBe(1);
    // Parsed or kept, the Kyr it reads: its own few lines, the shared rules and the canon, and nothing more.
    const read = (t.costs.parse?.bytes ?? 0) + (t.costs['parse kept']?.bytes ?? 0);
    expect(read).toBeLessThan(200_000);
    console.log(`  a tiny world: ${Costs.said(t.costs)}`);
  });
});
