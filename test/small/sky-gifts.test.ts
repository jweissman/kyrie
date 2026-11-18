import { describe, expect, it } from 'bun:test';
import sky from '../../data/imbar/sky.json';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { Effects } from '../../src/effects';
import { CompanyChapters } from '../../src/handbook/phb-company';
import { CombatProjection } from '../../src/combat-projection';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';

// The sky one is born under gives something, chosen with it (the owner, 18 November, OR-89: "there should probably be
// perk selection happening when you select a star-sign and some output/descriptor from the encyclopedia about the
// sign"): each sign two gifts, traits whose rules the game plays; the sign's entry beside it as it is considered; the
// gift asked of the sign chosen; and a creature made so holds it.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };

describe('the gifts of the sky', () => {
  it('are two to a sign, each a sign trait whose rule is played and said', () => {
    for (const s of sky.signs) {
      expect([s.id, s.gifts.length]).toEqual([s.id, 2]);
      for (const g of s.gifts) {
        expect([g, Canon.traits[g]?.category]).toEqual([g, 'sign']);
        expect(CompanyChapters.gift(g)).not.toMatch(/no effect|: $/);
      }
    }
    expect(new Set(sky.signs.flatMap(s => s.gifts)).size).toBe(24);
  });

  it('set the sign\'s entry beside it, and ask the gift of the sign chosen', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    flow.choose('you', 'human');
    const bear = flow.steps().find(x => x.id === 'sign')!.cards.find(c => c.id === 'sign_bear')!;
    expect(bear.entry!.facts).toEqual([['Month', 'Thaw'], ['Gifts', 'Unturned or Hard to fell']]);
    expect(bear.entry!.rules[0]).toBe('Unturned: +2 against fear, +1 against charms.');
    flow.choose('sign', 'sign_bear');
    const gift = flow.steps().find(x => x.id === 'gift')!;
    expect([flow.current(), gift.ask, gift.cards.map(c => c.id), flow.member.gift]).toEqual(['gift',
      'What did the Waking Bear give you?', ['star_unturned', 'star_hard_to_fell'], 'star_unturned']);
    flow.choose('gift', 'star_hard_to_fell');
    expect([flow.member.gift, flow.current()]).toEqual(['star_hard_to_fell', 'calling']);
    // Another sign, its own first gift.
    flow.choose('sign', 'sign_fox');
    expect(flow.member.gift).toBe('star_hard_to_pin');
  });

  it('is held by the one made with it, and one of another sign is refused', () => {
    const content = new Content('sky-gifts');
    const made = content.createCreature('pc', { raceId: 'human', classId: 'warrior', sign: 'sign_hart',
      gift: 'star_quick' });
    expect(made.traits).toContain('star_quick');
    expect(Effects.modifiers(CombatProjection.fighter(made, 'fighters')).initiative).toBe(2);
    expect(() => content.createCreature('pc2', { raceId: 'human', classId: 'warrior', sign: 'sign_hart',
      gift: 'star_fierce' })).toThrow(/not a gift of sign_hart/);
  });
});
