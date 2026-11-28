import { describe, expect, it } from 'bun:test';
import { DeepBelow } from '../../../src/world/deep/deep-below';
import { DeepLayouts } from '../../../src/world/deep/deep-layout';
import { DeepPacing } from '../../../src/world/deep/deep-pacing';
import { DeepPurposes } from '../../../src/world/deep/deep-purposes';
import { Stones } from '../../../src/world/deep/stones';

// The old dark (OR-1622): the reference dungeon goes on below the bottom of its makers' works. Under the barrow's
// grave, by a crack under the guard-benches, one level more of natural caves, written by the deep sites' own
// generator: its rooms by role, its dwellers and its worst drawn for its depth, its treasure of that depth's tier, and
// in its den a warden of serious resistance lying on a hoard rolled on Deem (DeepCarried), set down where it falls.
// Drawn by its own key, so the makers' levels above it are as they were; and the same by the same key.
const barrow = DeepPurposes.of('bone')!, key = 'old-dark:s1_ud:deep';
const deep = DeepBelow.extend(barrow);
describe('World › The old dark below the makers\' works', () => {
  it('goes on one level below the grave, from the guard room, and leaves the levels above as they were', () => {
    const was = DeepLayouts.make(barrow, 'ud', key), now = DeepLayouts.make(deep, 'ud', key);
    expect(now.levels.map(l => l.id)).toEqual(['ud_barrow', 'ud_halls', 'ud_grave', 'ud_below']);
    expect(now.levels.slice(0, 3)).toEqual(was.levels);
    const way = now.links.find(l => l.between && l.b === 'ud_below_fissure')!;
    expect(way.a).toBe('ud_grave_guard_room');
    expect(way.name).toBe('the crack under the guard-benches');
    // The king keeps his grave: the keeper is the makers', where it was.
    expect(now.levels[2]!.rooms.some(r => r.role === 'heart')).toBe(true);
    expect(now.levels[3]!.rooms.some(r => r.role === 'heart')).toBe(false);
  });
  it('holds its depth\'s dwellers and treasure, its den kept for its warden and the hoard under it', () => {
    const layout = DeepLayouts.make(deep, 'ud', key), plan = DeepPacing.plan(deep, layout, key);
    const below = plan.filter(c => c.room.level === 3);
    expect(below.some(c => c.dwellers)).toBe(true);
    // Its treasure is of the deepest tier the makers' finds reach, or Orsino's loot of it and the one above.
    const grand = new Set([...barrow.finds!.grand!, ...barrow.valuables!.grand!.map(v => v.id), ...Stones.tiers.grand!,
      ...Stones.tiers.legendary!]), found = below.flatMap(c => c.treasure?.items ?? []);
    expect(found.length).toBeGreaterThan(0);
    expect(found.filter(k => !grand.has(k))).toEqual([]);
    const den = below.find(c => c.room.role === 'den')!;
    expect(den.dwellers).toBeUndefined();
    const lines = DeepBelow.lines(deep, layout, key).join('\n');
    expect(lines).toMatch(/Person ud_below_warden "[^"]+" at ud_below_den \{[^}]*Level 8\.[^}]*Lair ud_below_den\. \}/);
    // What it lies on waits under it, and is set down where it falls.
    expect(lines).toContain('Place ud_below_hoard "under the hoard" is room within ud_below.');
    expect(lines).toMatch(/Item ud_below_warden_carried0 "[^"]+" is \w+ at ud_below_hoard\./);
    expect(lines).toMatch(/Rule ud_below_warden_drops when dead\(ud_below_warden\) and at\(ud_below_warden, \?r\)/);
    expect(DeepBelow.lines(deep, layout, key)).toEqual(DeepBelow.lines(deep, DeepLayouts.make(deep, 'ud', key), key));
    // A purpose that names no way down is as it was.
    expect(DeepBelow.extend({ ...barrow, below: undefined })).toEqual({ ...barrow, below: undefined });
  });
});
