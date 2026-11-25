import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Undertakings } from '../../src/presentation/undertakings';

// Under a town, gone through, the way up is led, marked, by a way the company can take (OR-411). On thorn's
// gold-follower, the dead laid and the priest to be told, the way toward the churchyard had gone by the crypt's stair
// up, barred and dark; the page led into the crypt, to listen at the stair, and back, nine times, and with the
// vault's keeper beyond the company, the ways toward the vault to and fro, plain: fifteen turns of eighty with nothing
// marked (the quantity gate's measure 5, 26% against a ceiling of 25). The same in miniature: a green and a churchyard
// above, the workings under them, the crypt's stair up to the churchyard locked, and the way back up by the adit.
const town = `
  Place vale "the vale" is region.
  Place mere "Mere" is settlement within vale at 0, 0.
  Place green "the green" is room within mere at 0, 0 outdoors.
  Place yard "the churchyard" is room within mere at 1, 0 outdoors.
  Place shrine "the shrine" is room within mere at 2, 0 indoors.
  Place adit "the adit" is room within mere at 0, 1 underground 1 down.
  Place hall "the bone hall" is room within mere at 1, 1 underground 1 down.
  Place crypt "the crypt" is room within mere at 1, 2 underground 1 down.
  Passage lane "the lane" is path between green and yard.
  Passage porch "the porch" is door between yard and shrine.
  Passage mouth "the adit mouth" is stair between green and adit.
  Passage cut "the cut" is passage between adit and hall.
  Passage arch "the arch" is arch between hall and crypt.
  Passage stair "the stone stair" is stair between yard and crypt.
  Thing lock "the lock of the stone door" on stair {
    State locked blocking "".
    State open "The stone door stands unlocked.".
  }
  Initially Assert state(lock, locked).
  Person priest "the priest" at shrine { Role "the priest". }
  Relation told(group).
  Company party "You" of 1 at green.
  Objective tell when not told(party) toward priest "Tell the priest the dead are laid.".
  Initially Assert unlit(crypt).
  Goal false.`;

describe('under a town, gone through', () => {
  it('leads up by the way open, marked, never into the crypt to listen at a barred stair', async () => {
    const t = await Tiny.start(town, { party: [{ name: 'Thora', raceId: 'dwarf', classId: 'warrior' }] });
    await t.perform('light_item(t__party_1__torch)');
    for (const way of ['go(t__mouth,t__adit)', 'go(t__cut,t__hall)', 'go(t__arch,t__crypt)', 'go(t__arch,t__hall)']) {
      await t.perform(way);
    }
    Undertakings.follow(t.campaign, 't__tell');
    t.look();
    const walked: string[] = [];
    for (let step = 0; step < 6 && t.where() !== 't__green'; step++) {
      const way = t.glance.acts[0];
      expect([t.where(), way?.aspects.length]).toEqual([t.where(), expect.any(Number)]);
      expect([t.where(), way!.aspects.length > 0]).toEqual([t.where(), true]);
      walked.push(way!.label);
      await t.perform(way!.command!);
    }
    expect([t.where(), walked]).toEqual(['t__green', ['To the adit', 'Up to the green']]);
  });
});
