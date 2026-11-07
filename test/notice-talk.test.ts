import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// The notices of the countries beyond, talked of where travellers are kept: once, the first time the company hears
// each, and not on every night at every inn after (the fresh playtest of 7 November: five of them, every evening,
// had stood between a company and what its own act did). The notice stays where it is nailed up, to be read.
class Inn {
  // What a wait there tells, and what the place shows after it.
  static async said(s: PlaySession): Promise<string[]> {
    const event = await s.perform('wait') as { perceptions?: { text: string }[] };
    const now = PlayerView.observe(s.campaign).observations.map(o => o.text);
    return [...(event.perceptions ?? []).map(p => p.text), ...now].filter(t => /nailed up where travellers/.test(t));
  }
}

describe('the talk of the notices at an inn', () => {
  it('is heard the first time, and not again on coming back, and the notices are still there to read', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    const room = s.campaign.module.entities.find(e => /^region__s1_.*taproom$/.test(e.id))!.id.replace(/^region__/, '');
    GeneratedWorld.put(s, room);
    expect((await Inn.said(s)).length).toBeGreaterThan(0);
    expect(await Inn.said(s)).toEqual([]);
    GeneratedWorld.put(s, room.replace(/taproom$/, 'green'));
    await s.perform('wait');
    GeneratedWorld.put(s, room);
    expect(await Inn.said(s)).toEqual([]);
    expect(PlayerView.choices(s.campaign).some(c => /^Read /.test(c.choice.name))).toBe(true);
  }, 120000);
});
