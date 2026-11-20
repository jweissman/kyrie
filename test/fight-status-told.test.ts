import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { CombatTelling } from '../src/ui/combat-telling';
import type { CombatEvent, Fighter } from '../src/model';

// A fight's status against its log (R9-06, round 9's cold play): a blow that does no harm leaves no wound to bleed
// (a bite for 0 had left Bleeding), and a save held against a condition already on its fighter is not told as
// shrugging it off ("shrugs off the armor shred" while Armor Shred stood on the card).
describe('a fight\'s status against its telling', () => {
  const content = new Content('status-told');
  const struck = (amount: number, seed: string) => {
    const wolf: Fighter = { ...content.creature('wolf', 'w', 'goblins'), hp: 30, maxHp: 30 };
    const events: CombatEvent[] = [], context = { fighters: [wolf], turn: 1, events, content, abilities: [],
      retreat: false, location: null, expressions: new Expressions(seed), source: { id: 'test', kind: 'trap' } } as EffectContext;
    Effects.damage(wolf, { amount, type: 'piercing' }, context);
    return events;
  };
  // Only a wound triggers a damage kind's condition, as Orsino has it (the lead's ruling, 13 November).
  it('leaves no wound to bleed from a blow that did no harm, and asks the save of one that did', () => {
    for (let n = 0; n < 12; n++) {
      expect(struck(0, `nothing-${n}`).filter(e => e.type === 'save' || e.type === 'status')).toEqual([]);
    }
    expect(struck(5, 'wound').some(e => e.type === 'save' && e.against === 'bleed')).toBe(true);
  });
  it('does not tell a held save against a condition its fighter already has', () => {
    const state = { combatants: [{ id: 'r', name: 'Ralf', team: 'fighters' } as Fighter], turn: 1, actor: '',
      outcome: null };
    const shredded: CombatEvent = { type: 'status', turn: 1, actor: 'x', target: 'r', detail: 'shred' };
    const held: CombatEvent = { type: 'save', turn: 2, actor: 'x', target: 'r', rolled: 18, difficulty: 15,
      success: true, kind: 'reflex', against: 'shred' };
    const told = (events: CombatEvent[]) => CombatTelling.exchanges(events, state).map(t => t.text).join(' ');
    expect(told([shredded, held])).not.toMatch(/does not tear/);
    // Not "armour holds" after a blow that landed for 4 (cold play 9, GR-17): the armour held against the tearing.
    expect(told([held])).toMatch(/does not tear Ralf's armour/);
  });
  it('says nothing of a wound the dead cannot take the infection of (GR-17: "The first zombie cannot be infected.")', () => {
    const state = { combatants: [{ id: 'z', name: 'the first zombie', team: 'foes' } as unknown as Fighter], turn: 1,
      actor: '', outcome: null };
    const immune = { type: 'save', turn: 1, actor: 'x', target: 'z', rolled: 0, difficulty: 0, success: true,
      immune: true, against: 'infected' } as unknown as CombatEvent;
    expect(CombatTelling.exchanges([immune], state).map(t => t.text).join(' ')).not.toMatch(/infected/);
  });
});
