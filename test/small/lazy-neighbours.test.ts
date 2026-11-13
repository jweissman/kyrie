import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import type { BundleSource } from '../../src/campaign/bundle-source';
import type { Campaign } from '../../src/campaign/campaign';
import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { ModuleWriter } from '../../src/lang/module-writer';

// Progressive commitment on the smallest bed (Mission 21's world-construction investigation, construction.md §4): a
// country committed at the start, and two neighbours not yet realised, each installed the first time the company
// stands at its march-stone, by the same install a country beyond a march is (Frontier). Crossed east first or north
// first, or with the game kept and opened again between, each neighbour is the same country: the same ids, the same
// places, people and facts; and what the company did in one (a torch bought at home, a rope in the east) is so in the
// others. What this does not prove is that a neighbour is drawn the same whatever was drawn before it: a generated
// country's draw reads what is placed already (construction.md §4, the long half of the demonstration).
const home = `
  Place yard "the yard" is room.
  Place east "the east march-stone" is room.
  Place north "the north march-stone" is room.
  Passage yard_east "the east road" is road between yard and east taking 1 hour.
  Passage yard_north "the north road" is road between yard and north taking 1 hour.
  Company party "You" of 1 at yard.
  Person halm "Teodor Halm" at yard { Role "a chandler". Peaceable. Pronouns he. Sells torch for 2 coin from 3. }
  Initially Set quantity(party, gold) to 20.
  Observe yard_scene at yard when true "A yard.".
  Goal false.`;
