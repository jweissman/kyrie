import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Countries } from '../src/world/countries';
import { WorldGrid } from '../src/world/world-grid';
import { Borders } from '../src/world/land/borders';
import { ProvincePlay } from './support/province-play';

// One continuing world holds every authored adventure (Mission 16's XIII). Where each lies is decided by the seed
// before anyone goes anywhere: the first country's marches lead where its folk have always said, and every other
// authored country lies further out, beyond a country drawn from the seed that is the way into no other. Its word is
// had where it is entered, and a country nearer in; beyond any other march toward it, there is no road over.
describe('a world of every adventure', () => {
  it('places every authored country, each beside a country it may lie beside, and walls none in', () => {
    for (const seed of ['wren', 'thorn', 'a1', 'b2', 'g7', 'kin', 'mere', 'cov13']) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain, plan = Countries.plan(seed, first);
      // Every country beyond a march somewhere; the provinces are parts of the first country (Mission 18).
      expect([...plan.values()].map(c => c.id).sort()).toEqual(Countries.marches.map(c => c.id).sort());
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

  // One country, every adventure in it (Mission 18's Gate B): each a province of the first country, its way in on the
  // country's own land with a road to it from a town, told of in every town, and gone into by that road.
  it('holds every adventure as a province of the first country, each told of and each with its road in', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    expect(w.report.region.provinces!.map(p => p.country).sort()).toEqual(Countries.list.map(c => c.id).sort());
    expect(Countries.marches).toEqual([]);
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    for (const country of Countries.list.filter(x => x.rumour)) {
      expect(c.module.actions.some(a => a.id.startsWith(`region__gate_${country.id}_beyond_told_`)), country.id).toBe(true);
    }
    const { c: into, told } = await ProvincePlay.enter('kite', 'thrume',
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    expect(told).toContain('salt town');
    expect(into.installations.find(m => m.id === 'pthrume')?.chapter).toBe(true);
    expect(into.world.one('at', 'party')).toBe('pthrume__salt_road');
  }, 300000);
});
