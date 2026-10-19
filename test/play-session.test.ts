import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { CheckpointStore } from '../src/session/checkpoint-store';
import { MemoryStorage } from './support/memory-storage';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import type { CampaignSave } from '../src/campaign/campaign';
import type { Command } from '../src/model';
import { Scenarios } from '../web/scenarios';

class Fixture {
  static crossing = 'data/bundles/crossing.campaign.json';
  static start(seed = 'slice', manifest = this.crossing) { return PlaySession.start(manifest, seed, Scenarios.source()); }
  static async play(session: PlaySession, commands: string[]) {
    for (const command of commands) { await session.perform(command); }
    return session;
  }
}

describe('browser session command handling', () => {
  it('accepts only legal public commands and leaves state untouched otherwise', async () => {
    const session = await Fixture.start();
    const before = session.campaign.save();
    await expect(session.perform('pay(crossing__guard)')).rejects.toThrow('Unavailable command');
    await expect(session.perform('travel(party,crossing__village,crossing__bank)')).rejects.toThrow('Unavailable command');
    await expect(session.perform('attack(crossing__guard)')).rejects.toThrow('Unavailable command');
    expect(session.campaign.save()).toEqual(before);
    expect(session.transcript.steps).toEqual([]);
    await session.perform('travel(crossing__bank)');
    expect(session.campaign.state.elapsed).toBe(1);
    expect(session.transcript.steps).toEqual([{ command: 'travel(crossing__bank)' }]);
  });
  it('records the player side of an encounter and replays it to the identical canonical state', async () => {
    const played = await Fixture.play(await Fixture.start('ember'), ['travel(crossing__bank)']);
    const chosen: Command[] = [];
    await played.perform('attack(crossing__guard)', battle => {
      const command = battle.legalCommands()[0]!;
      chosen.push(command);
      return Promise.resolve(command);
    });
    expect(played.transcript.steps[1]).toEqual({ command: 'attack(crossing__guard)', combat: chosen });
    expect(played.campaign.events[1]!.combat.length).toBeGreaterThan(0);
    const replayed = await Fixture.start('ember');
    await replayed.replay(played.transcript.steps);
    expect(replayed.canonical()).toBe(played.canonical());
    const short = await Fixture.start('ember');
    await expect(short.replay([{ command: 'travel(crossing__bank)' },
      { command: 'attack(crossing__guard)', combat: [] }])).rejects.toThrow('Transcript ended during combat');
    expect(short.campaign.events).toHaveLength(1);
  });
  it('rolls back an encounter atomically when the controller supplies an illegal command', async () => {
    const session = await Fixture.play(await Fixture.start(), ['travel(crossing__bank)']);
    const before = session.campaign.save();
    let turns = 0;
    await expect(session.perform('attack(crossing__guard)', battle => {
      turns++;
      const legal = battle.legalCommands()[0]!;
      return Promise.resolve(turns < 2 ? legal : { ...legal, target: 'nobody' });
    })).rejects.toThrow('Illegal combat command');
    expect(turns).toBe(2);
    expect(session.campaign.save()).toEqual(before);
    expect(session.transcript.steps).toHaveLength(1);
    expect(session.acting).toBe(false);
    await session.perform('attack(crossing__guard)');
    expect(session.campaign.events).toHaveLength(2);
  });
  it('rejects overlapping commands while an encounter awaits the player', async () => {
    const session = await Fixture.play(await Fixture.start(), ['travel(crossing__bank)']);
    let release: (c: Command) => void = () => undefined;
    const pending = session.perform('attack(crossing__guard)', () => new Promise<Command>(resolve => { release = resolve; }));
    await Promise.resolve();
    expect(session.acting).toBe(true);
    expect(() => session.checkpoint()).toThrow('Save only between campaign commands');
    await expect(session.perform('wait')).rejects.toThrow('already in progress');
    release({ actor: '', ability: '', target: '' });
    await expect(pending).rejects.toThrow('Illegal combat command');
  });
});

describe('browser persistence', () => {
  it('continues identically after a local-storage checkpoint roundtrip', async () => {
    const storage = new MemoryStorage(), store = new CheckpointStore(storage, () => '2026-10-17T00:00:00Z');
    const first = await Fixture.play(await Fixture.start(), ['travel(crossing__bank)', 'pay(crossing__guard)']);
    store.write('before payment', first.checkpoint());
    store.write(CheckpointStore.autosave, first.checkpoint());
    const resumed = PlaySession.resume(store.read('before payment'));
    const rest = ['pay(crossing__guard)', 'pay(crossing__guard)', 'wait', 'cross(crossing__guard,crossing__road)'];
    await Fixture.play(resumed, rest);
    const uninterrupted = await Fixture.play(await Fixture.start(), ['travel(crossing__bank)', 'pay(crossing__guard)', ...rest]);
    expect(resumed.canonical()).toBe(uninterrupted.canonical());
    expect(store.list().map(s => [s.name, s.elapsed, s.seed]).sort()).toEqual([['autosave', 2, 'slice'], ['before payment', 2, 'slice']]);
    store.remove('before payment');
    expect(() => store.read('before payment')).toThrow('No saved slot');
    expect(() => store.write('../escape/name?', first.checkpoint())).toThrow('Slot names');
  });
  it('imports bare Kyr saves from the CLI with an explicitly incomplete transcript', async () => {
    const session = await Fixture.play(await Fixture.start(), ['walk(crossing__refuge)']);
    const exported = JSON.stringify(session.campaign.save());
    const parsed = CheckpointStore.parse(exported);
    expect('transcript' in parsed).toBe(false);
    const imported = PlaySession.fromSave(parsed as CampaignSave);
    expect(imported.transcript).toMatchObject({ seed: 'slice', complete: false, steps: [] });
    await imported.perform('wait');
    await session.perform('wait');
    expect(imported.campaign.save()).toEqual(session.campaign.save());
    expect(() => CheckpointStore.parse('{"version":1}')).toThrow('Not a Kyrie');
    expect(() => CheckpointStore.parse(JSON.stringify({ transcript: { version: 1 }, save: {} }))).toThrow('Invalid session');
  });
  it('loads bundled browser assets exactly as the CLI loads files', async () => {
    for (const scenario of Scenarios.list) {
      const memory = await PlaySession.start(scenario.manifest, scenario.seed, Scenarios.source());
      const files = await PlaySession.start(scenario.manifest, scenario.seed, NodeBundleSource.shared);
      expect(memory.canonical()).toBe(files.canonical());
    }
    const source = new MemoryBundleSource({ 'data/a/b.json': '{}', 'data/c.kyr': 'x' });
    expect(source.resolve('../c.kyr', 'data/a/b.json')).toBe('data/c.kyr');
    expect(source.resolve('./a/../c.kyr', 'data/x.json')).toBe('data/c.kyr');
    await expect(source.read('data/missing.kyr')).rejects.toThrow('Missing bundled file');
  }, 60000);
});
