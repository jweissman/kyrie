import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A band its author named as someone's is told one by one by that name, not by its kind (CO-14: Skell's sons had
// fought as "Human 1", "Human 2", "Human 3"); a band named by its kind keeps its kind and number.
const yard = (name: string, role: string) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person sons "${name}" at yard { Role "${role}". Ancestry human. Calling warrior. Level 1. Numbers 3. Temperament territorial. }`;
describe('a band of three', () => {
  it("named as someone's, is the first, the second and the third of them", async () => {
    const t = await Tiny.start(yard("Skell's sons", "three of Skell's crew, not all of them his sons"));
    const names = t.journey.campaign.readout.creatures.map(c => c.name).filter(n => /Skell/.test(n));
    expect(names).toEqual(["The first of Skell's sons", "The second of Skell's sons", "The third of Skell's sons"]);
  });
  it('named by its kind, is numbered by it', async () => {
    const t = await Tiny.start(yard('the footpads', 'footpad'));
    const names = t.journey.campaign.readout.creatures.map(c => c.name).filter(n => /ootpad/.test(n));
    expect(names).toEqual(['Footpad 1', 'Footpad 2', 'Footpad 3']);
  });
});
