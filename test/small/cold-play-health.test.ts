import { describe, expect, it } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ColdPlay, type ColdRound } from '../../scripts/health/cold-play';

const round = (date: string, session: string): ColdRound => ({
  date, session, sha: 'a'.repeat(40), kind: 'reader', rubric: { id: 'first-hour', version: '1' },
  criteria: Object.fromEntries(ColdPlay.criteria.map(key => [key, { score: 3, max: 4 }])),
  total: 75, evidence: ['doc/cold-play/rubric.md'],
});

describe('cold-play evidence', () => {
  it('uses only the most recent three completed rounds within 21 days, never future rounds', () => {
    const rounds = [round('2026-11-05', 'stale'), round('2026-11-06', 'expired-at-boundary'),
      round('2026-11-07', 'boundary'),
      round('2026-11-20', 'a'), round('2026-11-21', 'b'), round('2026-11-22', 'c'),
      round('2026-11-28', 'future')];
    expect(ColdPlay.qualifying(rounds, '2026-11-27').map(r => r.session)).toEqual(['c', 'b', 'a']);
    expect(ColdPlay.qualifying(rounds.slice(0, 3), '2026-11-27').map(r => r.session)).toEqual(['boundary']);
    expect(ColdPlay.ready(ColdPlay.qualifying(rounds, '2026-11-27'))).toBe(true);
    expect(ColdPlay.ready(ColdPlay.qualifying(rounds.slice(0, 2), '2026-11-27'))).toBe(false);
  });

  it('rejects inconsistent totals and missing evidence', () => {
    const r = round('2026-11-27', 'a');
    expect(() => ColdPlay.validate({ ...r, total: 90 }, '2026-11-27-reader.json', '.')).toThrow();
    expect(() => ColdPlay.validate({ ...r, evidence: ['missing'] }, '2026-11-27-reader.json', '.')).toThrow();
    expect(() => ColdPlay.validate({ ...r, rubric: { id: 'unknown', version: '1' } },
      '2026-11-27-reader.json', '.')).toThrow();
  });

  it('refuses to count one session as multiple independent rounds', () => {
    const root = mkdtempSync(join(tmpdir(), 'kyrie-cold-play-'));
    try {
      mkdirSync(join(root, ColdPlay.directory), { recursive: true });
      writeFileSync(join(root, 'transcript.txt'), 'A transcript');
      const a = { ...round('2026-11-25', 'same-session'), evidence: ['transcript.txt'] };
      const b = { ...round('2026-11-26', 'same-session'), evidence: ['transcript.txt'] };
      writeFileSync(join(root, ColdPlay.directory, '2026-11-25-reader.json'), JSON.stringify(a));
      writeFileSync(join(root, ColdPlay.directory, '2026-11-26-reader.json'), JSON.stringify(b));
      expect(() => ColdPlay.read(root)).toThrow('Duplicate cold-play session');
    } finally {
      rmSync(root, { recursive: true });
    }
  });
});
