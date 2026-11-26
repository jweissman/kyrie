import { describe, expect, it } from 'bun:test';
import { DeepPurposes, type DeepPurpose } from '../../src/world/deep/deep-purposes';
import { DeepLayouts } from '../../src/world/deep/deep-layout';
import { DeepPacing, type DeepContent } from '../../src/world/deep/deep-pacing';

// Far more fighting in the deep (OR-1234; the owner, 26 November: "add 3x-10x more combat to the game… better to
// overdo than fail to communicate the core pleasure of a system like this"): Orsino's odds put a fight in about four
// rooms of ten; Kyrie's floor under them (DeepPacing.fights) puts dwellers in most rooms below the mouth that are not
// the keeper's. And more fights are not more coin: the dwellers are drawn by their room, so a level's treasure is the
// same with the floor as without it (the economy's band held by the world, not widened); and every level holds a band
// that stands its ground. Generator functions only.
const keys = Array.from({ length: 40 }, (_, n) => `fights${n}:w8:deep`);
const plan = (purpose: DeepPurpose, key: string): DeepContent[] =>
  DeepPacing.plan(purpose, DeepLayouts.make(purpose, 'w8', key), key);
const kept = (purpose: DeepPurpose, c: DeepContent) => ['heart', purpose.keeper.refuge].includes(c.room.role);
const without = <T>(f: () => T): T => {
  const floor = DeepPacing as unknown as { fights: Record<string, number> }, was = floor.fights;
  floor.fights = {};
  try { return f(); } finally { floor.fights = was; }
};
describe('the deep\'s fights', () => {
  for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
    it(`holds dwellers in most rooms not the keeper's, and no more coin for it (${art})`, () => {
      let rooms = 0, held = 0, before = 0;
      for (const key of keys) {
        const now = plan(purpose, key).filter(c => !kept(purpose, c)), was = without(() => plan(purpose, key))
          .filter(c => !kept(purpose, c));
        // Every level with dwellers has a band among them that stands its ground (not all of them slink off).
        for (const level of new Set(now.filter(c => c.dwellers).map(c => c.room.level))) {
          expect(now.some(c => c.room.level === level && c.dwellers && c.dwellers.group.temperament !== 'wary')).toBe(true);
        }
        rooms += now.length; held += now.filter(c => c.dwellers).length; before += was.filter(c => c.dwellers).length;
        expect(now.map(c => [c.room.id, c.treasure?.coin, c.treasure?.items, c.trap?.key]))
          .toEqual(was.map(c => [c.room.id, c.treasure?.coin, c.treasure?.items, c.trap?.key]));
      }
      console.log(`${art}: dwellers in ${held} of ${rooms} rooms (${before} at Orsino's odds)`);
      expect(held / rooms).toBeGreaterThanOrEqual(0.55);
      expect(held / before).toBeGreaterThanOrEqual(1.3);
    });
  }
});
