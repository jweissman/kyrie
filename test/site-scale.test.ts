import { describe, expect, it } from 'bun:test';
import { SiteScale } from '../src/ui/site-scale';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import type { Entity } from '../src/lang/module';
import { Spatial } from '../src/spatial';

// How big a place set out for is, said before the journey: one that goes down level under level (or up), a large
// place or a small one (NAV-09: a minor cave could be taken for the reward of a long journey).
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
  // A tower's levels go up as well as down ("The tower · goes down a long way": play 8); and the foot of a site,
  // where its ways in start, says how big the site behind it is.
  it('says a tower rises, and says it at the tower\'s foot', () => {
    const way = (passage: string, from: string, to: string) => ({ kind: 'call' as const, name: 'connects',
      args: [passage, from, to] });
    const entities = [Sites.place('land', 'region'), Sites.place('foot', 'room', 'land'), Sites.place('tower', 'site', 'land'),
      { ...Sites.place('under', 'level', 'tower'), name: 'Under the tower' }, { ...Sites.place('top', 'level', 'tower'),
        name: 'The top of the tower' }, ...Sites.rooms('crypt', 2, 'under')];
    const ways = [way('postern', 'foot', 'crypt_r0'), way('postern', 'crypt_r0', 'foot')];
    expect(SiteScale.of(entities, 'tower')).toBe('level upon level');
    expect(SiteScale.behind(entities, 'foot', ways)).toBe('tower');
    expect(SiteScale.of(entities, 'foot', ways)).toBe('level upon level');
    expect(SiteScale.behind(entities, 'crypt_r0', ways)).toBeUndefined();
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
  // Kite's lone tower, Ulmusspira: its keep is the unquiet tower's own site, gone into from the tower's foot. Told of,
  // the foot says how big the keep is; been into, the keep is not offered again under its own name beside the foot.
  it('is one place with the foot it is gone into from', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    const put = (place: string) => held.commit(held.world.apply([{ kind: 'retract',
      call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
    { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w9_named') }]));
    put('tower__bailey');
    await s.perform('go(tower__chapel_arch,tower__chapel)');
    put('region__s1_green');
    await s.perform('wait');
    const going = ScreenModel.build(c).destinations ?? [];
    expect(going.find(d => d.id === 'region__w9')?.scale).toBe('level upon level');
    expect(going.map(d => d.id)).not.toContain('tower__tower');
  }, 120000);
  // Nor is a ruin offered to set out for from inside it (the cold evaluation: "SET OUT FOR Sanhtusrecs", from its own
  // long passage). Kite's mine, four levels deep, told of, and stood in.
  it('is not offered to set out for from inside it', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w8_named') }]));
    expect((ScreenModel.build(c).destinations ?? []).map(d => d.id)).toContain('region__w8');
    const byId = new Map(c.module.entities.map(e => [e.id, e]));
    const within = c.module.entities.find(e => e.space?.kind === 'room' && Spatial.ancestry(byId, e.id)
      .some(a => a.id === 'region__w8_site'))!;
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', within.id) }]));
    expect((ScreenModel.build(c).destinations ?? []).map(d => d.id)).not.toContain('region__w8');
  }, 120000);
});
