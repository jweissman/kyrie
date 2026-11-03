import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';

// A way that waits on more than one thing says why it is shut by the one that keeps it shut (Wapshott's Circus friction
// 5: the big top's flap, laced for the show, said "The big top is not here; the circus has gone on").
describe('a way with several openings', () => {
  const m = ModuleParser.parse(`Module c "C" { Kind place. Kind passage. Relation pitched(place). Relation showing(place).
    Relation unopened(passage). Relation connects(passage, place, place). Relation within(place, place).
    Place town "the town" is settlement. Place ground "the ground" is room within town at 0, 0.
    Place top "the big top" is room within town at 1, 0.
    Passage flap "the flap" between ground and top
      opening when pitched(top) "The big top is not here; the circus has gone on."
      opening when not showing(top) "The flap is laced: the show is on.". }`);
  const shut = (w: World) => (m.observations ?? []).filter(o => o.id.startsWith('flap__shut') && w.test(o.when))
    .map(o => o.text);
  const at = (...facts: string[]) => new World(m).apply([...m.initial.filter(c => c.call.name === 'unopened'), ...facts.map(name => ({ kind: 'assert' as const,
    call: { kind: 'call' as const, name, args: ['top'] } }))]);
  it('opens only when all hold, and says the first that fails', () => {
    expect(shut(at())).toEqual(['The big top is not here; the circus has gone on.']);
    expect(shut(at('pitched', 'showing'))).toEqual(['The flap is laced: the show is on.']);
    expect(m.rules?.find(r => r.id === 'flap__opens')?.when).toMatchObject({ kind: 'and' });
  });
});
