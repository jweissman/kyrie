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
export interface FirstStep {
  id: 'begin'; ask: string; present: CreationPresent; all: true; chosen: Beginning;
  cards: (CreationCard & { id: Beginning })[];
}
// The title's ways in (the owner's playtests, 23-24 November, OR-300: "it's not like rolling a new character"):
// Continue the game kept here (only where it is still going and has not been refused), New character (a new life, in
// the world kept here where one is kept, else in a new one), and New world (a new life in a new country, the world kept
// here let go, its seed remembered). Each is its own row, by its id; what each does is said to a reader and a pointer.
export type Way = 'continue' | 'begin' | 'world';
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
  static step(): FirstStep {
    return { id: 'begin', ask: 'How will you begin?', present: 'rows', all: true, chosen: 'build', cards: [
      { id: 'build', name: 'Create a character', line: 'Choose who you are, step by step.',
        say: 'Your people, your calling, the stars you were born under and what you did before.' },
      // Its label short and literal (OR-301: the owner, 24 November, "far too long"); the literary words its line's.
      { id: 'set-out-now', name: 'A new life, at once', line: 'We enter the world as we are: whole, able and ready.',
        say: 'We enter the world as we are: a life of this country, whole as the world would make it.' },
    ] };
  }
  // The title's rows: Continue where the kept game is going and not refused; New character always; New world where a
  // country is kept to let go (with none kept it would be New character under a second name). The keys are on the
  // first offered.
  static title(kept?: Kept): TitleStep {
    const at = [kept?.where, kept?.when].filter(Boolean).join(' · '), world = !!kept?.seed;
    const cards: TitleStep['cards'] = [];
    if (FirstChoice.continues(kept)) { cards.push({ id: 'continue', name: 'Continue', said: `Continue${at ? `: ${at}` : ''}` }); }
    cards.push({ id: 'begin', name: 'New character',
      said: world ? 'New character: a new life in the world kept here' : 'New character: a new life in a new world' });
    if (world) {
      cards.push({ id: 'world', name: 'New world',
        said: 'New world: a new life in a new country, the world kept here let go' });
    }
    return { id: 'title', ask: 'Ways in', chosen: cards[0]!.id, all: true, cards,
      ...kept?.refused ? { told: FirstChoice.refusal(kept.refused) } : {} };
  }
  static continues(kept?: Kept): kept is Kept { return !!kept && !kept.ended && !kept.refused; }
  // The seed a way in begins its new life in: the kept world's for New character, where one is kept; a new one for New
  // world; none named for New character with no world kept (the client's country drawn ahead is the new one).
  static seedFor(way: Exclude<Way, 'continue'>, kept?: Kept): string | undefined {
    return way === 'world' ? FirstChoice.seed() : kept?.seed;
  }
  // A kept game this build could not open, said plainly on the title and in the terminal.
  static refusal(reason: string): string {
    return `The game kept here cannot be opened by this edition, so it cannot be continued: begin a new character or `
      + `a new world. (${reason})`;
  }
  // The in-game Options' ways (the owner, 23 November: "an options menu within the game, like a pause menu").
  static paused(): PausedStep {
    return { id: 'options', ask: 'Options', chosen: 'back', cards: [
      { id: 'back', name: 'Back to the game' }, { id: 'title', name: 'Return to title' }] };
  }
  // The seed a new game's country is drawn from, at random, as the title names it (page and terminal alike).
  static seed(): string {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return [...bytes].map(b => 'bcdfghjklmnprstvwz'[b % 18]! + 'aeiou'[(b >> 5) % 5]!).join('');
  }
  static is(value: string): value is Beginning { return value === 'build' || value === 'set-out-now'; }
}
