import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import { Runner } from '../src/cli/runner';

// Stories apart from the miscellaneous aims (the owner, 18 November, OR-74): on the drove road one notice read had made
// seven aims of one weight, the drove's own two among three town jobs, and nothing said which was the adventure. Each
// aim says the story it is part of, the stories' first, and what the notice begins is told as a story begun.
describe('stories apart from the other aims', () => {
  it('on the drove road, after the well-post notice', async () => {
    const s = await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
    const first = ScreenModel.build(s.campaign).aims ?? [];
    expect(first.map(a => a.story?.title)).toEqual(['The held drove', 'The held drove']);
    const before = PlayerView.observe(s.campaign);
    const event = await s.leg('region__s1_u_notice_read(party,region__s1_green)');
    const taken = ActionFeedbackView.read(s.campaign, event, before).taken ?? [];
    // Two stories begin by it, each once; the town's jobs are leads, not aims, until their giver is asked (HP-01).
    expect(taken.flatMap(t => t.begins ?? []).toSorted()).toEqual(['The cold pans', 'The last sea-gate']);
    expect(taken.filter(t => t.id.startsWith('region__'))).toEqual([]);
    const aims = ScreenModel.build(s.campaign).aims ?? [];
    const titles = aims.map(a => a.story?.title ?? '-');
    // The stories' aims only: four aims of three stories, where one notice had made seven of one weight.
    expect(titles).toEqual(expect.arrayContaining(['The held drove', 'The cold pans', 'The last sea-gate']));
    expect(titles.filter(t => t === '-')).toEqual([]);
    // No story is called twice over ("The unquiet tower: The unquiet tower").
    expect(s.campaign.installations.filter(m => /^(.+): \1$/.test(m.name)).map(m => m.name)).toEqual([]);
    // The runner says it too.
    expect(new Runner(s).said().aims?.map(a => a.story ?? '-')).toEqual(titles);
  }, 180000);
});
