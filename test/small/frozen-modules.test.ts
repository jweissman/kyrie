import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';

// What is kept between campaigns is shared, not copied for each (AX-04; the review of generated parsing, 20 November,
// §3: deep-freeze to prove no hidden writes before removing a clone): the shared rules every module is joined to, and
// a module compiled before, given to compose uncopied, of which loading copies only what it changes (a company's
// size, the canon's entities). Frozen once made, a world begun again from them, played, and another begun write
// nothing into them. In a process of its own (test/support/frozen-modules-play.ts).
describe('the modules kept between campaigns, frozen', () => {
  it('are not written by a world begun from them, played, and another begun', async () => {
    const run = Bun.spawn(['bun', join(import.meta.dir, '../support/frozen-modules-play.ts')],
      { stdout: 'pipe', stderr: 'pipe' });
    const [out, err] = [await new Response(run.stdout).text(), await new Response(run.stderr).text()];
    const code = await run.exited;
    expect(err.includes('TypeError') ? err.slice(0, 2000) : '').toBe('');
    expect(code).toBe(0);
    const said = JSON.parse(out.trim().split('\n').at(-1)!) as { kept: number; rules: number; same: number };
    expect([said.kept > 10, said.rules > 0, said.same > 1]).toEqual([true, true, true]);
  }, 240000);
});
