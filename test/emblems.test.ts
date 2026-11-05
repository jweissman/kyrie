import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { Emblems } from '../src/presentation/emblems';

// One visual vocabulary (the owner, 5 November): every people, calling, way, kind of life and reason for coming has an
// emblem of its own, drawn from the one authored table (data/paintings/emblems.json), never a letter in a ring.
describe('the emblems', () => {
  const catalog = Creation.catalog();
  it('draw every people, playable or met, every calling and its ways, and every kind of life', () => {
    const callings = catalog.callings.flatMap(c => [c.id, ...c.specializations.map(t => t.id)]);
    const ids = [...catalog.ancestries.map(a => a.id), ...callings, ...catalog.kinds.map(k => `life_${k.id}`)];
    expect(ids.filter(id => !Emblems.has(id))).toEqual([]);
  });
  it('keep each one to one thing, and draw what the Encyclopedia shows the same', () => {
    const keys = Object.values(Emblems.sets).flatMap(s => Object.keys(s.paths));
    expect(keys.length).toBe(new Set(keys).size);
    expect(Emblems.svg('catfolk')).toContain(Emblems.path('catfolk')!);
    expect(Emblems.svg('no_such_thing')).toBe('');
  });
});
