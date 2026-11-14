import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Runner, type Said } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';

// Continuity of intention (the experience pins' family 3): an aim left unmet leads back from wherever the company has
// wandered. EX-01's navigational confusion (81 lost turns over the generated tier) had two causes, each traced:
// the way out of a shop toward the aim ran over a landing passed twice doing nothing there, idle, and so nobody's
// (and, from deeper in a site than two steps, the way out toward an aim outside it was only "back out": AimRoute.door).
class Walked {
  constructor(readonly s: PlaySession, readonly r: Runner, public said: Said) {}
  static async start() {
    const s = await DrawnWorld.start('a1', { origin: 'order', party: [{ name: 'Hamo', raceId: 'human',
      classId: 'cleric', backgroundId: 'doctor' }] }, NodeBundleSource.shared);
    const r = new Runner(s);
    return new Walked(s, r, r.said());
  }
  async take(label: RegExp) {
    const o = [...this.said.offer.primary, ...this.said.offer.rest].find(x => label.test(x.label))!;
    this.said = await this.r.ask(JSON.stringify({ act: o.id })) as Said;
  }
  async follow(text: RegExp) {
    this.said = await this.r.ask(JSON.stringify({ follow: this.said.aims!.find(a => text.test(a.text))!.id })) as Said;
  }
  gold() { return this.said.offer.primary.filter(o => o.aspects.includes('undertaking')).map(o => o.label); }
}
describe('an aim left unmet', () => {
  it('leads out of a shop over a landing passed twice doing nothing there', async () => {
    const w = await Walked.start();
    await w.take(/^Give Eogan the brothers' letter/);
    await w.follow(/old writing/);
    for (const step of [/^To the landing/, /general store/, /^To the landing/, /general store/]) { await w.take(step); }
    expect(w.said.scene.lines[0]).toMatch(/general store/);
    expect(w.gold()).toHaveLength(1);
  }, 120000);
});
