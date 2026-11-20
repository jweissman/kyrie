import { describe, expect, it } from 'bun:test';
import { RegisterKinds } from '../../scripts/register-kinds';
import { RegisterTickets } from '../../scripts/register-tickets';

// What each live row is (the owner, 20 November: future design apart from defects, and which tickets an architecture
// change blocks; a true defect stays a defect however it is blocked). The file names only rows there are, with why;
// what blocks a row is a row still to be done; and a defect blocked is counted a defect.
const kinds = RegisterKinds.read(), rows = RegisterTickets.rows(RegisterTickets.text());
const ids = new Set(rows.map(r => r.id));
const live = new Set(rows.filter(r => RegisterTickets.live.includes(r.state)).map(r => r.id));
describe('the register by kind', () => {
  it('names only rows there are, each with why', () => {
    const named = [...Object.entries(kinds.direction), ...Object.entries(kinds.gate)];
    expect(named.filter(([id, why]) => !ids.has(id) || !why.trim()).map(([id]) => id)).toEqual([]);
    expect(Object.keys(kinds.direction).filter(id => id in kinds.gate)).toEqual([]);
  });
  it('is blocked only by a row still to be done, and a blocked defect is still a defect', () => {
    expect(Object.entries(kinds.blockedBy).filter(([id, by]) => !ids.has(id) || !live.has(by))).toEqual([]);
    const blocked = RegisterKinds.live()
      .filter(r => r.blockedBy && !(r.id in kinds.direction) && !(r.id in kinds.gate));
    expect(blocked.filter(r => r.kind !== 'defect')).toEqual([]);
  });
});
