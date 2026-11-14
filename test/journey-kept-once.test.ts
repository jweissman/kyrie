import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message } from '../web/engine/protocol';

// A journey is kept once it ends, not after every leg (AX-05, computation locality: each keeping writes the whole game
// out, and a journey of four legs had kept it five times while the page waited on the worker).
describe('a journey', () => {
  it('keeps the game once, however many legs it goes', async () => {
    let saves = 0;
    const host = new EngineHost((m: Message) => { if (m.kind === 'saved') { saves++; } });
    const first = await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] }) as Frame;
    // The opening is kept first (its world packed whole), before the journey is counted.
    await new Promise(r => setTimeout(r, 2000));
    const far = [...first.screen.destinations ?? [], ...first.screen.roads ?? []].at(-1)!;
    const before = saves, went = await host.handle({ kind: 'travel', destination: far.id }) as Frame;
    await new Promise(r => setTimeout(r, 1000));
    expect(went.travel!.legs.length).toBeGreaterThan(1);
    expect(saves - before).toBe(1);
  }, 120000);
});
