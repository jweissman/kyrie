import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Folded } from '../../web/reader/stage/folded-rail';
import type { Attested } from '../../src/presentation/attest';

// The lenses folded at rest (OR-1084, the owner, 26 November: "fade the lenses rail in the resting scene, or at least
// let it be folded into a single icon"): the engine says so of the resting scene, for every client (Glance.rail), and
// the diamond the page draws glitters with what the folded lenses hold, from their own marks: neutral with none, one
// tone for one, a still OKLab gradient across several, each tone once.
describe('the folded lenses', () => {
  // Only the lenses earned stand in it (compactification, OR-1241): none for a first-level company, and none at the
  // fourth level either (OR-1491: a level earns nothing; test/small/surfaces-earned holds the oracle's earn of all).
  it('are the resting scene\'s, by the engine\'s hint, with the lenses earned in them', async () => {
    const yard = `
      Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.`;
    const first = await Tiny.start(yard, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 1,
      backgroundId: 'soldier' }] });
    // The company's own page is kept within reach whatever is earned (OR-1685).
    const keep = { view: 'company' as const, label: 'Your character' };
    expect(first.leaf.glance?.rail).toEqual({ fold: 'folded', lenses: [], keep });
    const later = await Tiny.start(yard, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 4,
      backgroundId: 'soldier' }] });
    expect(later.leaf.glance?.rail).toEqual({ fold: 'folded', lenses: [], keep });
  });
  it('glitter with the tones their marks bear, and none without', () => {
    const mark = (tone?: string) => ({ tone, words: tone ?? 'nothing', icons: [], companion: false, faint: false,
      witnesses: [] }) as unknown as Attested;
    expect(Folded.glint([])).toBeUndefined();
    expect(Folded.glint([mark()])).toBeUndefined();
    expect(Folded.glint([mark('gold')])).toBe('var(--tone-gold)');
    expect(Folded.glint([mark('gold'), mark('blue'), mark('gold')]))
      .toBe('linear-gradient(135deg in oklab, var(--tone-gold), var(--tone-blue))');
  });
});
