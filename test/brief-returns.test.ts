import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ModuleWriter } from '../src/lang/module-writer';

// A place is told in full the first time the company comes to it; come back to, it is recalled by its first sentence,
// and what is new in it is told under it (What Tessary Owes' W2, Low Water's 10: every return told as if for the first
// time). The household: the lane, the yard, and the lane again.
class Home {
  static async go(s: PlaySession, to: string) {
    const c = PlayerView.choices(s.campaign).find(x => x.choice.id.startsWith('go(') && x.choice.id.endsWith(`${to})`))!;
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const feedback = ActionFeedbackView.read(s.campaign, event, before);
    return Narrator.leaf(s.campaign, ScreenModel.build(s.campaign),
      { event, feedback, said: c.choice.name, moved: true });
  }
}
describe('a place come back to', () => {
  it('is recalled by its first sentence, with what is new in it told under it', async () => {
    const s = await PlaySession.start('test/fixtures/household/household.campaign.json', 'h', NodeBundleSource.shared);
    const lane = 'The lane comes down between thorn hedges to the yard gate. Smoke from the kitchen chimney, and nobody about.';
    expect(Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).situation.join(' ')).toBe(lane);
    expect((await Home.go(s, 'h__yard')).situation.join(' ')).toBe('The yard, swept. The cart-shed stands empty.');
    // The opening is told before anything is done, and kept nowhere: the first return to it is told in full.
    expect((await Home.go(s, 'h__lane')).situation.join(' ')).toBe(lane);
    expect((await Home.go(s, 'h__yard')).situation).toEqual(['The yard, swept.']);
    expect((await Home.go(s, 'h__lane')).situation).toEqual(['The lane comes down between thorn hedges to the yard gate.']);
    // Wat along, and his coat on the cart-shed door: the yard recalled, and what is new in it told under it.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('travelsWith', 'h__brother', s.campaign.playerActor!) }]));
    const yard = await Home.go(s, 'h__yard');
    expect(yard.situation).toEqual(['The yard, swept.']);
    expect(yard.changed).toEqual(['Wat’s old coat hangs on the cart-shed door, where he left it for Father.']);
  }, 60000);
});
