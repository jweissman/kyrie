import type { CreationCard, CreationPresent } from './creation-flow';

// How a game is come to, the first things asked of it, each the engine's question and rows for every client: the page
// draws them as the title's rows, the terminal as its numbered lines (its `adventure` with no world named).
//
// How a new game begins (OR-120; OR-301): a life made step by step (CreationFlow), or "A new life, at once" (the
// owner's "We enter the world as we are" its line), one drawn whole and able from the flow's own defaults and set out
// with at once (EngineCreation.rolled). It is asked before any country is drawn, so it needs none: the page shows it
// at once while the world it will begin in is drawn behind the title, and the life it would roll made ready there
// (the seam for AX-04's pre-rolled world: ReaderOpening.foresee asks EngineForesight.ahead at the title's load).
export type Beginning = 'build' | 'set-out-now';
// The rest of New Game's rows (OR-1072): Back to the title, a row as every page's way back is. Which map a new life is
// drawn on is no longer asked (the owner's playtest, 26 November, OR-1271: "Map (your saved game's)" said neither what
// stays nor what changes): every new life begins in a country never seen.
export type BeginRow = Beginning | 'back';
// Where a game is kept here (its seed): said on the acts that set out, which replace it.
export interface Where { kept?: string }
export interface FirstStep {
  id: 'begin'; ask: string; present: CreationPresent; all: true; chosen: Beginning;
  cards: (CreationCard & { id: BeginRow })[];
}
// The title's ways in (the owner, 26 November, OR-1072: "keep 'Continue / New Game / Options / Quit' as the core
// four"): Continue the game kept here (only where it is still going and has not been refused), and New Game, which asks
// how the new life begins and, where a country is kept, in which world (step: the choice OR-300 had made two rows of
// the title, New character and New world). Each is its own row, by its id; what each does is said to a reader.
export type Way = 'continue' | 'begin';
// A game kept where the title is shown, as its summary says it: where and when it was left, whether it has ended, the
// seed its country was drawn from (a drawn country), and why it could not be opened, once tried and refused. During
// beta a game kept by an earlier build is tried, never migrated; if it cannot be opened, that is said and remembered.
export interface Kept { where?: string; when?: string; ended?: boolean; seed?: string; refused?: string }
export interface TitleStep {
  id: 'title'; ask: string; chosen: Way; all: true; cards: (CreationCard & { id: Way; said: string })[];
  // A line the title says of the game kept here where it could not be opened: plainly, never a row.
  told?: string;
}
// What can be done from the game, paused (the in-game Options): back to it, or to the title, where it stays kept.
export type Paused = 'back' | 'title';
export interface PausedStep { id: 'options'; ask: string; chosen: Paused; cards: (CreationCard & { id: Paused })[] }
export class FirstChoice {
  // New Game's question: how the life begins, in a country never seen; and Back to the title. Where a game is kept
  // here, each act that sets out says in its own words that the saved game is replaced then (OR-1271); with none kept,
  // nothing is said of one.
  static step(where: Where = {}): FirstStep {
    const replaced = where.kept ? ' Your saved game is replaced as this life sets out.' : '';
    return { id: 'begin', ask: 'How will you begin?', present: 'rows', all: true, chosen: 'build', cards: [
      { id: 'build', name: 'Create a character', line: 'Choose who you are, step by step.',
        say: `Your people, your calling, the stars you were born under and what you did before.${replaced}` },
      // Its label short and literal (OR-301: the owner, 24 November, "far too long"); the literary words its line's.
      { id: 'set-out-now', name: 'A new life, at once', line: 'We enter the world as we are: whole, able and ready.',
        say: `We enter the world as we are: a life of this country, whole as the world would make it.${replaced}` },
      { id: 'back', name: 'Back', say: 'Back to the title.' }] };
  }
  // The title's ways in: New Game always, first (the owner's play, 27 November, OR-1683: "'New Game' needs to be at
  // the top"), then Continue where the kept game is going and not refused. The keys are on the first offered.
  static title(kept?: Kept): TitleStep {
    const at = [kept?.where, kept?.when].filter(Boolean).join(' · ');
    const cards: TitleStep['cards'] = [{ id: 'begin', name: 'New Game', said: 'New Game: a new life' }];
    if (FirstChoice.continues(kept)) { cards.push({ id: 'continue', name: 'Continue', said: `Continue${at ? `: ${at}` : ''}` }); }
    return { id: 'title', ask: 'Ways in', chosen: cards[0]!.id, all: true, cards,
      ...kept?.refused ? { told: FirstChoice.refusal(kept.refused) } : {} };
  }
  static continues(kept?: Kept): kept is Kept { return !!kept && !kept.ended && !kept.refused; }
  // A kept game this build could not open, said plainly on the title and in the terminal.
  static refusal(reason: string): string {
    return `The game kept here cannot be opened by this edition, so it cannot be continued: begin a new game. `
      + `(${reason})`;
  }
  // The in-game Options' ways (the owner, 23 November: "an options menu within the game, like a pause menu").
  static paused(): PausedStep {
    return { id: 'options', ask: 'Options', chosen: 'back', cards: [
      { id: 'back', name: 'Back to the game' }, { id: 'title', name: 'Return to title' }] };
  }
  // A seed at random, as the title names one (page and terminal alike); a new life's is drawn by the engine from these
  // (FreshSeeds), never used as it comes.
  static seed(): string {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return [...bytes].map(b => 'bcdfghjklmnprstvwz'[b % 18]! + 'aeiou'[(b >> 5) % 5]!).join('');
  }
  static is(value: string): value is Beginning { return value === 'build' || value === 'set-out-now'; }
}
