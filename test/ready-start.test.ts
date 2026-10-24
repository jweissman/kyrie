import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import type { Frame, Member, Request } from '../web/engine/protocol';

// While the player reads the creation page, the start is made ready for the choices as they stand (EngineHost.prepare):
// Begin asking the same takes it up, and does not start again; Begin asking anything else starts afresh, for what it
// asks. The world drawn is the one asked for either way.
class Reading {
  static readonly host = () => new EngineHost(() => undefined);
  static starting(name: string): Omit<Extract<Request, { kind: 'begin' }>, 'kind'> {
    const party: Member[] = [{ name, raceId: 'human', classId: 'warrior' }];
    return { campaign: 'world', seed: 'a1', party, origin: 'wanderer' };
  }
  static async begin(host: EngineHost, name: string) {
    return await host.handle({ kind: 'begin', ...this.starting(name) }) as Frame;
  }
}

describe('a start made ready while the page is read', () => {
  afterEach(() => { mock.restore(); });
  it('is taken up by a Begin asking the same, once however often it was asked for', async () => {
    const host = Reading.host(), started = spyOn(Creation.prototype, 'origin');
    await host.handle({ kind: 'ready', ...Reading.starting('Wenna') });
    await host.handle({ kind: 'ready', ...Reading.starting('Wenna') });
    expect(started).toHaveBeenCalledTimes(1);
    const frame = await Reading.begin(host, 'Wenna');
    expect(started).toHaveBeenCalledTimes(1);
    expect(frame.screen.party.map(m => m.name)).toEqual(['Wenna']);
  }, 60000);
  it('is not taken up by a Begin asking something else, which starts afresh for what it asks', async () => {
    const host = Reading.host(), started = spyOn(Creation.prototype, 'origin');
    await host.handle({ kind: 'ready', ...Reading.starting('Wenna') });
    expect(started).toHaveBeenCalledTimes(1);
    const frame = await Reading.begin(host, 'Corin');
    expect(started).toHaveBeenCalledTimes(2);
    expect(frame.screen.party.map(m => m.name)).toEqual(['Corin']);
  }, 60000);
});
