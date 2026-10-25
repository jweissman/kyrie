import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { Planner } from '../src/campaign/planner';
import { Operators } from '../src/campaign/operators';
import { Candidates } from '../src/lang/candidates';
import { World } from '../src/lang/world';

// A query asked of what is not yet bound, with a negation in it over what it is asked of (as `reaches` is: what is
// not revealed by something, or revealed and known), proposes candidates without deciding them: every true answer
// is among them, and grounding through it offers exactly what grounding every binding and testing it would.
const module = new ModuleCompiler().instantiate(ModuleParser.parse(`Module hall "Hall" {
  Kind group. Kind place. Kind thing. Kind clue.
  Relation at(entity, place) exclusive. Relation revealedBy(thing, clue). Relation knows(group, clue).
  Relation broken(thing).
  Entity a: group "A". Entity x: place "X". Entity y: place "Y".
  Entity cup: thing "Cup". Entity box: thing "Box". Entity key: thing "Key". Entity map: thing "Map".
  Entity mark: clue "Mark".
  Query noticed(t: thing, g: group) means not revealedBy(t, ?c) or (revealedBy(t, ?c) and knows(g, ?c)).
  Query reaches(g: group, t: thing) means noticed(t, g) and at(g, ?p) and at(t, ?p).
  Initially Assert at(a, x). Initially Assert at(cup, x). Initially Assert at(box, x). Initially Assert at(key, x).
  Initially Assert at(map, y). Initially Assert revealedBy(key, mark).
  Action take(actor: group, thing: thing) "Take {thing}" {
    Requires reaches(actor, thing) and not broken(thing).
    On success { Assert at(thing, y). }
  }
  Goal false.
}`), 'hall').module;
const start = new World(module).apply(module.initial);
const call = ModuleWriter.call;

describe('candidates proposed by a query', () => {
  it('include every true answer, though a negation in it reads what is not yet bound', () => {
    const asked = call('reaches', 'a', '?t');
    // The world answers it too, now that it asks the negation once what it reads is bound (see Asking).
    expect([...start.solve(asked, {})].map(b => b['?t'])).toEqual(expect.arrayContaining(['cup', 'box']));
    const proposed = new Set([...Candidates.of(start, asked, {})].map(b => b['?t']));
    for (const t of ['cup', 'box']) { expect(start.test(call('reaches', 'a', t))).toBe(true); expect(proposed).toContain(t); }
    expect(proposed).not.toContain('map');
  });
  it('let grounding offer exactly what grounding every binding and testing it does, as the world changes', () => {
    const actions = ActionSchemas.ground(module), operators = new Operators(module);
    const states = [start, start.apply([{ kind: 'assert', call: call('knows', 'a', 'mark') }]),
      start.apply([{ kind: 'assert', call: call('broken', 'box') }, { kind: 'assert', call: call('at', 'a', 'y') }])];
    for (const state of states) {
      expect(operators.applicable(state, 'a').map(a => a.id))
        .toEqual(actions.filter(a => a.actor === 'a' && Planner.applicable(state, a)).map(a => a.id));
    }
    expect(operators.applicable(start, 'a').map(a => a.id)).toEqual(['take(a,cup)', 'take(a,box)']);
  });
});
