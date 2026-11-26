import { describe, expect, it } from 'bun:test';
import { SceneCensus, type Turn } from '../../../scripts/scene-census';
import { PaintedSky } from '../../../src/ui/painted-sky';
import type { Screen } from '../../../src/ui/screen-types';

// The painting is the place (the doctrine's resting scene), so it keeps to the world's sky (BRIEF §3.4: "Do not depict
// a sunny day when the world is in a storm"). The warrior's golden walk of Iscoed is played headless and the scene's
// painting judged at every turn, the way in first, against what each painting was seen to show (PaintedSky): never
// clear or sunlit in rain, never rain on a dry day, never daylit at evening or night nor of the moon by day, never a
// painting whose light was never recorded, and never no painting at all. Porthalen rains through the whole walk and
// it ends at night, so the walk meets every one of them: before 23 November it showed a sunlit Arcadian valley for
// Reedbridge's bridge-foot in rain, a sunny Roman ruin with figures for Highgate, and nothing for the chandlery at
// night.
const said = (t: Turn) => `${t.turn} ${t.place}, ${t.weather ?? 'no sky'} by ${t.hour}: ${t.painting ?? '-'} [${t.fault}] ${t.why}`;
describe('the painting a scene shows', () => {
  it('keeps to the world\'s sky and hour at every turn of the warrior\'s golden walk, from the way in', async () => {
    const screens = new Map<string, Screen>();
    const turns = await SceneCensus.walk(undefined, s => screens.set(s.place.id, s));
    expect(turns.length).toBeGreaterThan(40);
    // But for a painting wanted and asked for (doc/design/paintings-needed.md: scene-fields-rain, -evening, -night),
    // which the walk has met since its life began in the adit (OR-186: an hour later through the fields): the dim
    // ground there, not a picture against the sky.
    // And the bridge-foot at Reedbridge in rain: its kind's commissioned paintings are all of a dry day, and the old
    // masters that had stood for it are no longer backgrounds (OR-675; OR-676's commission list): a bridge in rain is
    // wanted (doc/design/paintings-needed.md), not a dry bridge against the rain.
    const wanted = (t: Turn) => t.fault === 'blank'
      && (/open fields/.test(t.place) || (/bridge-foot at Reedbridge/.test(t.place) && /rain/.test(t.weather ?? '')));
    expect(turns.filter(t => t.fault && !wanted(t)).map(said)).toEqual([]);
    // And every place the walk passes, put under each of the census's skies (a fair day, rain by day, a fair
    // evening, a fair night, rain by night), is never painted against it: none, where nothing fits, is a painting
    // wanted (doc/design/paintings-needed.md), not a picture against the place.
    const against = [...screens.values()].flatMap(s => SceneCensus.skies.map(sky => {
      const j = PaintedSky.judge(SceneCensus.under(s, sky));
      return j.fault && j.fault !== 'blank' ? `${s.place.name}, ${sky[0]}: ${j.painting} [${j.fault}] ${j.why}` : '';
    })).filter(Boolean);
    expect(screens.size).toBeGreaterThan(10);
    expect(against).toEqual([]);
  }, 120000);
});
