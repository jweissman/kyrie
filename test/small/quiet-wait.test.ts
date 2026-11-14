import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A wait told only as it ends (==, see Journey; LC-04): the same world as a wait told hour by hour, step for step, and
// the same told, with only the hours between left unnarrated. The specs that wait days in a drawn country and read
// the world after it, not the page of each hour, spend half as long on the wait. A shearing yard where the bell is
// rung in the fourth hour, the old shearer dies in the fifth, and the cart comes in at the end.
const yard = `
  Place yard "the shearing yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person gaffer "the Gaffer" at yard { Role "the old shearer". Ancestry human. Peaceable. Pronouns he. }
  Event bell near gaffer when watch(clock) >= 20 "The bell is rung for the shearers.".
  Rule gaffer_dies when watch(clock) >= 26 and not dead(gaffer) { Slay gaffer. }
  Person drover "the drover" at yard { Role "a drover". Ancestry human. Peaceable. Pronouns she. }
  Event cart near drover when watch(clock) >= 56 "The wool cart comes in at the gate.".
  Observe y at yard when true "A shearing yard.".
  Goal false.`;
const waited = async (step: string) => {
  const t = await Tiny.start(yard), told = await t.journey.play(step);
  return { t, told, digests: t.session.transcript.steps.map(s => s.digest) };
};

describe('a wait told only as it ends', () => {
  it('leaves the world as the wait told hour by hour does, every hour, and tells the same', async () => {
    const full = await waited('=60'), quiet = await waited('==60');
    expect(quiet.t.journey.watch()).toBe(60);
    expect(quiet.digests).toEqual(full.digests);
    expect(quiet.told).toBe(full.told);
    expect(quiet.t.journey.holds('dead', 't__gaffer')).toBe(true);
  });
  it('narrates its last hour, and only the hours between are left untold', async () => {
    const full = await waited('=60'), quiet = await waited('==60');
    expect(full.t.journey.page).toMatch(/bell is rung/);
    expect(quiet.t.journey.page).not.toMatch(/bell is rung/);
    expect(quiet.told).toMatch(/bell is rung/);
    expect(quiet.t.journey.taken.at(-1)!.page).toBe(full.t.journey.taken.at(-1)!.page);
    expect(quiet.t.journey.latest).toMatch(/wool cart comes in/);
    expect(quiet.t.journey.taken.filter(x => x.page).length).toBeLessThan(full.t.journey.taken.length);
  });
});
