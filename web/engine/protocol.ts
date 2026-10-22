import type { CreatureGenerationContext } from '../../src/content';
import type { Transcript } from '../../src/session/play-session';
import type { CombatScreen, Screen } from '../../src/ui/screen-types';

// What passes between the page and the engine. The engine (Kyrie, in a worker) is the only authority on what
// happens; the page draws frames and sends back what the player chose.

export type Member = CreatureGenerationContext;

// One thing that happened, as the page tells it: what the company did, in the player's words (an arrival has none),
// what came of it, and the margin notes (coin spent, something noted in the journal).
export interface Entry {
  id: number; at: string; elapsed: number; place: string; placeName: string;
  said?: string; arrival?: boolean;
  lines: string[]; notes: string[];
  tone: 'act' | 'fight' | 'note' | 'fail';
  // The same entry as a log line, for tests and the saved history.
  title: string;
}

export interface CampaignChoice {
  id: string; title: string; note: string; detail: string; seed: string; recommended?: boolean;
}
export interface Setting {
  title: string; pitch: { heading: string; text: string }; party: Member[]; generated: boolean;
}

// The choices a company is made from, read from the same catalogs the game runs on.
export interface Catalog {
  ancestries: { id: string; name: string; text: string }[];
  callings: { id: string; name: string; text: string; specializations: { id: string; name: string }[] }[];
  backgrounds: { id: string; name: string; kind: string; text: string; calling?: string }[];
  kinds: { id: string; name: string }[];
  presets: { id: string; label: string; note: string; members: Member[] }[];
  campaigns: CampaignChoice[];
}
// What a company would bring, before it sets out.
export interface CompanyView {
  members: { calling: string; practice: string; skills: string[]; gear: string[]; contact?: string;
    requires?: string }[];
  covered: { name: string; who: string[] }[]; missing: string[];
  formed: { name: string; perks: string[] }[]; near: { name: string; needs: string; perks: string[] }[];
}

// Everything the page draws while playing: the place, what has been told, a fight if one is on, and the journal.
export interface Frame {
  title: string; screen: Screen; entries: Entry[];
  combat?: CombatScreen;
  // How a fight began, as it was seen: the moment that started it.
  opening: string[];
  chronicle: { at: string; text: string; detail: string[] }[];
  transcript: Transcript;
}

export type Request =
  | { kind: 'catalog' }
  | { kind: 'setting'; campaign: string }
  | { kind: 'world'; seed: string; terrain?: string }
  | { kind: 'preview'; party: Member[]; generated: boolean }
  | { kind: 'begin'; campaign: string; seed: string; party: Member[]; terrain?: string }
  | { kind: 'resume'; saved: string }
  | { kind: 'perform'; command: string; said: string; move: boolean }
  // A companion's choice in a fight ("ability>target"); none lets them fight this turn on their own.
  | { kind: 'fight'; choice?: string }
  | { kind: 'checkpoint' };
export interface Envelope { id: number; request: Request }
export type Message =
  | { kind: 'reply'; id: number; value?: unknown; error?: string }
  | { kind: 'frame'; frame: Frame }
  // The game to keep in this browser, once a command is done (sent after its frame, so play does not wait on it).
  | { kind: 'saved'; save: string }
  | { kind: 'progress'; stage: string };
