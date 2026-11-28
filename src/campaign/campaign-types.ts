import type { CalendarStart } from './calendar';
import type { Night } from './fictional-time';
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
// What a campaign's state takes from its manifest as it begins (see CanonInstall.dated).
export type Dated = Pick<CampaignState, 'calendar' | 'night' | 'canonless'>;
export interface CampaignState {
  seed: string; world: WorldState; party: Fighter[]; creatures: Creature[];
  partyIds: string[]; inhabitants: Record<string, string[]>; elapsed: number; deadline: number;
  // Minutes spent since the last whole watch (less than ten): small actions take minutes, not watches.
  minutes?: number;
  // What rules with words for again the company has heard once (see CampaignTick.telling).
  told?: string[];
  // Who has joined the company, and which company: their own group is empty from then on.
  enlisted?: Record<string, string>;
  // Companions laid to rest, who have left the company for good.
  released?: string[];
  // What each who joined the company had of their own, put by until they leave it (see Membership.enlist).
  purses?: Record<string, number>;
  // The date the campaign began on, when its manifest gives one (see Calendar), and the hours its night keeps, when
  // they are its own (see FictionalTime.dark).
  calendar?: CalendarStart; night?: Night;
  // A world of its own setting, into which the canon (data/imbar) is never installed (its manifest's "canon": false).
  canonless?: true;
  outcome: 'active' | 'success' | 'failure';
  modules?: ModuleStatus[];
  outcomes?: Record<string, boolean>; developments?: { id: string; elapsed: number }[];
  pending?: Record<string, PendingAction>;
  // The placements its world holds back until the company nears them, in the world's order, and each taken up since,
  // with the watch it was taken up at (see PendingPlacements): kept with the game, as its world is.
  held?: import('./pending-placements').PendingPlacement[]; neared?: { id: string; at: number }[];
  // Who found no way to a goal after a long look, and the watch they try again at (see Agency.plan).
  waiting?: Record<string, number>;
  // The aim the player follows, by its id, and whether they chose it; and the aims they set aside for it, the latest
  // last, to be followed again when it is done (see Undertakings).
  following?: { id: string; chosen?: boolean; aside?: string[] };
  // The aims set aside for one ended in the command under way, to be gone back to as it ends (see Undertakings).
  resume?: string[];
}
export interface NpcDecision {
  actor: string; goal: string; action: string; plan: string[]; elapsed?: number; changes?: string[];
  // Whether the company perceived it as it happened (see CampaignTick.seen); a game kept before says nothing.
  seen?: boolean;
}
export interface CampaignSave {
  actionFormat?: 'schemas';
  // Where the definition's schemas are the module's actions, and written once, there (see SavedSchemas).
  schemas?: 'actions';
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
  // An activity broken off before it had run its course (a wait, a rest, a search), by what came: the response says
  // what broke it off.
  cut?: true;
  // What the company perceived of the command; an ending among it carries the others that held as it was reached
  // (rivals: see EndingOrder.rivals).
  perceptions?: { id: string; text: string; kind: 'observation' | 'discovery' | 'event'; rivals?: string[] }[];
  // A fight the company was drawn into: what it had been doing when it was fallen on, and where it ran to, if it ran.
  // What the company did before it was set upon, and how many of the combat's events were that first fight's.
  prelude?: { action: string; response?: string; perceptions?: CampaignEvent['perceptions']; fought?: number };
  fledTo?: string;
  // What the company was told of what happened, in the voice tables' words (see Telling), and what fighters said in
  // its fights (kind bark: see Barks): which line, of what.
  voiced?: { id: string; kind: string; actor?: string; text: string }[];
  // The world's words heard and held back, as told lately: which perceptions (see RuleWords).
  unsaid?: string[];
  // Of a journey's last leg as the journey returns it, never kept: what its legs before brought (see Travel.way).
  way?: string[];
}
