import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';

// What one who came alone did is echoed without saying it was for them (CO-10, the cold playtest's "You collect a
// garnet for Hild", Hild being the one collecting it); a company of two still says for whom.
const vault = (n: number) => `
  Place vault "the vault" is room at 0, 0 indoors.
  Company party "You" of ${n} at vault.
  Item garnet "a jewelled box" is jeweled_box at vault.`;
class Took {
  static async garnet(t: Tiny): Promise<string> {
    const c = t.campaign, before = PlayerView.observe(c);
    const take = t.journey.choices().find(x => /^take_item\(.*garnet/.test(x.command))!.command;
    return ActionFeedbackView.read(c, await t.session.leg(take), before).attempt;
  }
}
describe('a thing taken by one alone', () => {
  it('is echoed as taken, not as taken for them', async () => {
    const t = await Tiny.start(vault(1), { horizon: ['belongings'], party: [{ name: 'Hild', raceId: 'human', classId: 'warrior' }] });
    expect(await Took.garnet(t)).toBe('Collect a jewelled box');
    const two = await Tiny.start(vault(2), { horizon: ['belongings'], party: [{ name: 'Hild', raceId: 'human', classId: 'warrior' },
      { name: 'Baern', raceId: 'dwarf', classId: 'cleric' }] });
    expect(await Took.garnet(two)).toMatch(/^Collect a jewelled box for (Hild|Baern)$/);
  });
});
