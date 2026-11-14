import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';
import { Promises } from '../../src/presentation/promises';

// What a screen shows must be something the game keeps (Promises; CO-07's pedlar, "someone is here", who could not be
// spoken to). Asked of the screen's own rows, by what they carry.
const yard = (who: string) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Passage gate "the gate" is path between yard and lane.
  Company party "You" of 1 at yard.
  ${who}`;
describe('a screen\'s promises', () => {
  it('are kept where someone there can be spoken to and the way can be taken', async () => {
    const t = await Tiny.start(yard(`Person wat "Wat" at yard { Role "a pedlar". Ancestry human. Peaceable. }
  Topic road with wat "Ask Wat about the road" when true { Says "'Long,' says Wat.". }`));
    expect(Promises.broken(ScreenModel.build(t.campaign))).toEqual([]);
  });
  it('are broken where a way is shown open and nothing takes it', async () => {
    const t = await Tiny.start(yard(''));
    const screen = ScreenModel.build(t.campaign);
    const shut = { ...screen, exits: screen.exits.map(e => ({ ...e, acts: [] })) };
    expect(Promises.broken(shut)).toEqual(['the way to the lane is shown open, and nothing takes it']);
    expect(Promises.broken({ ...shut, exits: shut.exits.map(e => ({ ...e, blocked: 'barred' })) })).toEqual([]);
  });
  it('are broken where someone is shown there and nothing can be done toward them', async () => {
    const t = await Tiny.start(yard('Person wat "Wat" at yard { Role "a pedlar". Ancestry human. Peaceable. }'));
    const screen = ScreenModel.build(t.campaign);
    const mute = { ...screen, people: screen.people.map(p => ({ ...p, acts: [] })) };
    expect(Promises.broken(mute)).toEqual(['Wat, a pedlar is here, and nothing can be done toward them']);
  });
});
