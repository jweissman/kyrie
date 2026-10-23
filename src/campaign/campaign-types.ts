import type { CalendarStart } from '../presentation/calendar';
import type { CommandResolution } from './command-resolution';
import type { CampaignDefinition } from './definition';
import type { Creature } from '../creature';
import type { Fighter, CombatEvent } from '../model';
import type { Module, WorldState } from '../lang/module';
import type { PendingAction } from './campaign-tick';

// What a campaign is and leaves behind: its state, its save, and the record of each command.
export interface ModuleStatus {
  id: string; name: string; installedAt: number; deadline?: number;
  outcome: 'active' | 'success' | 'failure'; outcomes: Record<string, boolean>;
  developments: { id: string; elapsed: number }[];
}
export interface CampaignState {
  seed: string; world: WorldState; party: Fighter[]; creatures: Creature[];
  partyIds: string[]; inhabitants: Record<string, string[]>; elapsed: number; deadline: number;
  // Who has joined the company, and which company: their own group is empty from then on.
  enlisted?: Record<string, string>;
  // Companions laid to rest, who have left the company for good.
  released?: string[];
  // The date the campaign began on, when its manifest gives one (see Calendar).
  calendar?: CalendarStart;
  outcome: 'active' | 'success' | 'failure';
  modules?: ModuleStatus[];
  outcomes?: Record<string, boolean>; developments?: { id: string; elapsed: number }[];
  pending?: Record<string, PendingAction>;
}
export interface NpcDecision {
  actor: string; goal: string; action: string; plan: string[]; elapsed?: number; changes?: string[];
}
export interface CampaignSave {
  actionFormat?: 'schemas';
  version: 1; module: Module; definition?: CampaignDefinition; state: Omit<CampaignState, 'party' | 'creatures'>;
  creatures: Creature[]; events: CampaignEvent[]; encounter: number;
  observations: Record<string, number>;
}
// A save being resumed: copied unless handed over (owned); its module checked unless this engine kept it (trusted).
export interface Restored { save: CampaignSave; owned?: boolean; trusted?: boolean }
export interface CampaignEvent {
  resolution?: CommandResolution;
  action: string; elapsed: number; changes: string[];
  result: 'success' | 'failure'; combat: CombatEvent[]; npc?: NpcDecision[];
  response?: string;
  perceptions?: { id: string; text: string; kind: 'observation' | 'discovery' | 'event' }[];
  // A fight the company was drawn into: what it had been doing when it was fallen on, and where it ran to, if it ran.
  prelude?: { action: string; response?: string; perceptions?: CampaignEvent['perceptions'] }; fledTo?: string;
  // What the company was told of what happened, in the voice tables' words (see Telling): which line, of what.
  voiced?: { id: string; kind: string; actor?: string; text: string }[];
}
