import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';

// An aim that only grows (the brood's quarrel heard from Odile's side as well as Garth's) is told as the aim now, not
// as a new one (play 9).
class Told {
  static async notes(s: PlaySession, command: string) {
    const before = PlayerView.observe(s.campaign), event = await s.perform(command);
    const feedback = ActionFeedbackView.read(s.campaign, event, before);
    return Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), { event, feedback, said: command, moved: false })
      .exchange?.notes ?? [];
  }
}

describe('an aim taken up again', () => {
  const ridge = ['go(march__shop_door,march__shop_floor)', 'go(march__shop_door,march__quay)',
    'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)'];
  it('is the aim as it stands now', async () => {
    const s = await PlaySession.start('test/fixtures/march/silkholme.campaign.json', 'silk', NodeBundleSource.shared);
    for (const c of ridge) { await s.perform(c); }
    expect((await Told.notes(s, 'brood__complaint')).filter(n => /^Aim: Spiders from/.test(n))).toHaveLength(1);
    for (const c of ['go(sink__sink_path,sink__lip)', 'go(sink__terrace_steps,sink__frames)']) { await s.perform(c); }
    const notes = await Told.notes(s, 'brood__plea');
    expect(notes.some(n => /^Aim: /.test(n))).toBe(false);
    expect(notes.filter(n => /^Aim now: Spiders from .+ only needs feeding/.test(n))).toHaveLength(1);
  }, 60000);
});
