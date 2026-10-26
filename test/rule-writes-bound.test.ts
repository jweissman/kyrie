import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';

// A rule writes only what its condition binds (the architecture review's A9, from its probe lang-compiler-gaps):
// `Rule r1 when at(ann, hall) { Assert marked(?t). }` was accepted, and kept the fact marked(?t) for ever; so was a
// variable bound only under `not`, or in one side of an `or`.
class Writes {
  static check(rule: string) {
    const m = ModuleParser.parse(`Module w "W" { Kind thing. Kind place. Relation at(entity, place). Relation lit(thing).
      Relation marked(thing). Entity ann: thing "Ann". Entity cup: thing "a cup". Entity hall: place "the hall".
      ${rule} }`);
    return () => new ModuleCompiler().validate(m);
  }
}
describe('a rule', () => {
  it('writes only what its condition binds', () => {
    expect(Writes.check('Rule r1 when at(ann, hall) { Assert marked(?t). }')).toThrow('?t');
    expect(Writes.check('Rule r2 when at(ann, hall) and not lit(?t) { Assert marked(?t). }')).toThrow('?t');
    expect(Writes.check('Rule r3 when at(?t, hall) or lit(cup) { Assert marked(?t). }')).toThrow('?t');
    expect(Writes.check('Rule r4 when at(?t, hall) and not marked(?t) { Assert marked(?t). }')).not.toThrow();
    expect(Writes.check('Rule r5 when at(?t, hall) or lit(?t) { Assert marked(?t). }')).not.toThrow();
  });
});
