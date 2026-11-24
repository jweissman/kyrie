import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { ScreenModel } from '../../../src/ui/screen-model';
import { HonestPlayer } from '../../support/honest-player';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Choice and consequence › A job followed through its
// payoff and on (OR-179, undertaking continuity): a player who follows only the page's gold is led through the
// drove's inquiry to Bran let out, and on: the sale he said he would make next, followed as the story's next part, its
// four coin paid, and the road west he offers after it, followed and asked. With Bran let out no aim had been held,
// and the gold-follower walked off to the taproom; the sale, its coin and the road west were never come to. And the
// census's undertaking invariant holds all the way: an aim followed, once done, gives way to one followed where any is
// still held.
describe('Choice and consequence › A job followed through its payoff and on', () => {
  it('is led from the proof to the sale, paid, and on to the road west, by the gold alone', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const s = journey.session, c = s.campaign, p = new HonestPlayer(s);
    const followed: string[] = [], breaches: string[] = [];
    const aims = () => ScreenModel.build(c).aims ?? [];
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const asked = () => c.world.test(ModuleWriter.call('drove__westAsked', 'party'));
    let before = aims(), paid = 0, told = '';
    for (let i = 0; i < 20 && !asked(); i++) {
      const purse = coin();
      if (!await p.step()) { break; }
      if (coin() > purse) { paid += coin() - purse; told = c.history.at(-1)?.response ?? ''; }
      const after = aims(), was = before.find(a => a.followed)?.id, now = after.find(a => a.followed)?.id;
      if (now && followed.at(-1) !== now) { followed.push(now); }
      if (was && !after.some(a => a.id === was) && after.length && !now) { breaches.push(`${was} done, none on`); }
      before = after;
    }
    expect(followed).toEqual(['drove__held_aim', 'drove__held_rhyne', 'drove__held_proof', 'drove__sales_aim',
      'drove__west_aim']);
    expect(paid).toBe(4);
    expect(told).toContain('For the four you found');
    expect(asked()).toBe(true);
    expect(breaches).toEqual([]);
  }, 300000);
});
