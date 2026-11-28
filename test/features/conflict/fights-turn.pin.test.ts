import { describe, expect, it } from 'bun:test';
import { Battle } from '../../../src/arena';
import { Content } from '../../../src/content';
import { Tactics } from '../../../src/tactics';
import { CombatModel } from '../../../src/ui/combat-model';
import { ChoiceList } from '../../../src/ui/choice-list';
import { FightTurn } from '../../../src/ui/fight-turn';
import type { Fighter } from '../../../src/model';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Conflict › A fight blows cannot win has a turn in it
// (cold round D4, 28 November: OR-1858). Three banshees resisting every weapon the company had were some sixteen
// rounds of misses and blunted blows, honestly reckoned beforehand ("your weapons barely bite them") and with no turn
// in the fight itself. On a fragment of the rules, no world: after three rounds of blows mostly shrugged off, the
// fight says so and offers its way out beside the blow; against foes the same blows bite, it does not.
const warrior = (id = 'w') => new Content(id).character('warrior', id, 'fighters', 'human');
const band = (kind: string, n: number): Fighter[] => Array.from({ length: n }, (_, i) => new Content(`${kind}${i}`)
  .creature(kind, `${kind}${i}`, 'goblins', 1));
// Two warriors hard to kill, fought by the company's own tactics until it is the first's turn in the fourth round
// (three rounds of blows behind it), or the fight ends.
const third = (kind: string, seed: string) => {
  const company = [warrior(), warrior('r')];
  for (const w of company) { w.hp = w.maxHp = 300; }
  const b = new Battle({ id: kind, combatants: [...company, ...band(kind, 3)], abilities: Content.abilities }, seed);
  const round = () => b.events.filter(e => e.type === 'initiative').length;
  for (let i = 0; i < 400 && !b.state.outcome && !(round() >= 4 && b.state.actor === 'w'); i++) {
    b.step(Tactics.choose(b.view, b.plain(b.legalCommands())));
  }
  return b;
};
const seeds = Array.from({ length: 8 }, (_, i) => `turn${i}`);

describe('Conflict › A fight blows cannot win has a turn in it', () => {
  it('says after three rounds that the blows barely bite the banshees, and offers the way out beside the blow', () => {
    // Where the blows have told after all (two of the three down in three rounds), it is no grind, and is not said.
    const strong = (b: Battle) => { const foes = b.state.combatants.filter(f => f.team !== 'fighters');
      return foes.reduce((t, f) => t + f.hp, 0) * 2 > foes.reduce((t, f) => t + f.maxHp, 0); };
    const turned = seeds.map(s => third('banshee', s)).filter(b => !b.state.outcome && strong(b));
    expect(turned.length).toBeGreaterThanOrEqual(seeds.length * 3 / 4);
    for (const b of turned) {
      const screen = CombatModel.build(b, undefined, undefined, { quick: true });
      expect(screen.grind).toBe('Your blows barely bite them, and they keep most of their strength: you could fall back.');
      const away = ChoiceList.combat(screen).find(s => s.id === 'away');
      expect(away?.choices.map(c => c.id)).toEqual(['ability:flee']);
      expect(away?.choices[0]?.about).toContain(screen.grind);
    }
  });
  it('says nothing of it where the blows bite (zombies), nor before the third round', () => {
    for (const s of seeds) {
      const b = third('zombie', s);
      expect(FightTurn.grind(b.events, b.state.combatants)).toBeUndefined();
    }
    const early = new Battle({ id: 'b', combatants: [warrior(), ...band('banshee', 3)], abilities: Content.abilities },
      'early');
    expect(FightTurn.grind(early.events, early.state.combatants)).toBeUndefined();
  });
});
