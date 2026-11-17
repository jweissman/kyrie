import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegisterState } from '../../scripts/register-state';
import { RegisterTickets } from '../../scripts/register-tickets';

// The register measures all of itself (OB-01, the obligations audit's first reduction): every line that begins with
// an id is a row both of its readers count, and no id names two rows. Before OB-01 the three-column tables of
// §49–50 (id, finding, state) were read by neither, a blank line inside §37's table cut ten rows out of both,
// and OPR-05 and PB-15 each named two rows.
const text = readFileSync(join(RegisterTickets.root, 'doc/architecture/open-register.md'), 'utf8');
const lines = text.split('\n').filter(l => /^\| [A-Z][A-Z0-9]*-/.test(l)).map(l => l.split('|')[1]!.trim());
describe('the register counts every row', () => {
  it('reads every id-like line, by both of its readers', () => {
    const state = new Set(RegisterState.rows(text).map(r => r.id));
    const tickets = new Set(RegisterTickets.rows(text).map(r => r.id));
    expect(lines.filter(id => !state.has(id))).toEqual([]);
    expect(lines.filter(id => !tickets.has(id))).toEqual([]);
  });
  // One reading, one state model (the planning report's Sprint 0, item 1): every status leads with a state its reader
  // knows, and none says closed while saying open.
  it('leads every status with a known state, and closes none that is still open', () => {
    expect(RegisterState.hygiene(RegisterState.rows(text)).slice(1)).toEqual(['statuses leading with no known state (0): ',
      'closed, yet saying open (0): ']);
  });
  it('gives each row an id of its own', () => {
    expect(lines.filter((id, i) => lines.indexOf(id) !== i)).toEqual([]);
  });
  it('reads a three-column table by its state, and ends a table at its first line that is not a row', () => {
    const table = '| id | finding | state |\n|---|---|---|\n| ZZ-01 | a | open |\n| ZZ-01b | a `p | q` rule | fixed |\n'
      + '\n| ZZ-02 | b | closed | P1 | M |';
    expect(RegisterState.rows(table).map(r => [r.id, RegisterState.kind(r.status)]))
      .toEqual([['ZZ-01', 'open'], ['ZZ-01b', 'closed']]);
    expect(RegisterTickets.rows(table).map(r => [r.id, r.state, r.pri]))
      .toEqual([['ZZ-01', 'open', ''], ['ZZ-01b', 'closed', '']]);
  });
});
