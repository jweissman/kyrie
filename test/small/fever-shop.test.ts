import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Where what the aim waits on someone keeping is sold in the town, the shop is the aim's way, and buying it its step,
// once nobody of the company carries any (M21's playability list, PL-28): at Newmeet the fevered child's mother, asked,
// said the herb-wife had nothing left, and nothing was gold, with herbs on Falkor's shelves a door off the
// market-place. The fever in miniature (data/goings-on/fever): a mother on the green, a herb-shop off it.
const fever = `
  Place hythe "Hythe" is settlement.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place shop "the herb-shop" is room within hythe at 1, 0 indoors.
  Passage shop_door "the herb-shop door" is door between green and shop.
  Company party "You" of 1 at green.
  Initially Set quantity(party, gold) to 10.
  Relation dosed(group).
  Person mother "Ebba" at green { Role "the child's mother". Peaceable. Pronouns she. Wants herbs. }
  Topic child with mother "Ask Ebba about the child" when not dosed(mother) once { Says "'Three days,' says Ebba.". }
  Person herbalist "Falkor" at shop { Role "a herbalist". Peaceable. Pronouns he. Sells herbs for 1 coin from 2. }
  Rule dosed_by when keeps(mother, ?i) and not dosed(mother) { Assert dosed(mother). }
  Objective fever when not dosed(mother) "A child on {green} has a fever; it needs herbs.".
  Goal false.`;

describe('the fever\'s gold, with herbs sold in the town', () => {
  it('goes to the shop, buys the herbs, and brings them to the mother', async () => {
    const t = await Tiny.start(fever);
    t.follow('fever');
    expect(t.gold.map(a => a.label)).toContain('To the herb-shop');
    await t.play('To the herb-shop');
    const buys = () => t.gold.flatMap(a => [a.command ?? '', a.for ?? '']).filter(c => /^buy_item\(/.test(c));
    expect(buys().length).toBeGreaterThan(0);
    await t.perform(buys()[0]!);
    // Carried, it is not bought again: the way back to the mother is the step.
    expect(buys()).toEqual([]);
    expect(t.gold.map(a => a.label)).toContain('To the green at Hythe');
  });
});
