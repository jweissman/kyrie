import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { World } from '../src/lang/world';

// One thing at a time may hold it: `current(place) exclusive` (Wapshott's Circus friction 8 had to hang it on an entity
// of its own, `current(wapshotts, ground)`, because one argument was refused).
describe('an exclusive relation of one argument', () => {
  it('holds of one thing at a time', () => {
    const m = ModuleParser.parse(`Module c "C" { Kind place. Relation current(place) exclusive.
      Entity a: place "A". Entity b: place "B". Initially Assert current(a). }`);
    new ModuleCompiler().validate(m);
    const w = new World(m).apply(m.initial).apply([{ kind: 'assert', call: { kind: 'call', name: 'current', args: ['b'] } }]);
    expect(w.related('current').map(r => r.args[0])).toEqual(['b']);
  });
});
