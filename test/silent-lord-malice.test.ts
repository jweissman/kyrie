import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { Keep } from './support/keep';

// The darker side of the keep (data/situations/silent-lord/malice.kyr), where it needs the generated country: the
// wicket of the keep's own gate and the rider's tracks at its foot are on the site a placement binds it to. The
// situation's own rules (the quiet watch, the young man with a sword, the cup, what each calling sees, the crisis
// that moves without the company) are proved on the situation alone, in test/silent-lord-alone, without drawing a
// country. A spec puts the company down with `Placed.at` only to skip a walk; where it is given a fact it says so.
const k = Keep.id;

describe('the silent lord: malice, at the generated keep', () => {
  it('lets a thief who has read the gate lift the wicket’s bar without a bribe or a bell', async () => {
    const j = await Keep.at('gatehouse', { calling: 'thief' });
    await j.play('Wait › A while');
    expect(Keep.knows(j, 'wire_seen')).toBe(true);
    const site = await Keep.site();
    await j.play('=day 10 23:00');
    Placed.at(j, `region__${site}`);
    j.roll('pass');
    await j.play('Have .* lift the wicket');
    j.roll();
    expect(Keep.holds(j, 'night_open', k('house'))).toBe(true);
  }, 600000);

  it('lets a ranger read the rider’s tracks in the ditch, and the marshal call the Hands off', async () => {
    const j = await Keep.at('ward', { calling: 'ranger' });
    const site = await Keep.site();
    Placed.at(j, `region__${site}`);
    expect(j.seen()).toMatch(/soft soles/);
    Placed.knows(j, k('tracks_seen'));
    Placed.at(j, k('ward'));
    await j.play('Tell .* the rider was taken in the ditch');
    expect(Placed.holds(j, 'tolerates', k('hands'), 'party')).toBe(true);
  }, 600000);
});
