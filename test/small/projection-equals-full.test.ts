import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { DrawnWorld } from '../../src/world/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Runner, type Said } from '../../src/cli/runner';
import { ScreenModel } from '../../src/ui/screen-model';
import { PlayerView } from '../../src/presentation/player-view';
import { WorldReads } from '../../src/lang/world-reads';
import { World } from '../../src/lang/world';
import { KeptReading } from '../../src/lang/kept-reading';
import { ModuleWriter } from '../../src/lang/module-writer';
import type { Module } from '../../src/lang/module';
import { Nearby } from '../../src/campaign/nearby';
import { LocalObservations } from '../../src/campaign/local-observations';
import { Tiny } from '../support/tiny';

// What is kept from one world to the next (OR-91: the offered actions, the ways, what is told, each kept while nothing
// it read has been written) must agree exactly with working it out afresh. Two sessions of one game are played act by
// act alike: one keeps what it may, the other keeps nothing from world to world (every reading said to read everything,
// as `act-costs --fresh` has it). After every act the turn's answer, the screen and what the company perceives are the
// same in both: no stale act, indicator, route or narration.
type Read = <T>(read: () => T) => { value: T; reads?: string[] };
class Twins {
  // A world of one relation, and a reading of what one party first knows.
  static readonly knowing = { relations: [{ name: 'knows', types: ['entity', 'entity'], exclusive: false }], measures: [],
    queries: [], entities: [], actions: [] } as unknown as Module;
  static fact(kind: 'assert' | 'retract', ...args: string[]) { return { kind, call: ModuleWriter.call('knows', ...args) }; }
  static first(w: World) { return w.related('knows', 'c')[0]?.args[1]; }
  private static readonly keeping: Read = WorldReads.of.bind(WorldReads);
  static fresh<T>(read: () => T): { value: T } { return { value: read() }; }
  // Done with nothing kept from one world to the next.
  static async afresh<T>(f: () => Promise<T> | T): Promise<T> {
    WorldReads.of = Twins.fresh as Read;
    try { return await f(); } finally { WorldReads.of = Twins.keeping; }
  }
  // What is near the company, read at once (Nearby), is what each observation's own test finds near it.
  static near(s: PlaySession) {
    const world = s.campaign.world, actor = s.campaign.playerActor!, near = Nearby.of(world, actor);
    // Of a named thing or way (one of a variable, ?b, is asked of each thing it binds: LocalObservations.each).
    const anchored = (s.campaign.module.observations ?? []).filter(o => (o.anchor === 'near' || o.anchor === 'beside')
      && !o.place.startsWith('?'));
    return anchored.filter(o => LocalObservations.perceives(world, actor, o.place, o.anchor)
      !== (o.anchor === 'near' ? near.near : near.beside).has(o.place)).map(o => o.id);
  }
  // And so wherever the company might stand to be near each one: where the thing is, where a way it is on or guards
  // starts, where the box it is in stands, where a way told of beside starts (the company set down there).
  static everywhere(s: PlaySession): string[] {
    const w = s.campaign.world, actor = s.campaign.playerActor!, wrong: string[] = [];
    const anchored = (s.campaign.module.observations ?? []).filter(o => (o.anchor === 'near' || o.anchor === 'beside')
      && !o.place.startsWith('?'));
    for (const o of anchored) {
      for (const at of this.stands(w, o.place).slice(0, 2)) {
        const there = w.apply([...w.related('at', actor).map(f => ({ kind: 'retract' as const, call: f })),
          { kind: 'assert', call: ModuleWriter.call('at', actor, at) }]);
        const near = Nearby.of(there, actor), set = o.anchor === 'near' ? near.near : near.beside;
        if (LocalObservations.perceives(there, actor, o.place, o.anchor) !== set.has(o.place)) {
          wrong.push(`${o.id}@${at}`);
        }
      }
    }
    return wrong;
  }
  private static stands(w: World, thing: string): string[] {
    return [...w.related('at', thing).map(f => f.args[1]!), ...this.starts(w, thing),
      ...[...w.related('on', thing), ...w.related('guards', thing)].flatMap(f => this.starts(w, f.args[1]!)),
      ...w.related('inside', thing).flatMap(f => w.related('at', f.args[1]!).map(x => x.args[1]!))];
  }
  private static starts(w: World, way: string): string[] { return w.related('connects', way).map(c => c.args[1]!); }
  static seen(s: PlaySession) {
    return { screen: ScreenModel.build(s.campaign), observed: PlayerView.observe(s.campaign) };
  }
  // Each act the kept twin's turn leads with (the first one first, if given), done by both; what each then shows.
  static async play(kept: PlaySession, fresh: PlaySession, acts: number, first?: RegExp): Promise<number> {
    const k = new Runner(kept), f = await this.afresh(() => new Runner(fresh));
    let said = k.said(), done = 0;
    expect(await this.afresh(() => f.said())).toEqual(said);
    for (let i = 0; i < acts && kept.campaign.running; i++) {
      const all = [...said.offer.primary, ...said.offer.rest];
      const o = (i === 0 && first ? all.find(x => first.test(x.label)) : undefined) ?? said.offer.primary[0];
      if (!o) { break; }
      const line = JSON.stringify({ act: o.id }), ours = await k.ask(line);
      expect(await this.afresh(() => f.ask(line))).toEqual(ours);
      expect(await this.afresh(() => this.seen(fresh))).toEqual(this.seen(kept));
      expect(this.near(kept)).toEqual([]);
      if ('error' in ours) { break; }
      said = ours as Said; done++;
    }
    return done;
  }
}
describe('what is kept from world to world, against working it out afresh', () => {
  it('holds a reading over what it did not pick, and not over a fact of it written, or moved in its order', () => {
    const w0 = new World(Twins.knowing, { relations: [ModuleWriter.call('knows', 'c', 'a'),
      ModuleWriter.call('knows', 'c', 'b')], measures: [] });
    const kept = KeptReading.read(w0, () => Twins.first(w0)).kept!;
    expect(kept.picks?.get('knows')).toBeDefined();
    const w1 = w0.apply([Twins.fact('assert', 'd', 'z')]);
    expect(KeptReading.holds(w1, kept)).toBe(true);
    expect(KeptReading.holds(w1.apply([Twins.fact('assert', 'c', 'e')]), kept)).toBe(false);
    // Taken away and put back, knows(c, a) is listed after knows(c, b): what c first knows is b now.
    const w2 = w1.apply([Twins.fact('retract', 'c', 'a')]).apply([Twins.fact('assert', 'c', 'a')]);
    expect(Twins.first(w2)).toBe('b');
    expect(KeptReading.holds(w2, kept)).toBe(false);
  });
  it('finds near the company, read at once, just what each thing\'s own test of nearness finds', async () => {
    const t = await Tiny.start('Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.');
    const c = t.journey.session.campaign, actor = c.playerActor!, at = c.world.one('at', actor)!;
    const facts = [['memberOf', 'm1', actor], ['ownedItem', 'lamp', 'm1'], ['travelsWith', 'dog', 'guide'],
      ['at', 'guide', at], ['inside', 'coin', 'box'], ['at', 'box', at], ['inside', 'gem', 'chest'], ['at', 'chest', at],
      ['state', 'chest', 'locked'], ['closesWhen', 'chest', 'locked'], ['guards', 'warden', 'gate'],
      ['connects', 'gate', at, 'lane'], ['at', 'warden', 'lane'], ['guards', 'idler', 'gate'], ['at', 'idler', 'far'],
      ['on', 'trap', 'path'], ['connects', 'path', at, 'field'], ['at', 'rock', 'field']];
    const w = c.world.apply(facts.map(([name, ...args]) => ({ kind: 'assert' as const,
      call: ModuleWriter.call(name!, ...args) })));
    const near = Nearby.of(w, actor), things = ['lamp', 'dog', 'guide', 'coin', 'box', 'gem', 'chest', 'warden',
      'idler', 'trap', 'rock', 'm1'];
    expect(things.filter(x => near.near.has(x))).toEqual(things.filter(x => LocalObservations.perceives(w, actor, x,
      'near')));
    expect(things.filter(x => near.near.has(x))).toEqual(['lamp', 'dog', 'guide', 'coin', 'box', 'chest', 'warden',
      'trap']);
    expect(['gate', 'path', 'lane'].filter(x => near.beside.has(x))).toEqual(['gate', 'path']);
  });
  it('agrees act by act on a small world', async () => {
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }, { name: 'Bran', raceId: 'human',
      classId: 'warrior' }];
    const start = () => PlaySession.start('test/fixtures/ford-road/campaign.json', 'projection-equals',
      NodeBundleSource.shared, party);
    const kept = await start(), fresh = await Twins.afresh(start);
    expect(await Twins.play(kept, fresh, 8)).toBeGreaterThan(3);
  }, 60000);
  it('agrees act by act in a drawn country: a quest seen through, then talk, which writes what it knows', async () => {
    const drawn = { origin: 'order', party: [{ name: 'Hamo', raceId: 'human', classId: 'cleric',
      backgroundId: 'doctor' }] };
    const start = () => DrawnWorld.start('a1', drawn, NodeBundleSource.shared);
    const kept = await start(), fresh = await Twins.afresh(start);
    expect(Twins.everywhere(kept)).toEqual([]);
    expect(await Twins.play(kept, fresh, 5, /^Give Eogan/)).toBe(5);
  }, 120000);
});
