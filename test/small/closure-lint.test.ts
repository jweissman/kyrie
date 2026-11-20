import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ClosureLint } from '../../scripts/closure-lint';

// Closures checked mechanically (MT-17; mission-22/closure-review-method.md, patterns 5 and 6). Every closed row's
// cited paths and specs are on disk, a spec named by its name alone is one file, and a size the defect names is a
// size a cited spec says. Today's findings are the baseline; a new one fails here, and so does one mended that the
// baseline still lists, so that the count only falls, each time on purpose (`bun scripts/closure-lint.ts --write`
// after mending one, the row named in the commit).
describe('the closure lint', () => {
  const kept = JSON.parse(readFileSync(join(ClosureLint.root, ClosureLint.baseline), 'utf8')) as { findings: string[] };
  const now = ClosureLint.all().filter(f => ClosureLint.counted.includes(f.kind)).map(f => ClosureLint.key(f));
  it('finds nothing on a closed row that the baseline does not hold', () => {
    expect(now.filter(f => !kept.findings.includes(f))).toEqual([]);
  });
  it('keeps no finding in the baseline that is mended', () => {
    expect(kept.findings.filter(f => !now.includes(f))).toEqual([]);
  });
  it('resolves a path, a spec by its forms, and a spec by its name alone', () => {
    const cites = ClosureLint.cites('fixed (19 Nov): src/rules/nowhere.ts, test/wares, small/own-hex:12, '
      + '`told-way`, `data-way`, scripts/register-state.ts');
    expect(cites.map(c => [c.said, c.files.length, c.meant])).toEqual([['src/rules/nowhere.ts', 0, true],
      ['test/wares', 1, true], ['scripts/register-state.ts', 1, true], ['small/own-hex', 1, true],
      ['told-way', 1, true]]);
    expect(ClosureLint.cites('held by gold-thread, a one-way word').map(c => [c.said, c.files.length]))
      .toEqual([['gold-thread', 2]]);
  });
  it('names each kind: missing, ambiguous, a size unpinned, a census with no spec', () => {
    const row = { id: 'ZZ-01', what: 'the map at 1280×800 and 390×844',
      status: 'fixed: test/no-such-spec, held by gold-thread, test/small/own-hex' };
    expect(ClosureLint.findings(row).map(f => f.kind)).toEqual(['missing', 'ambiguous', 'size', 'size']);
    const census = { id: 'ZZ-02', what: 'a count', status: 'fixed: scripts/register-state.ts says 0' };
    expect(ClosureLint.findings(census).map(f => f.kind)).toEqual(['unpinned']);
    expect(ClosureLint.says('page.setViewportSize({ width: 390, height: 844 })', '390', '844')).toBe(true);
  });
});
