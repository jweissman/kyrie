import type { ConditionInstance } from './creature';
export type { Creature } from './creature';

import type { ArenaAbility } from './lang/parse';

export type Team = 'fighters' | 'goblins';
export interface EncounterParticipant {
  creatureId: string; team: Team; guarding: boolean;
  cooldowns: Record<string, number>; conditions: ConditionInstance[];
}
// Detached combat projection for controllers and legacy arena fixtures, not persistent storage.
export interface Fighter {
  id: string; name: string; team: Team; hp: number; maxHp: number;
  strength: number; speed: number; level: number; guarding: boolean; abilities: string[];
  raceId: string; classId: string; dexterity: number; intelligence: number; wisdom: number;
  constitution: number; charisma: number; mana: number; maxMana: number;
  gold: number; experience: number;
  abilitySources?: Record<string, { id: string; kind: 'item'; name: string }>;
  attachmentModifiers?: { armor: number; power: number; save: number };
  statuses: ConditionInstance[];
  // Traits the creature chose (lineage, specialization, feat); its kind's nature traits are read from the canon.
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
    modifiers?: { power: number; armor: number; resistance: number; guarding: boolean;
      critical?: number; halfSave?: boolean } }
  | { type: 'attack'; turn: number; actor: string; target: string; die: number; modifier: number;
    defense: number; success: boolean; critical: boolean }
  | { type: 'save'; turn: number; actor: string; target: string; rolled: number; difficulty: number; success: boolean;
    stat?: string; die?: number; modifier?: number; kind?: string; level?: number; bonus?: number;
    immune?: boolean; limit?: boolean }
  | { type: 'defend' | 'death' | 'skip'; turn: number; actor: string }
  | { type: 'status' | 'remove' | 'revive' | 'gain' | 'learn' | 'summon' | 'travel' | 'expire';
    turn: number; actor: string; target: string; detail: string; amount?: number;
    clock?: 'owner-turn' | 'world-time' | 'until-removed' }
  | { type: 'end'; turn: number; outcome: Outcome; reason: 'elimination' | 'turn-limit' | 'retreat' }) & { visibility?: 'private' };
export interface BattleState { combatants: Fighter[]; turn: number; actor: string; outcome: Outcome | null }
export type Controller = (state: BattleState, legal: Command[]) => Command;
