import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { CreationDefaults } from '../web/engine/creation-defaults';
import { SpellSelection } from '../src/rules/spell-selection';
import { Canon } from '../src/canon/canon';

// A protagonist chooses their first-level spells (the owner, 3 November): every first-level spell of the tradition the
// calling does not teach is offered, so many and one of the way's own; a choice the way allows is kept, as the engine
// takes it, and one it does not gives way to the card's.
describe('first spells, chosen', () => {
  const evoker = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations.find(t => t.id === 'evoker')!;
  it('offers the first-level spells, keeps a choice the way allows, and the engine takes it', () => {
    const first = evoker.first!, picks = evoker.picks!, open = first.open.map(s => s.id);
    expect(first.count).toBe(3);
    expect(open.length).toBeGreaterThan(first.count);
    const rest = picks.filter(id => !open.includes(id)), own = first.school.find(id => open.includes(id))!;
    const others = open.filter(id => id !== own).slice(0, first.count - 1), chosen = [own, ...others, ...rest];
    expect(CreationDefaults.allowed(chosen, evoker)).toBe(true);
    expect(() => SpellSelection.validate(SpellSelection.plan(Canon.traits.evoker!), chosen, 'Ama')).not.toThrow();
    // Fewer than the way gives, or none of its own, is no choice.
    expect(CreationDefaults.allowed([own, ...rest], evoker)).toBe(false);
    const foreign = open.filter(id => !first.school.includes(id)).slice(0, first.count);
    if (foreign.length === first.count) { expect(CreationDefaults.allowed([...foreign, ...rest], evoker)).toBe(false); }
  });
});
