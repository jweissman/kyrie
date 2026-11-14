import { describe, expect, it } from 'bun:test';
import { Gesture, type Commit, type Said, type Source, type Step } from '../../web/reader/instrument/gesture';

// The first touch's press (Mission 21, first-touch.md): when a press commits, never what it does. Every promise of
// the owner's for the primary control that a press can break is held here, for both treatments (down, up):
// a press commits once whatever repeats; an interrupted hold never commits; a tap on a held act only asks; a press
// slid off before release (up) commits nothing; a touch always waits for release (a finger may scroll).
class Run {
  static of(commit: Commit, hold: number, steps: Step[]): Said[] {
    const g = new Gesture(commit, hold);
    return steps.flatMap(s => g.feed(s));
  }
  static commits(commit: Commit, hold: number, steps: Step[]): number {
    return Run.of(commit, hold, steps).filter(s => s === 'commit').length;
  }
  static down(at: number, source: Source = 'mouse', repeat = false): Step { return { kind: 'down', at, source, repeat }; }
  static up(at: number, inside = true): Step { return { kind: 'up', at, inside }; }
}

describe('a press on the first touch\'s row', () => {
  for (const commit of ['down', 'up'] as const) {
    it(`commits once, at most, however the input repeats (${commit})`, () => {
      const keys = [Run.down(0, 'key'), ...[30, 60, 90, 120].map(t => Run.down(t, 'key', true)), Run.up(140)];
      expect(Run.commits(commit, 0, keys)).toBe(1);
      const twice = [Run.down(0), Run.up(70), Run.down(90), Run.up(150)];
      expect(Run.commits(commit, 0, twice)).toBe(1);
      expect(Run.of(commit, 0, [Run.down(0)])[0]).toBe('struck');
    });
    it(`never commits a hold let go early, and asks at a tap (${commit})`, () => {
      expect(Run.of(commit, 650, [Run.down(0), Run.up(400), { kind: 'time', at: 650 }])).toEqual(['holding', 'let-go']);
      expect(Run.of(commit, 650, [Run.down(0), { kind: 'cancel', at: 300 }, { kind: 'time', at: 700 }]))
        .toEqual(['holding', 'let-go']);
      expect(Run.of(commit, 650, [Run.down(0, 'touch'), Run.up(120)])).toEqual(['holding', 'ask']);
      // Slid off and let go quickly is not a tap: nothing is asked.
      expect(Run.of(commit, 650, [Run.down(0), Run.up(120, false)])).toEqual(['holding', 'let-go']);
      expect(Run.of(commit, 650, [Run.down(0), { kind: 'time', at: 649 }, { kind: 'time', at: 650 }, Run.up(700)]))
        .toEqual(['holding', 'commit']);
    });
    it(`waits for a finger's release, which may be a scroll (${commit})`, () => {
      expect(Run.of(commit, 0, [Run.down(0, 'touch')])).toEqual(['struck']);
      expect(Run.of(commit, 0, [Run.down(0, 'touch'), { kind: 'cancel', at: 40 }, Run.up(90)])).toEqual(['struck', 'released']);
    });
  }
  it('commits at the down in one, at the release over the row in the other', () => {
    expect(Run.of('down', 0, [Run.down(0), Run.up(90, false)])).toEqual(['struck', 'commit']);
    expect(Run.of('up', 0, [Run.down(0), Run.up(90, false)])).toEqual(['struck', 'released']);
    expect(Run.of('up', 0, [Run.down(0), Run.up(90)])).toEqual(['struck', 'commit']);
  });
});
