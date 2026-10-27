import { describe, expect, it } from 'bun:test';
import { Arms } from '../web/reader/arms';
import type { Catalog, Member } from '../web/engine/protocol';

// The weapon someone sets out with is chosen at creation from their calling's own; until it is, the one they strike
// best with (a fresh play's ranger, quick and slight, had been given a spear by the draw, and could not hit a knight).
describe('a weapon to set out with', () => {
  const worth = Array.from({ length: 31 }, (_, score) => Math.floor((score - 10) / 2));
  const catalog = { worth, ancestries: [{ id: 'elf', name: 'Elf', text: '', callings: ['ranger'], qualities: { dexterity: 2 } }],
    callings: [{ id: 'ranger', name: 'Ranger', text: '', specializations: [], qualities: { strength: 1, dexterity: 2 },
      weapons: [{ id: 'longsword', name: 'Longsword', missile: false }, { id: 'spear', name: 'Spear', missile: false },
        { id: 'shortbow', name: 'Shortbow', missile: true }] }] } as unknown as Catalog;
  const ranger = (strength: number, dexterity: number) => ({ raceId: 'elf', classId: 'ranger',
    rolled: { strength, dexterity } }) as unknown as Member;
  it('is the bow for one quick and slight, the sword for one strong and slow', () => {
    expect(Arms.suited(ranger(8, 15), catalog)).toBe('shortbow');
    expect(Arms.suited(ranger(16, 8), catalog)).toBe('longsword');
  });
  it('is struck with by the quality the page shows, with what the people and the calling add', () => {
    expect(Arms.worth(ranger(8, 15), catalog, 'dexterity')).toBe(4);
    expect(Arms.worth(ranger(8, 15), catalog, 'strength')).toBe(-1);
  });
});
