import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';
import { Traits } from '../../src/ports/traits';
import { Canon } from '../../src/canon/canon';
import { Checks } from '../../src/rules/checks';
import { MechanicsText } from '../../src/presentation/mechanics-text';

// Creation suggests nothing it cannot say why of, and every perk says what it buys (the owner's play, 27 November,
// OR-1684: "Things were pre-selected that might have been 'good' but it wasn't clear why they were selected. Perks are
// completely unclear as to what they buy"). What a life would set out with unchosen (its sign, calling, past, trade,
// perk and name) is drawn or defaulted, never suggested for a reason, so no card is shown as chosen until the player
// chooses at its step; chosen, it is shown so. And each perk's words say what changes and by how much, from its own
// trait: each skill it teaches by what knowing it adds at the first level and when the skill is used, each modifier
// as the rules say it.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'wanderer', title: 'Wandering', choice: 'You come with your trade', background: 'drifter' }], names,
  party: [Creation.protagonist('human', 'warrior', names)] };
describe('creation, suggesting nothing unexplained', () => {
  it('shows no card as chosen until the player chooses at its step', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    expect(flow.steps().filter(s => s.chosen !== undefined).map(s => s.id)).toEqual([]);
    flow.choose('perk', 'haggler');
    expect(flow.steps().find(s => s.id === 'perk')!.chosen).toBe('haggler');
  });
  it('says of every perk what it buys in play, from its trait', () => {
    const flow = new CreationFlow(setting, Creation.catalog()), perk = flow.steps().find(s => s.id === 'perk')!;
    for (const card of perk.cards) {
      const t = Traits.of(card.id)!, said = card.say ?? '';
      for (const skill of t.skills ?? []) { expect(said).toContain(`${Canon.skills[skill]!.name} +${Checks.proficiency(1)}, for `); }
      for (const m of MechanicsText.modifiers(t.modifiers)) { expect(said).toContain(m); }
      expect([card.id, /[+−]\d/.test(said)]).toEqual([card.id, true]);
    }
    expect(perk.cards.find(c => c.id === 'tactician')!.say).toMatch(/\+2 initiative: you act sooner when a fight begins/);
  });
});
