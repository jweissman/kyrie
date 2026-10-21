import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Battle } from '../src/battle';
import type { Command } from '../src/model';

// People who fall on the company: a sentry who challenges trespassers and a patrol that hunts them
// (test/fixtures/watch-house).
class Watch {
  static start() {
    return PlaySession.start('test/fixtures/watch-house/campaign.json', 'watch', NodeBundleSource.shared);
  }
  static where(s: PlaySession) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
  }
  static know(s: PlaySession, fact: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', fact) }]));
  }
  static run(this: void, battle: Battle): Promise<Command> {
    const legal = battle.legalCommands();
    return Promise.resolve(legal.find(c => c.ability === 'flee') ?? legal[0]!);
  }
}

describe('people who fall on the company', () => {
  it('a sentry falls on a company that comes through the gate without the word, and the fight is fought there', async () => {
    const s = await Watch.start();
    const event = await s.perform('go(world__gate,world__gatehouse)');
    expect(event.prelude?.response).toContain('comes at you');
    expect(event.combat.some(e => e.type === 'end')).toBe(true);
    expect(s.campaign.world.test(ModuleWriter.call('assails', 'world__sentry', 'party'))).toBe(false);
  }, 60000);
  it('lets by a company that knows the word', async () => {
    const s = await Watch.start();
    Watch.know(s, 'world__password');
    const event = await s.perform('go(world__gate,world__gatehouse)');
    expect([event.prelude, event.combat.length, Watch.where(s)]).toEqual([undefined, 0, 'world__gatehouse']);
  }, 60000);
  it('puts a company that runs from the fight back where it came from', async () => {
    const s = await Watch.start();
    const event = await s.perform('go(world__gate,world__gatehouse)', Watch.run);
    expect([event.fledTo, Watch.where(s)]).toEqual(['world__lane', 'world__lane']);
    // The sentry is still at his post, and will challenge them again.
    expect(s.campaign.world.test(ModuleWriter.call('at', 'world__sentry', 'world__gatehouse'))).toBe(true);
  }, 60000);
  it('sends the patrol after a company that gets into the yard, and they fall on it there', async () => {
    const s = await Watch.start();
    Watch.know(s, 'world__password');
    await s.perform('go(world__gate,world__gatehouse)');
    const event = await s.perform('go(world__arch,world__yard)');
    const fought = event.prelude ? event : await s.perform('wait_hour');
    expect(fought.prelude?.response).toContain('yard patrol');
    expect(fought.combat.some(e => e.type === 'end')).toBe(true);
  }, 60000);
  it('replays an ambush to the same world from the transcript', async () => {
    const s = await Watch.start();
    await s.perform('go(world__gate,world__gatehouse)');
    const replay = await Watch.start();
    await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
  }, 60000);
});
