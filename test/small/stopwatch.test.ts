import { describe, expect, it } from 'bun:test';
import { Stopwatch } from '../../src/stopwatch';

// A start-up says each phase as it begins and the whole when done, each phase's time only with --profile: the
// terminal had sat silent for seconds while the world was drawn (the owner, 14 November).
describe('the stopwatch', () => {
  it('says each phase as it begins, and how long the whole took, the phases too when profiling', async () => {
    const said: string[] = [], watch = new Stopwatch(t => said.push(t), true);
    expect(await watch.time('Drawing the country', () => 3)).toBe(3);
    await watch.time('Composing the world', async () => { await Bun.sleep(5); });
    watch.done();
    expect(said.slice(0, 2)).toEqual(['Drawing the country…', 'Composing the world…']);
    const each = /^Ready in \d+\.\d s \(Drawing the country \d+\.\d s, Composing the world \d+\.\d s\)\.\n$/;
    expect(said[2]).toMatch(each);
    const quiet: string[] = [], plain = new Stopwatch(t => quiet.push(t));
    await Stopwatch.in(plain, 'A', () => 1);
    plain.done();
    expect(quiet.at(-1)).toMatch(/^Ready in \d+\.\d s\.\n$/);
    expect(await Stopwatch.in(undefined, 'unwatched', () => 'ran')).toBe('ran');
  });
});
