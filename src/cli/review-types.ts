// The journey review's artifact (the adventure-structure brief, mission-22/adventure-structure-brief.md §6; ST-08's
// Phase A): a played journey kept step by step as the player met it, each step's scene before and after, what was
// offered and chosen, what the world did, and where each line told was made, where that is known exactly. Its own
// version, apart from the transcript's: it is not needed to resume a game, and a transcript is not made larger by it.
import type { Transcript } from '../session/play-session';

// Where a line or a choice was made. kyr: a declaration of a Kyr module (its namespace, its id, of what type, and by
// which of the engine's records it was carried: a perception, the act's result). template: an entry of a voice table.
// engine: words the engine makes of its own (a heading, a blow of a fight). unknown: not known, and why; never guessed.
export type SourceRef =
  | { kind: 'kyr'; module: string; declaration: string; type?: string; via?: string }
  | { kind: 'template'; table: string; entry: string; via?: string }
  | { kind: 'engine'; producer: string }
  | { kind: 'unknown'; reason: string };
// How exactly a line's making is known: exact (the declaration or table entry that wrote it), producer (only what
// made it: the engine, or the person or thing it is of), unknown.
export type Exactness = 'exact' | 'producer' | 'unknown';
// A line as shown, in order: the opening's (prologue), the place's heading, the narration (prose), and what the scene
// says for reference after it (the aim, what is needed, the instruments).
export interface ToldLine { text: string; role: 'prologue' | 'heading' | 'prose' | 'reference'; exact: Exactness;
  sources: SourceRef[] }
// A choice as offered, in order: what pulls next, the four (led among them, where the aim followed leads), the rest.
// Its makers, which are the same wherever it is offered, are kept once for the artifact, by its id (makers).
// why, note: of one of the four the glance led with, its reason (Promoted.why: named, advance, own…) and that reason
// in words ("your aim"), as the glance gave them (the AT-09 analysis: the reason had been dropped before the review).
export interface ReviewChoice { id: string; label: string; group: 'next' | 'primary' | 'rest' | 'fight'; led?: true;
  aspects?: string[]; aside?: string; why?: string; note?: string }
export interface Maker { type?: string; exact: Exactness; sources: SourceRef[] }
// A scene as the player was shown it: when and where, the lines, the offer, the aims, and the world in a word.
export interface ReviewFrame {
  n: number; turn: number; moment: string; elapsed: number; clock: string; place: { id: string; name: string };
  lines: ToldLine[]; offer: ReviewChoice[];
  aim?: string; aims?: { id: string; text: string; followed?: true }[]; need?: string[];
  purse?: { coin: number; rations: number }; you?: string; company?: string[];
  ending?: { title: string; lines: string[] };
  // The world's own choices offered in the frame before, at the same place, that the world no longer allows, though
  // the step did not take them (PlayerView.choices): a way shut by what was learned or by a check failed (AT-09).
  withdrawn?: { id: string; label: string }[];
  digest: string;
}
// What a step did to the world, in its own terms: facts written and taken away, measures changed, what was learned,
// who went where, what came into or went out of the company's hands, the aims, the time; and of it, what was done by
// the world's own rules and people without the player, each by what did it.
export interface ReviewDelta {
  asserted: string[]; retracted: string[];
  measures: { measure: string; before?: number; after?: number }[];
  learned: string[]; moved: { who: string; from?: string; to?: string }[];
  gained: string[]; lost: string[];
  aims: { taken: string[]; retired: string[]; followed?: { from?: string; to?: string } };
  elapsed: number;
  // Each part of the change by what made it: the act itself (the command), a rule, someone else's act, or not known.
  by: { source: SourceRef; changes: string[] }[];
}
// A step: the line the player sent, what it was in the scene before (its label and where it stood), the scene before
// and after (by their frames' numbers), what happened, what changed. consequential: it passed time, changed the
// world, taught something, changed an aim or moved the company (§5.3); counted, its number among those.
export interface ReviewStep {
  n: number; line: string; before: number; after?: number;
  chosen?: { command: string; label: string; from: string; grave?: string };
  error?: string; events: { action: string; result: string; response?: string; elapsed: number }[];
  delta: ReviewDelta; consequential: boolean; consequence?: number; mark: number;
}
// The artifact: what it is of, by what build, whether its frames were recorded as the journey was played (live) or
// made again by replaying another artifact's transcript (replay), never one written over the other.
export interface JourneyReviewV1 {
  version: 1; kind: 'journey-review'; generatedAt: string;
  revision: { commit: string; dirty: boolean };
  source: { kind: 'live-recorded' | 'replay'; args: string[]; lines?: { file: string; playedAt?: string };
    replayedAgainst?: { file: string; revision: { commit: string; dirty: boolean } }; transcript: Transcript };
  frames: ReviewFrame[]; steps: ReviewStep[]; makers: Record<string, Maker>;
  // A replay's verdicts against the artifact it replayed (§15.15): state, offer and presentation, each its own.
  verdicts?: { step: number; state: 'same' | 'differs'; offer: 'same' | 'changed' | 'not offered';
    presentation: 'same' | 'differs' }[];
  coverage: Coverage;
}
// How much of what was shown is known by its making: lines, words and choices, each exact, producer, unknown.
export interface Coverage {
  lines: Record<Exactness, number>; words: Record<Exactness, number>; prose: Record<Exactness, number>;
  proseWords: Record<Exactness, number>; choices: Record<Exactness, number>;
  unknown: { reason: string; lines: number; words: number }[];
}
