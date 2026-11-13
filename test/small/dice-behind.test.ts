import { describe, expect, it } from 'bun:test';
import { ToldLines } from '../../src/presentation/told-lines';
import { TerminalScene } from '../../src/cli/terminal-scene';
import type { Leaf } from '../../src/presentation/narrator';
import type { Screen } from '../../src/ui/screen-types';

// The dice behind an outcome are kept for a deliberate look (the first blind playtest: "1 on the die, needing 11"
// beside a success the prose had made plain; BP-03): told, the outcome is prose alone; looked at, the roll is there.
const lines = [{ text: 'The keeper looks past you at the bracken. The boy is gone.', kind: 'telling' as const },
  { text: 'Haze makes the deception check (d20 14 + 2 = 16 against 11).', kind: 'roll' as const }];
describe('the dice of a check', () => {
  it('are not said with the outcome, and are there on a look', () => {
    expect(ToldLines.said(lines).map(l => l.kind)).toEqual(['telling']);
    expect(ToldLines.said(lines, true).map(l => l.kind)).toEqual(['telling', 'roll']);
  });
  it('are left out of the terminal\'s telling of an act', () => {
    const screen = { place: { id: 'road', name: 'the road' }, elapsed: 0, clock: '09:00', date: { short: '1 Thaw',
      long: '1 Thaw; spring' }, aims: [], party: [], expedition: { daylight: 'day', rations: 3, hungry: false } };
    const leaf = { situation: [], presence: [], changed: [], exchange: { lines, notes: [], tone: 'act' } };
    const told = new TerminalScene().lines(screen as unknown as Screen, leaf as unknown as Leaf, 'act').join('\\n');
    expect(told).toContain('The boy is gone');
    expect(told).not.toContain('d20');
  });
});
