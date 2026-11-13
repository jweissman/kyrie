import { Canon } from './canon/canon';
import { ItemCatalog } from './item-catalog';
import { LevelDrain } from './rules/level-drain';
import type { Creature } from './creature';
import type { BattleState, EncounterParticipant, Fighter, Team } from './model';

export class CombatProjection {
  static creature(fighter: Fighter, original?: Creature): Creature {
    return { ...(original?.generation ? { generation: structuredClone(original.generation) } : {}),
      ...(original?.professionId ? { professionId: original.professionId } : {}),
      // What it is goes on from the fight, and what a fight made it (the undead a raising makes) with it.
      ...(original?.traits ?? fighter.traits
        ? { traits: [...new Set([...original?.traits ?? [], ...fighter.traits ?? []])] } : {}),
      ...(original?.backgroundId ? { backgroundId: original.backgroundId } : {}),
      ...(original?.likeness ? { likeness: original.likeness } : {}),
      id: fighter.id, name: fighter.name, raceId: fighter.raceId,
      ...fighter.classId ? { classId: fighter.classId } : {},
      base: original ? structuredClone(original.base) : { abilities: [...fighter.abilities],
        maxHp: fighter.maxHp, maxMana: fighter.maxMana,
        ...(fighter.maxSlots ? { maxSlots: [...fighter.maxSlots] } : {}),
        level: fighter.level, speed: fighter.speed, strength: fighter.strength, dexterity: fighter.dexterity,
        constitution: fighter.constitution, intelligence: fighter.intelligence,
        wisdom: fighter.wisdom, charisma: fighter.charisma },
      state: { hp: fighter.hp, mana: fighter.mana, gold: fighter.gold, experience: fighter.experience,
        ...(fighter.slots ? { slots: [...fighter.slots] } : {}),
        ...(fighter.prepared
          ? { prepared: structuredClone(fighter.prepared), ready: structuredClone(fighter.ready ?? []) } : {}),
        learnedAbilities: fighter.abilities.filter(id => !(original?.base.abilities ?? fighter.abilities).includes(id)
          && !(original && ItemCatalog.abilities(original)[id]
            && !original.state.learnedAbilities.includes(id)) && !fighter.stock?.[id]),
        conditions: structuredClone(fighter.statuses),
        // What it used up in the fight is gone from its pack; a wand used and not spent keeps the charges it has left.
        ...(original?.state.inventory ? { inventory: structuredClone(original.state.inventory
          .flatMap(i => !fighter.spent?.includes(i.id) ? [i] : fighter.charges?.[i.id]
            ? [{ ...i, charges: fighter.charges[i.id]! }] : [])) } : {}),
        // What levels gained still have to spend, and the skills taken up with them, are no part of a fight, and come
        // back from it as they went in (a warrior's climbing, taken up with a level, was gone at the next watch of a
        // torch burning: found by test/growth.test.ts).
        ...(original?.state.advances ? { advances: structuredClone(original.state.advances) } : {}),
        ...(original?.state.skills ? { skills: [...original.state.skills] } : {}),
        ...fighter.daily ? { daily: structuredClone(fighter.daily) } : {} } };
  }
  // Every creature as a fight told after it names them, each on its own side: the company's as fighters, and the rest
  // as what they were fought as. Each creature had been drawn as of the company, and a foe's hit points told as it fell
  // ("takes 6 slashing damage (0 HP left)"), where a foe's are never told (the owner, 7 November).
  static told(creatures: readonly Creature[], party: readonly string[], called?: ReadonlyMap<string, string>):
    BattleState {
    const ours = new Set(party);
    return { combatants: creatures.map(c => ({ ...this.fighter(c, ours.has(c.id) ? 'fighters' : 'goblins'),
      ...called?.get(c.id) ? { name: called.get(c.id)! } : {} })), turn: 0, actor: '', outcome: null };
  }
  // One of the company carries into a fight what it can use up there (see ItemCatalog.stock), each kind an ability
  // whose source is the first of that kind it has not used.
  // One drained of levels fights at the level it stands at (see LevelDrain).
  static fighter(creature: Creature, team: Team): Fighter {
    const fighter = CombatProjection.made(creature, team), drained = LevelDrain.levels(creature.state.conditions);
    if (drained) { LevelDrain.lower(fighter, drained); }
    return fighter;
  }
  private static made(creature: Creature, team: Team): Fighter {
    const stock = team === 'fighters' ? ItemCatalog.stock(creature) : {}, sources = { ...ItemCatalog.abilities(creature),
      ...Object.fromEntries(Object.entries(stock).map(([id, [first]]) => [id,
        { id: first!, kind: 'item' as const, name: ItemCatalog.used(id)!.name }])) };
    return { id: creature.id, name: creature.name, raceId: creature.raceId,
      ...creature.classId ? { classId: creature.classId } : {},
      ...structuredClone(creature.base), hp: creature.state.hp, mana: creature.state.mana,
      ...(creature.state.slots ? { slots: [...creature.state.slots] } : {}),
      ...(creature.state.prepared ? { prepared: structuredClone(creature.state.prepared),
        ready: structuredClone(creature.state.ready ?? []) } : {}),
      gold: creature.state.gold, experience: creature.state.experience,
      abilities: [...new Set([...creature.base.abilities, ...creature.state.learnedAbilities,
        ...Object.keys(sources)])],
      ...(Object.keys(sources).length ? { abilitySources: sources } : {}),
      ...(Object.keys(stock).length ? { stock } : {}), ...CombatProjection.charges(creature, stock),
      statuses: structuredClone(creature.state.conditions), equipment: ItemCatalog.equipment(creature),
      ...(creature.traits ? { traits: [...creature.traits] } : {}),
      ...(creature.variations ? { variations: [...creature.variations] } : {}),
      // A creature of a kind with no calling: its kind's powers are its own, spells among them cast without slots.
      ...(Canon.isBody(creature.raceId) && !creature.classId ? { innate: [...creature.base.abilities] } : {}),
      ...creature.state.daily ? { daily: structuredClone(creature.state.daily) } : {},
      team, cooldowns: {} };
  }
  // The uses left in each charged thing it carries into the fight (a wand): its own count, or its kind's when new.
  static charges(creature: Creature, stock: Record<string, string[]>): { charges?: Record<string, number> } {
    const carried = new Set(Object.values(stock).flat()), charges = Object.fromEntries((creature.state.inventory ?? [])
      .filter(i => carried.has(i.id) && ItemCatalog.get(i.definition).charges)
      .map(i => [i.id, i.charges ?? ItemCatalog.get(i.definition).charges!]));
    return Object.keys(charges).length ? { charges } : {};
  }
  // One charge used of a charged thing: whether any are left in it.
  static discharge(fighter: Fighter, id: string): boolean {
    const left = (fighter.charges?.[id] ?? 1) - 1;
    if (left > 0) { fighter.charges![id] = left; } else { delete fighter.charges?.[id]; }
    return left > 0;
  }
  static participant(fighter: Fighter, localConditions: Fighter['statuses']): EncounterParticipant {
    return { creatureId: fighter.id, team: fighter.team,
      cooldowns: structuredClone(fighter.cooldowns), conditions: structuredClone(localConditions) };
  }
}
