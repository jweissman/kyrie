import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Folded } from '../../web/reader/stage/folded-rail';
import type { Attested } from '../../src/presentation/attest';

// The lenses folded at rest (OR-1084, the owner, 26 November: "fade the lenses rail in the resting scene, or at least
// let it be folded into a single icon"): the engine says so of the resting scene, for every client (Glance.rail), and
// the diamond the page draws glitters with what the folded lenses hold, from their own marks: neutral with none, one
// tone for one, a still OKLab gradient across several, each tone once.
describe('the folded lenses', () => {
  it('are the resting scene\'s, by the engine\'s hint', async () => {
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.`);
    expect(t.leaf.glance?.rail).toBe('folded');
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
