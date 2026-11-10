import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';

// Pressing a fight on is for that fight: carried into the next command, the next two fights at the hobs' hold, their
// chief's among them, were fought out by the game's tactics with no page at all (Mission 20's fourth round, F 147).
describe('pressing a fight on', () => {
  it('ends with the command it was pressed in', async () => {
    const host = new EngineHost(() => undefined);
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    await host.handle({ kind: 'fight', through: true });
    const held = host as unknown as { session: PlaySession; pressing: boolean };
    expect(held.pressing).toBe(true);
    const wait = PlayerView.choices(held.session.campaign).find(r => /^wait/.test(r.choice.id))!;
    await host.handle({ kind: 'perform', command: wait.choice.id });
    expect(held.pressing).toBe(false);
  }, 120000);
});
