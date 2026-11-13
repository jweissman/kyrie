import { describe, expect, it } from 'bun:test';
import { Promotion } from '../src/ui/promotion';
import { Guidance } from '../web/reader/guidance';
import { Emphasis } from '../src/presentation/emphasis';
import type { Promoted } from '../src/presentation/glance-types';

// The owner's play of 11 November: where the aim followed has a known next step, exactly one of the few things the
// page leads with carries it on; not always first; and only where the way is shown is it drawn as the aim's.
describe('the aim\'s continuation', () => {
  const act = (choice: string, aspects: Promoted['aspects'], tier: Promoted['tier'] = 3) =>
    ({ choice, label: choice, why: 'own', facets: [], tier, aspects, marks: [] }) as Promoted;
  it('is exactly one, the first of the aim\'s, and none where none carries it', () => {
    const marked = Promotion.continued([act('a', ['exploration']), act('b', ['undertaking']), act('c', ['undertaking'])]);
    expect(marked.filter(a => a.continues).map(a => a.choice)).toEqual(['b']);
    expect(Promotion.continued([act('a', ['exploration'])]).some(a => a.continues)).toBe(false);
    // What the aim names (the priest to ask) before what merely stands where the aim is (the shrine's tower).
    const tower = { ...act('tower', ['undertaking']), why: 'about' as const }, priest = { ...act('priest', ['undertaking']), why: 'named' as const };
    expect(Promotion.continued([tower, priest]).filter(a => a.continues).map(a => a.choice)).toEqual(['priest']);
  });
  it('stands among the rest where the place puts it, the same each time, after what will not wait', () => {
    const acts = Promotion.continued([act('urgent', [], 0), act('x', ['undertaking']), act('y', ['knowledge']),
      act('z', ['exploration'])]);
    const places = ['crypt', 'yard', 'green', 'quay', 'mill', 'well'].map(k => Guidance.placed(acts, 1, k));
    expect(places.every(p => p[0]!.choice === 'urgent' && p.length === 4)).toBe(true);
    expect(new Set(places.map(p => p.findIndex(a => a.continues))).size).toBeGreaterThan(1);
    expect(Guidance.placed(acts, 1, 'crypt')).toEqual(Guidance.placed(acts, 1, 'crypt'));
  });
  it('is drawn in gold only where the way is shown, and otherwise as what else it is', () => {
    expect(Emphasis.of(['undertaking', 'exploration'], true).tone).toBe('gold');
    expect(Emphasis.of(['undertaking', 'exploration'], false).tone).toBe('silver');
    expect(Emphasis.said(['undertaking'], false)).toBeUndefined();
  });
});
