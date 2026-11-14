import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import { CreationDefaults } from '../../engine/creation-defaults';
import { Card } from './card';
import { OriginStep } from './origin-step';
import type { Option } from './composed-row';

// What each step of the engine's creation flow offers, as the first touch draws it (see ComposedCreation): the options
// in the engine's order (CreationFlow: the four it leads with first), whether they are cards (ancestry and calling keep
// theirs), and the sentence each is considered by. Words only: every option is the flow's card, and choosing one is
// the flow's choose.
export interface Offer { options: Option[]; cards?: boolean; all?: boolean; say: (id: string) => string }
export class ComposedOptions {
  static of(app: ReaderApp, step: CreationStep, roll: number): Offer {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, origins = s.setting?.origins ?? [];
    const line = (id: string) => step.cards.find(c => c.id === id)?.line ?? '';
    const text = (id: string) => { const c = step.cards.find(x => x.id === id); return c?.text ? Card.sentence(c.text) : c?.line ?? ''; };
    if (step.id === 'why') {
      return { options: step.cards.map(c => ({ id: c.id, name: c.name, aside: OriginStep.rule(origins.find(o => o.id === c.id)
        ?.background, catalog, m.pronouns), ...c.shut ? { shut: c.shut } : {} })), say: line };
    }
    if (step.id === 'you' || step.id === 'calling') {
      return { cards: true, options: step.cards.map(c => ({ id: c.id, name: c.name, aside: c.line ?? '', glyph: c.emblem ?? c.id,
        ...c.shut ? { shut: c.shut } : {} })), say: text };
    }
    if (step.id === 'sign') {
      const signs = catalog.signs;
      return { all: true, options: step.cards.map(c => ({ id: c.id, name: c.name.replace(/^the /, 'The '),
        aside: signs.find(x => x.id === c.id)?.month ?? '' })), say: (id: string) => signs.find(x => x.id === id)?.line ?? '' };
    }
    if (step.id === 'before') {
      return { options: step.cards.map(c => ({ id: c.id, name: c.name, ...c.shut ? { shut: c.shut } : {} })), say: line };
    }
    if (step.id === 'presenting') {
      return { all: true, options: step.cards.map(c => ({ id: c.id, name: c.name, aside: ComposedOptions.pronouns[c.id] ?? '' })),
        say: () => 'The words the world will speak of you in.' };
    }
    const table = CreationDefaults.table(m, s.setting, roll);
    return { all: true, options: table.map(name => ({ id: name, name })), say: () => '' };
  }
  static readonly pronouns: Record<string, string> = { she: 'she, her', he: 'he, him', they: 'they, them' };
}
