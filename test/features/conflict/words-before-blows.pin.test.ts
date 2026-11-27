import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { GeneratedWorld } from '../../support/generated';
import { NoviceMeeting, type Meeting } from '../../../scripts/novice-meeting';
import type { PlaySession } from '../../../src/session/play-session';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Conflict › Words before blows (OR-1433, the economy
// review of 27 November: a fight should offer parley where the world allows it, and what it offers must be what the
// band would do): in the reference seed's first dungeon (s0's barrow, halls and grave), every band that would hear
// words (Ask them to let you by, Warn them off: inhabitants.kyr's hears and talks) meets the company with a turn,
// warning it or letting it be, and is offered those words where it stands; and every band that comes at once is one
// that hears none, so a fight's first frame offering none is the truth, not an omission. Measured 27 November: the
// robbers and the recess's dwellers are offered words; the five that come at once are all savage.
interface Met { band: string; meeting: Meeting; words: boolean }
describe('Conflict › Words before blows', () => {
  const met: Met[] = [];
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const session = journey.session as PlaySession, campaign = session.campaign, world = campaign.world;
    const company = campaign.readout.partyIds.map(id => campaign.readout.creatures.find(c => c.id === id)!);
    const members = new Map<string, string[]>();
    for (const r of world.related('memberOf')) { members.set(r.args[1]!, [...members.get(r.args[1]!) ?? [], r.args[0]!]); }
    const bands = world.related('at').filter(r => r.args[1]!.startsWith('region__s1_ud_') && members.has(r.args[0]!)
      && r.args[0] !== campaign.playerActor).map(r => ({ id: r.args[0]!, where: r.args[1]!, place: r.args[1]!,
      name: r.args[0]!, installation: '', trouble: '', minutes: 0, members: members.get(r.args[0]!)! }));
    for (const band of bands) {
      const { meeting } = NoviceMeeting.read(campaign, band, company);
      GeneratedWorld.put(session, band.place.replace(/^region__/, ''));
      const offered = campaign.offered().map(o => o.id);
      const words = ['talk_round', 'face_down'].every(a => offered.includes(`${a}(party,${band.id},${band.place})`));
      met.push({ band: band.id, meeting, words });
    }
  }, 120000);
  it('offers words to the bands that would hear them, each at a turn it gives, and none to a band that comes at once', () => {
    const heard = met.filter(m => m.words), atOnce = met.filter(m => m.meeting === 'at once');
    expect(heard.length).toBeGreaterThan(1);
    expect(atOnce.length).toBeGreaterThan(0);
    expect(heard.filter(m => m.meeting === 'at once').map(m => m.band)).toEqual([]);
  });
});
