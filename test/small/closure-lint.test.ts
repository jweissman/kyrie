import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ClosureClauses } from '../../scripts/closure-clauses';
import { ClosureLint } from '../../scripts/closure-lint';

// Closures checked mechanically (MT-17, MT-19; mission-22/closure-review-method.md, patterns 1, 3, 5 and 6). Every
// closed row's cited paths and specs are on disk, a spec named by its name alone is one file, a size the defect names
// is a size a cited spec says, each cold-play reference and clause is answered in the status, and a rule against is
// closed on a negative assertion. Today's findings are the baseline; a new one fails here, and so does one mended
// that the baseline still lists, so that the count only falls, each time on purpose (`bun scripts/closure-lint.ts
// --write` after mending one, the row named in the commit).
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
  // Pattern 1: a many-part row closed on one part (CL-50: (20) and (28) unanswered).
  it('says which cold-play reference or clause a closed status leaves unanswered', () => {
    const what = 'Supply (cold play 4): no food met (27); "1 candle to spare" with one lit (20); a road stops after one hex (28)';
    const status = 'fixed: the supply sold in the store (27, test/store-wares); the candle ruled a harness count (20)';
    expect(ClosureClauses.refs(what)).toEqual(['(27)', '(20)', '(28)']);
    expect(ClosureClauses.unanswered(what, status)).toEqual(['ref (28)', 'clause "a road stops after one hex (28)"']);
    expect(ClosureClauses.answered('(Q 69, 135)', 'held (Q 69) and moved to XX-02 (135)')).toBe(true);
    expect(ClosureClauses.answered('(Q 69, 135)', 'held (Q 69), the rest not')).toBe(false);
    expect(ClosureClauses.answered('(19)', 'fixed (19 Nov): test/x:19-20')).toBe(false);
    expect(ClosureClauses.clauses('one; two (a; b); "three; four"')).toEqual(['one', 'two (a; b)', '"three; four"']);
    expect(ClosureClauses.clauses('no clauses here')).toEqual([]);
  });
  // Pattern 3: the driver may do what a rule forces (OR-111); a rule against is closed on a negative assertion.
  it('asks a rule against for a negative assertion in a cited spec', () => {
    const row = { id: 'ZZ-03', what: 'A journey must be held to set out on', status: 'fixed: test/small/closure-lint' };
    expect(ClosureClauses.forbids(row.what)).toBe(true);
    expect(ClosureClauses.forbids('a journey is set out on')).toBe(false);
    expect(ClosureLint.findings(row).filter(f => f.kind === 'negative')).toEqual([]);
    expect(ClosureLint.findings({ ...row, status: 'fixed: scripts/register-state.ts' }).map(f => f.kind))
      .toContain('negative');
    expect([ClosureClauses.negative('expect(log).toEqual(before)'), ClosureClauses.negative('expect(x).toBe(1)')])
      .toEqual([true, false]);
  });
});
