import { describe, expect, it } from 'bun:test';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Tiny } from './support/tiny';

// Who someone is now: a role said while something holds, instead of who they are otherwise (What Tessary Owes'
// cold playtest, W20: "a corporal in a new coat" after he had thrown it in the canal, a goose "in a crate" after she
// was let out).
describe('a role that holds while something does', () => {
  it('is who they are while it holds', async () => {
    const kyr = await Bun.file('test/fixtures/probes/role-when/site.kyr').text();
    const s = (await Tiny.start(kyr, { seed: 'role', horizon: ['probing'] })).session;
    const dunn = () => ScreenModel.build(s.campaign).people.find(p => p.id === 'rolewhen__dunn')!.name;
    expect(dunn()).toBe('Corporal Dunn, a corporal in a new coat');
    await s.leg(PlayerView.choices(s.campaign).find(c => /^Throw the coat/.test(c.choice.name))!.choice.id);
    expect(dunn()).toBe('Corporal Dunn, a corporal in his shirtsleeves, dripping');
  }, 60000);
});
