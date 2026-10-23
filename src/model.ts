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
  // The spell prepared in each slot, by spell level, and those of them not yet cast.
  prepared?: string[][]; ready?: string[][];
  gold: number; experience: number;
  abilitySources?: Record<string, { id: string; kind: 'item'; name: string }>;
  // The wielded (or natural) weapon, worn armour's ac, and equipped items' modifiers and hooks.
  equipment: Equipment;
  statuses: ConditionInstance[];
  // The creature whose call brought it into the fight, for a summoned one.
  summoner?: string;
  // Where each of its cycling abilities is in its cycle (Orsino's cycleEffects: prismatic spray's beams).
  cycles?: Record<string, number>;
  // Every trait the creature holds: birth or nature traits and the ones it chose.
  traits?: string[];
  // Where it fights (urban, forest, cave...), for perks that hold only there.
  environment?: string;
  // Successful category saves in this encounter; Orsino fails a fourth success of one category automatically.
  saved?: Record<string, number>;
  cooldowns: Record<string, number>;
  // A big blow this creature is winding up, to land on its next turn unless it is interrupted.
  windup?: Command;
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
    immune?: boolean; limit?: boolean;
    // The condition a blow would have left, when the save is against one (a slash's shred, a stab's bleeding).
    against?: string }
  | { type: 'defend' | 'death' | 'skip' | 'random'; turn: number; actor: string }
  // A check made outside a fight (see Checks): unrolled when it could not have gone otherwise.
  | { type: 'check'; turn: number; actor: string; skill: string; rolled: number; difficulty: number; success: boolean;
    die?: number; stat?: string; modifier?: number; trained?: number; unrolled?: boolean }
  // A guard takes a blow meant for the one they guard; a creature winds up a big blow, or loses it to a stun.
  | { type: 'intercept'; turn: number; actor: string; target: string }
  | { type: 'windup' | 'interrupt'; turn: number; actor: string; target: string; detail: string }
  // A creature answers what another did (Orsino's reactions), by the key that set it off.
  | { type: 'react'; turn: number; actor: string; target: string; detail: string }
  | { type: 'status' | 'remove' | 'revive' | 'gain' | 'learn' | 'summon' | 'dismiss' | 'travel' | 'expire';
    turn: number; actor: string; target: string; detail: string; amount?: number;
    clock?: 'owner-turn' | 'world-time' | 'until-removed' }
  | { type: 'end'; turn: number; outcome: Outcome; reason: 'elimination' | 'turn-limit' | 'retreat';
    fled?: { actor: string; team: Team } }) & { visibility?: 'private' };
export interface BattleState {
  combatants: Fighter[]; turn: number; actor: string; outcome: Outcome | null;
  // What each creature on the other side declared it means to do this round, and who acts next, in order.
  intents?: Record<string, Command>; order?: string[];
  // Foes that fled the fight, by name, so what they did can still be told.
  departed?: { id: string; name: string }[];
}
export type Controller = (state: BattleState, legal: Command[]) => Command;
