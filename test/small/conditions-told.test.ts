import { describe, expect, it } from 'bun:test';
import voiced from '../../data/voice/conditions.json';
import { Canon } from '../../src/canon/canon';
import { CombatPresenter } from '../../src/ui/combat-presenter';
import { ClauseLoad } from '../../src/presentation/clause-load';

// A condition's beginning and ending told as what happens, never as the mechanic's name and duration (the cold
// playtest, CO-10: "Hild gains inspired for 3h", "under migraine"): in its own words, else the voice table's.
describe('a condition told', () => {
  const voice = voiced.conditions as Record<string, { begins: string; ends: string }>;
  it('names only conditions there are, in a short sentence with whom it falls on', () => {
    for (const [id, told] of Object.entries(voice)) {
      expect(Canon.conditions[Canon.resolve('conditions', id)], id).toBeDefined();
      for (const said of [told.begins, told.ends]) {
        expect(said, id).toContain('{target}');
        expect(ClauseLoad.heavy(said), said).toBe(false);
        expect(said, id).not.toMatch(/\bfor \d|\bturns?\b|\bgains\b|\bunder \w+\.$/);
      }
    }
  });
  it('is the voice table\'s where the condition says nothing of its own', () => {
    expect(CombatPresenter.told('inspired', 'begins')).toBe('{target}\'s blood is up.');
    expect(CombatPresenter.told('migraine', 'ends')).toBe('{target}\'s head clears.');
    expect(CombatPresenter.told('torchlit', 'ends')).toBe('{target}\'s torch gutters out.');
  });
});
