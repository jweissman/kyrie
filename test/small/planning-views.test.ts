import { describe, expect, it } from 'bun:test';
import { PlanningViews, type Planning } from '../../scripts/planning-views';
import type { Row } from '../../scripts/register-tickets';

// The three planning views held apart (the owner, 20 November): the register records everything; the supported
// slice's gate counts its live P0/P1 rows against every row declared in it, and every live P0/P1 row is in it or said
// to be outside it, with a reason, so it cannot reach zero by narrowing; the active queue keeps its limits, and an
// urgent defect displaces another rather than waiting.
function row(id: string, pri = 'P1', state: Row['state'] = 'open'): Row {
  return { id, section: '', what: id, status: state, pri, state, loose: false, feature: 'page-ui', how: 'row' };
}
function plan(members: string[], outside: Record<string, string>, active: Partial<Planning['active']> = {}): Planning {
  return { slice: { name: 'slice', since: '2026-11-20', scope: 'the first hour', members, outside },
    active: { limits: { blockers: 2, platform: 1 }, blockers: [], platform: [], urgent: [], ...active } };
}
const q = (id: string) => ({ id, owner: 'lead', accept: 'shown in the browser' });

describe('the planning views', () => {
  it('hold as declared, over the register as it is', () => {
    expect(PlanningViews.faults()).toEqual([]);
  });
  it('find a live P0 or P1 row neither in the slice nor outside it, and an exclusion without a reason', () => {
    const rows = new Map([row('A-1'), row('A-2', 'P0'), row('A-3'), row('A-4', 'P2')].map(r => [r.id, r]));
    expect(PlanningViews.faults(plan(['A-1'], { 'A-3': ' ' }), rows)).toEqual([
      'A-2 is a live P0 and neither in the slice nor said to be outside it', 'A-3 is outside the slice with no reason']);
  });
  it('keep a closed member in the count, so the gate reads live over declared', () => {
    const rows = new Map([row('A-1'), row('A-2', 'P1', 'closed')].map(r => [r.id, r]));
    expect(PlanningViews.said(plan(['A-1', 'A-2'], {}), rows)[1]).toBe('slice (since 2026-11-20): 1 / 2 P0/P1 rows live');
  });
  it('hold the queue to its limits, its blockers to the slice, an urgent row to a reason and a displacement', () => {
    const rows = new Map(['A-1', 'A-2', 'A-3', 'M-1'].map(id => [id, row(id)]));
    const over = plan(['A-1', 'A-2', 'A-3'], { 'M-1': 'platform' },
      { blockers: [q('A-1'), q('A-2'), q('A-3')], platform: [q('M-1')], urgent: [] });
    expect(PlanningViews.faults(over, rows)).toEqual(['3 blockers active, over 2']);
    const urgent = plan(['A-1', 'A-2', 'A-3'], { 'M-1': 'platform' },
      { blockers: [q('A-1'), q('A-3')], platform: [q('M-1')], urgent: [{ id: 'A-3', why: '', displaced: 'A-1' }] });
    expect(PlanningViews.faults(urgent, rows)).toEqual(['A-3 is urgent with no reason', 'A-3 displaced A-1, still active']);
    const outside = plan(['A-1'], { 'M-1': 'platform' }, { blockers: [q('M-1')] });
    expect(PlanningViews.faults(outside, rows)).toContain('M-1 is an active blocker outside the slice');
  });
});
