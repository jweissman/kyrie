import { describe, expect, it } from 'bun:test';
import { CombatPresenter } from '../../src/ui/combat-presenter';
import type { CombatEvent } from '../../src/model';

// What a company member gains is said as the thing it is (S3-0's mage run, step 48, GR-10: "Ilse gains 1 Lantern"
// beside Gek's "a lantern" in the same turn): one of a kind the catalogue names is a thing taken; a count is a count.
const state = { combatants: [{ id: 'ilse', name: 'Ilse' }] } as never;
const gain = (detail: string, amount: number) => ({ type: 'gain', actor: 'ilse', target: 'ilse', detail, amount }) as
  unknown as CombatEvent;
describe('what is gained, told', () => {
  it('says one named thing as taken, with its article', () => {
    expect(CombatPresenter.format(gain('Lantern', 1), state)).toBe('Ilse takes a lantern.');
    expect(CombatPresenter.format(gain('Ivory comb', 1), state)).toBe('Ilse takes an ivory comb.');
  });
  it('keeps counts as counts, and a thing already said with its article as it is', () => {
    expect(CombatPresenter.format(gain('Lantern', 2), state)).toBe('Ilse gains 2 lanterns.');
    expect(CombatPresenter.format(gain('experience', 1), state)).toBe('Ilse gains 1 experience.');
    expect(CombatPresenter.format(gain("Davy's red coat", 1), state)).toBe("Ilse takes Davy's red coat.");
  });
});
