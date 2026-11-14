import { describe, expect, it, spyOn } from 'bun:test';
import { KyrieCli } from '../../src/cli/kyrie';

// The owner's headless review (14 November, P3): `bin/kyrie adventure --help` was taken for a campaign's path and
// failed with ENOENT and a stack trace. Asked, it says its own usage and does nothing else: no world drawn, no file.
describe('bin/kyrie adventure --help', () => {
  it('says how to play, and draws and writes nothing', async () => {
    const said: string[] = [], log = spyOn(console, 'log').mockImplementation((s: unknown) => { said.push(String(s)); });
    const started = performance.now();
    try {
      expect(await KyrieCli.main(['adventure', '--help'])).toBe(0);
    } finally { log.mockRestore(); }
    expect(performance.now() - started).toBeLessThan(200);
    for (const flag of ['--world', '--as', '--create', '--interactive', '--headless', '--save-as', 'resume', 'e.g.']) {
      expect([flag, said.join('\n').includes(flag)]).toEqual([flag, true]);
    }
  });
});
