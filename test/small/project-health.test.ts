import { describe, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HealthScoreModel, type HealthInput } from '../../scripts/health/score';
import { HealthReport } from '../../scripts/health/report';
import { HealthRead } from '../../scripts/health/read';
import type { ColdRound } from '../../scripts/health/cold-play';

const round = (date: string, session: string, total: number): ColdRound => ({
  date, session, total, kind: 'reader', sha: 'a'.repeat(40), rubric: { id: 'first-hour', version: '1' },
  criteria: {}, evidence: ['transcript'],
});
const input = (): HealthInput => ({
  date: '2026-11-27',
  rounds: [round('2026-11-05', 'expired', 100), round('2026-11-25', 'one', 60)],
  aspects: Array.from({ length: 6 }, (_, i) => ({ id: String(i + 1), name: `Aspect ${i + 1}`,
    capabilities: [{ id: 'old-met', title: 'Met', due: true, met: true },
      { id: 'old-missing', title: 'Missing', due: true, met: false },
      { id: 'new', title: 'New', due: false, met: false }] })),
  p0: ['OR-900'],
  p1: [{ id: 'grace', status: 'open (24 Nov)', existedYesterday: true },
    { id: 'aged', status: 'open (4 Nov)', existedYesterday: true },
    { id: 'undated', status: 'open', existedYesterday: true },
    { id: 'new', status: 'open', existedYesterday: false }],
  ratchets: [{ id: 'edges', name: 'Edges', count: 1, why: 'none permitted' }],
});

describe('project health calculation', () => {
  it('uses mature asks and recent independent rounds, with grace and undated P1s', () => {
    const result = HealthScoreModel.compute(input());
    expect(result.verified).toBe(false);
    expect(result.cold.value).toBe(60);
    expect(result.feature.value).toBe(50);
    expect(result.feature.aspects.map(a => a.value)).toEqual([50, 50, 50, 50, 50, 50]);
    expect(result.p1.defects.map(d => d.cost)).toEqual([0, 2, 1, 0]);
    expect(result.debt.cost).toBe(2);
    expect(result.headline).toBe(50);
    expect(result.p0).toEqual(['OR-900']);
  });
  it('applies the exact seven- and fourteen-day boundaries and caps P1 cost', () => {
    expect([6, 7, 20, 21, 34, 35, 100].map(days => HealthScoreModel.defect({
      id: 'x', status: `open (${new Date(Date.parse('2026-11-27T00:00:00Z') - days * 86_400_000)
        .toISOString().slice(0, 10)})`, existedYesterday: true,
    }, '2026-11-27').cost)).toEqual([0, 1, 1, 2, 2, 3, 3]);
    expect(HealthScoreModel.statusDate('open (20 Nov): evidence from 11 Nov', '2026-11-27')).toBe('2026-11-20');
    expect(HealthScoreModel.statusDate('open: evidence from 11 Nov', '2026-11-27')).toBeNull();
  });
  it('clamps both ends, while new undated discoveries cost nothing on filing day', () => {
    const low = input();
    low.p1 = Array.from({ length: 60 }, (_, i) => ({ id: String(i), status: 'open', existedYesterday: true }));
    expect(HealthScoreModel.compute(low).headline).toBe(0);
    const high = input();
    high.rounds = [round('2026-11-27', 'a', 100), round('2026-11-26', 'b', 100), round('2026-11-25', 'c', 100)];
    high.aspects.forEach(a => { a.capabilities = []; });
    high.p1 = [];
    high.ratchets = [];
    expect(HealthScoreModel.compute(high).headline).toBe(100);
    expect(HealthScoreModel.compute(high).verified).toBe(true);
    expect(HealthScoreModel.clamp(105)).toBe(100);
  });
  it('weights the six aspects equally rather than weighting their capability counts', () => {
    const data = input();
    data.aspects[0]!.capabilities = [{ id: 'a', title: 'A', due: true, met: false }];
    data.aspects.slice(1).forEach(a => {
      a.capabilities = Array.from({ length: 10 }, (_, i) => ({ id: String(i), title: 'Met', due: true, met: true }));
    });
    expect(HealthScoreModel.compute(data).feature.value).toBeCloseTo(100 * 5 / 6);
  });
  it('does not charge the slice ratchet for P0s or for P1s newly filed today', () => {
    const data = input();
    data.p0 = ['OR-900'];
    data.p1 = [{ id: 'OR-901', status: 'open', existedYesterday: false }];
    data.ratchets = [{ id: 'slice', name: 'Slice', count: 10, why: 'release gate' }];
    const result = HealthScoreModel.compute(data);
    expect(result.debt.cost).toBe(0);
    expect(result.debt.ratchets[0]).toMatchObject({ recorded: 10, count: 0 });
    data.p1[0]!.existedYesterday = true;
    expect(HealthScoreModel.compute(data).debt.cost).toBe(2);
  });
  it('explains expired rounds, a P1 leaving grace, and a rising ratchet', () => {
    const before = input(), after = input();
    before.date = '2026-11-26';
    before.rounds = [round('2026-11-05', 'expired', 100)];
    after.rounds = before.rounds;
    before.p1 = [{ id: 'OR-900', status: 'open (20 Nov)', existedYesterday: true }];
    after.p1 = before.p1;
    before.ratchets[0]!.count = 0;
    const old = { date: before.date, sha: 'a'.repeat(40), sources: {}, historyReferences: { grace: '', yesterday: '' },
      components: HealthScoreModel.compute(before) };
    const now = { ...old, date: after.date, components: HealthScoreModel.compute(after) };
    expect(HealthReport.reasons(old, now)).toEqual([
      'cold-play round 2026-11-05 reader expired', 'OR-900 passed its grace (0 → 1)', 'Edges rose (0 → 1)',
    ]);
    expect(HealthReport.trend([old], now).join('\n')).toContain('fell:');
  });
  it('finds requests in the register snapshot at the UTC cutoff', () => {
    const root = mkdtempSync(join(tmpdir(), 'kyrie-health-history-'));
    try {
      mkdirSync(join(root, 'doc/architecture'), { recursive: true });
      execFileSync('git', ['init', '-q', root]);
      const file = join(root, 'doc/architecture/open-register.md');
      const header = '| ID | What | Status | Pri |\n|---|---|---|---|\n';
      writeFileSync(join(root, 'doc/architecture/register-archive.md'), header);
      writeFileSync(join(root, 'doc/architecture/register-kinds.json'), '{"rows":{},"blockedBy":{}}');
      writeFileSync(file, `${header}| OR-701 | First request | open | P1 |\n`);
      execFileSync('git', ['add', '.'], { cwd: root });
      const commit = (date: string) => execFileSync('git', ['-c', 'user.name=Test',
        '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', date, '-m',
        'Co-authored-by: copilot-swe-agent[bot] <198982749+Copilot@users.noreply.github.com>'], { cwd: root,
        env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
      commit('2026-11-19T12:00:00Z');
      writeFileSync(file, `${header}| OR-701 | First request | open | P1 |\n| OR-702 | New request | open | P1 |\n`);
      execFileSync('git', ['add', '.'], { cwd: root });
      commit('2026-11-20T12:00:00Z');
      expect([...HealthRead.before('2026-11-20', root).ids]).toEqual(['OR-701']);
      expect([...HealthRead.before('2026-11-21', root).ids]).toEqual(['OR-701', 'OR-702']);
    } finally {
      rmSync(root, { recursive: true });
    }
  });
});
