import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';

// No two people on one page are shown in the same painting: a fresh play at a tablet's size met a carpenter and a
// child's elder sister in one painting on one quay, and a farmer and the child's mother in another (play 5). The
// folk of a country are each given their own; anyone else (a story's people, cast in a town) is given one no one on
// the page has.
describe('the people on a page', () => {
  it('are each in a painting of their own', async () => {
    for (const seed of ['kite', 'wren']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
        party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
      const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
      const rooms = c.module.entities.filter(e => /^region__s\d+_/.test(e.id) && e.type === 'place');
      for (const room of rooms) {
        GeneratedWorld.put(s, room.id.replace(/^region__/, ''));
        const shown = ScreenModel.build(c).people.flatMap(p => p.portrait ? [p.portrait.src] : []);
        expect([room.id, shown.length - new Set(shown).size]).toEqual([room.id, 0]);
      }
    }
  }, 180000);
});
