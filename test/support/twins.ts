import { expect } from 'bun:test';
import type { PlaySession } from '../../src/session/play-session';
import { Runner, type Said } from '../../src/cli/runner';
import { ScreenModel } from '../../src/ui/screen-model';
import { PlayerView } from '../../src/presentation/player-view';
import { WorldReads } from '../../src/lang/world-reads';
import type { World } from '../../src/lang/world';
import { ModuleWriter } from '../../src/lang/module-writer';
import type { Module } from '../../src/lang/module';
import { Nearby } from '../../src/campaign/nearby';
import { LocalObservations } from '../../src/campaign/local-observations';

// Two sessions of one game played alike, one keeping what it may from world to world and the other nothing (see
// test/projection-equals-full and test/projection-equals-drawn).
type Read = <T>(read: () => T) => { value: T; reads?: string[] };
export class Twins {
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
  // One line done by both, and what each then shows; the kept twin's answer.
  static async step(twins: { kept: PlaySession; fresh: PlaySession; k: Runner; f: Runner }, line: string) {
    const ours = await twins.k.ask(line);
    expect(await this.afresh(() => twins.f.ask(line))).toEqual(ours);
    expect(await this.afresh(() => this.seen(twins.fresh))).toEqual(this.seen(twins.kept));
    return ours;
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
