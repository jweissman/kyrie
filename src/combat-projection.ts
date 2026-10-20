import { ItemCatalog } from './item-catalog';
import type { Creature } from './creature';
import type { EncounterParticipant, Fighter, Team } from './model';

export class CombatProjection {
  static creature(fighter: Fighter, original?: Creature): Creature {
    return { ...(original?.generation ? { generation: structuredClone(original.generation) } : {}),
      ...(original?.professionId ? { professionId: original.professionId } : {}),
      ...(original?.traits ?? fighter.traits ? { traits: [...original?.traits ?? fighter.traits ?? []] } : {}),
      ...(original?.backgroundId ? { backgroundId: original.backgroundId } : {}),
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
        learnedAbilities: fighter.abilities.filter(id => !(original?.base.abilities ?? fighter.abilities).includes(id)
          && !(original && ItemCatalog.abilities(original)[id]
            && !original.state.learnedAbilities.includes(id))),
        conditions: structuredClone(fighter.statuses),
        ...(original?.state.inventory ? { inventory: structuredClone(original.state.inventory) } : {}) } };
  }
  static fighter(creature: Creature, team: Team): Fighter {
    const sources = ItemCatalog.abilities(creature);
    return { id: creature.id, name: creature.name, raceId: creature.raceId,
      ...creature.classId ? { classId: creature.classId } : {},
      ...structuredClone(creature.base), hp: creature.state.hp, mana: creature.state.mana,
      ...(creature.state.slots ? { slots: [...creature.state.slots] } : {}),
      gold: creature.state.gold, experience: creature.state.experience,
      abilities: [...new Set([...creature.base.abilities, ...creature.state.learnedAbilities,
        ...Object.keys(sources)])],
      ...(Object.keys(sources).length ? { abilitySources: sources } : {}),
      statuses: structuredClone(creature.state.conditions), equipment: ItemCatalog.equipment(creature),
      ...(creature.traits ? { traits: [...creature.traits] } : {}),
      team, cooldowns: {} };
  }
  static participant(fighter: Fighter, localConditions: Fighter['statuses']): EncounterParticipant {
    return { creatureId: fighter.id, team: fighter.team,
      cooldowns: structuredClone(fighter.cooldowns), conditions: structuredClone(localConditions) };
  }
}
