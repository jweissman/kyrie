import { describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Repeats } from '../src/cli/repeats';

// An author's own phrases said again and again across a module (Wapshott's Circus friction 25, WPC-25: "for a long
// time" fifteen times, "purring like a millstone" twice), found where they are; a name said often is not one.
describe('kyrie voice repeats', () => {
  it('finds a module\'s repeated phrases with where each is, longest as it runs, and leaves its names out', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'kyrie-repeats-'));
    await writeFile(join(dir, 'site.kyr'), [
      'Module m "M" {',
      '  Place stairs "the fish stairs" is room.',
      '  Observe a at stairs when true "The ringmaster sits, purring like a millstone, for a long time.".',
      '  Observe b at stairs when true "The lion lies by the fish stairs, purring like a millstone.".',
      '  // "for a long time, for a long time, for a long time"',
      '  Rule c when true says "Nobody moves for a long time. The Door of Doors stands open." { }',
      '  Rule d when true says "Rain on the canvas; the Door of Doors shuts, and the fish stairs run wet." { }',
      '}'].join('\n'));
    try {
      const found = Repeats.find(Repeats.texts([dir], dir));
      expect(found.map(r => [r.phrase, r.count])).toEqual([['purring like a millstone', 2], ['for a long time', 2]]);
      expect(found[0]!.at).toEqual(['site.kyr:3', 'site.kyr:4']);
      const lines: string[] = [];
      expect(Repeats.main([dir, '--top', '1'], l => lines.push(l))).toBe(0);
      expect(lines).toHaveLength(1);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});
