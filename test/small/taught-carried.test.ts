import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Knowing } from '../../src/presentation/knowing';
import { Outcome } from '../../src/presentation/outcome';
import type { Campaign } from '../../src/campaign/campaign';

// What an act would teach is carried from one world to the next while nothing it read has been written (OR-864), and
// read again where something it read was: Ned's word on the road teaches the road until the company knows it another
// way, though his word is still to be had, and learning something else leaves it as it was. Carried or afresh, each is
// the same at every step.
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Goal false.
  Person ned "Ned Rook" at yard { Role "the ostler". Ancestry human. Peaceable. Pronouns he. }
  Entity road: fact "The road goes over the moor.".
  Topic ned_ask with ned "Ask Ned about the road" when true {
    Says "'Over the moor,' says Ned.". On discuss { Assert knows(actor, road). } }`;
const taught = (c: Campaign, label: RegExp): boolean => {
  const act = c.offered().find(a => label.test(a.name));
  if (!act) { throw new Error(`nothing offered as ${label}`); }
  return Knowing.of(c).teaches(act);
};
const afresh = (f: () => boolean): boolean => {
  Outcome.carrying = false;
  try { return f(); } finally { Outcome.carrying = true; }
};
describe('what an act would teach, carried', () => {
  it('teaches what the company does not know, until it knows it another way', async () => {
    const t = await Tiny.start(yard, { party });
    expect(taught(t.campaign, /road/)).toBe(true);
    t.journey.assert('knows', 'party', 'road'); t.campaign.refreshProjection();
    expect(afresh(() => taught(t.campaign, /road/))).toBe(false);
    expect(taught(t.campaign, /road/)).toBe(false);
  });
  it('is carried across a world that writes nothing it read, and is the same afresh', async () => {
    const t = await Tiny.start(`${yard}
      Entity hay: fact "The hay is in.".`, { party });
    expect(taught(t.campaign, /road/)).toBe(true);
    t.journey.assert('knows', 'party', 'hay'); t.campaign.refreshProjection();
    expect(taught(t.campaign, /road/)).toBe(true);
    expect(afresh(() => taught(t.campaign, /road/))).toBe(true);
  });
});
