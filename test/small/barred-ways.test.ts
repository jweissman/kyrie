import { describe, expect, it } from 'bun:test';
import { BarredWays } from '../../src/presentation/barred-ways';
import type { ExitRow, Screen } from '../../src/ui/screen-types';

// A way on that only something barred would cross is said with what the company needs: a ranger alone at Ironkeep
// had found push, pull, listen and search empty, and only the way out (the terminal's human session, 15 November).
const exit = (over: Partial<ExitRow>): ExitRow => ({ id: 'exit:in', kind: 'exit', name: 'the bailey',
  destination: { id: 'bailey', name: 'the bailey', kind: 'room' }, transition: 'enter', passage: 'arch',
  visited: false, acts: [], ...over } as ExitRow);
const heave = { key: '0:Heave', label: 'Heave the portcullis up and wedge it', does: 'change_thing',
  disabled: 'Needs brawn: no one in the company can use it now.' };
const go = { key: '0:Go', label: 'Go', command: 'go(gate,keep)', does: 'go', moves: true };
const screen = (exits: ExitRow[], site = true) => ({ place: { id: 'gate' }, exits,
  path: site ? [{ id: 'keep', kind: 'site' }] : [{ id: 'town', kind: 'settlement' }] }) as unknown as Screen;

describe('a barred way on', () => {
  it('says what crossing it needs, in a site', () => {
    expect(BarredWays.said(screen([exit({ acts: [heave] as never }), exit({ acts: [go] as never })]), new Set()))
      .toEqual(['Heave the portcullis up and wedge it: needs brawn']);
    expect(BarredWays.said(screen([exit({ way: 'a breach in the curtain wall',
      blocked: 'You would need climbing or a coil of rope.' })]), new Set()))
      .toEqual(['A breach in the curtain wall: needs climbing or a coil of rope']);
  });
  it('says nothing of a way open, taken, or out in a town the aim does not name', () => {
    expect(BarredWays.said(screen([exit({ acts: [heave, go] as never })]), new Set())).toEqual([]);
    expect(BarredWays.said(screen([exit({ acts: [heave] as never, visited: true })]), new Set())).toEqual([]);
    expect(BarredWays.said(screen([exit({ acts: [heave] as never })], false), new Set())).toEqual([]);
    expect(BarredWays.said(screen([exit({ acts: [heave] as never })], false), new Set(['gate']))).toHaveLength(1);
  });
});
