import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { PlaySession } from '../src/session/play-session';
import { Digest } from '../src/session/digest';
import type { CreationChoice } from '../src/creation/creation-flow';
import type { Message } from '../src/creation/protocol';
import type { CreationState } from '../web/engine/engine-creation';
import { Creation } from '../web/engine/creation';
import { CreationRules } from '../src/creation/creation-rules';

// OR-08: a life made through the engine's own making (EngineCreation) has its start made ready at each choice
// (EngineStarts.readying), and Set out takes the one made ready for the life as it stands. Determinism: the game set
// out on is the very one a cold set-out with the same choices makes, its whole checkpoint alike (every name, every
// fact, every creature), after starts made ready for other choices were given up on the way.
class Making {
  static readonly seed = 'a1';
  static host() {
    const said: string[] = [];
    const host = new EngineHost((m: Message) => { if (m.kind === 'progress') { said.push(m.stage); } });
    return { host, said };
  }
  static async choose(host: EngineHost, choices: [CreationChoice, string][]) {
    for (const [step, value] of choices) { await host.handle({ kind: 'creation', step, value }); }
  }
  // Until the starts begun come to so many (each made ready, or set out on).
  static async until(started: { mock: { calls: unknown[] } }, n: number) {
    for (let i = 0; i < 600 && started.mock.calls.length < n; i++) { await new Promise(r => setTimeout(r, 50)); }
    expect(started.mock.calls.length).toBeGreaterThanOrEqual(n);
  }
  static async setOut(host: EngineHost) {
    await host.handle({ kind: 'set-out' });
    const session = host.played!;
    return { checkpoint: JSON.stringify(session.checkpoint()), digest: Digest.of(session.campaign) };
  }
  static readonly first: [CreationChoice, string][] = [['you', 'human'], ['calling', 'mage']];
  static readonly last: [CreationChoice, string][] = [['calling', 'warrior'], ['presenting', 'she'], ['name', 'Ysolde']];
}

describe('a life made by the engine, set out on', () => {
  afterEach(() => { mock.restore(); });
  it('is the very game a cold set-out with the same choices makes, though made ready while it was chosen', async () => {
    const started = spyOn(PlaySession, 'start');
    // Made ready: a start for a mage begun and given up when the calling changes, then one for the life as it ends.
    const ready = Making.host();
    await ready.host.handle({ kind: 'world', seed: Making.seed });
    await Making.choose(ready.host, Making.first);
    await Making.until(started, 1);
    await Making.choose(ready.host, Making.last);
    await Making.until(started, 2);
    const prepared = await Making.setOut(ready.host);
    expect(started.mock.calls.length).toBe(2);
    expect(ready.said[0]).toBe('Placing its people');
    // Cold: the same choices, set out on at once, before anything was made ready.
    const cold = Making.host();
    await cold.host.handle({ kind: 'world', seed: Making.seed });
    await Making.choose(cold.host, [...Making.first, ...Making.last]);
    const fresh = await Making.setOut(cold.host);
    expect(cold.said[0]).toBe('Drawing the world');
    expect(started.mock.calls.length).toBe(3);
    expect(prepared.digest).toBe(fresh.digest);
    expect(prepared.checkpoint === fresh.checkpoint).toBe(true);
  }, 240000);
  it('sets out with the weapon its name page shows in hand, the one struck best with', async () => {
    const { host } = Making.host();
    await host.handle({ kind: 'world', seed: Making.seed });
    await Making.choose(host, [['you', 'human'], ['calling', 'warrior']]);
    const { member } = await host.handle({ kind: 'creation' }) as CreationState, catalog = Creation.catalog();
    const calling = catalog.callings.find(c => c.id === member.classId)!;
    const shown = CreationRules.best(calling.weapons, member, catalog)?.id;
    expect(member.weapon).toBeUndefined();
    expect(shown).toBeTruthy();
    await host.handle({ kind: 'set-out' });
    expect(host.played!.transcript.drawn?.party?.[0]?.weapon).toBe(shown);
  }, 240000);
});
