import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// A transcript keeps what the game was after each step, and a replay or a game opened is held to it (the architecture
// review's H6: determinism was asserted, not verified, and a replay that came out otherwise went on as if it had not).
class Steps {
  static start() { return PlaySession.start('test/fixtures/wolf-yard/campaign.json', 'slice', NodeBundleSource.shared); }
  static async played() {
    const s = await this.start();
    for (const command of ['go(world__byre_door,world__byre)', 'wait', 'go(world__byre_door,world__yard)']) {
      await s.perform(command);
    }
    return s;
  }
}
describe('a transcript', () => {
  it('keeps what the game was after each step, and a replay is held to it', async () => {
    const played = await Steps.played(), steps = played.transcript.steps;
    expect(steps.every(s => typeof s.digest === 'string')).toBe(true);
    await (await Steps.start()).replay(steps);
    const tampered = steps.map((s, i) => i === 1 ? { ...s, digest: `${s.digest}x` } : s);
    await expect((await Steps.start()).replay(tampered)).rejects.toThrow('step 2');
  }, 60000);
  it('holds a game kept by this build to its own record when it is opened', async () => {
    const checkpoint = (await Steps.played()).checkpoint();
    expect(() => PlaySession.resume(structuredClone(checkpoint), { trusted: true })).not.toThrow();
    const wrong = structuredClone(checkpoint);
    wrong.save.state.elapsed += 1;
    expect(() => PlaySession.resume(structuredClone(wrong), { trusted: true })).toThrow('its own record');
    // Kept by another build, it is checked as it is opened, not held to a record another build kept.
    expect(() => PlaySession.resume(wrong, { trusted: false })).not.toThrow();
  }, 60000);
});
