import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Communities } from '../src/world/community/community';
import { Spatial } from '../src/spatial';
import type { Campaign } from '../src/campaign/campaign';

// The people of a story cast in a country (a sick child's mother and sister, a drover's wife and son, the parties to a
// disputation) are not given names its own folk have: a fresh play met two Caelynns on one quay, a fisher and a sick
// child's elder sister (play 5, PT-28). Nor are two of them given one name: where the folk have every name of their
// people but one, a story's people drawn a name already taken were all given that one (three Kildraks in wren).
describe('the people of a story', () => {
  it('are named apart from the folk of the country they are cast in', async () => {
    for (const seed of ['kite', 'wren', 'pine', 'larch', 'a1', 'b2']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
        party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
      const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
      const folk = Communities.everyone(w.report.region);
      const cast = c.module.entities.filter(e => e.type === 'group' && !e.id.startsWith('region__')
        && /^(fever|drover|disputation|oldcoin|tower)/.test(e.id)).map(e => e.name.split(', ')[0]!);
      const twice = cast.filter((n, i) => cast.indexOf(n) !== i);
      expect([seed, cast.filter(n => folk.has(n)), twice]).toEqual([seed, [], []]);
    }
  }, 240000);
  // A story's own people keep the names their author gave them, and the country's people are named apart from them
  // (NAV-04): in ash a tin-miner, and in h2 an armourer, had been called Odile, in the country where Silkholme's
  // silk-gatherer Odile is; the placement says the names it holds. And no settlement of a country has two people of
  // one name, nor anyone of a story (by a name of their own) one of the country's people has.
  it('keep their authors\' names, and no settlement has two people of one name', async () => {
    for (const seed of ['ash', 'h2', 'kite', 'troupe']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
        party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
      const c = (await PlaySession.start(w.path, seed, w.source)).campaign;
      const brood = w.report.placements.find(p => p.scenario === 'brood-hollow');
      if (['ash', 'h2'].includes(seed)) {
        expect([seed, brood?.named]).toEqual([seed, ['Garth', 'Odile']]);
        expect(w.report.region.reserved).toEqual(expect.arrayContaining(['Garth', 'Odile']));
        expect(c.module.entities.filter(e => e.type === 'group' && /^Odile\b/.test(e.name)).map(e => e.id))
          .toEqual(['brood__odile']);
      }
      expect([seed, Census.alike(c)]).toEqual([seed, []]);
    }
  }, 240000);
});

// Who is where: the people of each settlement, and the country's people by name.
class Census {
  static name(n: string): string { return n.split(', ')[0]!; }
  static alike(c: Campaign): string[] {
    const entities = new Map(c.module.entities.map(e => [e.id, e]));
    const people = c.module.entities.filter(e => e.type === 'group' && e.id !== 'party')
      .map(e => ({ id: e.id, name: this.name(e.name), at: c.world.one('at', e.id) ?? '' }))
      .filter(p => p.at && p.at !== 'region__elsewhere');
    const town = (at: string) => Spatial.ancestry(entities, at).find(e => e.space?.kind === 'settlement')?.id;
    const settled = people.filter(p => town(p.at));
    const twice = settled.filter(p => settled.some(q => q.id < p.id && q.name === p.name && town(q.at) === town(p.at)));
    // A story's person with a name of their own (Odile, not "the brood-mother") whom one of the country's has.
    const country = new Set(people.filter(p => p.id.startsWith('region__')).map(p => p.name));
    const shared = people.filter(p => !p.id.startsWith('region__') && /^\p{Lu}/u.test(p.name) && !/^The /.test(p.name)
      && country.has(p.name));
    return [...twice, ...shared].map(p => `${p.id} ${p.name}`);
  }
}
