import { describe, expect, it } from 'bun:test';
import { Promotion, type Candidate, type Situation } from '../../src/ui/promotion';
import type { Why } from '../../src/presentation/glance-types';

// Being someone is no opportunity (the owner, 14 November: CN-07): a person led with only for being the life of the
// place has no aspect, so the page draws their likeness neutral; what can be had of them keeps its own: a question
// that teaches, knowledge; a genuine recruit, companionship; the aim's own person, the undertaking.
const calm: Situation = { threat: false, warned: false, dark: false, settled: true, open: false };
const talk = (whys: Why[]): Candidate => ({ choice: 'hild#talk', label: 'Talk to Hild', kind: 'talk', whys, order: 0,
  marks: [], subject: 'hild' });
const aspects = (whys: Why[]) => Promotion.pick([talk(whys)], calm)[0]?.aspects;

describe('a person\'s aspects', () => {
  it('are none for being the life of the place', () => {
    expect(aspects(['life'])).toEqual([]);
  });
  it('are what can be had of them: knowledge, companionship, the undertaking', () => {
    expect(aspects(['asked'])).toEqual(['knowledge']);
    expect(aspects(['companion'])).toEqual(['companionship']);
    expect(aspects(['named'])).toContain('undertaking');
  });
});
