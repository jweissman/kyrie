import type { CreationStep } from '../../../src/creation/creation-flow';
import type { Option } from './composed-row';

// What a step of the engine's creation flow offers, as the first touch draws it (see ComposedCreation): its options in
// the engine's order (CreationFlow: the four it leads with first), each with the aside the engine sets beside it and
// its emblem where the step is drawn as cards or asks for them (a school's, a spell's school: OR-92), whether all are shown at once, and the sentence each is considered by.
// Nothing here is a step's own: what a step offers and how it may be drawn are the engine's (PA-04).
export interface Offer { options: Option[]; all?: boolean; say: (id: string) => string }
export class ComposedOptions {
  static of(step: CreationStep): Offer {
    const card = (id: string) => step.cards.find(c => c.id === id);
    return { ...step.all ? { all: true } : {},
      options: step.cards.map(c => ({ id: c.id, name: c.name, aside: c.aside ?? '',
        ...step.present === 'cards' || (step.emblems && c.emblem) ? { glyph: c.emblem ?? c.id } : {}, ...c.shut ? { shut: c.shut } : {} })),
      say: id => card(id)?.say ?? card(id)?.line ?? '' };
  }
}
