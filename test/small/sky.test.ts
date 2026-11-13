import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// There is no weather under the ground: the header had said "· sunny" in the crypt under the churchyard (round 12, B,
// T30). The sky as a generated region writes it (RegionWeather: a thing sky, its state the weather), over a green and
// an old adit.
const fen = `
  Place region "the Reedlands" is region.
  Place fen "the fen" is wilderness within region at 0, 0.
  Place green "the green" is room within fen at 0, 0 outdoors.
  Place adit "the old adit" is room within fen at 1, 0 underground.
  Passage mouth "the adit mouth" is path between green and adit.
  Thing sky "the sky" at region is scenery { State weather_sunny "sunny". State weather_rainy "rainy". }
  Initially Assert state(sky, weather_sunny).
  Company party "You" of 1 at green.
  Goal false.`;

describe('the weather', () => {
  it('is told under the sky, and not under the ground', async () => {
    const t = await Tiny.start(fen);
    expect(t.screen.weather).toBe('sunny');
    t.journey.put('party', 't__adit');
    expect(t.look().screen.weather).toBeUndefined();
  });
});
