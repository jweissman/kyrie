import { beforeAll, describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';
import { GeneratedWorld } from './support/generated';

// The long half of Mission 21's progressive-commitment demonstration (doc/architecture/mission-21/world/
// construction.md §4; the short half is test/small/lazy-neighbours). a1's first country and the two countries beyond
// its western and northern march-stones, realised as the company first stands at each: west then north, north then
// west, and west, the game kept and opened again, then north; a purchase made at home before any crossing. A long spec
// (KYRIE_LONG=1, CI's long descents): one generated start and six countries drawn, about a minute.
// What holds: a game kept between two crossings is the game played on, every fact of every country the same; what the
// company did at home is so after both crossings; the places, ways and people of each country's own region are the
// same ids in either order. What does not: a country's draw reads what is drawn already (the scenarios placed
// anywhere, the paintings the world's people hold, the names of works), so the country drawn second is not the
// country it would have been drawn first (construction.md §4: the fever went to whichever was first).
type Country = { entities: string[]; facts: string[] };
class Orders {
  static readonly seed = 'a1';
  static async start(): Promise<{ checkpoint: string; bought: string }> {
    const w = await WorldAssembler.assemble(this.seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, this.seed, w.source);
    return { bought: await this.buy(s), checkpoint: JSON.stringify(s.checkpoint()) };
  }
  // Something bought from a seller at home, wherever one sells what the company can pay for: what it was.
  static async buy(s: PlaySession): Promise<string> {
    const world = s.campaign.world;
    for (const f of world.related('soldBy')) {
      const site = world.one('at', f.args[0]!);
      if (!site || world.one('at', f.args[1]!) !== site) { continue; }
      GeneratedWorld.put(s, site.replace(/^region__/, ''));
      const buy = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(`buy_item(${f.args[0]!},`));
      if (buy) { await s.leg(buy.choice.id); return f.args[0]!; }
    }
    throw new Error('Nothing at home the company can buy');
  }
  static async cross(s: PlaySession, frontier: Frontier, side: string): Promise<string> {
    GeneratedWorld.put(s, `edge_${side}`);
    return (await frontier.expand(s.campaign))!.rid;
  }
  // west, north; north, west; or west, kept and opened again, north.
  static async play(checkpoint: string, order: 'wn' | 'nw' | 'w|n'): Promise<Campaign> {
    const s = PlaySession.resume(JSON.parse(checkpoint) as SessionCheckpoint, { trusted: true });
    const frontier = new Frontier(this.seed, NodeBundleSource.shared);
    if (order === 'nw') { await this.cross(s, frontier, 'north'); await this.cross(s, frontier, 'west'); return s.campaign; }
    await this.cross(s, frontier, 'west');
    if (order === 'wn') { await this.cross(s, frontier, 'north'); return s.campaign; }
    const save = JSON.parse(JSON.stringify(s.checkpoint())) as SessionCheckpoint;
    const kept = PlaySession.resume(save, { trusted: false });
    await this.cross(kept, new Frontier(this.seed, NodeBundleSource.shared), 'north');
    return kept.campaign;
  }
  // A country by its ids: its entities, and every fact about them that is not where the company stands; or, of the
  // kinds given, its entities' ids alone.
  static country(c: Campaign, prefix: string, types?: string[]): Country {
    const mine = (id: string) => id.startsWith(prefix);
    return { entities: c.module.entities.filter(e => mine(e.id) && (!types || types.includes(e.type)))
      .map(e => types ? `${e.id} ${e.type}` : `${e.id} ${e.type} ${e.name}`).sort(),
    facts: types ? [] : c.world.view.relations.filter(f => f.args.some(mine) && !f.args.includes('party'))
      .map(f => `${f.name}(${f.args.join(',')})`).sort() };
  }
  static all(c: Campaign) {
    return { home: this.country(c, 'region__'), west: this.country(c, 'xm1y0'), north: this.country(c, 'x0ym1') };
  }
}

describe.skipIf(!process.env.KYRIE_LONG)('countries realised as the company first comes to them', () => {
  let bought = '', wn: Campaign, nw: Campaign, kept: Campaign;
  beforeAll(async () => {
    const start = await Orders.start();
    bought = start.bought;
    [wn, nw, kept] = [await Orders.play(start.checkpoint, 'wn'), await Orders.play(start.checkpoint, 'nw'),
      await Orders.play(start.checkpoint, 'w|n')];
  }, 600000);
  it('are the same countries when the game is kept and opened again between two crossings', () => {
    expect(Orders.all(kept)).toEqual(Orders.all(wn));
  });
  it('keep what the company did at home, in whichever order they are crossed into', () => {
    for (const c of [wn, nw, kept]) {
      expect(c.world.one('at', bought)).toBeUndefined();
      expect(c.world.related('ownedItem').some(f => f.args[0] === bought)).toBe(true);
      expect(c.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(
        wn.world.number(ModuleWriter.call('quantity', 'party', 'gold')));
    }
  });
  // Their ids: what they are called is not (Fencarr's barrow is Lacrimerecs drawn first, Tenebrerechies drawn after
  // Cloudreach: works are named apart from the works drawn already).
  it('hold the same places, ways and people under the same ids, in either order', () => {
    const own = ['place', 'passage', 'group', 'member'];
    for (const rid of ['xm1y0__', 'x0ym1__']) {
      expect(Orders.country(nw, rid, own).entities).toEqual(Orders.country(wn, rid, own).entities);
      expect(Orders.country(wn, rid, own).entities.length).toBeGreaterThan(300);
    }
  });
  // The finding (construction.md §4): inverted while a country's draw reads what was drawn before it.
  it.failing('are each the same country whichever is crossed into first', () => {
    expect(Orders.all(nw)).toEqual(Orders.all(wn));
  });
});
