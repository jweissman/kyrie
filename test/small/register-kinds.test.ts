import { describe, expect, it } from 'bun:test';
import { RegisterKinds } from '../../scripts/register-kinds';
import { RegisterTickets } from '../../scripts/register-tickets';

// What each live row is, auditable (the owner, 20 November: release-blocking defects, outstanding requirements and
// future directions apart; every reclassification shown with what it was and why; a kind never moves a priority, and
// a blocked defect is still a defect). The file names only rows there are; a row's priority is still the one it had
// when reclassified; what blocks a row is a row still to be done.
const kinds = RegisterKinds.read(), rows = RegisterTickets.rows(RegisterTickets.text());
const pri = new Map(rows.map(r => [r.id, r.pri]));
const live = new Set(rows.filter(r => RegisterTickets.live.includes(r.state)).map(r => r.id));
describe('the register by kind', () => {
  it('names only rows there are, each with what it was and why, its priority unmoved', () => {
    const named = Object.entries(kinds.rows);
    expect(named.filter(([id, n]) => !pri.has(id) || !n.why.trim() || !n.was || n.was === n.kind)
      .map(([id]) => id)).toEqual([]);
    expect(named.filter(([id, n]) => pri.get(id) !== n.pri).map(([id, n]) => `${id}: ${n.pri} → ${pri.get(id)}`))
      .toEqual([]);
  });
  it('is blocked only by a row still to be done, and a blocked defect is still a defect', () => {
    expect(Object.entries(kinds.blockedBy).filter(([id, by]) => !pri.has(id) || !live.has(by))).toEqual([]);
    const blocked = RegisterKinds.live().filter(r => r.blockedBy && !(r.id in kinds.rows));
    expect(blocked.filter(r => r.kind !== 'defect')).toEqual([]);
  });
});