const country = (id: string, name: string, keeper: string) => `Module ${id} "${name}" {
  Place here "where the road comes in" is room.
  Place ford "the ford of ${name}" is room.
  Passage here_ford "the ford path" is path between here and ford.
  Person ${keeper} "${keeper[0]!.toUpperCase()}${keeper.slice(1)}" at ford { Role "a ferryman". Peaceable. Pronouns he.
    Sells rope for 3 coin from 2. }
  Observe ford_scene at ford when true "A ford.".
  Goal false.
}`;
class Crossing {
  static async start(): Promise<{ s: PlaySession; source: BundleSource }> {
    const source = new OverlayBundleSource(NodeBundleSource.shared, this.files());
    const s = await PlaySession.start(source.resolve('lazy/lazy.campaign.json'), 'tiny', source);
    return { s: s.extend(this.neighbours(source)), source };
  }
  // The neighbours, installed on arrival: each the first time the company stands at its march-stone.
  static neighbours(source: BundleSource) {
    return { expand: async (campaign: Campaign) => {
      const at = campaign.world.one('at', 'party');
      for (const side of ['east', 'north']) {
        if (at !== `t__${side}` || campaign.installed.includes(side)) { continue; }
        await campaign.install({ id: side, bundle: source.resolve(`lazy/${side}/module.json`),
          imports: { here: `t.${side}` } }, source);
      }
    } };
  }
  static files(): Record<string, string> {
    const manifest = (id: string) => JSON.stringify({ version: 1, source: `${id}.kyr`, rules: ['world'],
      imports: ['here'], roles: { here: { type: 'place' } } });
    // The country at home, as SingleModule writes one, with its march-stones exported for its neighbours' roads.
    return { 'lazy/site.kyr': `Module t "Home" {\n${home}\n}`,
      'lazy/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party', east: 'east', north: 'north' } }),
      'lazy/lazy.campaign.json': JSON.stringify({ version: 1, name: 'Home', modules: [{ id: 't', bundle: 'module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
      'lazy/east/module.json': manifest('east'), 'lazy/east/east.kyr': country('east', 'Eastmarch', 'osric'),
      'lazy/north/module.json': manifest('north'), 'lazy/north/north.kyr': country('north', 'Northwold', 'dunn') };
  }
  // The choice a player sees by its words (a way, a purchase), taken.
  static async take(s: PlaySession, words: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => words.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${words}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(', ')}`); }
    await s.leg(c.choice.id);
  }
  // Out to a march-stone and its country's ford, a rope bought in the east, and back home.
  static async visit(s: PlaySession, side: 'east' | 'north') {
    await this.take(s, new RegExp(`${side} road`));
    await this.take(s, /ford path/);
    if (side === 'east') { await this.take(s, /^Buy a coil of rope/); }
    await this.take(s, /ford path/);
    await this.take(s, new RegExp(`${side} road`));
  }
  static kept(s: PlaySession, source: BundleSource): PlaySession {
    return PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as SessionCheckpoint)
      .extend(this.neighbours(source));
  }
  // What a country is, by its ids: its entities, and every fact about them that is not where the company is.
  static country(c: Campaign, prefix: string) {
    const mine = (id: string) => id.startsWith(prefix);
    return { entities: c.module.entities.filter(e => mine(e.id)).map(e => `${e.id} ${e.type} ${e.name}`).sort(),
      facts: c.world.view.relations.filter(f => f.args.some(mine) && !f.args.includes('party'))
        .map(f => `${f.name}(${f.args.join(',')})`).sort() };
  }
  static deeds(c: Campaign) {
    const gold = (who: string) => c.world.number(ModuleWriter.call('quantity', who, 'gold'));
    return { gold: [gold('party'), gold('t__halm'), gold('east__osric')],
      owned: c.world.related('ownedItem').map(f => f.args[0]!.replace(/\d+$/, '')).sort() };
  }
}

describe('two neighbours realised as the company first comes to them', () => {
  it('are the same countries whichever is crossed into first, and across a game kept and opened again', async () => {
    const orders: Campaign[] = [];
    for (const order of ['east, north', 'north, east', 'east, kept, north'] as const) {
      const { s, source } = await Crossing.start();
      await Crossing.take(s, /^Buy a torch/);
      expect(s.campaign.installed).not.toContain('east');
      const first = order.startsWith('north') ? 'north' : 'east';
      await Crossing.visit(s, first);
      expect(s.campaign.installed).toContain(first);
      const live = order.includes('kept') ? Crossing.kept(s, source) : s;
      await Crossing.visit(live, first === 'east' ? 'north' : 'east');
      orders.push(live.campaign);
    }
    const [east, north, kept] = orders.map(c => ({ home: Crossing.country(c, 't__'), east: Crossing.country(c, 'east__'),
      north: Crossing.country(c, 'north__'), deeds: Crossing.deeds(c) }));
    expect(east!.east.entities).toContain('east__osric group Osric, a ferryman');
    expect(north).toEqual(east!);
    expect(kept).toEqual(east!);
    // What the company did in each country is so in the others: a torch from home and a rope from the east, paid for.
    expect(east!.deeds).toEqual({ gold: [15, 2, 3], owned: expect.arrayContaining([expect.stringMatching(/torch/),
      expect.stringMatching(/rope/)]) });
  });
  // Each installation had brought its own copies of the shared rules' callings and peoples, and everyone in the world
  // was then said to have their calling and people once more at every install (T24-11's growth, construction.md §2).
  it('bring no calling or people of their own: no one is said to have theirs again', async () => {
    const { s } = await Crossing.start();
    // What is said of those at home (the east's own people are said to have theirs as they come).
    const said = () => ['hasCalling', 'hasAncestry'].map(r => s.campaign.world.related(r)
      .filter(f => !f.args[0]!.startsWith('east__')).map(f => f.args.join(' ')).sort());
    const before = said();
    await Crossing.visit(s, 'east');
    expect(s.campaign.installed).toContain('east');
    expect(said()).toEqual(before);
    expect(before[0]!.some(f => / calling_warrior$/.test(f))).toBe(true);
    expect(before[0]!.filter(f => !/ calling_[a-z]+$/.test(f))).toEqual([]);
    expect(s.campaign.module.entities.filter(e => /^east__(calling|ancestry)_/.test(e.id))).toEqual([]);
  });
});
