import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { PressOn } from '../../src/press-on';
import type { Fighter } from '../../src/model';

// Pressing on stops where a choice is the player's again, by one rule every client reads (OR-830; the cold play of
// 25 November, D2: deaths under "Press on to the end" with no pause). A mage at full strength against a bear:
// above a third of her strength, so that the old rule fought on, and the bear's blow can kill her with one blow.
const fight = (hp?: (f: Fighter) => number, foe = 'bear', klass: 'mage' | 'warrior' = 'mage') => {
  const wizard = new Content('w').character(klass, 'w', 'fighters', 'human');
  if (hp) { wizard.hp = hp(wizard); }
  const beast = new Content('o').creature(foe, 'o', 'goblins', 1);
  const battle = new Battle({ id: 'bout', combatants: [wizard, beast], abilities: Content.abilities }, 'press-on');
  while (battle.state.actor !== 'w' && !battle.state.outcome) { battle.step(battle.chosen()); }
  return battle;
};

describe('pressing on', () => {
  it('stops before a blow declared that could fell one of the company, though they stand above a third', () => {
    const battle = fight(), wizard = battle.state.combatants.find(f => f.id === 'w')!;
    expect(wizard.hp).toBeGreaterThan(wizard.maxHp / 3);
    expect(PressOn.threat(battle).get('w')?.harm).toBeGreaterThanOrEqual(wizard.hp);
    expect(PressOn.from(battle.view).halt(battle)).toMatch(/could fall to .+'s next blow\.$/);
  });
  it('says it once in a fight: pressed on again, it goes on', () => {
    const battle = fight(), rule = PressOn.from(battle.view);
    expect(rule.halt(battle)).toBeDefined();
    expect(rule.halt(battle)).toBeUndefined();
  });
  it('names the company as the client calls them', () => {
    const battle = fight();
    expect(PressOn.from(battle.view).halt(battle, new Map([['w', 'Iselde'], ['o', 'the bear']])))
      .toBe("Iselde could fall to the bear's next blow.");
  });
  it('does not stop where nothing declared could fell anyone', () => {
    const battle = fight(undefined, 'rat', 'warrior');
    const most = PressOn.threat(battle).get('w')?.harm ?? 0, wizard = battle.state.combatants.find(f => f.id === 'w')!;
    expect(most).toBeLessThan(wizard.hp);
    expect(PressOn.from(battle.view).halt(battle)).toBeUndefined();
  });
  it('does not say what stood so when pressing on was asked for', () => {
    const battle = fight(f => Math.max(1, Math.floor(f.maxHp / 3)), 'rat', 'warrior');
    const rule = PressOn.from(battle.view);
    const left = [rule.halt(battle), rule.halt(battle)];
    expect(left.every(l => !/badly hurt/.test(l ?? ''))).toBe(true);
  });
});
