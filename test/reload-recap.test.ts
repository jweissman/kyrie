import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message, Request } from '../web/engine/protocol';

// A host whose keeping is waited for: each command's game is kept once its frame has gone (EngineHost.keep), and a
// game left being kept would be kept during whatever the process runs next.
class Kept {
  saves = 0;
  readonly host = new EngineHost((m: Message) => { if (m.kind === 'saved' || m.kind === 'unkept') { this.saves++; } });
  async handle(request: Request): Promise<Frame> {
    const was = this.saves, frame = await this.host.handle(request) as Frame;
    for (let i = 0; i < 500 && this.saves === was; i++) { await new Promise(r => setTimeout(r, 20)); }
    return frame;
  }
}

// A game continued after a reload opened where the company stood, with no word of what it had been doing (the
// play-structure investigation's PT-36): taken up again, the page opens on what the company is about and the last
// thing it did, once.
describe('a game taken up again', () => {
  it('opens on what the company is about and the last thing it did', async () => {
    const played = new Kept();
    await played.handle({ kind: 'begin', campaign: 'world', seed: 'thorn', origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const last = await played.handle({ kind: 'perform', command: 'wait' });
    const saved = await played.host.handle({ kind: 'checkpoint' }) as string;
    const opened = new Kept(), frame = await opened.handle({ kind: 'resume', saved });
    expect(frame.leaf.recap?.aim).toBe(last.screen.objectives[0]);
    expect(frame.leaf.recap?.last?.said).toBe(last.entries.at(-1)!.said);
    const next = await opened.handle({ kind: 'perform', command: 'wait' });
    expect(next.leaf.recap).toBeUndefined();
  }, 120000);
});
