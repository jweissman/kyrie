import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { Itineraries } from '../../../src/ui/itinerary';

// Feature pins: see test/features/choice/consequence.pin.test.ts. An aim's lead a step from the way out (AT-12, S3-0's
// golden route, 20 November): from the Stone Horn's taproom the fuel boat's aim toward Ianto at Reedbridge had said
// "Nothing here bears on your aim now", the landing a minute off leading with Reedbridge. From inside, where no plan
// reaches the room the one it names stands in, the way out toward the town holding them is the step, in gold; only
// to a town the company knows a journey to, and never out of its own town for one in it.
const country = (opts: { far?: boolean; told?: boolean; here?: boolean } = {}) => `
  Place hythe "Hythe" is settlement at 0, 0.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place taproom "the taproom of the Stone Horn" is room within hythe at 1, 0 indoors.
  Place back "the back room" is room within hythe at 2, 0 indoors.
  Passage door "the inn door" is door between green and taproom.
  Passage back_door "the back door" is door between taproom and back.
  Place reed "Reedbridge" is settlement at 6, 0.
  Place quay "the quay at Reedbridge" is room within reed at 0, 0 outdoors.
  Place boathouse "the boathouse" is room within reed at 1, 0 indoors.
  Passage boat_door "the boathouse door" is door between quay and boathouse.
  ${opts.far ? `Place lane "the drove lane" is room at 3, 0 outdoors.
  Passage lane_way "the lane" is path between green and lane taking 1 hours.
  Passage reed_way "the way to Reedbridge" is path between lane and quay taking 1 hours.`
    : 'Passage reed_way "the way to Reedbridge" is road between green and quay taking 2 hours.'}
  Entity reed_told: fact "The fuel boat lies at Reedbridge.".
  Initially Assert established(reed_told). Initially Assert leadsTo(reed_told, reed).
  ${opts.told === false ? '' : 'Initially Assert knows(party, reed_told).'}
  Company party "You" of 1 at green.
  Person ianto "Ianto" at ${opts.here ? 'back' : 'boathouse'} { Role "the fuel boatman". Ancestry human. Peaceable. Pronouns he. }
  Objective cold when true toward ianto "Find out what has become of Ianto's fuel boat.".
  Goal false.`;
class Lead {
  static async inside(opts: Parameters<typeof country>[0] = {}): Promise<Tiny> {
    const t = await Tiny.start(country(opts));
    await t.play('To the taproom of the Stone Horn');
    return t.follow('cold');
  }
  static gold(t: Tiny): string[] { return t.gold.map(a => a.command ?? ''); }
  // In the king's hall with his crown (see halls, below), the aim to bring it up followed.
  static async held(): Promise<Tiny> {
    const t = await Tiny.start(halls);
    await t.play('Into the barrow', 'To the king\'s hall', 'the king\'s crown: Take');
    return t.follow('bring');
  }
}

describe('World › An aim led from inside', () => {
  it('leads a step from the way out: from the taproom, out to the green toward the town holding the one it names',
    async () => {
      const t = await Lead.inside();
      expect(t.where()).toBe('t__taproom');
      expect(Lead.gold(t)).toEqual(['go(t__door,t__green)']);
    });
  // Reedbridge beyond a lane not yet walked, and not told of: no journey is known to it, and nothing leads out.
  it('leads no way out toward a town the company knows no journey to', async () => {
    const t = await Lead.inside({ far: true, told: false });
    expect(Itineraries.plan(t.campaign, 't__reed')).toBeUndefined();
    expect(Lead.gold(t)).not.toContain('go(t__door,t__green)');
  });
  it('leads no way out of its own town for one in a room of it not yet been to', async () => {
    const t = await Lead.inside({ here: true });
    expect(Lead.gold(t)).not.toContain('go(t__door,t__green)');
  });
});

