import { describe, expect, it } from 'bun:test';
import { CombatTelling } from '../src/ui/combat-telling';
import type { CombatEvent, Fighter } from '../src/model';

// A fight's status against its log (R9-06, round 9's cold play): a save held against a condition already on its
// fighter is not told as shrugging it off ("shrugs off the armor shred" while Armor Shred stood on the card).
describe('a fight\'s status against its telling', () => {
  // A blow that does no harm still asks the bleeding save (Effects.aftermath runs a kind's triggers for any blow of
  // it): held for the lead, since mending it turns cov7's barrow-king from grave to deadly for a fresh warrior, whose
  // blows for nothing on its half-proof hide had been bleeding it (play-structure's worthiest band).
  it.todo('leaves no wound to bleed from a blow that did no harm (R9-06: the lead\'s decision)');
  it('does not tell a held save against a condition its fighter already has', () => {
    const state = { combatants: [{ id: 'r', name: 'Ralf', team: 'fighters' } as Fighter], turn: 1, actor: '',
      outcome: null };
    const shredded: CombatEvent = { type: 'status', turn: 1, actor: 'x', target: 'r', detail: 'shred' };
    const held: CombatEvent = { type: 'save', turn: 2, actor: 'x', target: 'r', rolled: 18, difficulty: 15,
      success: true, kind: 'reflex', against: 'shred' };
    const told = (events: CombatEvent[]) => CombatTelling.exchanges(events, state).map(t => t.text).join(' ');
    expect(told([shredded, held])).not.toMatch(/shrugs off/);
    expect(told([held])).toMatch(/shrugs off/);
  });
});
