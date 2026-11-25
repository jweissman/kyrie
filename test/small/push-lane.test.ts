import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// No test over ten seconds on the push suite (the owner, 24 November: "I don't think any test that takes more than
// 10s to run belongs on core CI"). The push lane takes the files under ten kept seconds (test/lanes.json, by
// test/timings.json, kept from the night's run by scripts/timings-from-ci.ts) and every file of test/small, so
// test/small holds none over ten seconds; what is slower is the night's, and the world canary's before landing
// (test/canary.json).
describe('the push lane', () => {
  const lanes = JSON.parse(readFileSync('test/lanes.json', 'utf8')) as { push: { under: number } };
  const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
  it('takes no file over ten seconds', () => {
    expect(lanes.push.under).toBeLessThanOrEqual(10000);
  });
  it('holds no file of test/small over ten kept seconds', () => {
    const small = [...new Glob('test/small/*.test.ts').scanSync('.')];
    expect(small.filter(f => (kept[f] ?? 0) > 10000).map(f => `${f}: ${Math.round(kept[f]! / 1000)} s`)).toEqual([]);
  });
  it('names in the canary only specs that are there', () => {
    const canary = JSON.parse(readFileSync('test/canary.json', 'utf8')) as { specs: { file: string }[] };
    const all = new Set([...new Glob('test/**/*.test.ts').scanSync('.')]);
    expect(canary.specs.map(s => s.file).filter(f => !all.has(f))).toEqual([]);
  });
});
