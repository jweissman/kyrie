import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { AimRoute } from '../../src/presentation/aim-route';

// The gold leads to where the character knows someone to be, never to where the world has them (OR-880; knowledge
// belongs to characters, truth to the world). Out of a building toward a person the aim names, the way out had been
// planned to where they truly stood (AimRoute.outward and holding read `at` of the world): moved while unseen, the gold
// followed them. Now it leads to where the company last saw them (CompanyRecall.sawAt), and where it has never seen
// them, out toward no town at all. Glen keeps the forge at Brightford; the Plough, at Millholm a road off, has a front
// door to the market, the mill beyond it, and a back door to its yard, where the road to Brightford comes in.
const towns = (start: string) => `
  Place brightford "Brightford" is settlement.
  Place bf_green "Brightford green" is room within brightford at 0, 0 outdoors.
  Place forge "Glen's forge" is room within brightford at 0, 1 indoors.
  Place millholm "Millholm" is settlement.
  Place market "Millholm market" is room within millholm at 3, 0 outdoors.
  Place yard "the Plough's yard" is room within millholm at 3, 1 outdoors.
  Place mill "the mill" is room within millholm at 4, 0 indoors.
  Place plough "the Plough" is building within millholm.
  Place taproom "the Plough's taproom" is room within plough at 3, 0 indoors.
  Passage forge_door "the forge door" is door between bf_green and forge.
  Passage road "the road" is road between bf_green and yard.
  Passage front "the front door" is door between taproom and market.
  Passage back "the back door" is door between taproom and yard.
  Passage lane "the mill lane" is path between market and mill.
  Company party "You" of 1 at ${start}.
  Person glen "Glen" at forge { Role "the smith". }
  Relation metGlen(group).
  Rule glen_met when at(party, forge) and at(glen, forge) { Assert metGlen(party). }
  Rule glen_goes when at(party, taproom) and metGlen(party) and at(glen, forge) {
    Retract at(glen, forge). Assert at(glen, mill). }
  Entity found_f: fact "Glen is found.".
  Objective find when not knows(party, found_f) "Find {glen}.".
  Goal false.`;
const gold = (t: Tiny) => t.gold.map(a => a.label);

describe('the gold toward someone the aim names', () => {
  it('leads to where the company last saw them, not to where they went unseen', async () => {
    // Been to the mill first, so that a plan to it is the company's to make; then Glen seen at his forge.
    const t = await Tiny.start(towns('mill'));
    t.follow('find');
    await t.play('To Millholm market', 'Into the Plough by the front', 'Out to the Plough\'s yard', 'To Brightford green',
      'To Glen\'s forge');
    await t.play('To Brightford green', 'To the Plough', 'Into the Plough by the back');
    // In the taproom Glen has gone down to the mill, unseen: the gold is the way back toward his forge.
    expect(t.where('glen')).toBe('t__mill');
    expect(gold(t)).toEqual(['Out to the Plough\'s yard']);
  }, 60000);
  it('leads out toward no town where the company has never seen them', async () => {
    // Brightford been to, Glen never seen: his forge there is not where the company knows him to be.
    const t = await Tiny.start(towns('bf_green'));
    t.follow('find');
    await t.play('To the Plough', 'Into the Plough by the back');
    expect(t.where('glen')).toBe('t__forge');
    expect(gold(t)).toEqual([]);
  }, 60000);
});

// Out of a building toward a place no known way reaches (a room not yet found), by a journey to the town holding it
// that the map sets out for: never toward a town the map does not draw, which the country's roads reach (OR-880).
// Hythe, where the company sits in the Reed Inn; Ashby, where the fen road comes to; Calder, past it by the salt road,
// which Odo can tell of, and its net loft up a stair not yet found.
const reedlands = `
  Place shire "the Reedlands" is region.
  Place hythe "Hythe" is settlement within shire at 0, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place inn "the Reed Inn" is building within hythe.
  Place taproom "the Reed Inn's taproom" is room within inn at 0, 0 indoors.
  Passage inn_door "the inn door" is door between green and taproom.
  Place ashby "Ashby" is settlement within shire at 2, 0.
  Place cross "Ashby cross" is room within ashby at 0, 0 outdoors.
  Place calder "Calder" is settlement within shire at 4, 0.
  Place quay "Calder quay" is room within calder at 0, 0 outdoors.
  Place loft "the net loft" is room within calder at 0, 1 indoors.
  Passage loft_stair "the loft stair" is stair between quay and loft hidden until loft_known.
  Entity loft_known: fact "A stair goes up to the net loft.".
  Passage fen_road "the fen road" is road between green and cross taking 2 hours.
  Passage salt_road "the salt road" is road between cross and quay taking 3 hours.
  Person reeve "Odo" at taproom { Role "the reeve of Hythe". Ancestry human. Peaceable. Pronouns he. }
  Entity calder_told: fact "Calder lies past Ashby, at the end of the salt road.".
  Initially Assert established(calder_told). Initially Assert leadsTo(calder_told, quay).
  Topic ask_east with reeve "Ask Odo what lies east" when true once {
    Says "'Ashby, and past it Calder, where the salt road ends,' he says.".
    On discuss { Assert knows(actor, calder_told). }
  }
  Company party "You" of 1 at taproom.
  Goal false.`;

describe('the way out toward a place', () => {
  it('is a journey the map sets out for, never one to a town it does not draw', async () => {
    const t = await Tiny.start(reedlands), loft = new Set(['t__loft']);
    expect(t.screen.region?.areas.map(a => a.id)).not.toContain('t__calder');
    expect(AimRoute.routed(t.campaign, t.screen, loft)).toEqual(loft);
    await t.perform('t__ask_east');
    expect(AimRoute.routed(t.campaign, t.screen, loft)).toEqual(new Set(['t__loft', 't__green']));
  }, 60000);
});
