import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Spatial } from '../src/spatial';
import { ModuleWriter } from '../src/lang/module-writer';

// Every ruin of a generated country holds something to meet, look at, change, take or find out inside it: a quarter of
// the first ruins reached had held no band and nothing else to do (the play-structure investigation's PT-40).
describe('a ruin of a generated country', () => {
  it('holds at least two things to meet, look at, change, take or find out', async () => {
    for (const seed of ['kite', 'wren', 'b2']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
        { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
      const c = (await PlaySession.start(w.path, seed, w.source)).campaign, world = c.world;
      const byId = new Map(c.module.entities.map(e => [e.id, e]));
      for (const site of c.module.entities.filter(e => /^region__w\d+_site$/.test(e.id))) {
        const rooms = new Set(c.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room'
          && Spatial.ancestry(byId, e.id).some(a => a.id === site.id)).map(e => e.id));
        const inside = (e: { id: string }) => rooms.has(world.one('at', e.id) ?? '');
        const held = c.module.entities.filter(e => inside(e) && (e.type === 'thing' || e.type === 'item'
          || (e.type === 'group' && !world.test(ModuleWriter.call('peaceable', e.id))))).length
          + (c.module.observations ?? [])
            .filter(o => o.teaches && (rooms.has(o.place) || inside({ id: o.place }))).length;
        expect([seed, site.name, held >= 2]).toEqual([seed, site.name, true]);
      }
    }
  }, 240000);
});
