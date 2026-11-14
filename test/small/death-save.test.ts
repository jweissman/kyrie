import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { Effects } from '../../src/effects';
import { Expressions } from '../../src/expressions';
import { CombatPresenter } from '../../src/ui/combat-presenter';
import type { CombatEvent, Fighter } from '../../src/model';

// A foe brought to nothing is dead, as the telling says it falls (CO-05: "5 was all it had left", then "The cold below
// returns with 1 HP", fighting on); the company keeps Orsino's save against death, and a foe of a kind that rises again
// (Rises Again) saves as it does and is told as rising. Each of the twentieth level, which makes that save at DC 25 on
// any but the worst throws.
const c = new Content('death-save');
const felled = (f: Fighter) => {
  const events: CombatEvent[] = [];
  Effects.damage(f, { amount: f.hp, type: 'slashing' }, { fighters: [f], turn: 1, events, content: c, abilities: [],
    source: { id: 'blade', kind: 'ability' },
    retreat: false, location: null, expressions: new Expressions('death-save') });
  return { hp: f.hp, events };
};
const at = (team: Fighter['team'], traits: string[] = []): Fighter =>
  ({ ...c.creature('ghoul', `g-${team}-${traits.join()}`, team, 20), traits });
describe('a creature brought to nothing', () => {
  it('is dead, a foe of an ordinary kind', () => {
    const { hp, events } = felled(at('goblins'));
    expect(hp).toBe(0);
    expect(events.some(e => e.type === 'revive' || (e.type === 'save' && e.kind === 'death'))).toBe(false);
  });
  it('saves against death, one of the company', () => {
    const { hp, events } = felled(at('fighters'));
    expect(hp).toBe(1);
    expect(events.find(e => e.type === 'revive')).toMatchObject({ detail: 'saved against death' });
  });
  it('rises again, a foe of a kind that does, and is told so', () => {
    const { hp, events } = felled(at('goblins', ['rises_again']));
    expect(hp).toBe(1);
    const rose = events.find(e => e.type === 'revive')!;
    expect(rose).toMatchObject({ detail: 'rises again' });
    expect(CombatPresenter.format(rose, { combatants: [{ id: rose.actor, name: 'The troll' }] } as never))
      .toBe('The troll rises again.');
  });
});
