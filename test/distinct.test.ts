import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { World } from '../src/lang/world';

// "A place other than the Ranks" (What Tessary Owes' W5): `distinct(?p, ranks)` holds of whatever ?p is bound to that
// is not the Ranks. It tests, and binds nothing, so what it tests is bound before it; one asked of nothing bound was
// accepted, and threw in the middle of a pass (the architecture review's A9).
class Other {
  static module(rule: string) {
    return ModuleParser.parse(`Module d "D" { Kind place. Kind thing. Relation at(thing, place). Relation seen(place).
      Relation distinct(entity, entity).
      Entity ranks: place "the Ranks". Entity quay: place "the quay". Entity cup: thing "a cup".
      Initially Assert at(cup, quay). ${rule} }`);
  }
}
describe('distinct', () => {
  it('holds of what is bound to something else, and is asked only of what is bound', () => {
    const m = Other.module('Rule other when at(cup, ?p) and distinct(?p, ranks) { Assert seen(?p). }');
    new ModuleCompiler().validate(m);
    const w = new World(m).apply(m.initial);
    expect(w.test({ kind: 'and', left: { kind: 'call', name: 'at', args: ['cup', '?p'] },
      right: { kind: 'call', name: 'distinct', args: ['?p', 'ranks'] } })).toBe(true);
    expect(() => new ModuleCompiler().validate(Other.module('Rule loose when distinct(quay, ?other) { Assert seen(quay). }')))
      .toThrow('?other');
  });
});
