import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegisterArchive } from '../../scripts/register-archive';
import { RegisterState } from '../../scripts/register-state';
import { RegisterTickets } from '../../scripts/register-tickets';

// The register's archive (the owner, 20 November: archive old items once verified or proved by a spec). A closed row
// moves only on a spec that exists, a clean closure lint and a second reading (or a closure older than fourteen
// days); both readers read both files, so nothing counted is lost; and an id stands in only one of the two.
const root = RegisterTickets.root;
const ids = (file: string): string[] => readFileSync(join(root, file), 'utf8').split('\n')
  .filter(l => /^\| [A-Z][A-Z0-9]*-/.test(l)).map(l => l.split('|')[1]!.trim());
const today = new Date('2026-11-20T00:00:00Z');
const row = (status: string, state = RegisterTickets.state(status).state): Parameters<typeof RegisterArchive.why>[0] =>
  ({ id: 'ZZ-01', what: 'a thing', status, state, loose: false });
describe('the register archive', () => {
  const [register, archive] = RegisterTickets.files.map(ids) as [string[], string[]];
  it('holds each id in only one of the register and its archive', () => {
    expect(archive.filter(id => register.includes(id))).toEqual([]);
    expect(archive.filter((id, i) => archive.indexOf(id) !== i)).toEqual([]);
  });
  it('is read by both readers with the register, every row counted', () => {
    const state = new Set(RegisterState.rows(RegisterTickets.text()).map(r => r.id));
    const tickets = new Set(RegisterTickets.rows(RegisterTickets.text()).map(r => r.id));
    expect([...register, ...archive].filter(id => !state.has(id) || !tickets.has(id))).toEqual([]);
  });
  it('holds only closed rows, each still qualifying', () => {
    const text = readFileSync(join(root, RegisterArchive.archive), 'utf8');
    const why = RegisterTickets.rows(text).map(r => [r.id, RegisterArchive.why(r, new Date())]);
    expect(why.filter(([, w]) => w!.startsWith('stays'))).toEqual([]);
  });
  it('moves a closed row only on a spec, a clean lint and a second reading or age', () => {
    const verdicts = ['fixed (19 Nov, verified): held by test/small/own-hex', 'fixed (2 Nov): test/small/own-hex',
      'closed (20 Nov, s3-45; for a second reading): test/small/own-hex', 'fixed (19 Nov): test/small/own-hex',
      'fixed (19 Nov, verified): nothing cited', 'fixed (19 Nov, verified): test/small/own-hex, test/no-such-spec',
      'met in part (20 Nov, tribunal): test/small/own-hex', 'open (19 Nov, verified): test/small/own-hex',
      'duplicate of ZZ-02 (verified): test/small/own-hex', 'deferred (verified): test/small/own-hex']
      .map(s => RegisterArchive.why(row(s), today).split(':')[0]);
    expect(verdicts).toEqual(['a second reading; held by test/small/own-hex',
      'closed 18 days ago; held by test/small/own-hex', ...Array<string>(6).fill('stays'),
      RegisterArchive.duplicate, 'stays']);
    // Old and settled, apart (the owner, 20 November: "archive old/solved defects"): a duplicate, and a closure from
    // before proof specs were asked for, once older than the fortnight (undated: of the first compiling); never lately.
    expect(['fixed: nothing cited', 'fixed (2 Nov): nothing cited', 'duplicate of ZZ-02 (19 Nov)']
      .map(s => RegisterArchive.why(row(s), today))).toEqual([RegisterArchive.unproved, RegisterArchive.unproved,
      'stays: duplicate, lately']);
    expect(RegisterArchive.why({ ...row('fixed (19 Nov, verified): test/small/own-hex'), state: 'reference' }, today))
      .toBe('stays: reference');
  });
  it('lifts a row out of the register into its own section and layout', () => {
    const register = '# R\n\n## 1. First\n\n| Id | What | Status | Pri | When |\n|---|---|---|---|---|\n'
      + '| ZZ-01 | a | fixed (19 Nov, verified): test/small/own-hex | P1 | M22 |\n| ZZ-02 | b | open | P1 | M22 |\n';
    const { moves } = RegisterArchive.moves(register, today);
    expect(moves.map(m => m.id)).toEqual(['ZZ-01']);
    expect(RegisterArchive.lift(register, moves)).not.toContain('ZZ-01');
    const placed = RegisterArchive.place('# Archive\n\nWhat belongs here.\n', moves, register);
    expect(placed).toBe('# Archive\n\nWhat belongs here.\n\n## 1. First\n\n| Id | What | Status | Pri | When |\n'
      + '|---|---|---|---|---|\n| ZZ-01 | a | fixed (19 Nov, verified): test/small/own-hex | P1 | M22 |\n');
    expect(RegisterArchive.place(placed, moves, register)).toBe(placed);
  });
});
