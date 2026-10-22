import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { CombatTelling } from '../src/ui/combat-telling';
import { ChoiceList } from '../src/ui/choice-list';
import type { BattleState, CombatEvent, Fighter } from '../src/model';

// What a fight shows the company must be true of it: the chance shown on a blow is the chance the dice give; a
// creature with two actions a turn and nothing but its weapon strikes twice; and a blow's aftermath says what was
// shrugged off rather than "it".
class Bout {
  static warrior(seed: string): Fighter { return new Content(seed).character('warrior', 'w', 'fighters', 'human'); }
  static foe(species: string, level: number): Fighter { return new Content(`${species}-${level}`).creature(species, 'f', 'goblins', level); }
  static battle(fighters: Fighter[], seed: string) {
    return new Battle({ id: 'bout', combatants: fighters, abilities: Content.abilities }, seed);
  }
}

describe('the odds of a blow, and what a fight says', () => {
  it('shows the chance the dice give', () => {
    const a = Effects.combatant(Bout.warrior('odds')), d = Effects.combatant(Bout.foe('wolf', 1));
    let landed = 0;
    for (let r = 1; r <= 20; r++) { if (Fighting.attack(a, d, () => r).success) { landed++; } }
    expect(Fighting.chance(a, d)).toBeCloseTo(landed / 20, 5);
    expect(ChoiceList.odds(0.25)).toBe('1 in 4');
    expect(ChoiceList.odds(2 / 3)).toBe('2 in 3');
    expect(ChoiceList.odds(0.98)).toBe('almost always');
  });
  it('lets a creature with two actions a turn and only its weapon strike twice', () => {
    const slump = { ...Bout.foe('slump', 4), id: 'slump', abilities: [] };
    const battle = Bout.battle([slump, { ...Bout.warrior('w'), hp: 200, maxHp: 200 }], 'twice');
    for (let i = 0; i < 20 && battle.state.actor !== 'slump'; i++) { battle.step(battle.chosen()); }
    const blows = [battle.step(battle.chosen()), battle.state.actor === 'slump' ? battle.step(battle.chosen()) : []]
      .flat().filter(e => e.type === 'attack' && e.actor === 'slump');
    expect(blows.length).toBe(2);
  });
  it('says what a save held against', () => {
    const state = { combatants: [{ id: 'w', name: 'Bran' }, { id: 'f', name: 'the Wet' }] } as unknown as BattleState;
    const events: CombatEvent[] = [
      { type: 'action', turn: 1, command: { actor: 'w', ability: 'melee', target: 'f' } },
      { type: 'attack', turn: 1, actor: 'w', target: 'f', die: 15, need: 8, toHit: 2, armorClass: 6, weapon: 'battleaxe',
        success: true, critical: false },
      { type: 'damage', turn: 1, actor: 'w', target: 'f', rolled: 5, amount: 5, hp: 20 },
      { type: 'save', turn: 1, actor: 'w', target: 'f', rolled: 18, difficulty: 15, success: true, against: 'shred' },
    ];
    expect(CombatTelling.exchanges(events, state)[0]!.text).toContain('shrugs off the armor shred');
  });
});
