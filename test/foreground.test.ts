import { describe, expect, it } from 'bun:test';
import { Emphasis } from '../src/presentation/emphasis';
import { Aspects } from '../src/presentation/aspects';

// What an opportunity is (its aspects, the engine's) apart from how it is drawn (its tone, the page's): gold is the aim
// followed and nothing else; a way to an aim held and not followed is worth exploring, silver; a need is neither, and
// stays neutral (amendment 6, C).
describe('an opportunity, as meant and as drawn', () => {
  it('takes its aspects from its reasons and marks, chiefly the first', () => {
    expect(Aspects.of(['toward'], [])).toEqual(['undertaking']);
    expect(Aspects.of(['held', 'unvisited'], [])).toEqual(['exploration']);
    expect(Aspects.of(['danger'], [{ kind: 'fight', said: 'easily won' }])).toEqual(['danger']);
    expect(Aspects.of(['named'], [{ kind: 'fight', said: 'a hard fight' }])).toEqual(['undertaking', 'danger']);
    expect(Aspects.of(['dark'], [])).toEqual([]);
  });
  it('is drawn in its chief tone, with a word, and gold only for the aim followed', () => {
    expect(Emphasis.of(['undertaking', 'danger'])).toEqual({ tone: 'gold', also: ['red'] });
    expect(Emphasis.of(['exploration'])).toEqual({ tone: 'silver', also: [] });
    expect(Emphasis.of([])).toEqual({ also: [] });
    expect(Object.entries(Emphasis.tones).filter(([, t]) => t === 'gold').map(([a]) => a)).toEqual(['undertaking']);
    expect(Emphasis.said(['knowledge'])).toBe('to learn');
  });
  it('draws what is several things at once as a gradient through their tones, and one thing in its one', () => {
    expect(Emphasis.prism(['undertaking', 'danger'])).toBe('linear-gradient(in oklab 180deg, var(--tone-gold), var(--tone-red))');
    expect(Emphasis.prism(['undertaking', 'danger'], false)).toBeUndefined();
    expect(Emphasis.prism(['exploration'])).toBeUndefined();
  });
});
