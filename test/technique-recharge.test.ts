import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { ChoiceList, type Choice } from '../src/ui/choice-list';
import { CombatModel } from '../src/ui/combat-model';

// Orsino rests every skill that names no cooldown for three turns after use (Combat.ts: action.cooldown || 3), all but
// a weapon's blow, waiting and getting away. Kyr had read the unnamed as none, so a warrior's Second Wind (1d10 + level
// back) and Sweep (a blow, and the foe prone three turns) were free every turn, and every reckoning of a fight, the
// autoplayer and every measure of a novice's chances fought with them so (the OWN-28 diagnosis). And the fight cards
// said only a blow's odds, alike for Strike, Cleave and Sweep, and nothing at all of Second Wind.
class Rested {
  static readonly ability = (id: string) => Content.abilities.find(a => a.id === id)!;
  static fight(seed: string) {
    const content = new Content(seed);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
    const foe = content.createCreature('foe', { raceId: 'human', classId: 'warrior' });
    const store = new CreatureStore([hero, foe]);
    return Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' }, { creatureId: 'foe', team: 'goblins' }],
      { seed });
  }
  static toHero(battle: Battle) {
    while (!battle.state.outcome && battle.state.actor !== 'hero') { battle.step(battle.chosen()); }
  }
  static card(battle: Battle, id: string): Choice | undefined {
    return ChoiceList.all(ChoiceList.combat(CombatModel.build(battle))).flatMap(c => [c, ...c.children ?? []])
      .find(c => c.id === `ability:${id}`);
  }
}

describe('a technique rests after use as Orsino rests it', () => {
  it('three turns where it names none, as it names where it does; a blow, waiting and running never', () => {
    expect(Canon.rules.combat.recharge.technique).toBe(3);
    for (const id of ['second_wind', 'sweep', 'cleave', 'taunt', 'backstab', 'dodge']) {
      expect([id, Rested.ability(id).cooldown]).toEqual([id, 3]);
    }
    expect(Rested.ability('defend').cooldown).toBe(Canon.abilities.defend!.recharge!);
    for (const id of ['melee', 'ranged', 'wait', 'flee', 'guard']) {
      expect([id, Rested.ability(id).cooldown]).toEqual([id, 0]);
    }
    // A spell spends a slot instead.
    expect(Rested.ability('firebolt').cooldown).toBe(0);
  });
  it('is not offered again until its rest is over', () => {
    const battle = Rested.fight('rested');
    Rested.toHero(battle);
    battle.step({ actor: 'hero', ability: 'second_wind', target: 'hero' });
    const offered: boolean[] = [];
    for (let turn = 0; turn < 4 && !battle.state.outcome; turn++) {
      Rested.toHero(battle);
      if (battle.state.outcome) { break; }
      offered.push(battle.legalCommands().some(c => c.ability === 'second_wind'));
      battle.step(battle.legalCommands().find(c => c.ability === 'melee')!);
    }
    expect(offered).toEqual([false, false, false, true].slice(0, offered.length));
  });
});

describe('a technique\'s card says what it does', () => {
  it('Second Wind its healing, Sweep the fall, Cleave the blow carried on, each when it can be used again', () => {
    const battle = Rested.fight('cards');
    Rested.toHero(battle);
    expect(Rested.card(battle, 'second_wind')?.note)
      .toMatch(/^heal yourself for 1d10 \+ 1 \(2–11\) · again after 3 turns$/);
    expect(Rested.card(battle, 'sweep')?.note).toMatch(/prone for 3 turns.* · again after 3 turns$/);
    expect(Rested.card(battle, 'cleave')?.note).toMatch(/a killing blow carries on to another · again after 3 turns$/);
    // A plain blow is told by its odds alone; running by its odds, and that it ends the fight for all.
    expect(Rested.card(battle, 'melee')?.note).toMatch(/^\d in \d+$|^almost (always|never)$/);
    expect(Rested.card(battle, 'flee')?.note).toBe('1 in 2 · ends the fight for all');
  });
});
