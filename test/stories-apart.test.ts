import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Runner } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';

// Stories apart from the miscellaneous aims (the owner, 18 November, OR-74): on the drove road one notice read had made
// seven aims of one weight, the drove's own two among three town jobs, and nothing said which was the adventure. Each
// aim says the story it is part of, the stories' first, and what is taken up is told as a story begun. Nor does the
// green give other stories' aims before anyone has asked the company for anything (HP-01): the pans' one chimney and
// the reeve's notice for the sea-gate are leads, said with who to ask, and a story begins when that one is asked.
describe('stories apart from the other aims', () => {
  const act = async (s: PlaySession, command: string) => {
    const before = PlayerView.observe(s.campaign), event = await s.leg(command);
    return (ActionFeedbackView.read(s.campaign, event, before).taken ?? []).flatMap(t => t.begins ?? []);
  };
  it('on the drove road, after the green\'s signs and the well-post notice', async () => {
    const s = await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
    const titles = () => (ScreenModel.build(s.campaign).aims ?? []).map(a => a.story?.title ?? '-');
    expect(titles()).toEqual(['The held drove', 'The held drove']);
    // The notice read, and the green looked at (its signs said with it): no story begins, and the drove's two steps
    // are all that is held, one principal story, where four aims of three stories had been held.
    expect(await act(s, 'region__s1_u_notice_read(party,region__s1_green)')).toEqual([]);
    expect(titles()).toEqual(['The held drove', 'The held drove']);
    expect(Undertakings.held(s.campaign).length).toBeLessThanOrEqual(3);
    // What was seen and read are leads, a record apart from the aims, each with who to ask.
    const leads = () => new Map((ScreenModel.build(s.campaign).leads ?? []).map(l => [l.id, l.ask]));
    expect([...leads().keys()].toSorted()).toEqual(['gate__gate_posted', 'pans__chimney', 'region__s1_u_notice']);
    expect(leads().get('gate__gate_posted')).toEqual(['Reeve Annis Talfryn']);
    expect(leads().get('region__s1_u_notice')?.length).toBeGreaterThanOrEqual(2);
    // Asked, the reeve gives the sea-gate: its story begins, its aim is held, and its lead is let go.
    await act(s, 'talk_to(gate__reeve)');
    expect(await act(s, 'gate__reeve_gate')).toEqual(['The last sea-gate']);
    expect(titles()).toEqual(['The held drove', 'The held drove', 'The last sea-gate']);
    expect(leads().has('gate__gate_posted')).toBe(false);
    expect(ScreenModel.build(s.campaign).knowledge.map(k => k.text)).not.toContainEqual(expect.stringMatching(/seal/));
    // No story is called twice over ("The unquiet tower: The unquiet tower").
    expect(s.campaign.installations.filter(m => /^(.+): \1$/.test(m.name)).map(m => m.name)).toEqual([]);
    // The runner says it too.
    expect(new Runner(s).said().aims?.map(a => a.story ?? '-')).toEqual(titles());
  }, 180000);
  it('at the weir, an elf mage holds the sea-gate alone', async () => {
    const s = await DrawnWorld.start('iscoed', { origin: 'weir',
      party: [{ name: 'Aud', raceId: 'elf', classId: 'mage' }] }, NodeBundleSource.shared);
    await act(s, 'wait');
    expect(Undertakings.held(s.campaign).map(o => o.id)).toEqual(['gate__gate_aim']);
  }, 180000);
});
