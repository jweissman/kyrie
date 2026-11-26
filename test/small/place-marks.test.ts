import { describe, expect, it } from 'bun:test';
import { PlaceMark } from '../../web/reader/stage/place-mark';
import { Fold } from '../../src/presentation/fold';
import type { Witness } from '../../src/presentation/attest';

// Place-marks, horizontal and coloured (the owner, 26 November, OR-1248): a place's dash carries the Atlas colours of
// every danger and opportunity in its area, folded from the same leaves that mark what the place leads with (one
// derivation): neutral with none, one tone for one, a restrained OKLab gradient across several, each tone once.
const witness = (id: string, aspect: string) => ({ id, aspects: [aspect], kind: 'choice' }) as unknown as Witness;
const app = { props: {}, state: {} } as never;
describe('a place\'s mark', () => {
  it('is neutral with nothing in the place\'s area', () => {
    expect(PlaceMark.glint(app, [])).toBeUndefined();
  });
  it('takes the one tone of what is there, and every tone of several, once each', () => {
    const gold = Fold.step('a', [witness('a', 'undertaking')]), blue = Fold.step('b', [witness('b', 'knowledge')]);
    expect(PlaceMark.glint(app, [gold])).toBe('var(--tone-gold)');
    expect(PlaceMark.glint(app, [gold, blue, gold]))
      .toBe('linear-gradient(135deg in oklab, var(--tone-gold), var(--tone-blue))');
  });
});
