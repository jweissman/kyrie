import { describe, expect, it } from 'bun:test';
import { ComputedRelations } from '../src/lang/computed-relations';
import type { Module } from '../src/lang/module';

// Someone is within an area when they stand in a place of it, however deep; and a place is within an area it is, or
// is a place of (the Grand Tour's 11: within(?room, collegium) had held of no room).
describe('within', () => {
  it('holds of someone in a place of the area, of a place of it, and of the area itself', () => {
    const entities = [{ id: 'collegium', type: 'place', name: 'the Collegium', space: { kind: 'building' } },
      { id: 'hall', type: 'place', name: 'the hall', space: { kind: 'room', parent: 'collegium' } },
      { id: 'quad', type: 'place', name: 'the quad', space: { kind: 'room' } },
      { id: 'tench', type: 'group', name: 'Threlkeld' }];
    const world = { module: { entities } as unknown as Module, one: (_n: string, who: string) => who === 'tench' ? 'hall' : undefined };
    const within = (x: string) => ComputedRelations.test(world, { kind: 'call', name: 'within', args: [x, 'collegium'] });
    expect(['tench', 'hall', 'collegium', 'quad'].map(within)).toEqual([true, true, true, false]);
  });
});
