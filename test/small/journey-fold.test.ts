import { describe, expect, it } from 'bun:test';
import { JourneyFold } from '../../src/presentation/journey-fold';
import type { Screen } from '../../src/ui/screen-types';

// CL-33: which journeys the rest keeps (the others behind the journeys lens): one road for each way leaving, where an
// aim names, where gone before, the way out, and the nearest three others.
const leg = (way: string, to: string) => ({ way, to, minutes: 10 });
const to = (id: string, minutes: number, ...legs: [string, string][]) =>
  ({ id, name: id, minutes, legs: legs.map(([w, t]) => leg(w, t)) });
const town: [string, string] = ['the lane', 'the green'];
const screen = {
  roads: [to('west', 70, town, ['the old road west', 'a stone']), to('far-west', 300, town,
    ['the old road west', 'a stone'], ['on', 'the march']), to('east', 200, town, ['the road', 'a bridge'])],
  around: [to('inn', 5, town), to('chapel', 6, town), to('yard', 7, town), to('pit', 8, town), to('weir', 30, town)],
  destinations: [to('mound', 160, town, ['a track', 'a mound'])],
  aims: [{ id: 'a', text: 'Go to the mound', places: ['mound'] }],
  map: [{ id: 'weir', name: 'weir', zone: '', visited: true, here: false }],
} as unknown as Screen;
describe('JourneyFold', () => {
  it('keeps a road for each way leaving, the aimed, the visited and the nearest three', () => {
    const kept = JourneyFold.kept(screen, { to: 'gate', name: 'the gate', ways: [], minutes: 2, command: 'out(x)' });
    expect([...kept].sort()).toEqual(['chapel', 'east', 'gate', 'inn', 'mound', 'out(x)', 'weir', 'west', 'yard']);
    expect(JourneyFold.keeps(kept, 'travel:mound')).toBe(true);
    expect(JourneyFold.keeps(kept, 'travel:far-west')).toBe(false);
    expect(JourneyFold.keeps(kept, 'travel:pit')).toBe(false);
  });
});
