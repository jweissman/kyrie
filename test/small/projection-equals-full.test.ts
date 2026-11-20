import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { DrawnWorld } from '../../src/world/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Runner, type Said } from '../../src/cli/runner';
import { ScreenModel } from '../../src/ui/screen-model';
import { PlayerView } from '../../src/presentation/player-view';
import { WorldReads } from '../../src/lang/world-reads';

// What is kept from one world to the next (OR-91: the offered actions, the ways, what is told, each kept while nothing
// it read has been written) must agree exactly with working it out afresh. Two sessions of one game are played act by
// act alike: one keeps what it may, the other keeps nothing from world to world (every reading said to read everything,
// as `act-costs --fresh` has it). After every act the turn's answer, the screen and what the company perceives are the
// same in both: no stale act, indicator, route or narration.
type Read = <T>(read: () => T) => { value: T; reads?: string[] };
class Twins {
  private static readonly keeping: Read = WorldReads.of.bind(WorldReads);
  static fresh<T>(read: () => T): { value: T } { return { value: read() }; }
  // Done with nothing kept from one world to the next.
  static async afresh<T>(f: () => Promise<T> | T): Promise<T> {
    WorldReads.of = Twins.fresh as Read;
    try { return await f(); } finally { WorldReads.of = Twins.keeping; }
  }
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
      if ('error' in ours) { break; }
      said = ours as Said; done++;
    }
    return done;
  }
}
describe('what is kept from world to world, against working it out afresh', () => {
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
    expect(await Twins.play(kept, fresh, 5, /^Give Eogan/)).toBe(5);
  }, 120000);
});
