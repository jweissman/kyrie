import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Glanced } from './support/glanced';
import { PlayerView } from '../src/presentation/player-view';
import type { PlaySession } from '../src/session/play-session';

// Quittance's QTC-10: a place come back to was told by its first sentence only, and what the company had done in it
// went unsaid: the chest it opened was told only under Look about. Come back to, what the company itself left changed
// is said with what has changed (test/fixtures/probes/come-back).
describe('a place come back to', () => {
  it('says what the company left changed in it', async () => {
    const j = await Journey.start('test/fixtures/probes/come-back/probe.campaign.json', 'q');
    const g = Glanced.of((j as unknown as { session: PlaySession }).session);
    const go = (re: RegExp) => g.perform(PlayerView.choices(g.campaign).find(x => re.test(x.choice.name))!.choice.id);
    await go(/^Lift/);
    await go(/stair$/);
    const back = await go(/strongroom$/);
    expect(back.arrival).toBe('return');
    expect(back.changed).toContain('The iron chest stands open, and empty.');
  }, 30000);
});
