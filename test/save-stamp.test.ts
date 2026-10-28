import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { BuildStamp } from '../src/session/build-stamp';

// A save file says which build made it, as a game kept in the browser does (COR-06: it had carried no stamp); it is
// checked as it is opened, as any file brought in is.
describe('a save file', () => {
  it('carries the build that made it', async () => {
    const host = new EngineHost(() => undefined);
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const saved = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { build?: string };
    expect(saved.build).toBe(BuildStamp.current);
  }, 120000);
});
