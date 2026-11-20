import type { CreationCard, CreationPresent } from './creation-flow';

// How a new game begins, the first thing asked of it (the owner, 19 November, night, OR-120: "our first choice in new
// game should be 'build a character' or 'set out now' with the immediate option leading to being in the game in under
// a second"): a life made step by step (CreationFlow), or one drawn for the player from the flow's own defaults and set
// out with at once (EngineCreation.rolled). Asked as any step of creation is, its question and its two rows the
// engine's, for every client: the page draws them as the title's rows, the terminal as numbered lines. It is asked
// before any country is drawn, so it needs none: the page shows it at once, while the world it will begin in is still
// being drawn behind the title (see EngineForesight).
export type Beginning = 'build' | 'set-out-now';
export interface FirstStep {
  id: 'begin'; ask: string; present: CreationPresent; all: true; chosen: Beginning;
  cards: (CreationCard & { id: Beginning })[];
}
export class FirstChoice {
  static step(): FirstStep {
    return { id: 'begin', ask: 'How will you begin?', present: 'rows', all: true, chosen: 'build', cards: [
      { id: 'build', name: 'Build a character', line: 'Choose who you are, step by step.',
        say: 'Your people, your calling, the stars you were born under and what you did before.' },
      { id: 'set-out-now', name: 'Set out now', line: 'A life drawn for you, and into the world at once.',
        say: 'Someone of this country, as the world would make them; who they are is learnt on the way.' },
    ] };
  }
  static is(value: string): value is Beginning { return value === 'build' || value === 'set-out-now'; }
}
