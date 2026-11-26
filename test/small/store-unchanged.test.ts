import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';

// A commit that leaves a record as it was leaves it where it lies, and the store's revision as it was: what is
// derived from the records (Projection) is then not worked out again. A watch's lease of everyone under a lasting
// condition had written every record again, changed or not, and the company's facts were projected again for every
// watch of a journey (OR-145).
describe('a commit that changes nothing', () => {
  const made = () => {
    const content = new Content('store-unchanged');
    return new CreatureStore(ItemCatalog.canon, [content.createCreature(ItemCatalog.canon, 'hero', { raceId: 'human', classId: 'warrior' }),
      content.createCreature(ItemCatalog.canon, 'goblin', { raceId: 'goblin', classId: 'commoner' })]);
  };
  it('keeps each record and the revision', () => {
    const store = made(), hero = store.peek('hero'), version = store.version, lease = store.acquire(['hero', 'goblin']);
    try { lease.commit(lease.creatures); } finally { lease.release(); }
    expect(store.peek('hero')).toBe(hero);
    expect(store.version).toBe(version);
  });
  it('replaces only the record that changed, and moves the revision', () => {
    const store = made(), hero = store.peek('hero'), goblin = store.peek('goblin'), version = store.version;
    const lease = store.acquire(['hero', 'goblin']);
    try {
      lease.creatures.find(c => c.id === 'goblin')!.state.hp -= 1;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    expect(store.peek('hero')).toBe(hero);
    expect(store.peek('goblin')).not.toBe(goblin);
    expect(store.peek('goblin').state.hp).toBe(goblin.state.hp - 1);
    expect(store.version).toBe(version + 1);
  });
});
