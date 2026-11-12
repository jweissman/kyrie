import { describe, expect, it } from 'bun:test';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { Content } from '../src/content';
import type { CombatEvent } from '../src/model';

// What is learned is said by its name, never its id ("Krex learns true_sight": round 11, T).
describe('a thing learned', () => {
  it('is said by its name', () => {
    const ability = Content.abilities.find(a => a.id.includes('_'))!;
    const state = { combatants: [{ id: 'k', name: 'Krex', side: 'fighters', hp: 5, maxHp: 9 }], turn: 0, actor: '',
      outcome: null } as unknown as Parameters<typeof CombatPresenter.format>[1];
    const said = CombatPresenter.format({ type: 'learn', turn: 0, actor: 'k', target: 'k', detail: ability.id } as CombatEvent,
      state);
    expect(said).toContain(ability.name);
    expect(said).not.toContain(ability.id);
  });
});
