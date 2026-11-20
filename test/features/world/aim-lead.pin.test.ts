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
