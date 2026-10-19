import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { parseAbility } from '../src/lang/parse';
import { Battle } from '../src/battle';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { FantasyRules } from '../src/fantasy-rules';

class Compatibility {
  static damage(type: string) {
    const content = new Content('resistance');
    const actor = content.character('fighter', 'hero', 'fighters');
    const target = content.character('barrow_warden', 'warden', 'goblins', 'revenant');
    target.hp = target.maxHp = 100;
    target.statuses = [{ id: 'warded', remaining: 3 }];
    const context: EffectContext = { actor, fighters: [actor, target], turn: 1, events: [], content,
      abilities: [], retreat: false, location: null };
    const effect = parseAbility('probe', 'Probe', `Deal 10 ${type} damage to enemy.`).effects[0]!;
    Effects.validate(effect, []); Effects.apply(effect, target, 10, context);
    return { target, context };
  }
}

describe('representative Orsino semantic compatibility', () => {
  it('uses signed fractional resistance before flat mitigation, with explicit observable provenance', () => {
    for (const [type, expected, resistance] of [['physical', 3, 0.5], ['fire', 13, -0.5],
      ['radiant', 18, -1], ['poison', 8, 0]] as const) {
      const { target, context } = Compatibility.damage(type);
      expect(target.hp).toBe(100 - expected);
      const event = context.events[0]!;
      expect(event).toMatchObject({ type: 'damage', rolled: 10, amount: expected,
        modifiers: { armor: 2, resistance, power: 0, guarding: false } });
      expect(CombatPresenter.format(event, { combatants: context.fighters, turn: 1, actor: 'hero', outcome: null }))
        .toContain(`resistance ${resistance * 100}%`);
    }
  });
  it('retains Kyr’s pinned statMod convention and explicit attribute saves despite upstream rule drift', () => {
    const expressions = new Expressions('convention');
    for (const [score, modifier] of [[3, -2], [7, -1], [10, 0], [13, 1], [18, 3]] as const) {
      expect(FantasyRules.statMod(score)).toBe(modifier);
      expect(expressions.number(`10 + statMod(${score})`)).toBe(10 + modifier);
    }
    const c = new Content('saving');
    const actor = c.character('barrow_warden', 'warden', 'goblins', 'revenant');
    const target = c.character('fighter', 'hero', 'fighters');
    actor.speed = 100; actor.abilities = ['sleep'];
    const battle = new Battle({ id: 'save', abilities: Content.abilities, combatants: [actor, target] }, 'saving');
    const events = battle.step(battle.legalCommands()[0]!);
    const save = events.find(e => e.type === 'save');
    expect(save?.type).toBe('save');
    if (save?.type === 'save') {
      expect(save.stat).toBe('wisdom');
      expect(save.rolled).toBe(save.die! + save.modifier!);
      expect(save.success).toBe(save.rolled >= save.difficulty);
    }
  });
  it('grants authored spell choices through the same compositional creature context and rejects unknown grants', () => {
    const content = new Content('spell-choice');
    const creature = content.createCreature('cleric', { classId: 'cleric', raceId: 'dwarf',
      abilities: ['attack', 'heal', 'dawn_spark'] });
    expect(creature.base.abilities).toEqual(['attack', 'heal', 'dawn_spark']);
    expect(() => content.createCreature('invalid', { abilities: ['undefined_spell'] })).toThrow('references');
  });
});
