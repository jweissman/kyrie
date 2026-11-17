import { describe, expect, it } from 'bun:test';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import { DeepLayouts, type DeepLayout, type DeepRoom } from '../../src/world/deep/deep-layout';
import { DeepPacing } from '../../src/world/deep/deep-pacing';

// A deep site's first level, as the pacing places who lives in it (the sites commission, item 4; register SI-01): on
// the way a company first comes in by (the spine) nothing lies in wait, and an elite stands only at a branch's end;
// the way in still meets a band close to where the level is entered, as often as before (87% of keys a purpose, the
// Phase A sample): a band changes rooms, it is never weakened or taken away. Generator functions only, no world.
const keys = Array.from({ length: 40 }, (_, n) => `placement${n}:w8:deep`);
const end = (layout: DeepLayout, r: DeepRoom) => r.y !== 1
  && layout.links.filter(l => !l.between && (l.a === r.id || l.b === r.id)).length === 1;
describe('a deep site\'s first level', () => {
  for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
    it(`keeps what lies in wait off the way in, and its worst at a branch's end (${art})`, () => {
      let near = 0;
      for (const key of keys) {
        const layout = DeepLayouts.make(purpose, 'w8', key), level = layout.levels[0]!;
        const first = DeepPacing.plan(purpose, layout, key).filter(c => c.room.level === 0);
        for (const c of first.filter(x => x.dwellers)) {
          if (c.dwellers!.group.temperament === 'ambush') { expect(c.room.y).not.toBe(1); }
          if (c.dwellers!.elite) { expect(end(layout, c.room)).toBe(true); }
          expect(c.dwellers!.id).toBe(`${c.room.id}_dwellers`);
        }
        const order = DeepPacing.order(layout, level).map(o => o.room.id);
        if (first.some(c => c.dwellers && order.indexOf(c.room.id) <= 2)) { near++; }
      }
      expect(near / keys.length).toBeGreaterThanOrEqual(0.8);
    });
  }
});
