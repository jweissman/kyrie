import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// Who someone is now: a role said while something holds, instead of who they are otherwise (What Tessary Owes'
// cold playtest, W20: "a corporal in a new coat" after he had thrown it in the canal, a goose "in a crate" after she
// was let out).
describe('a role that holds while something does', () => {
  it('is who they are while it holds', async () => {
    const s = await PlaySession.start('test/fixtures/probes/role-when/probe.campaign.json', 'role', NodeBundleSource.shared);
    const dunn = () => ScreenModel.build(s.campaign).people.find(p => p.id === 'p__dunn')!.name;
    expect(dunn()).toBe('Corporal Dunn, a corporal in a new coat');
    await s.perform(PlayerView.choices(s.campaign).find(c => /^Throw the coat/.test(c.choice.name))!.choice.id);
    expect(dunn()).toBe('Corporal Dunn, a corporal in his shirtsleeves, dripping');
  }, 60000);
});
