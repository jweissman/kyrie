import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { CreationRules } from '../web/reader/creation-rules';
import { Fighting } from '../src/rules/fighting';
import { Checks } from '../src/rules/checks';
import type { Creature } from '../src/creature';
import type { Member } from '../web/engine/protocol';

// Creation says what a choice does by the rules (the owner's interim report: "+2 in a fight" explained nothing, and a
// warrior was offered a longsword or a battleaxe): the numbers it says are the ones the fight and the checks use; a
// calling is offered every ordinary weapon it is trained to, and no treasure; and the weapon it suggests is the one its
// scores strike best with.
describe('creation, by the rules', () => {
  const catalog = Creation.catalog();
  const member = (classId: string, rolled: Record<string, number>, backgroundId?: string) =>
    ({ raceId: 'human', classId, rolled, ...backgroundId ? { backgroundId } : {} }) as unknown as Member;
  it('says what a score adds as the fight and the checks add it', () => {
    for (let score = 1; score <= 30; score++) {
      const c = { base: { intelligence: score, level: 1 }, traits: [],
        state: { hp: 0, conditions: [], inventory: [] } } as unknown as Creature;
      expect([CreationRules.fight(score), CreationRules.check(score)])
        .toEqual([Fighting.statMod(score), Checks.bonus(c, 'lore').modifier]);
    }
    expect(CreationRules.quality('strength', 13)).toEqual(['A blow with a weapon in the hand: +2 to hit, +2 to the harm it'
      + ' does.', 'Climbing, and lifting or forcing what is stuck: +1 to the roll. Against paralysis: +3 and the die.']);
    // The sheet says its saves on their own, with what is worn counted, and its qualities without them.
    expect(CreationRules.quality('wisdom', 10, undefined, false)).toEqual(['Searching a place: +0. Reading people and'
      + ' country, tending wounds, the rites, and the way across country: +0 to the roll.']);
    expect(CreationRules.quality('dexterity', 8, undefined, false)).toEqual(['Easier to hit: blows at you need 1 less to'
      + ' land.', 'A shot with a bow, a sling or a dart: −1 to hit, +0 to the harm it does.',
    'Going unseen, locks and traps: −1 to the roll.']);
  });
  it('offers a calling every ordinary weapon it is trained to, and no treasure', () => {
    const arms = (calling: string) => catalog.callings.find(c => c.id === calling)!.weapons.map(w => w.id);
    expect(arms('warrior').length).toBeGreaterThan(40);
    expect(arms('warrior')).toEqual(expect.arrayContaining(['longsword', 'battleaxe', 'halberd', 'longbow', 'spear']));
    for (const treasure of ['wardens_blade', 'longsword_of_flames', 'ironglass_dagger']) {
      expect(arms('warrior')).not.toContain(treasure);
    }
    // A calling's own weapon is offered though its training would not reach it (a mage's staff is no light weapon).
    expect(arms('mage')).toEqual(expect.arrayContaining(['staff', 'dagger']));
    expect(catalog.callings.find(c => c.id === 'ranger')!.braces).toBe(true);
  });
  it('suggests the weapon struck best with, and counts what a trade adds to the qualities', () => {
    const ranger = catalog.callings.find(c => c.id === 'ranger')!.weapons;
    expect(CreationRules.best(ranger, member('ranger', { strength: 8, dexterity: 17 }), catalog)?.missile).toBe(true);
    expect(CreationRules.best(ranger, member('ranger', { strength: 17, dexterity: 8 }), catalog)?.missile).toBe(false);
    const forester = catalog.backgrounds.find(b => b.id === 'forester')!;
    expect(forester.qualities).toEqual({ wisdom: 2, dexterity: 1 });
    expect(CreationRules.score(member('ranger', { wisdom: 10 }, 'forester'), catalog, 'wisdom')).toBe(10 + 1 + 2 + 2);
  });
});
