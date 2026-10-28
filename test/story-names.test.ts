import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Communities } from '../src/world/community/community';

// The people of a story cast in a country (a sick child's mother and sister, a drover's wife and son, the parties to a
// disputation) are not given names its own folk have: a fresh play met two Caelynns on one quay, a fisher and a sick
// child's elder sister (play 5, PT-28).
describe('the people of a story', () => {
  it('are named apart from the folk of the country they are cast in', async () => {
    for (const seed of ['kite', 'wren', 'pine', 'larch', 'a1', 'b2']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
        party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
      const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
      const folk = Communities.everyone(w.report.region);
      const cast = c.module.entities.filter(e => e.type === 'group' && !e.id.startsWith('region__')
        && /^(fever|drover|disputation|oldcoin|tower)/.test(e.id)).map(e => e.name.split(', ')[0]!);
      expect([seed, cast.filter(n => folk.has(n))]).toEqual([seed, []]);
    }
  }, 240000);
});
