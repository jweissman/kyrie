import type { Choice, Section } from '../src/ui/choice-list';
import type { CombatScreen, Screen } from '../src/ui/screen-types';

// What is on the page. Play happens in one frame: the page (exploring, or a fight), with the company, the pack, the
// journal and the full map drawn over it as views of the same game, never as separate applications.
export type Mode = 'title' | 'campaigns' | 'create' | 'explore' | 'pack' | 'party' | 'journal' | 'map' | 'combat';
export const Views: Mode[] = ['pack', 'party', 'journal', 'map'];

// One thing that happened, as the page tells it: what the company did, in the player's words (an arrival has none),
// what came of it, and the margin notes (coin spent, something noted in the journal).
export interface Entry {
  at: string; elapsed: number; place: string; placeName: string;
  said?: string; arrival?: boolean;
  lines: string[]; notes: string[];
  tone: 'act' | 'fight' | 'note' | 'fail';
  // The same entry as a log line, for tests and the saved history: a title and its lines.
  title: string;
}

export interface PlayState {
  mode: Mode; screen?: Screen; combat?: CombatScreen;
  // How a fight began, as it was seen: the moment that started it.
  opening: string[];
  // The choices on show: every section at the top level, or the list a choice opened (trail names the way in).
  sections: Section[]; level: Choice[]; trail: Choice[]; cursor: number;
  log: Entry[];
  // While a command is being carried out: what the company is doing.
  pending: boolean; doing?: string;
  error: string; history: boolean; narrow: boolean;
  chronicle: { at: string; text: string; detail: string[] }[];
}
