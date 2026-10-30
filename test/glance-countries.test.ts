import { describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import type { Glance } from '../src/presentation/glance-types';

// The glance across other generated countries (OWN-18, OWN-19): b2's bailey of Ramavor and thorn's causeway into
// Sedgeminster. Wherever the company stands, at most three things are led with, each a choice the page draws and each
// with why; the place's line is two sentences at most; a first arrival says far less than the full telling, and a
// return less again; and every command the company could give is still to be had.
class Seen {
  static check(g: Glanced, glance: Glance) {
    const menu = new Set(g.menu());
    expect(glance.acts.length).toBeLessThanOrEqual(3);
    expect([...glance.acts.map(a => a.choice), ...glance.ways].filter(id => !menu.has(id))).toEqual([]);
    expect(new Set(glance.acts.map(a => a.choice)).size).toBe(glance.acts.length);
    for (const a of glance.acts) { expect(a.facets).toContain('here'); }
    if (glance.sight && glance.arrival !== 'opening') {
      expect(Glanced.sentences(glance.sight.text)).toBeLessThanOrEqual(2);
    }
    if (glance.arrival === 'stay') { expect([glance.sight, glance.life]).toEqual([undefined, undefined]); }
    const reachable = g.reachable();
    expect(g.legal().filter(c => !reachable.has(c))).toEqual([]);
  }
  // A way about the town not yet taken, by the command the page offers for it.
  static unvisited(g: Glanced): string {
    const exit = g.screen.exits.find(e => e.local && !e.visited && !e.blocked && e.acts.length === 1)!;
    return exit.acts[0]!.command!;
  }
  static back(g: Glanced, place: string): string {
    return g.screen.exits.find(e => e.destination.id === place)!.acts.find(a => a.command)!.command!;
  }
  static async walk(seed: string) {
    const g = await Glanced.country(seed), home = g.screen.place.id;
    Seen.check(g, g.glance);
    const opened = await g.perform(g.glance.acts[0]?.command ?? Seen.unvisited(g));
    Seen.check(g, opened);
    const start = g.screen.place.id;
    const there = await g.perform(Seen.unvisited(g)), place = g.screen.place.id;
    expect(there.arrival).toBe('first');
    Seen.check(g, there);
    const first = g.words();
    expect(first.glance).toBeLessThan(first.full);
    Seen.check(g, await g.perform(Seen.back(g, start)));
    const again = await g.perform(Seen.back(g, place));
    expect(again.arrival).toBe('return');
    Seen.check(g, again);
    expect(g.words().glance).toBeLessThanOrEqual(first.glance);
    // A return never tells again the life it told the first time.
    if (again.life && !again.life.danger) { expect(again.life.text).not.toBe(there.life?.text); }
    return { g, home };
  }
}
describe('the glance in other countries', () => {
  it('b2: the bailey of Ramavor, a way about it, and back', async () => {
    const { g } = await Seen.walk('b2');
    expect(g.glance.acts.length).toBeGreaterThan(0);
  }, 180000);
  it('thorn: the causeway in, toward the aim, the gate-yard, a way about it, and back', async () => {
    const g = await Glanced.country('thorn');
    expect(g.glance.acts.map(a => [a.choice, a.why])).toEqual([['exit:region__s5_green', 'toward']]);
    const yard = await g.perform(g.glance.acts[0]!.command!);
    expect(yard.acts.slice(0, 2).map(a => [a.choice, a.why])).toEqual([['drover__son#talk', 'kin'],
      ['exit:region__s4_s5_way', 'named']]);
    await Seen.walk('thorn');
  }, 180000);
});
