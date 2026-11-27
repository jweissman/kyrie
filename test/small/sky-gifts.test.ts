import { HandbookCreationReferences } from '../../src/client/creation-references';
import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import sky from '../../data/imbar/sky.json';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { Effects } from '../../src/effects';
import { CompanyChapters } from '../../src/handbook/phb-company';
import { CombatProjection } from '../../src/combat-projection';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import { CharacterSheets } from '../../src/presentation/character-sheet';
import { BookWording } from '../../src/presentation/book-wording';
import { CreatureStore } from '../../src/creature-store';
import type { Setting } from '../../src/creation/protocol';

// The sky one is born under gives something, chosen with it (the owner, 18 November, OR-89: "there should probably be
// perk selection happening when you select a star-sign and some output/descriptor from the encyclopedia about the
// sign"): each sign two gifts, traits whose rules the game plays; the sign's entry beside it as it is considered; and
// (OR-117: "Don't make people choose between the perk options for the birth sign. Just give them both things") no
// gift asked, a creature made under the sign holding both.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };

describe('the gifts of the sky', () => {
  it('are two to a sign, each a sign trait whose rule is played and said', () => {
    for (const s of sky.signs) {
      expect([s.id, s.gifts.length]).toEqual([s.id, 2]);
      for (const g of s.gifts) {
        expect([g, Canon.traits[g]?.category]).toEqual([g, 'sign']);
        expect(CompanyChapters.gift(g, BookWording)).not.toMatch(/no effect|: $/);
      }
    }
    expect(new Set(sky.signs.flatMap(s => s.gifts)).size).toBe(24);
  });

  it('set the sign\'s entry beside it, saying both gifts, and ask no gift: the sign chosen, the calling is next', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    flow.choose('you', 'human'); flow.choose('presenting', 'he');
    const bear = flow.steps().find(x => x.id === 'sign')!.cards.find(c => c.id === 'sign_bear')!;
    expect(bear.entry!.facts).toEqual([['Month', 'Thaw'], ['Gifts', 'Unturned and Hard to fell']]);
    expect(bear.entry!.rules[0]).toBe('Unturned: +2 against fear, +1 against charms. Skilled in brawn.');
    flow.choose('sign', 'sign_bear');
    expect([flow.current(), flow.steps().map(x => x.id)]).toEqual(['calling', ['you', 'presenting', 'sign', 'calling',
      'before', 'perk', 'name']]);
    expect(Object.hasOwn(flow.member, 'gift')).toBe(false);
  });

  it('are both held by the one made under the sign, and the sheet says both', () => {
    const made = new Content('sky-gifts').createCreature(ItemCatalog.canon, 'pc', { raceId: 'human', classId: 'warrior', sign: 'sign_hart' });
    expect(made.traits).toEqual(expect.arrayContaining(['star_quick', 'star_wary']));
    expect(Effects.modifiers(CombatProjection.fighter(ItemCatalog.canon, made, 'fighters')).initiative).toBe(2);
    expect(CharacterSheets.sheet(ItemCatalog.canon, made).born).toEqual({ sign: 'The Hart', gifts: ['Quick: +2 initiative.',
      'Wary: +2 against what can be dodged. Skilled in woodcraft.'] });
  });

  it('are each named once on the sheet, a gift whose perk bears its name too (OR-258, "Lamplit eye: Lamplit eye:")', () => {
    for (const s of sky.signs) {
      const made = new Content(`sky-gifts-${s.id}`).createCreature(ItemCatalog.canon, 'pc', { raceId: 'human', classId: 'warrior', sign: s.id });
      for (const line of CharacterSheets.sheet(ItemCatalog.canon,
        made).born!.gifts) { expect(line).not.toMatch(/^([^:]+): \1:/); }
    }
    const lantern = new Content('sky-gifts-lantern').createCreature(ItemCatalog.canon, 'pc', { raceId: 'human', classId: 'warrior',
      sign: sky.signs.find(s => s.gifts.includes('star_lamplit'))!.id });
    expect(CharacterSheets.sheet(ItemCatalog.canon, lantern).born!.gifts).toContain(
      'Lamplit eye: +2 to searching, their torches, candles and lanterns burn an hour longer.');
  });

  it('are all held by one kept from when a gift was chosen, on coming back', () => {
    const made = new Content('sky-gifts-kept').createCreature(ItemCatalog.canon, 'pc', { raceId: 'human', classId: 'warrior', sign: 'sign_fox' });
    made.traits = made.traits!.filter(t => t !== 'star_sly');
    const back = new CreatureStore(ItemCatalog.canon, [made]).get('pc');
    expect(back.traits).toEqual(expect.arrayContaining(['star_hard_to_pin', 'star_sly']));
  });
});
