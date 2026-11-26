import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Progression } from '../../src/campaign/progression';
import { CreatureStore } from '../../src/creature-store';
import { Milestones, ModuleParser, ModuleWriter, World } from '../../src/lang/index';

// The milestones achieved are read whole (each one's title and worth) only where one has not been seen yet: asked
// after every watch and resolution of an act, they had been looked up among every entity of the country each time,
// to find each seen already (AX-10). One newly achieved is still seen, and given, once.
const m = ModuleParser.parse(`Module ms "Ms" { Kind thing. Kind milestone. Relation done(thing). Relation achieved(milestone).
  Measure merit(milestone). Entity pan: thing "the pan".
  Milestone kept_pan "kept the pan" worth 10 when done(pan). }`);
describe('the milestones achieved, once seen', () => {
  it('are not read whole again, and one new is seen once', () => {
    const w = new World(m).apply(m.initial).apply([{ kind: 'assert', call: ModuleWriter.call('achieved', 'kept_pan') }]);
    const read = Milestones.achieved, seen: Record<string, number> = {};
    let asked = 0;
    Milestones.achieved = (world: World) => { asked++; return read.call(Milestones, world); };
    try {
      const award = { elapsed: 3, store: new CreatureStore(ItemCatalog.canon), party: [], events: [] };
      Progression.milestones(w, seen, award);
      expect([asked, seen]).toEqual([1, { 'kept_pan.achieved': 3 }]);
      Progression.milestones(w, seen, { ...award, elapsed: 4 });
      expect([asked, seen]).toEqual([1, { 'kept_pan.achieved': 3 }]);
    } finally { Milestones.achieved = read; }
  });
});
