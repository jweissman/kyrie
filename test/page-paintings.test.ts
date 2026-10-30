import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Portraits } from '../src/ui/portraits';
import { Frontier } from '../src/world/frontier';
import { Canon } from '../src/canon/canon';
import { Likeness } from '../src/paintings/likeness';
import { GeneratedWorld } from './support/generated';

// Whom each painting a world's people are met in is of: every one person of a people the paintings are of, but the
// company itself.
class Census {
  static take(s: PlaySession): Map<string, string[]> {
    const c = s.campaign, read = c.readout, held = new Map<string, string[]>();
    for (const [id, members] of Object.entries(read.inhabitants)) {
      const member = members.length === 1 ? read.creatures.find(x => x.id === members[0]) : undefined;
      if (!member || Canon.ancestries[member.raceId]?.playable !== true || id === c.playerActor) { continue; }
      const src = Portraits.of(c, id)?.src;
      if (src) { held.set(src, [...held.get(src) ?? [], id]); }
    }
    return held;
  }
  static twice(held: Map<string, string[]>): [string, string[]][] {
    return [...held].filter(([, ids]) => ids.length > 1);
  }
  static async generated(seed: string, origin = 'kin') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin });
    return PlaySession.start(w.path, seed, w.source);
  }
}

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
  // Nor are two people of one country, whichever village each is met in: a widow in black and a sick child's mother
  // had been one smiling woman gutting a fish (the cold evaluation's M17-65). Each home had been painted apart: cov11
  // hung the child's mother in a merchant's painting two towns off, the drover's wife in a chandler's and the drover's
  // son in another town's shepherd's; Carth's Joby and Cuthbert, Low Water's Dov and Basset and Wrayford's Jennet
  // and Honoria were one painting each.
  it('are each in a painting no one else of their country is in', async () => {
    const cov11 = await Census.generated('cov11'), held = Census.take(cov11);
    expect(Census.twice(held)).toEqual([]);
    expect([...held.values()].flat().length).toBeGreaterThan(45);
    // The child's mother and the drover's wife are still painted, as women of their years.
    for (const id of ['fever__mother', 'drover__wife']) {
      const painting = /([\w-]+)\.webp$/.exec(Portraits.of(cov11.campaign, id)?.src ?? '')?.[1] ?? '';
      expect([id, Likeness.sitter(painting)?.sex, Likeness.sitter(painting)?.age === 'young']).toEqual([id, 'woman', false]);
    }
    for (const book of ['a-winter-in-carth', 'low-water', 'the-third-night']) {
      const s = await PlaySession.start(`data/campaigns/${book}.campaign.json`, 'census', NodeBundleSource.shared);
      expect([book, Census.twice(Census.take(s))]).toEqual([book, []]);
    }
  }, 120000);
  // A country drawn beyond the march is painted apart from the one the company comes from, and takes from no one
  // there the painting they were met in: a1 and the country west of it had hung seven paintings in common. Its own
  // people (`xm1y0__`) avoid every painting the world holds; a story's person there may take one held a country away
  // only where nothing else of their kind is left (with the circus's forty people in a1, the fever's mother west of
  // it is in a resident's painting), and never one held in their own country (M17-65's remains).
  it('are painted apart across the march, and keep their faces when the country beyond is drawn', async () => {
    const s = await Census.generated('a1', 'wanderer'), before = Census.take(s);
    GeneratedWorld.put(s, 'edge_west');
    expect((await new Frontier('a1', NodeBundleSource.shared).expand(s.campaign))?.rid).toBe('xm1y0');
    const after = Census.take(s), beyond = [...after.values()].flat().filter(id => id.startsWith('xm1y0__'));
    expect(beyond.length).toBeGreaterThan(20);
    const country = (id: string) => id.startsWith('xm1y0') ? 'beyond' : 'first';
    const shared = Census.twice(after);
    expect(shared.filter(([, ids]) => ids.some(id => id.startsWith('xm1y0__')))).toEqual([]);
    expect(shared.filter(([, ids]) => new Set(ids.map(country)).size < ids.length)).toEqual([]);
    expect([...before].filter(([src, ids]) => after.get(src)?.[0] !== ids[0])).toEqual([]);
  }, 120000);
});
