import { describe, expect, it } from 'bun:test';
import { Foreground } from '../../src/presentation/foreground';
import type { Promoted } from '../../src/presentation/glance-types';

// One foreground of four (the owner, 15 November): what stands beside the acts takes a place among the four; the acts
// give way, keeping what is urgent and the aim's next step.
const act = (choice: string, extra: Partial<Promoted> = {}) => ({ choice, label: choice, why: 'life', facets: ['here'], tier: 3,
  aspects: [], marks: [], ...extra }) as unknown as Promoted;
describe('the foreground of four', () => {
  const six = [act('a'), act('b'), act('c', { continues: true, tier: 1 }), act('d'), act('e', { tier: 0 }), act('f')];
  it('is four where nothing stands beside the acts, and room is made for what does', () => {
    expect(Foreground.fit(six, 0)).toHaveLength(4);
    expect(Foreground.fit(six, 1)).toHaveLength(3);
    expect(Foreground.fit(six, 2)).toHaveLength(2);
    expect(Foreground.fit(six.slice(0, 3), 0)).toHaveLength(3);
  });
  it('keeps the urgent act and the aim\'s next step before the rest, in the scene\'s order', () => {
    expect(Foreground.fit(six, 2).map(a => a.choice)).toEqual(['c', 'e']);
    expect(Foreground.fit(six, 1).map(a => a.choice)).toEqual(['a', 'c', 'e']);
  });
  it('never leaves the scene with nothing to do', () => {
    expect(Foreground.fit(six, 9)).toHaveLength(1);
  });
});
