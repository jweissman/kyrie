import { describe, expect, it } from 'bun:test';
import { Charge } from '../../src/presentation/charge';
import type { Screen } from '../../src/ui/screen-types';

// The company's charge at the opening is its origin's and the world's situation it comes into (first-hour-beats,
// 0–30 s): the weir life's, its aunt's weir and the sea-gate that will drown it. With the weir's own errand held as the
// first aim (OR-247), the sea-gate's aim stood second, the charge was read off the first aim alone and taken for none,
// and the first page led with the tinker's daughter and the notice, the sea-gate in none of the four (OR-261). The
// situation is the first of the aims that is the world's own, wherever it stands.
const screen = (aims: string[], observed = ['origin__arrival']) =>
  ({ aims: aims.map(id => ({ id, text: id })), observed: observed.map(id => ({ id, text: id })) }) as unknown as Screen;
describe('the charge at the opening', () => {
  it('is the origin\'s and the first situation\'s among the aims, after the origin\'s own errand too', () => {
    expect([...Charge.of(screen(['origin__weir_lift', 'gate__gate_aim']))]).toEqual(['origin', 'gate']);
    expect([...Charge.of(screen(['drove__held_rhyne']))]).toEqual(['origin', 'drove']);
  });
  it('is none where there is no situation, no origin, or the opening is a meeting on the road', () => {
    expect([...Charge.of(screen(['origin__home', 'region__s1_job']))]).toEqual([]);
    expect([...Charge.of(screen(['gate__gate_aim'], []))]).toEqual([]);
    expect([...Charge.of(screen(['gate__gate_aim'], ['origin__meeting', 'origin__arrival']))]).toEqual([]);
  });
});
