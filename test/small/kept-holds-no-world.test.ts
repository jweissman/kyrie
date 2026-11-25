import { describe, expect, it } from 'bun:test';
// The parser first: Kyr's entry, loaded first, meets the language's inner cycle half-made (OR-542).
import { ModuleParser } from '../../src/lang/module-parser';
import { KeptReading, ModuleWriter, World } from '../../src/lang/index';
import { KeptParts } from '../../src/ui/kept-parts';

// What a step of play keeps (25 November: a walk had kept some 1.5 MB a step, 195 → 347 MB over 100 steps of iscoed).
// A reading kept from one world to the next holds what it read of the world, never the world: two thousand groundings
// kept, most never asked again, had each held the world it was made in, and each world every fact list it had written
// (63 worlds held at step 100). And the parts of the page are kept only while lately asked for: a journey's search,
// kept by the place it set out from, had been kept for every place a walk planned from.
const m = ModuleParser.parse(`Module k "K" { Kind thing. Relation at(thing, thing). Relation sent(thing).
  Entity reeve: thing "the reeve". Entity miller: thing "the miller". Entity mill: thing "the mill".
  Entity green: thing "the green". Initially Assert at(reeve, green). Initially Assert at(miller, green). }`);
const call = ModuleWriter.call;
class Graph {
  // Whether anything reachable from a value is a world.
  static holdsWorld(value: unknown, seen = new Set<unknown>()): boolean {
    if (value instanceof World) { return true; }
    if (!value || typeof value !== 'object' || seen.has(value)) { return false; }
    seen.add(value);
    const parts = value instanceof Map ? [...value.keys(), ...value.values()]
      : value instanceof Set ? [...value] : Object.values(value);
    return parts.some(p => Graph.holdsWorld(p, seen));
  }
}
describe('a reading kept from one world to the next', () => {
  it('holds no world, as it holds across worlds and is found stale', () => {
    const w0 = new World(m).apply(m.initial), read = KeptReading.read(w0, () => w0.related('at', 'reeve').length);
    const kept = read.kept!;
    expect(kept.picks?.get('at')).toBeDefined();
    expect(Graph.holdsWorld(kept)).toBe(false);
    // Something it did not read written, and something of what it read it did not pick: it holds, and holds no world.
    const w1 = w0.apply([{ kind: 'assert', call: call('sent', 'reeve') }]);
    expect(KeptReading.holds(w1, kept)).toBe(true);
    const w2 = w1.apply([{ kind: 'retract', call: call('at', 'miller', 'green') },
      { kind: 'assert', call: call('at', 'miller', 'mill') }]);
    expect(KeptReading.holds(w2, kept)).toBe(true);
    expect(Graph.holdsWorld(kept)).toBe(false);
    // What it picked written: stale.
    const w3 = w2.apply([{ kind: 'retract', call: call('at', 'reeve', 'green') },
      { kind: 'assert', call: call('at', 'reeve', 'mill') }]);
    expect(KeptReading.holds(w3, kept)).toBe(false);
  });
});
describe('the parts of the page kept', () => {
  it('are those lately asked for', () => {
    const w = new World(m).apply(m.initial);
    let reads = 0;
    const part = (key: string) => KeptParts.of(w, key, '', () => { reads++; return w.related('at', 'reeve').length; });
    part('first');
    for (let i = 0; i < KeptParts.lately; i++) { part(`other ${i}`); }
    expect(reads).toBe(KeptParts.lately + 1);
    part(`other ${KeptParts.lately - 1}`);
    expect(reads).toBe(KeptParts.lately + 1);
    part('first');
    expect(reads).toBe(KeptParts.lately + 2);
  });
});
