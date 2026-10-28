import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { CombatTelling } from '../src/ui/combat-telling';
import { ChoiceList } from '../src/ui/choice-list';
import type { BattleState, CombatEvent, Fighter } from '../src/model';

// What a fight shows the company must be true of it: the chance shown on a blow is the chance the dice give; a
// creature with two actions a turn and nothing but its weapon strikes twice; and a blow's aftermath says what was
// shrugged off rather than "it".
class Bout {
  static warrior(seed: string): Fighter { return new Content(seed).character('warrior', 'w', 'fighters', 'human'); }
  static foe(species: string, level: number): Fighter { return new Content(`${species}-${level}`).creature(species, 'f', 'goblins', level); }
  static battle(fighters: Fighter[], seed: string) {
    return new Battle({ id: 'bout', combatants: fighters, abilities: Content.abilities }, seed);
  }
}

describe('the odds of a blow, and what a fight says', () => {
  it('shows the chance the dice give', () => {
    const a = Effects.combatant(Bout.warrior('odds')), d = Effects.combatant(Bout.foe('wolf', 1));
    let landed = 0;
    for (let r = 1; r <= 20; r++) { if (Fighting.attack(a, d, () => r).success) { landed++; } }
    expect(Fighting.chance(a, d)).toBeCloseTo(landed / 20, 5);
    expect(ChoiceList.odds(0.25)).toBe('1 in 4');
    expect(ChoiceList.odds(2 / 3)).toBe('2 in 3');
    expect(ChoiceList.odds(0.98)).toBe('almost always');
  });
  it('lets a creature with two actions a turn and only its weapon strike twice', () => {
    const slump = { ...Bout.foe('slump', 4), id: 'slump', abilities: [] };
    const battle = Bout.battle([slump, { ...Bout.warrior('w'), hp: 200, maxHp: 200 }], 'twice');
    for (let i = 0; i < 20 && battle.state.actor !== 'slump'; i++) { battle.step(battle.chosen()); }
    const blows = [battle.step(battle.chosen()), battle.state.actor === 'slump' ? battle.step(battle.chosen()) : []]
      .flat().filter(e => e.type === 'attack' && e.actor === 'slump');
    expect(blows.length).toBe(2);
  });
  it('says what a save held against', () => {
    const state = { combatants: [{ id: 'w', name: 'Bran' }, { id: 'f', name: 'the Wet' }] } as unknown as BattleState;
    const events: CombatEvent[] = [
      { type: 'action', turn: 1, command: { actor: 'w', ability: 'melee', target: 'f' } },
      { type: 'attack', turn: 1, actor: 'w', target: 'f', die: 15, need: 8, toHit: 2, armorClass: 6, weapon: 'battleaxe',
        success: true, critical: false },
      { type: 'damage', turn: 1, actor: 'w', target: 'f', rolled: 5, amount: 5, hp: 20 },
      { type: 'save', turn: 1, actor: 'w', target: 'f', rolled: 18, difficulty: 15, success: true, against: 'shred' },
    ];
    expect(CombatTelling.exchanges(events, state)[0]!.text).toContain('shrugs off the armor shred');
  });
  // A wound bleeds at its own turn's end, after whatever it did: what it comes to is said of the wound, not read as
  // the blow just told (play 8: "The second of the risen dead is not infected", after its claws caught Maren).
  it('tells a wound bleeding, and festering or not, as the wound\'s', () => {
    const state = { combatants: [{ id: 'w', name: 'Maren' }, { id: 'f', name: 'the risen dead' }] } as unknown as BattleState;
    const turn: CombatEvent[] = [
      { type: 'action', turn: 1, command: { actor: 'f', ability: 'melee', target: 'w' } },
      { type: 'attack', turn: 1, actor: 'f', target: 'w', die: 15, need: 8, toHit: 2, armorClass: 6, weapon: 'claws',
        success: true, critical: false },
      { type: 'damage', turn: 1, actor: 'f', target: 'w', rolled: 1, amount: 1, hp: 6 },
      { type: 'damage', turn: 1, actor: 'f', target: 'f', rolled: 2, amount: 2, hp: 9, damageType: 'bleed' },
      { type: 'save', turn: 1, actor: 'f', target: 'f', rolled: 18, difficulty: 15, success: true, against: 'infected' },
    ];
    const told = CombatTelling.exchanges(turn, state)[0]!.text;
    expect(told).toContain('The risen dead bleeds, for 2.');
    expect(told).toContain('The risen dead\'s wound stays clean.');
    expect(told).not.toMatch(/bleed damage|not infected/);
    const festers: CombatEvent[] = [{ type: 'action', turn: 1, command: { actor: 'f', ability: 'wait', target: 'f' } },
      { type: 'status', turn: 1, actor: 'f', target: 'f', detail: 'infected', amount: 3 }];
    expect(CombatTelling.exchanges(festers, state)[0]!.text).toContain('The risen dead\'s wound festers.');
  });
  // A creature's antlers or claws miss and catch as many, and a held bleed is no news of how anyone is (the cold
  // evaluation: "Finn's antlers misses", "Sir Hamo Ashdown is not bleeding").
  it('tells many-pointed weapons as many, and a held bleed plainly', () => {
    const state = { combatants: [{ id: 'f', name: 'Finn', equipment: { weapon: { name: 'Antlers', natural: true } } },
      { id: 'h', name: 'Sir Hamo Ashdown' }] } as unknown as BattleState;
    const miss: CombatEvent[] = [{ type: 'action', turn: 1, command: { actor: 'f', ability: 'melee', target: 'h' } },
      { type: 'attack', turn: 1, actor: 'f', target: 'h', die: 3, need: 12, toHit: 0, armorClass: 8, weapon: 'antlers',
        success: false, critical: false }];
    expect(CombatTelling.exchanges(miss, state)[0]!.text).toContain("Finn's antlers miss Sir Hamo Ashdown.");
    const held: CombatEvent[] = [{ type: 'action', turn: 1, command: { actor: 'f', ability: 'wait', target: 'f' } },
      { type: 'save', turn: 1, actor: 'f', target: 'h', rolled: 17, difficulty: 15, success: true, against: 'bleed' }];
    expect(CombatTelling.exchanges(held, state)[0]!.text).toContain('Sir Hamo Ashdown does not bleed from it.');
  });
  // The follow-up review: "shakes it off. … takes 0 fire damage. … is burning", and a bite "for 0" that bled.
  it('tells harm that came to nothing as nothing, and a save against harm as turning the worst of it', () => {
    const state = { combatants: [{ id: 'w', name: 'Dayereth' }, { id: 'f', name: 'the hound' }] } as unknown as BattleState;
    const scald: CombatEvent[] = [
      { type: 'action', turn: 1, command: { actor: 'w', ability: 'scald', target: 'f' } },
      { type: 'save', turn: 1, actor: 'w', target: 'f', rolled: 18, difficulty: 15, success: true },
      { type: 'damage', turn: 1, actor: 'w', target: 'f', rolled: 1, amount: 0, hp: 9, damageType: 'fire' },
      { type: 'status', turn: 1, actor: 'w', target: 'f', detail: 'burning', amount: 2 },
    ];
    const told = CombatTelling.exchanges(scald, state)[0]!.text;
    expect(told).toContain('The hound turns the worst of it aside.');
    expect(told).not.toMatch(/shakes it off|takes 0/);
    const bite: CombatEvent[] = [
      { type: 'action', turn: 1, command: { actor: 'f', ability: 'melee', target: 'w' } },
      { type: 'attack', turn: 1, actor: 'f', target: 'w', die: 15, need: 8, toHit: 2, armorClass: 6, weapon: 'bite',
        success: true, critical: false },
      { type: 'damage', turn: 1, actor: 'f', target: 'w', rolled: 0, amount: 0, hp: 12 },
    ];
    expect(CombatTelling.exchanges(bite, state)[0]!.text).not.toContain('for 0');
    // A spell that came to nothing says so (PT-23: "Ithil uses Soot Cloud." with nothing hidden for it to show).
    const soot: CombatEvent[] = [{ type: 'action', turn: 1, command: { actor: 'w', ability: 'soot_cloud', target: 'w' } }];
    expect(CombatTelling.exchanges(soot, state)[0]!.text).toBe('Dayereth uses Soot Cloud, to no effect.');
  });
  // Seen in a1's barrow: a hound knocked flat and stunned "cannot act. … cannot act."
  it('says once what two things that came of a blow both come to', () => {
    const state = { combatants: [{ id: 'w', name: 'Bran' }, { id: 'f', name: 'the hound' }] } as unknown as BattleState;
    const events: CombatEvent[] = [
      { type: 'action', turn: 1, command: { actor: 'w', ability: 'melee', target: 'f' } },
      { type: 'skip', turn: 1, actor: 'f' }, { type: 'skip', turn: 1, actor: 'f' },
    ];
    expect(CombatTelling.exchanges(events, state)[0]!.text.match(/cannot act/g)).toHaveLength(1);
  });
});
