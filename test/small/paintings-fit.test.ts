import { describe, expect, it } from 'bun:test';
import { Fits, type Seen } from '../../src/ui/fits';

// A painting is not chosen for a place it contradicts (data/paintings/fit.json, against what each painting shows in
// seen.json): the cold rounds' paintings against the text (R9-12, R10-08, R11-09, CP-01): an intact sunlit castle for
// a ruined bailey, a sunny courtyard on a stormy evening, a hillside four storeys down. What the place is answers
// to what is painted, and a ruin painted as a ruin is still a ruin's.
const at = (name: string, o: { weather?: string; daylight?: string; underground?: boolean } = {}): Seen =>
  ({ place: { name, underground: o.underground }, weather: o.weather, expedition: { daylight: o.daylight ?? 'day' } });
describe('a painting against the place', () => {
  it('is not a ruin\'s if it shows the place whole, banners flying, in a golden haze', () => {
    expect(Fits.fits(at('the ruined bailey'), 'castle')).toBe(false);
    expect(Fits.fits(at('the bailey'), 'castle')).toBe(true);
  });
  it('is not a stormy evening\'s if it shows a sunny courtyard', () => {
    expect(Fits.fits(at('the well-court', { weather: 'a storm coming on', daylight: 'evening' }), 'scene-well')).toBe(false);
    expect(Fits.fits(at('the well-court', { weather: 'fair' }), 'scene-well')).toBe(true);
  });
  it('is not a vault\'s under the ground if it shows a hillside under the sky', () => {
    expect(Fits.fits(at('the fourth level', { underground: true }), 'scene-wheat-field')).toBe(false);
    expect(Fits.fits(at('the undercroft', { underground: true }), 'scene-undercroft-dark')).toBe(true);
  });
});
