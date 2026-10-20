import type { ConditionInstance } from './creature';
export type { Creature } from './creature';

import type { ArenaAbility } from './lang/parse';
import type { Equipment } from './item-catalog';

export type Team = 'fighters' | 'goblins';
export interface EncounterParticipant {
  creatureId: string; team: Team; cooldowns: Record<string, number>; conditions: ConditionInstance[];
}
// Detached combat projection for controllers and legacy arena fixtures, not persistent storage.
export interface Fighter {
  id: string; name: string; team: Team; hp: number; maxHp: number;
  strength: number; speed: number; level: number; abilities: string[];
  raceId: string; classId?: string; dexterity: number; intelligence: number; wisdom: number;
  constitution: number; charisma: number; mana: number; maxMana: number; maxSlots?: number[]; slots?: number[];
  gold: number; experience: number;
  abilitySources?: Record<string, { id: string; kind: 'item'; name: string }>;
  // The wielded (or natural) weapon, worn armour's ac, and equipped items' modifiers and hooks.
  equipment: Equipment;
  statuses: ConditionInstance[];
  // Every trait the creature holds: birth or nature traits and the ones it chose.
  traits?: string[];
  // Successful category saves in this encounter; Orsino fails a fourth success of one category automatically.
  saved?: Record<string, number>;
  cooldowns: Record<string, number>;
}
export interface Scenario { id: string; combatants: Fighter[]; abilities: ArenaAbility[] }
export interface Command { actor: string; ability: string; target: string }
export type Outcome = Team | 'draw' | 'escaped';
export type CombatEvent = (
  | { type: 'action'; turn: number; command: Command; source?: { id: string; kind: 'ability' | 'trap' | 'item' | 'shrine'; name?: string } }
  | { type: 'damage' | 'heal'; turn: number; actor: string; target: string;
    rolled: number; amount: number; hp: number; damageType?: string;
    modifiers?: { bonus: number; resistance: number; reduction: number; absorbed?: number;
      critical?: number; halfSave?: boolean } }
  // Orsino's attack roll: die at or above need hits (need = THAC0 − armourClass − toHit); evasion may cancel a hit.
  | { type: 'attack'; turn: number; actor: string; target: string; die: number; need: number; toHit: number;
    armorClass: number; weapon: string; success: boolean; critical: boolean; evaded?: boolean }
  | { type: 'initiative'; turn: number; order: { id: string; roll: number }[] }
  | { type: 'flee'; turn: number; actor: string; success: boolean }
  | { type: 'save'; turn: number; actor: string; target: string; rolled: number; difficulty: number; success: boolean;
    stat?: string; die?: number; modifier?: number; kind?: string; level?: number; bonus?: number;
    immune?: boolean; limit?: boolean }
  | { type: 'defend' | 'death' | 'skip'; turn: number; actor: string }
  | { type: 'status' | 'remove' | 'revive' | 'gain' | 'learn' | 'summon' | 'travel' | 'expire';
    turn: number; actor: string; target: string; detail: string; amount?: number;
    clock?: 'owner-turn' | 'world-time' | 'until-removed' }
  | { type: 'end'; turn: number; outcome: Outcome; reason: 'elimination' | 'turn-limit' | 'retreat';
    fled?: { actor: string; team: Team } }) & { visibility?: 'private' };
export interface BattleState { combatants: Fighter[]; turn: number; actor: string; outcome: Outcome | null }
export type Controller = (state: BattleState, legal: Command[]) => Command;
