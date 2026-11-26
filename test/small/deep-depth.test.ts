import { describe, expect, it } from 'bun:test';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import { DeepLayouts } from '../../src/world/deep/deep-layout';
import { DeepPacing } from '../../src/world/deep/deep-pacing';

// Dungeons deeper everywhere (OR-1232; the owner, 26 November: "deepen/extend existing dungeon sites throughout
// generated, intrinsic and authored locations"): every deep purpose serves a country's own deep work, the catacombs
// under a town and the dead place under the reference town's woods alike, so a level of every purpose has three rooms
// at least, and its deepest level two rooms or more besides the keeper's own, where a company meets what stands
// about the keeper (each a branch off the way, so the way to the keeper is as the walked specs know it). And a site
// of every purpose keeps two levels of serious resistance or more (the owner, 24 November: OR-311), each with a boss
// (dwellers of the second level or above) and coin to carry home. Generator functions only, over forty keys a
// purpose; no world.
// The rooms whose coin is laid out to be found (DeepRooms.lines).
const laid = ['treasure', 'elite', 'special', 'mob'];
const keys = Array.from({ length: 40 }, (_, n) => `depth${n}:w8:deep`);
describe('a deep site', () => {
  for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
    it(`has no level of fewer than three rooms, and dwellers' rooms on its last besides the keeper's (${art})`, () => {
      for (const level of purpose.levels) {
        const rooms = [...level.spine, ...(level.branches ?? []).flatMap(b => b.roles)].filter(r => !r.startsWith('?'));
        expect(`${level.id} ${rooms.length >= 3}`).toBe(`${level.id} true`);
      }
      const last = purpose.levels.at(-1)!, kept = ['heart', purpose.keeper.refuge];
      const others = [...last.spine, ...(last.branches ?? []).flatMap(b => b.roles)]
        .filter(r => !r.startsWith('?') && !kept.includes(r));
      expect(others.length).toBeGreaterThanOrEqual(2);
    });
    it(`keeps two levels of serious resistance, each with a boss and coin (${art})`, () => {
      let held = 0;
      for (const key of keys) {
        const layout = DeepLayouts.make(purpose, 'w8', key), content = DeepPacing.plan(purpose, layout, key);
        const serious = layout.levels.filter(l => {
          const rooms = content.filter(c => c.room.level === l.index);
          const coin = rooms.reduce((t, c) => t + (laid.includes(c.guide) ? c.treasure?.coin ?? 0 : 0), 0);
          return rooms.some(c => (c.dwellers?.level ?? 0) >= 2) && coin >= 10;
        });
        if (serious.length >= 2) { held++; }
      }
      expect(held / keys.length).toBeGreaterThanOrEqual(0.9);
    });
  }
});
