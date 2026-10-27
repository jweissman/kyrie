import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { WorldGrid } from '../src/world/world-grid';
import { Borders } from '../src/world/land/borders';
import { GeneratedWorld } from './support/generated';

// One continuing world holds every authored adventure (Mission 16's XIII). Where each lies is decided by the seed
// before anyone goes anywhere: the first country's marches lead where its folk have always said, and every other
// authored country lies further out, beyond a country drawn from the seed that is the way into no other. Its word is
// had where it is entered, and a country nearer in; beyond any other march toward it, there is no road over.
describe('a world of every adventure', () => {
  it('places every authored country, each beside a country it may lie beside, and walls none in', () => {
    for (const seed of ['wren', 'thorn', 'a1', 'b2', 'g7', 'kin', 'mere', 'cov13']) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain, plan = Countries.plan(seed, first);
      expect([...plan.values()].map(c => c.id).sort()).toEqual(Countries.list.map(c => c.id).sort());
      const ways = [...plan].map(([cell, c]) => WorldGrid.id(...WorldGrid.next(WorldGrid.at(cell)!,
        Borders.opposite[c.side])));
      for (const [i, [, c]] of [...plan].entries()) {
        const way = ways[i]!;
        expect(plan.has(way)).toBe(false);
        expect(c.beside).toContain(way === 'region' ? first : WorldGrid.drawn(seed, ...WorldGrid.at(way)!).terrain);
      }
      // The first country leads into as many as its folk ever told of; every other is the way into one at most.
      expect(new Set(ways.filter(w => w !== 'region')).size).toBe(ways.filter(w => w !== 'region').length);
      // The first ring as it always was: what fits beyond each march of the first country.
      for (const side of Borders.sides) {
        const told = Countries.fits(first, side, () => false, seed);
        expect(plan.get(WorldGrid.id(...WorldGrid.next([0, 0], side)))?.id).toBe(told?.id);
      }
    }
  }, 60000);

  // Whether a country is in the world already is known by an entity only it has: The Patient Star's tally made the
  // frontier think What Tessary Owes placed once the Ghessil Uplands were (the library tour, wren).
  it('knows each country by an entity no other adventure declares', () => {
    const declared = /^\s*(?:Person|Place|Thing|Item|Entity|Company|Hazard|Passage|Discovery)\s+(\w+)\b/gm;
    const by = new Map<string, Set<string>>();
    for (const c of Countries.list) {
      const dir = `data/adventures/${c.bundle.split('/')[0]}`;
      for (const file of readdirSync(dir).filter(f => f.endsWith('.kyr'))) {
        for (const m of readFileSync(`${dir}/${file}`, 'utf8').matchAll(declared)) {
          by.set(m[1]!, new Set([...by.get(m[1]!) ?? [], c.id]));
        }
      }
    }
    expect(Countries.list.map(c => [c.id, [...by.get(c.marker) ?? []]]))
      .toEqual(Countries.list.map(c => [c.id, [c.id]]));
  });

  it('is told of a country further off, then in full where it is entered, and the road leads in', async () => {
    const w = await WorldAssembler.assemble('ember', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'ember', w.source), c = s.campaign;
    const frontier = new Frontier('ember', NodeBundleSource.shared);
    const ask = async (pattern: RegExp) => {
      const topic = c.module.actions.find(a => pattern.test(a.id))!;
      await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!);
      const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id))!;
      return (await s.perform(choice.choice.id)).response ?? '';
    };
    // In the first country: Thrume lies beyond Leafholt, the country south, east of it.
    expect(w.report.region.further!.map(f => [f.id, f.side, f.then])).toEqual([['thrume', 'south', 'east']]);
    expect(await ask(/^region__edge_south_further_told_/)).toContain('East of it there is Thrume');
    expect(PlayerView.observe(c).knowledge.map(k => k.id)).toContain('region__edge_south_further_thrume');
    // Down the road south, over the march, to Leafholt, where the innkeepers tell of it in full.
    await GeneratedWorld.travel(s, 'edge_south');
    expect((await frontier.expand(c))!.rid).toBe('x0y1');
    await s.perform(PlayerView.choices(c).find(x => /^go\(link.*x0y1__edge_north\)$/.test(x.choice.id))!.choice.id);
    expect(await ask(/^x0y1__edge_east_beyond_told_/)).toContain('salt town');
    expect(c.module.entities.find(e => e.id === 'x0y1__edge_east')!.name).toBe('the march-stone of Thrume');
    // At its march-stone the road goes on into Thrume, a chapter of the world, and in by the salt road.
    await GeneratedWorld.travel(s, 'x0y1__edge_east');
    const drawn = await frontier.expand(c);
    expect(drawn!.rid).toBe('x1y1');
    expect(c.installations.find(m => m.id === 'x1y1')?.chapter).toBe(true);
    await s.perform(PlayerView.choices(c).find(x => /^go\(link.*x1y1__salt_road\)$/.test(x.choice.id))!.choice.id);
    expect(c.world.one('at', 'party')).toBe('x1y1__salt_road');
  }, 300000);

  it('goes no further at a march toward one entered from another side, and says so', async () => {
    const w = await WorldAssembler.assemble('ember', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'ember', w.source), c = s.campaign;
    const frontier = new Frontier('ember', NodeBundleSource.shared);
    // Coldmoor, east of the first, has Thrume south of it; Thrume is entered from Leafholt.
    await GeneratedWorld.travel(s, 'edge_east');
    expect((await frontier.expand(c))!.rid).toBe('x1y0');
    const scene = c.module.observations!.find(o => o.id === 'x1y0__edge_south_scene')!.text;
    expect(scene).toContain('Beyond it lies Thrume');
    expect(scene).toContain('no road goes over into it from this side. The way in is from Leafholt, they say.');
    await GeneratedWorld.travel(s, 'x1y0__edge_south');
    expect(frontier.drawing(c)).toBe(false);
    expect(await frontier.expand(c)).toBeUndefined();
    expect(c.installed).not.toContain('x1y1');
  }, 300000);
});
