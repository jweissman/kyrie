import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { World } from '../../src/lang/world';
import { KeptReading } from '../../src/lang/kept-reading';
import { WorldMemo } from '../../src/lang/world-memo';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Nearby } from '../../src/campaign/nearby';
import { LocalObservations } from '../../src/campaign/local-observations';
import { Tiny } from '../support/tiny';
import { Twins } from '../support/twins';
import { KeptParts } from '../../src/ui/kept-parts';
import { Openings } from '../../src/presentation/openings';

// What is kept from one world to the next (OR-91: the offered actions, the ways, what is told, each kept while nothing
// it read has been written) must agree exactly with working it out afresh. Two sessions of one game are played act by
// act alike: one keeps what it may, the other keeps nothing from world to world (every reading said to read everything,
// as `act-costs --fresh` has it). After every act the turn's answer, the screen and what the company perceives are the
// same in both: no stale act, indicator, route or narration.

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
  // A view kept once a world (WorldMemo), asked first outside any reading and then within one: the reading still reads
  // what it read, so a later world that writes of it keeps nothing (the journeys plan over the one search a world).
  it('notes what a view kept once a world read, wherever it is asked again', () => {
    const w0 = new World(Twins.knowing, { relations: [ModuleWriter.call('knows', 'c', 'a')], measures: [] });
    const memo = new WorldMemo<string | undefined>(), first = () => memo.of(w0, 'c', () => Twins.first(w0));
    expect(first()).toBe('a');
    const kept = KeptReading.read(w0, () => [first(), first()]).kept!;
    expect(kept.reads).toEqual(['knows']);
    expect(KeptReading.holds(w0.apply([Twins.fact('assert', 'd', 'z')]), kept)).toBe(true);
    expect(KeptReading.holds(w0.apply([Twins.fact('assert', 'c', 'e')]), kept)).toBe(false);
  });
  // A part of the page kept from one world to the next (KeptParts): again where what else it was worked out from, or a
  // name it worded a row by, is not what it was.
  it('keeps a part of the page while what it read, what it was worked out from and the names it asked are the same', () => {
    const w0 = new World(Twins.knowing, { relations: [ModuleWriter.call('knows', 'c', 'a')], measures: [] });
    const w1 = w0.apply([Twins.fact('assert', 'd', 'z')]), names = new Map([['a', 'Ann']]);
    let reads = 0;
    const part = (w: World, from: string) => KeptParts.named(w, 'twins', { from, names },
      n => `${n.get(Twins.first(w)!)}${++reads}`);
    expect([part(w0, 'here'), part(w1, 'here')]).toEqual(['Ann1', 'Ann1']);
    expect(part(w1, 'there')).toBe('Ann2');
    names.set('a', 'Anna');
    expect(part(w1, 'there')).toBe('Anna3');
    expect(part(w1.apply([Twins.fact('assert', 'c', 'b')]), 'there')).toBe('Anna4');
    // An install adds to the module's entities in place: a part that went through them is read again.
    const w2 = new World({ ...Twins.knowing, entities: [] }, { relations: [ModuleWriter.call('knows', 'c', 'a')],
      measures: [] });
    const count = () => KeptParts.of(w2, 'twins', '', () => `${w2.module.entities.length}:${++reads}`);
    expect([count(), count()]).toEqual(['0:5', '0:5']);
    w2.module.entities.push({ id: 'e', type: 'thing', name: 'e' });
    expect(count()).toBe('1:6');
  });
  // The offered actions grounded together (KeptGroundings.all), asked again in the same world within a reading: what
  // they read is still read there, though none is grounded again.
  it('notes what the offered actions read when none of them is grounded again', async () => {
    const t = await Tiny.start('Place yard "the yard" is room. Place lane "the lane" is room. '
      + 'Passage gate "the gate" is path between yard and lane. Company party "You" of 1 at yard.');
    const c = t.journey.session.campaign, w = c.world, actor = c.playerActor!;
    const offered = c.operators.applicable(w, actor);
    const kept = KeptReading.read(w, () => c.operators.applicable(w, actor)).kept!;
    expect(kept.value).toBe(offered);
    const moved = w.apply([...w.related('at', actor).map(f => ({ kind: 'retract' as const, call: f })),
      { kind: 'assert', call: ModuleWriter.call('at', actor, 't__lane') }]);
    expect(KeptReading.holds(moved, kept)).toBe(false);
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
  // What a skill would open is told of a way once the company has been at its foot, which the log says, not the
  // world (Openings: KeptParts' from).
  it('agrees as the company comes to the foot of a way it cannot yet climb', async () => {
    const kyr = `Place lane "the lane" is room. Place foot "the foot of the tower" is room at 0, 0 outdoors.
      Place top "the top of the tower" is room at 0, 1 outdoors.
      Passage track "the track up from the lane" is path between lane and foot.
      Passage stair "the broken stair" is climb between foot and top needing climbing or rope.
      Company party "You" of 1 at lane.`;
    const kept = (await Tiny.start(kyr)).journey.session;
    const fresh = (await Twins.afresh(() => Tiny.start(kyr))).journey.session;
    expect(await Twins.play(kept, fresh, 3, /foot of the tower|track/)).toBeGreaterThan(0);
    // As a sheet's development tells it, where a level is to be had.
    const opens = Openings.of(kept.campaign);
    expect([...opens.values()].flat().join()).toContain('the broken stair');
    expect(await Twins.afresh(() => Openings.of(fresh.campaign))).toEqual(opens);
  }, 60000);
  it('agrees act by act on a small world', async () => {
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }, { name: 'Bran', raceId: 'human',
      classId: 'warrior' }];
    const start = () => PlaySession.start('test/fixtures/ford-road/campaign.json', 'projection-equals',
      NodeBundleSource.shared, party);
    const kept = await start(), fresh = await Twins.afresh(start);
    expect(await Twins.play(kept, fresh, 8)).toBeGreaterThan(3);
  }, 60000);

});