// What the aim waits on comes true outside (CL-65, the barrow's crown: held in the halls, the aim had said the barrow
// was still to be explored): where a rule makes it so by the company standing somewhere (in daylight, the crown in
// hand), the step is the nearest place the company knows where it would; the first of the ways there is gold, room by
// room; and at night there, the wait for first light.
const halls = `
  Place moor "the moor" is wilderness at 0, 0.
  Place mouth "the barrow's mouth" is room within moor at 0, 0 outdoors.
  Place barrow "the barrow" is site within moor at 1, 0.
  Place passage "the long passage" is room within barrow at 0, 0 indoors.
  Place hall "the king's hall" is room within barrow at 1, 0 indoors.
  Passage door "the stone door" is door between mouth and passage.
  Passage arch "the low arch" is doorway between passage and hall.
  Company party "You" of 1 at mouth.
  Relation daylit(place). Relation raised(). Initially Assert daylit(mouth).
  Kind crown_kind "a bronze crown" is treasure worth 5 weighing 1 described "A crown of green bronze.".
  Item crown "the king's crown" is crown_kind at hall.
  Rule brought when at(party, ?p) and daylit(?p) and not dark() and holding(party, crown_kind) and not raised()
    says "In the daylight the bronze of the crown is green as a beetle." { Assert raised(). }
  Objective bring when not raised() "Bring the king's crown up into the daylight.".
  Goal false.`;
describe('World › An aim that comes true outside', () => {
  it('leads out room by room to where it would, the crown in hand, and is done there', async () => {
    const t = await Lead.held();
    expect(t.glance.lead).toMatchObject({ source: 'placed', next: ['t__mouth'] });
    expect(Lead.gold(t)).toEqual(['go(t__arch,t__passage)']);
    await t.perform('go(t__arch,t__passage)');
    expect(Lead.gold(t)).toEqual(['go(t__door,t__mouth)']);
    await t.perform('go(t__door,t__mouth)');
    expect(t.journey.holds('raised')).toBe(true);
  });
  it('waits for the day where only the night stands in its way', async () => {
    const t = await Lead.held();
    await t.play('=22:00', 'To the long passage', 'Out to the barrow\'s mouth');
    expect(t.journey.holds('raised')).toBe(false);
    expect(t.glance.lead).toMatchObject({ source: 'placed', next: ['t__mouth'] });
    expect(Lead.gold(t)).toEqual(['wait_for_light']);
  });
});

// The gold never goes round (AT-14, the warned barrow walk: the cross-chamber led to a recess, the back-stone back to
// the chamber, and the counterweight was never gilded): a chamber with two dead-end recesses, and a back room whose
// stair down opens only while its wheel is turned. Following only the gold, the company never stands twice in one
// place under one lead, and comes by the wheel's act down into the vault within a dozen moves.
const winch = `
  Place hill "the hill" is wilderness at 0, 0.
  Place hold "the old hold" is site within hill at 1, 0.
  Place chamber "the chamber" is room within hold at 0, 0 indoors.
  Place left "the left recess" is room within hold at 0, 1 indoors.
  Place right "the right recess" is room within hold at 0, 2 indoors.
  Place back "the back room" is room within hold at 1, 0 indoors.
  Place below "the vault below" is room within hold at 1, 1 indoors.
  Passage left_way "the left opening" is doorway between chamber and left.
  Passage right_way "the right opening" is doorway between chamber and right.
  Passage back_way "the back opening" is doorway between chamber and back.
  Passage stair "the stair down" is stair between back and below opening when state(wheel, turning) "The stair is shut under a slab.".
  Thing wheel "the iron wheel" at back {
    State still "An iron wheel stands in the wall, chained.". State turning "The wheel is turned, and the slab is up.".
    Change turn "Turn the iron wheel" from still to turning.
  }
  Company party "You" of 1 at chamber.
  Objective vault when not been(party, below) toward below "Go down into the vault under the old hold.".
  Goal false.`;
describe('World › The gold never goes round', () => {
  it('goes down by the wheel on the gold alone, never twice in one place under one lead', async () => {
    const t = await Tiny.start(winch);
    t.follow('vault');
    const stood = new Set<string>(), walked: string[] = [];
    for (let i = 0; i < 12; i++) {
      const at = `${t.where()}|${JSON.stringify(t.glance.lead)}`;
      expect(stood.has(at)).toBe(false);
      stood.add(at);
      const step = t.gold[0];
      if (!step || t.journey.holds('been', 'party', 't__below')) { break; }
      walked.push(step.label);
      await t.perform(step.command ?? step.choice);
    }
    expect(walked.some(l => /iron wheel/.test(l))).toBe(true);
    expect(t.journey.holds('been', 'party', 't__below')).toBe(true);
  });
});
