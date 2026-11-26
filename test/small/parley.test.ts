import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { Tactics } from '../../src/tactics';
import { CombatTelling } from '../../src/ui/combat-telling';
import { CombatModel } from '../../src/ui/combat-model';
import { ChoiceList } from '../../src/ui/choice-list';
import type { Fighter } from '../../src/model';

// Words in a fight (Parley): once a fight has turned against a band that can understand it, the company may call on it
// to throw down its arms, an intimidation check whose odds the hand says; made, the band yields and the fight is won
// (routed, as a bout's loser is); refused, the turn is spent. Never against beasts, nor while they stand whole.
const fight = (foes: Fighter[], seed = 'parley') => {
  const hero = new Content('w').character('warrior', 'w', 'fighters', 'human');
  const battle = new Battle({ id: 'bout', combatants: [hero, ...foes], abilities: Content.abilities }, seed);
  while (battle.state.actor !== 'w' && !battle.state.outcome) { battle.step(battle.chosen()); }
  return battle;
};
const bandit = (id: string, hp?: number) => {
  const f = new Content(id).character('commoner', id, 'goblins', 'human');
  if (hp !== undefined) { f.hp = hp; }
  return f;
};
const demands = (b: Battle) => b.legalCommands().filter(c => c.ability === 'demand');

describe('a call to yield', () => {
  it('is offered once one of a thinking band is down, with its odds and what it does', () => {
    const battle = fight([bandit('b1', 0), bandit('b2')]);
    expect(demands(battle).length).toBe(1);
    const words = ChoiceList.combat(CombatModel.build(battle)).find(s => s.id === 'words')?.choices[0];
    expect(words?.label).toBe('Call on them to yield');
    expect(words?.note).toMatch(/ · ends the fight if they yield$/);
  });
  it('is not offered while they stand whole, nor to beasts', () => {
    expect(demands(fight([bandit('b1'), bandit('b2')]))).toEqual([]);
    const rats = [new Content('r1').creature('rat', 'r1', 'goblins', 1), new Content('r2').creature('rat', 'r2', 'goblins', 1)];
    rats[0]!.hp = 0;
    expect(demands(fight(rats))).toEqual([]);
  });
  it('is never the tactics\' choice', () => {
    const battle = fight([bandit('b1', 0), bandit('b2')]);
    expect(Tactics.choose(battle.state, battle.legalCommands()).ability).not.toBe('demand');
  });
  it('made, ends the fight won with their yielding; refused, spends the turn; and is told', () => {
    const outcomes = new Set<string>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const battle = fight([bandit('b1', 0), bandit('b2', 1)], seed), from = battle.events.length;
      battle.step(demands(battle)[0]!);
      const after = battle.events.slice(from), check = after.find(e => e.type === 'check');
      expect(check).toMatchObject({ skill: 'intimidation' });
      const end = after.find(e => e.type === 'end');
      if (check?.type === 'check' && check.success) { expect(end).toMatchObject({ outcome: 'fighters', reason: 'yielded' }); }
      else { expect(end).toBeUndefined(); }
      outcomes.add(String(check?.type === 'check' && check.success));
      const told = CombatTelling.since(battle.events, from, battle.state).map(t => t.text).join(' ');
      expect(told).toMatch(/calls on them to throw down their arms\. They (waver, and throw down|are not ready)/);
    }
    expect(outcomes.has('true')).toBe(true);
  });
});
