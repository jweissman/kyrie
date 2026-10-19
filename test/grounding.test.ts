import { expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { World } from '../src/lang/world';

it('joins static preconditions while preserving dynamic, rule-written and late-projected possibilities', () => {
  const m = new ModuleCompiler().instantiate(ModuleParser.parse(`Module roads "Roads" {
    Kind group. Kind place. Relation at(group, place) exclusive. Relation route(place, place).
    Relation able(group). Relation distinct(group, group). Relation permit(group).
    Entity a: group "A". Entity b: group "B". Entity x: place "X". Entity y: place "Y".
    Initially Assert route(x, y). Initially Assert at(a, x).
    Rule later when true { Assert permit(a). }
    Action travel(actor: group, origin: place, destination: place) "Travel to {destination}" {
      Requires able(actor) and permit(actor) and at(actor, origin) and route(origin, destination).
      On success { Assert at(actor, destination). }
    }
    Action greet(actor: group, other: group) "Greet {other}" {
      Requires able(actor) and distinct(actor, other).
    }
    Goal at(a, y).
  }`), 'roads').module;
  const grounded = ActionSchemas.ground(m);
  expect(grounded.filter(a => a.schema === 'travel')).toHaveLength(2); // two actors, one real route
  expect(grounded.filter(a => a.schema === 'greet')).toHaveLength(4); // projected distinct is not assumed immutable
  const world = new World(m).apply(m.initial).apply(m.rules![0]!.effects).apply([
    { kind: 'assert', call: ModuleWriter.call('able', 'a') },
    { kind: 'assert', call: ModuleWriter.call('distinct', 'a', 'b') },
  ]);
  const possible = grounded.filter(a => world.test(a.requires)).map(a => a.id);
  expect(possible).toEqual(['travel(a,x,y)', 'greet(a,b)']);
});
