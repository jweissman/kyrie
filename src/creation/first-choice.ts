import type { CreationCard, CreationPresent } from './creation-flow';

// How a game is come to, the first things asked of it, each the engine's question and rows for every client: the page
// draws them as the title's rows, the terminal as its numbered lines (and its `adventure` with no world named as Play).
//
// The title (the owner, 23 November, OR-160: "the title says only Play; it continues a game if there is one"): one
// row, Play, which takes up the game kept here where there is one still going, and otherwise asks how a new game
// begins. What Play does is said by the row's id (continue or begin), never by a second row beside it; a kept game
// that has ended, or one that cannot be opened (FirstChoice.played), is not continued: Play begins.
//
// How a new game begins (OR-120; renamed by the owner, 23 November): a life made step by step (CreationFlow), or "We
// enter the world as we are", one drawn whole and able from the flow's own defaults and set out with at once
// (EngineCreation.rolled). It is asked before any country is drawn, so it needs none: the page shows it at once while
// the world it will begin in is drawn behind the title, and the life it would roll made ready there (the seam for
// AX-04's pre-rolled world: ReaderOpening.foresee asks EngineForesight.ahead at the title's load).
export type Beginning = 'build' | 'set-out-now';
export interface FirstStep {
  id: 'begin'; ask: string; present: CreationPresent; all: true; chosen: Beginning;
  cards: (CreationCard & { id: Beginning })[];
}
// What Play does: takes up the game kept here, or begins a new one.
export type Way = 'continue' | 'begin';
// A game kept where the title is shown, as its summary says it: where and when it was left, and whether it has ended.
export interface Kept { where?: string; when?: string; ended?: boolean }
export interface TitleStep { id: 'title'; ask: string; chosen: Way; cards: (CreationCard & { id: Way; said: string })[] }
export class FirstChoice {
  static step(): FirstStep {
    return { id: 'begin', ask: 'How will you begin?', present: 'rows', all: true, chosen: 'build', cards: [
      { id: 'build', name: 'Create a character', line: 'Choose who you are, step by step.',
        say: 'Your people, your calling, the stars you were born under and what you did before.' },
      { id: 'set-out-now', name: 'We enter the world as we are', line: 'A whole life, able and ready, at once.',
        say: 'A life of this country, whole as the world would make it, set out with at once.' },
    ] };
  }
  // The title's one row: Play, continuing the kept game while it is still going, else beginning. said: what it does,
  // for a reader and a pointer (the place and hour of the game it takes up), never written as a line of its own.
  static title(kept?: Kept): TitleStep {
    const way = FirstChoice.continues(kept) ? 'continue' : 'begin';
    const at = [kept?.where, kept?.when].filter(Boolean).join(' · ');
    const said = way === 'continue' ? `Play: continue${at ? `, ${at}` : ''}` : 'Play: begin a new game';
    return { id: 'title', ask: 'Ways in', chosen: way, cards: [{ id: way, name: 'Play', said }] };
  }
  static continues(kept?: Kept): kept is Kept { return !!kept && !kept.ended; }
  // Play pressed where the kept game could not be opened (another edition kept it, or its world is gone): it begins a
  // new game instead, and says why in a line, so that Play is never a way that goes nowhere.
  static played(reason: string): { way: 'begin'; said: string } {
    return { way: 'begin', said: `The game kept here could not be taken up, so a new one begins. (${reason})` };
  }
  // The seed a new game's country is drawn from, at random, as the title names it (page and terminal alike).
  static seed(): string {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return [...bytes].map(b => 'bcdfghjklmnprstvwz'[b % 18]! + 'aeiou'[(b >> 5) % 5]!).join('');
  }
  static is(value: string): value is Beginning { return value === 'build' || value === 'set-out-now'; }
}
