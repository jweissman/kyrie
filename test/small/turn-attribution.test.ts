import { describe, expect, it } from 'bun:test';
import { TurnAttribution } from '../../scripts/turn-attribution';

// The turn's attribution (scripts/turn-attribution.ts) gives each part its own time, less the parts within it, sync or
// async, so that the parts and what no part holds add up to the turn and nothing is counted twice.
// Timed by a clock of its own, which each toy part moves on as it works.
class Toy {
  static now = 0;
  static spin(ms: number) { Toy.now += ms; }
  static inner() { Toy.spin(20); }
  static outer() { Toy.spin(10); Toy.inner(); }
  static async later() { await Promise.resolve(); Toy.spin(10); Toy.outer(); }
}
describe("a turn's attribution", () => {
  it('gives each part its own time, nested and awaited, and the parts add up to the whole', async () => {
    TurnAttribution.wrap(Toy, 'inner', 'inner'); TurnAttribution.wrap(Toy, 'outer', 'outer');
    TurnAttribution.wrap(Toy, 'later', 'later');
    const clock = TurnAttribution.clock;
    TurnAttribution.clock = () => Toy.now;
    const parts = await TurnAttribution.within(() => Toy.later()).finally(() => { TurnAttribution.clock = clock; });
    const total = parts.total, own = parts.parts;
    expect(Object.fromEntries(own)).toEqual({ inner: 20, outer: 10, later: 10, turn: 0 });
    expect([...own.values()].reduce((a, b) => a + b, 0)).toBe(total);
  });
});
