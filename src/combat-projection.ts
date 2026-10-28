import { ItemCatalog } from './item-catalog';
import type { Creature } from './creature';
import type { EncounterParticipant, Fighter, Team } from './model';

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
        // What it used up in the fight is gone from its pack.
        ...(original?.state.inventory ? { inventory: structuredClone(original.state.inventory
          .filter(i => !fighter.spent?.includes(i.id))) } : {}),
        // What levels gained still have to spend, and the skills taken up with them, are no part of a fight, and come
        // back from it as they went in (a warrior's climbing, taken up with a level, was gone at the next watch of a
        // torch burning: found by test/growth.test.ts).
        ...(original?.state.advances ? { advances: structuredClone(original.state.advances) } : {}),
        ...(original?.state.skills ? { skills: [...original.state.skills] } : {}) } };
  }
  // One of the company carries into a fight what it can use up there (see ItemCatalog.stock), each kind an ability
  // whose source is the first of that kind it has not used.
  static fighter(creature: Creature, team: Team): Fighter {
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
      ...(Object.keys(stock).length ? { stock } : {}),
      statuses: structuredClone(creature.state.conditions), equipment: ItemCatalog.equipment(creature),
      ...(creature.traits ? { traits: [...creature.traits] } : {}),
      team, cooldowns: {} };
  }
  static participant(fighter: Fighter, localConditions: Fighter['statuses']): EncounterParticipant {
    return { creatureId: fighter.id, team: fighter.team,
      cooldowns: structuredClone(fighter.cooldowns), conditions: structuredClone(localConditions) };
  }
}
