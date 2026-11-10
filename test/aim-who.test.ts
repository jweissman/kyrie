import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../src/autoplay/run';
import { ScreenModel } from '../src/ui/screen-model';

// An aim whose place the map cannot show says who it names, who might know where (the product-design review's PD-12:
// following an aim whose place was not known, the map gave no direction and said nothing of who might know).
describe('an aim not yet on the map', () => {
  it('names whom to ask: the notice on the green at Lowmouth sends the company to Eogan', async () => {
    const s = await AutoplayRun.start({ seed: 'a1', origin: 'wanderer', policy: 'follow', steps: 0,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'cleric' } });
    await s.leg('go(party,region__s1_approach_way,region__s1_approach,region__s1_green)');
    await s.leg('region__s1_u_notice_read(party,region__s1_green)');
    const aims = ScreenModel.build(s.campaign).aims ?? [];
    const dead = aims.find(a => /under the churchyard/.test(a.text));
    // Whom to ask, and where: said in the aim itself (the owner's own session, 7 November), so the map needs no
    // "may know where" of him.
    expect(dead?.text).toMatch(/^Ask Eogan, priest of \S+ at the shrine of \S+, about what has come up/);
    // The father's own errand names no one to ask.
    expect(aims.find(a => /your father/i.test(a.text))?.who).toBeUndefined();
  }, 120000);
});
