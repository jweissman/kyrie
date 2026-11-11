import { describe, expect, it } from 'bun:test';
import { TimingsFromCi } from '../scripts/timings-from-ci';

// A shard's JUnit report gives each file's whole time by its file-level suite; only files with no time kept are
// written, unless all are asked for (the consolidated register's TC-01: forty files untimed fell to one shard).
describe('timings from a CI run', () => {
  const xml = `<testsuites><testsuite name="test/a.test.ts" file="test/a.test.ts" tests="2" time="6.30114018">
    <testsuite name="a block" file="test/a.test.ts" line="16" time="5.944"><testcase name="x" time="5.9" file="test/a.test.ts" />
    </testsuite></testsuite><testsuite name="test/b.test.ts" file="test/b.test.ts" time="0.5"></testsuite></testsuites>`;
  it('reads each file\'s whole time, not its blocks\'', () => {
    expect([...TimingsFromCi.times(xml)]).toEqual([['test/a.test.ts', 6301], ['test/b.test.ts', 500]]);
  });
  it('writes only the files with no time kept, or all when asked', () => {
    const kept = { version: 1, files: { 'test/a.test.ts': 9000 } }, times = TimingsFromCi.times(xml);
    expect(TimingsFromCi.merge(kept, times, false).timings.files).toEqual({ 'test/a.test.ts': 9000, 'test/b.test.ts': 500 });
    expect(TimingsFromCi.merge(kept, times, true).timings.files['test/a.test.ts']).toBe(6301);
  });
});
