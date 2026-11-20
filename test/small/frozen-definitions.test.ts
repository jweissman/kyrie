import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';

// Shared definitions are not changed by play (MT-28, the architectural review's Finding J and Stage 0: "deep-freeze
// shared definitions in tests"): the abilities, the conditions and the rules every fight reads, and each base item and
// species, frozen whole once a world is installed; a world played (a thing taken, a light lit, time passed) and a
// second begun, each change to a frozen one a TypeError. In a process of its own (test/support/frozen-play.ts), as
// what is frozen stays frozen for every spec after it in one process.
describe('the shared definitions, frozen', () => {
  it('are not changed by a world played and another begun', async () => {
    const run = Bun.spawn(['bun', join(import.meta.dir, '../support/frozen-play.ts')], { stdout: 'pipe', stderr: 'pipe' });
    const [out, err] = [await new Response(run.stdout).text(), await new Response(run.stderr).text()];
    const code = await run.exited;
    expect(err.includes('TypeError') ? err : '').toBe('');
    expect(code).toBe(0);
    const said = JSON.parse(out.trim().split('\n').at(-1)!) as { acts: number; again: string };
    expect(said.acts).toBeGreaterThan(1);
    expect(said.again).toBe('t__yard');
  }, 60000);
});
