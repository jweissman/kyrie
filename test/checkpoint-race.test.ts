import { describe, expect, it } from 'bun:test';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { EngineHost } from '../web/engine/engine-host';

// A checkpoint is the game between commands (the independent review's A2): one taken while a command was under way,
// its country beyond still being drawn, held the command's effects but not its step, so the save and its transcript
// disagreed. The session refuses one then, and the page's download waits for the command.
class Race {
  static slow(s: PlaySession) {
    let release!: () => void, inside!: () => void;
    const entered = new Promise<void>(r => { inside = r; });
    s.extend({ expand: async () => { inside(); await new Promise<void>(r => { release = r; }); } });
    return { entered, release: () => release() };
  }
  static go(s: PlaySession) { return PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('go('))!.choice.id; }
  static agrees(c: SessionCheckpoint) { return c.transcript.steps.length === c.save.events.length; }
}
describe('a checkpoint', () => {
  it('is refused while a command is under way, and agrees with its transcript after', async () => {
    const s = await PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json', 'race', NodeBundleSource.shared);
    const gate = Race.slow(s), pending = s.perform(Race.go(s));
    await gate.entered;
    expect(() => s.checkpoint()).toThrow('Save only between campaign commands');
    gate.release(); await pending;
    expect(Race.agrees(s.checkpoint())).toBe(true);
  }, 60000);
  it('asked of the page\'s engine while a command is under way, waits for it', async () => {
    const host = new EngineHost(() => undefined), inner = host as unknown as { session: PlaySession; saving(): void };
    inner.saving = () => undefined;
    const campaign = 'data/campaigns/the-long-man.campaign.json';
    const setting = await host.handle({ kind: 'setting', campaign }) as { party: never[] };
    await host.handle({ kind: 'begin', campaign, seed: 'merrow', party: setting.party });
    const gate = Race.slow(inner.session);
    const performing = host.handle({ kind: 'perform', command: Race.go(inner.session), said: 'Go', move: true });
    await gate.entered;
    let taken = false;
    const checkpointing = host.handle({ kind: 'checkpoint' }).then(text => { taken = true; return text as string; });
    await new Promise(r => setTimeout(r, 20));
    expect(taken).toBe(false);
    gate.release(); await performing;
    // The download carries the story with the checkpoint (the architecture review's A24).
    const taken2 = JSON.parse(await checkpointing) as { checkpoint: SessionCheckpoint; log: unknown[] };
    expect(Race.agrees(taken2.checkpoint)).toBe(true);
    expect(Array.isArray(taken2.log)).toBe(true);
  }, 120000);
});
