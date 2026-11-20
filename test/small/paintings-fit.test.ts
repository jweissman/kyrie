import { describe, expect, it } from 'bun:test';
import { Fits, type Seen } from '../../src/ui/fits';

// A painting is not chosen for a place it contradicts (data/paintings/fit.json, against what each painting shows in
// seen.json): the cold rounds' paintings against the text (R9-12, R10-08, R11-09, CP-01): an intact sunlit castle for
// a ruined bailey, a sunny courtyard on a stormy evening, a hillside four storeys down. What the place is answers
// to what is painted, and a ruin painted as a ruin is still a ruin's.
type At = { weather?: string; daylight?: string; underground?: boolean; told?: string };
const at = (name: string, o: At = {}): Seen =>
  ({ place: { name, underground: o.underground, description: o.told }, weather: o.weather,
    expedition: { daylight: o.daylight ?? 'day' } });
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
  // The cold playtest (CO-04): the shrine of Danu, "snowy, 7 Frost", painted as a sunlit temple of flowering urns.
  it('is not a snowy morning\'s if it shows flowers in summer sun', () => {
    expect(Fits.fits(at('the shrine of Danu', { weather: 'snowy' }), 'scene-temple')).toBe(false);
    expect(Fits.fits(at('the shrine of Danu', { weather: 'fair' }), 'scene-temple')).toBe(true);
  });
  // M22's second review (OR-30): "A well-head with a carved lip" under a church spire, which stood for the shrine of
  // Lugh as well. A shrine that is a well-head, a standing stone or a figure in the open is no church or temple.
  it('is not a church\'s, or a temple\'s, for a shrine told as a well-head or a stone', () => {
    const well = 'A well-head with a carved lip, the water close under it: the well-head of Coventina, Goddess of Nature.';
    for (const p of ['chapel', 'abbey', 'scene-temple']) {
      expect([p, Fits.fits(at('The shrine of Coventina', { told: well }), p)]).toEqual([p, false]);
      expect([p, Fits.fits(at('The shrine of Lugh', { told: 'A standing stone, squared and cut with lines.' }), p)])
        .toEqual([p, false]);
    }
    expect(Fits.fits(at('The shrine of Coventina'), 'chapel')).toBe(true);
    expect(Fits.fits(at('The bailey', { told: well }), 'castle')).toBe(true);
  });
  // The golden route (S3-4, OA-13): Gatesend's gate-yard painted at dusk at eight in the morning, the gate-well at
  // a quarter to nine painted as a town under the moon, a Hall kitchen in daylight at evening, a barrow's king's
  // treasury four rooms under the mound as a counting-house by its barred window's daylight, a forecourt "clear" in
  // the rain, and a sea-bank as a ship foundering in a heavy sea.
  it('is not of dusk or the moon by day, nor of daylight at evening', () => {
    expect(Fits.fits(at('the gate-yard of Gatesend'), 'scene-village-gate-yard')).toBe(false);
    expect(Fits.fits(at('the gate-well, under the gatehouse'), 'scene-town-night')).toBe(false);
    expect(Fits.fits(at('the gate-yard of Gatesend', { daylight: 'evening' }), 'scene-village-gate-yard')).toBe(true);
    expect(Fits.fits(at('the Hall kitchen', { daylight: 'evening' }), 'scene-kitchen')).toBe(false);
    expect(Fits.fits(at('the Hall kitchen'), 'scene-kitchen')).toBe(true);
  });
  it('is not of a window\'s daylight under the ground, nor clear in the rain, nor a ship at sea for a sea-bank', () => {
    expect(Fits.fits(at('the king\'s treasury', { underground: true }), 'scene-counting-house')).toBe(false);
    expect(Fits.fits(at('the antechamber', { underground: true }), 'scene-crypt')).toBe(false);
    expect(Fits.fits(at('the forecourt', { weather: 'rainy', daylight: 'evening' }), 'scene-barrow-forecourt')).toBe(false);
    expect(Fits.fits(at('the forecourt', { daylight: 'evening' }), 'scene-barrow-forecourt')).toBe(true);
    expect(Fits.fits(at('the sea-bank at Gatesend'), 'wreck')).toBe(false);
    expect(Fits.fits(at('the deck'), 'wreck')).toBe(true);
  });
});
