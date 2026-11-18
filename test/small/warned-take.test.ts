import { describe, expect, it } from 'bun:test';
import { Offers } from '../../src/presentation/offer';
import { ScreenModel } from '../../src/ui/screen-model';
import { Tiny } from '../support/tiny';

// Whatever spends the last of a warning's patience is marked so, a moment's take among it (cold play 3, CL-12: with a
// minute left, "Collect a moonstone" stood unmarked among the vault's four, and taking it brought the keeper on and
// killed the company). The offer's own rows, made from the player's choices, are warned as the page marks them.
const vault = `
  Place vault "the vault" is room at 0, 0.
  Company party "You" of 1 at vault.
  Item stone "a moonstone the size of a thumb" is moonstone at vault.
  Goal false.`;
describe('a warning about to be spent', () => {
  it('marks a take, which spends its minute, and nothing with time to spare', async () => {
    const t = await Tiny.start(vault), c = t.session.campaign, screen = ScreenModel.build(c);
    const take = (left: number) => {
      const o = Offers.scene([], [], [], { campaign: c,
        screen: { ...screen, warned: { by: 'the keeper of the vault', left, id: 't__keeper' } } });
      return [...o.primary, ...o.rest].find(x => /take_item\(t__stone/.test(x.command ?? x.choice));
    };
    expect(take(1)?.marks.map(m => m.kind)).toContain('warned');
    expect(take(30)?.marks.map(m => m.kind) ?? []).not.toContain('warned');
  });
});
