import { describe, expect, it } from 'bun:test';
import { DifferenceCensus, type Walk } from '../../scripts/difference-census';

// The difference census's invariant (doc/design/difference-census.md; scripts/difference-census.ts): what a thing is
// is compared, not where it is. A generated town's own is its template's whichever town has it; a town's folk are
// their work, never their slot; and the overlap of two walks is what they share over what either met.
describe('the difference census', () => {
  it('keys a thing by what it is, wherever it is', () => {
    expect(DifferenceCensus.key('region__s1_hesper')).toBe(DifferenceCensus.key('region__s3_hesper'));
    expect(DifferenceCensus.key('region__s2_pl_dog')).toBe('pl_dog');
    expect(DifferenceCensus.key('drove__bran')).toBe('drove__bran');
    expect(DifferenceCensus.person('region__s1_r7', 'Sabine, the tinker, Martin\'s daughter')).toBe('folk:tinker');
    expect(DifferenceCensus.person('region__s4_r2', 'Elfred, the tinker')).toBe('folk:tinker');
    expect(DifferenceCensus.person('region__s1_r3', 'Wat, the collier')).not.toBe('folk:tinker');
  });
  it('measures the overlap of two walks as what both met over what either did', () => {
    const walk = (met: string[]): Walk => ({ name: met.join(), seed: '', origin: '', calling: '',
      sets: { met: new Set(met), spoke: new Set(), offered: new Set(), found: new Set(), answered: new Set() } });
    const pair = DifferenceCensus.pair(walk(['innkeeper', 'hesper', 'reeve']), walk(['innkeeper', 'reeve', 'owain']));
    expect(pair.overlap.met).toBe(0.5);
    expect(pair.shared.met).toEqual(['innkeeper', 'reeve']);
    expect(pair.overlap.spoke).toBe(1);
  });
});
