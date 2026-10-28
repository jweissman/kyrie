import { describe, expect, it } from 'bun:test';
import { SiteScale } from '../src/ui/site-scale';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import type { Entity } from '../src/lang/module';

// How big a place set out for is, said before the journey: one that goes down level under level, a large place or a
// small one (NAV-09: a minor cave could be taken for the reward of a long journey).
class Sites {
  static place(id: string, kind: string, parent?: string): Entity {
    return { id, type: 'place', name: id, space: { kind, ...parent ? { parent } : {} } } as Entity;
  }
  static rooms(site: string, n: number, parent = site): Entity[] {
    return Array.from({ length: n }, (_, i) => this.place(`${site}_r${i}`, 'room', parent));
  }
}

describe('a site set out for', () => {
  it('is said to be small, large, or to go down a long way', () => {
    const entities = [Sites.place('cave', 'site'), ...Sites.rooms('cave', 2),
      Sites.place('keep', 'site'), ...Sites.rooms('keep', 11),
      Sites.place('mine', 'site'), Sites.place('mine_l1', 'level', 'mine'), Sites.place('mine_l2', 'level', 'mine'),
      ...Sites.rooms('mine', 6, 'mine_l1'), ...Sites.rooms('mine2', 6, 'mine_l2'),
      Sites.place('hall', 'site'), ...Sites.rooms('hall', 6)];
    expect(['cave', 'keep', 'mine', 'hall'].map(id => SiteScale.of(entities, id)))
      .toEqual(['a small place', 'a large place', 'goes down a long way', undefined]);
  });
  // Kite's ruins, told of: a doorway in a crag with three rooms behind it, and a mine four levels deep.
  it('says so where it is offered to set out for', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply(['region__w1_named', 'region__w8_named'].map(fact =>
      ({ kind: 'assert', call: ModuleWriter.call('knows', 'party', fact) }))));
    const going = ScreenModel.build(c).destinations ?? [];
    expect(['region__w1', 'region__w8'].map(id => going.find(d => d.id === id)?.scale))
      .toEqual(['a small place', 'goes down a long way']);
  }, 120000);
});
