import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { ActionFeedback } from '../src/presentation/action-feedback';

// How a fight ended is told after the blows that ended it, not before them (What Tessary Owes' cold playtest, W23:
// "Your company is defeated" read before "Bettany Slake hits Ivo").
describe('a fight told', () => {
  it('ends with how it ended', async () => {
    const s = await PlaySession.start('test/fixtures/household/household.campaign.json', 'h', NodeBundleSource.shared);
    const event = { action: 'wait', result: 'success', changes: [], elapsed: 0,
      combat: [{ type: 'end', outcome: 'goblins' }] } as unknown as CampaignEvent;
    const feedback: ActionFeedback = { attempt: 'Fight', result: 'The fight is lost.', ended: true, resources: [],
      time: '', immediate: ['Bettany Slake hits Ivo.', 'Ivo takes 6 bludgeoning damage (0 HP left).', 'Ivo falls.'],
      discoveries: [], rolls: [], observations: [], available: [], unavailable: [], events: [] };
    const lines = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), { event, feedback, moved: false })
      .exchange!.lines.map(l => l.text);
    expect(lines).toEqual(['Bettany Slake hits Ivo.', 'Ivo takes 6 bludgeoning damage (0 HP left).', 'Ivo falls.',
      'The fight is lost.']);
  }, 60000);
});
