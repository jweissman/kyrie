import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message } from '../src/creation/protocol';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';
import { Digest } from '../src/session/digest';

// The browser and the terminal through a fight (PR-05: client parity had covered no fight). From one checkpoint, a
// company in the barrow's mourners' hall with the ghouls there, the page answering each turn with no choice of its own
// (the tactics choose, as they do for a companion left to fight) and the terminal fighting by the same tactics, the two
// come to the same world after it, and the page's save reloads as the terminal's.
class Pair {
  static async start() {
    let turns = 0;
    const host = new EngineHost((m: Message) => { if (m.kind === 'frame' && m.frame.combat) { turns++; } });
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const held = host as unknown as { session: PlaySession }, kept = held.session.checkpoint(), save = kept.save;
    // Hardy enough to see the fight through, so both are compared after it and not at a death.
    for (const m of save.creatures.filter(x => save.state.partyIds.includes(x.id))) {
      m.base.maxHp = 300; m.state.hp = 300;
    }
    const room = 'region__w8_halls_mourners', world = new World(save.module, save.state.world).apply([
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
      { kind: 'retract', call: ModuleWriter.call('unlit', room) }]);
    save.state.world = CreatureFacts.project(world, save.definition!.actors,
      new CreatureStore(ItemCatalog.of(save.module.catalog),
      save.creatures))
      .snapshot;
    const copy = (): SessionCheckpoint => JSON.parse(JSON.stringify(kept)) as SessionCheckpoint;
    held.session = PlaySession.resume(copy());
    return { host, page: held, terminal: PlaySession.resume(copy()), turns: () => turns };
  }
}
describe('the browser and the terminal, through a fight', () => {
  it('come to the same world after it, and the page\'s save reloads as the terminal\'s', async () => {
    const { host, page, terminal, turns } = await Pair.start();
    expect(Digest.of(page.session.campaign)).toBe(Digest.of(terminal.campaign));
    const attack = PlayerView.choices(terminal.campaign).find(c => /^Attack/.test(c.choice.name))!.choice.id;
    let settled = false;
    const fought = (host.handle({ kind: 'perform', command: attack }) as Promise<Frame>)
      .finally(() => { settled = true; });
    for (let i = 0; i < 400 && !settled; i++) {
      await host.handle({ kind: 'fight' });
      await new Promise(r => setTimeout(r, 1));
    }
    await fought;
    // A fight it was, the page asked turn after turn.
    expect(turns()).toBeGreaterThan(1);
    await terminal.leg(attack);
    expect(terminal.campaign.history.length).toBe(page.session.campaign.history.length);
    expect(Digest.of(terminal.campaign)).toBe(Digest.of(page.session.campaign));
    const kept = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint };
    expect(Digest.of(PlaySession.resume(kept.checkpoint).campaign)).toBe(Digest.of(terminal.campaign));
  }, 240000);
});
