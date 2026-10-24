import type { CreatureGenerationContext } from '../../src/content';
import type { Transcript } from '../../src/session/play-session';
import type { CombatScreen, Screen } from '../../src/ui/screen-types';
import type { Exchange, Leaf } from '../../src/presentation/narrator';
import type { Memorial } from '../../src/world/memorial';
export type { Exchange, Leaf };

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
  // In a generated country, the reasons one person might have come into it, as this country holds them.
  origins?: { id: string; title: string; choice: string; background?: string }[];
}

// The choices a company is made from, read from the same catalogs the game runs on.
export interface Catalog {
  // Each people, and the callings open to it (an elf is no cleric).
  ancestries: { id: string; name: string; text: string; callings: string[] }[];
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
  // What the page tells now: the present situation and the immediate exchange, chosen by the narrator.
  leaf: Leaf;
  combat?: CombatScreen;
  // How a fight began, as it was seen: the moment that started it.
  opening: string[];
  chronicle: { at: string; text: string; detail: string[] }[];
  transcript: Transcript;
  // How long the engine took over it, in milliseconds: the command itself, building the screen, telling it.
  timing?: { engine: number; screen: number; narrative: number };
  // When no one is left standing: how it came to that, said plainly (see Obituary), and where they lie, for a country
  // begun again to remember.
  ending?: { title: string; lines: string[]; memorial?: Memorial };
}

export type Request =
  | { kind: 'catalog' }
  | { kind: 'setting'; campaign: string }
  | { kind: 'world'; seed: string; terrain?: string }
  | { kind: 'preview'; party: Member[]; generated: boolean }
  | { kind: 'begin'; campaign: string; seed: string; party: Member[]; terrain?: string; origin?: string;
    memorial?: Memorial }
  // A kept game, with the world it was played in when that is kept apart from it (see KeptGame).
  | { kind: 'resume'; saved: string; world?: string }
  | { kind: 'perform'; command: string; said: string; move: boolean; named?: boolean }
  // A companion's choice in a fight ("ability>target"); none lets them fight this turn on their own.
  | { kind: 'fight'; choice?: string }
  | { kind: 'checkpoint' };
export interface Envelope { id: number; request: Request }
// What a kept game says about itself on the title: the campaign, where the company is, when, and who.
export interface SaveSummary { title: string; where: string; when: string; company: string }
export type Message =
  | { kind: 'reply'; id: number; value?: unknown; error?: string }
  | { kind: 'frame'; frame: Frame }
  // The game to keep in this browser, once a command is done (sent after its frame, so play does not wait on it):
  // packed small (see SaveCodec), with what the title page says of it.
  // The game kept after a command: its state, and its world the first time it is kept or after it changes.
  | { kind: 'saved'; save: string; summary: SaveSummary; world?: { key: string; text: string } }
  | { kind: 'progress'; stage: string };
