import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message } from '../web/engine/protocol';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';
import { SaveCodec } from '../web/engine/save-codec';

// The worker plays one game at a time, and one command at a time in it (the architecture review's A2, from its
// probes persist-fight-wedge and persist-begin-during-perform). A command sent while a fight waits on the player is
// refused and leaves the fight as it was; a new game begun while a command is under way takes nothing of it.
class Host {
  static async fight() {
    let frames = 0;
    const host = new EngineHost((m: Message) => { if (m.kind === 'frame' && m.frame.combat) { frames++; } });
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const held = host as unknown as { session: PlaySession; turn?: unknown }, checkpoint = held.session.checkpoint();
    const save = checkpoint.save, room = 'region__w8_halls_mourners';
    for (const m of save.creatures.filter(x => save.state.partyIds.includes(x.id))) {
      m.base.maxHp = 300; m.state.hp = 300;
    }
    const world = new World(save.module, save.state.world).apply([
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
      { kind: 'retract', call: ModuleWriter.call('unlit', room) }]);
    save.state.world = CreatureFacts.project(world, save.definition!.actors, new CreatureStore(save.creatures))
      .snapshot;
    held.session = PlaySession.resume(checkpoint);
    return { host, held, frames: () => frames };
  }
}
describe('the engine, while a fight waits on the player', () => {
  it('refuses another command and leaves the fight to be answered', async () => {
    const { host, held, frames } = await Host.fight();
    const attack = PlayerView.choices(held.session.campaign).find(c => /^Attack/.test(c.choice.name))!.choice.id;
    let settled = false;
    const fight = (host.handle({ kind: 'perform', command: attack }) as
      Promise<Frame>).finally(() => { settled = true; });
    await new Promise(r => setTimeout(r, 50));
    expect(frames()).toBeGreaterThan(0);
    expect(host.handle({ kind: 'perform', command: attack })).rejects.toThrow('already in progress');
    expect(!!held.turn).toBe(true);
    // Answered turn after turn, the fight ends, and the game goes on.
    for (let i = 0; i < 400 && !settled; i++) { await host.handle({ kind: 'fight' }); await new Promise(r => setTimeout(r, 1)); }
    await fight;
    expect(await host.handle({ kind: 'checkpoint' })).toBeTruthy();
    const wait = PlayerView.choices(held.session.campaign).find(c => c.choice.id === 'wait')!.choice.id;
    expect((await host.handle({ kind: 'perform', command: wait }) as Frame).screen).toBeTruthy();
  }, 240000);
});
describe('a new game begun while a command of the last is under way', () => {
  it('takes nothing of it', async () => {
    const saves: string[] = [];
    const host = new EngineHost((m: Message) => { if (m.kind === 'saved') { saves.push(m.save); } });
    const inner = host as unknown as { session: PlaySession; log: { title: string }[] };
    const campaign = 'data/campaigns/the-long-man.campaign.json';
    const setting = await host.handle({ kind: 'setting', campaign }) as { party: never[] };
    await host.handle({ kind: 'begin', campaign, seed: 'merrow', party: setting.party });
    const old = inner.session;
    // Standing in for a country beyond being drawn, which takes seconds (as test/checkpoint-race.test.ts does).
    let release!: () => void;
    const entered = new Promise<void>(r => {
      old.extend({ expand: async () => { r(); await new Promise<void>(x => { release = x; }); } });
    });
    const go = PlayerView.choices(old.campaign).find(c => c.choice.id.startsWith('go('))!.choice;
    const performing = host.handle({ kind: 'perform', command: go.id }) as Promise<Frame>;
    await entered;
    const other = 'data/campaigns/thrume.campaign.json';
    const s2 = await host.handle({ kind: 'setting', campaign: other }) as { party: never[] };
    await host.handle({ kind: 'begin', campaign: other, seed: 'saltgrave', party: s2.party });
    release();
    expect(performing).rejects.toThrow('no longer under way');
    await performing.catch(() => undefined);
    expect(inner.log).toEqual([]);
    // The new game is kept once its world is packed, which under a loaded machine is not at once.
    for (let i = 0; i < 300 && !saves.length; i++) { await new Promise(r => setTimeout(r, 100)); }
    const last = JSON.parse(await SaveCodec.unpack(saves.at(-1)!)) as { log: unknown[];
      checkpoint: { transcript: { scenario: string } } };
    expect(last.checkpoint.transcript.scenario).toContain('thrume');
    expect(last.log).toEqual([]);
  }, 240000);
});
