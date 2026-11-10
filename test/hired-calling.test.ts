import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';

// Anyone's calling can be asked after, through whoever is of them: an escort who only travels with the company by
// travelsWith(?h, party) and memberOf(?m, ?h) and hasCalling(?m, calling_x); one recruited, a member of the company
// from then, by memberOf(?m, party). Register M19-183, met by the authors of Let One Remember and the Patient Star,
// who had not found the form (see doc/authoring/forms.md).
describe('a hired companion', () => {
  it('has a calling to ask after while travelling with the company', async () => {
    const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, { origin: 'kin',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kahitude', w.source), c = s.campaign, who = 'region__s5_traveller';
    const take = async (re: RegExp) => s.leg(PlayerView.choices(c).find(x => re.test(x.choice.id))!.choice.id);
    await take(/,region__s5_green\)$/);
    await take(/,region__s5_taproom\)$/);
    // Anyone's calling is asked through whoever is of them: before they join, of their own group (as an escort who
    // only travels with the company is); once joined, of the company.
    const of = (group: string) => ({ kind: 'and', left: { kind: 'call', name: 'memberOf', args: ['?m', group] },
      right: { kind: 'call', name: 'hasCalling', args: ['?m', '?k'] } }) as never;
    expect(c.world.test(of(who))).toBe(true);
    await take(/^talk_to\(region__s5_traveller\)$/);
    await take(/^region__s5_traveller_brings$/);
    await take(new RegExp(`^recruit\\(${who}`));
    expect(c.world.related('memberOf').some(r => r.args[0] === 'region__member_s5_traveller_person'
      && r.args[1] === 'party')).toBe(true);
    expect(c.world.test(of('party'))).toBe(true);
  }, 120000);
});
