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
  // Each people, the callings open to it (an elf is no cleric), and what it and each calling add to the qualities.
  ancestries: { id: string; name: string; text: string; callings: string[]; qualities: Record<string, number> }[];
  // A calling's specializations (a cleric's domains, a mage's schools): what each is, and what its first spells are of.
  callings: { id: string; name: string; text: string;
    specializations: { id: string; name: string; text?: string; of?: string }[]; qualities: Record<string, number> }[];
  // The six qualities and what each is for; and what a score is worth in a fight, by the score.
  qualities: { id: string; name: string; rests: string }[]; worth: number[];
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
  // A journey just made along known ways: where it was going, each leg as it went (where it came, when, how the way
  // was, and anything that came of it), whether it arrived, and why it stopped if it did not.
  travel?: { to: string; arrived: boolean; stopped?: string;
    legs: { place: string; at: string; journey: string[]; lines: string[] }[] };
}

export type Request =
  | { kind: 'catalog' }
  | { kind: 'setting'; campaign: string }
  | { kind: 'world'; seed: string; terrain?: string }
  | { kind: 'preview'; party: Member[]; generated: boolean }
  | { kind: 'begin'; campaign: string; seed: string; party: Member[]; terrain?: string; origin?: string;
    memorial?: Memorial }
  // What Begin will be asked, as the page stands while the player reads it: made ready in advance, and taken up by a
  // Begin asking the same.
  | { kind: 'ready'; campaign: string; seed: string; party: Member[]; terrain?: string; origin?: string;
    memorial?: Memorial }
  // A kept game, with the world it was played in when that is kept apart from it (see KeptGame).
  | { kind: 'resume'; saved: string; world?: string }
  // The page only chooses: what was done is worded by the engine, a way by the label its own screen gave it (the page's
  // words had been kept as the story: the architecture review's H2).
  | { kind: 'perform'; command: string }
  // A companion's choice in a fight ("ability>target"); none lets them fight this turn on their own.
  | { kind: 'fight'; choice?: string }
  // Travel along known ways to a place the company knows (see Travel): leg after leg, until it arrives or something
  // wants a decision.
  | { kind: 'travel'; destination: string }
  | { kind: 'checkpoint' }
  // The whole story so far, for the Story page: frames carry only its last entries.
  | { kind: 'story' }
  // Whether the page kept the world it was sent (see the saved message): until it says so, the world is sent again.
  | { kind: 'kept'; key: string; ok: boolean };
export interface Envelope { id: number; request: Request }
// What a kept game says about itself on the title: the campaign, where the company is, when, and who.
export interface SaveSummary { title: string; where: string; when: string; company: string }
export type Message =
  | { kind: 'reply'; id: number; value?: unknown; error?: string }
  | { kind: 'frame'; frame: Frame }
  // The game to keep in this browser, once a command is done (sent after its frame, so play does not wait on it):
  // packed small (see SaveCodec), with what the title page says of it.
  // The game kept after a command: its state, and its world the first time it is kept or after it changes.
  // key: the world the state was kept against, which a state is kept beside and no other.
  | { kind: 'saved'; save: string; summary: SaveSummary; key: string; world?: { key: string; text: string } }
  // A game the engine could not keep (it was not kept, and nobody was told: the architecture review's M8).
  | { kind: 'unkept'; reason: string }
  | { kind: 'progress'; stage: string };
