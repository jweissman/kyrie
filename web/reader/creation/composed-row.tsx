import type { MouseEvent, ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';
import { PressGuard } from '../press-guard';
import { ChoiceRow } from '../stage/choice-row';

// One choice of creation drawn in the game's own grammar (the owner, 15 November: most of
// creation's decisions "should use the normal highlighted action-menu grammar, not their own card interfaces"): a row
// of one line, its words and a quiet aside on the same line, its number at the right, marked at the left when it is the
// one already chosen. A press is the choice made and the page gone on (see ComposedCreation); the hand or the keys on
// it only consider it (onConsider), which the page shows and the engine never hears.
// Ancestry and calling are rows too, their emblem beside the name (the owner, M19: icons beside ancestry and calling
// names; M22's second review, OR-42: a grid of cards had been a second control with its own focus and hold).
// What is chosen is chosen at a press, a tap, or the keys' Enter (the owner, 23 November, OR-169: no long presses; it
// had been held, 16 November), and Back undoes it; the second click of a double press is not a second choice
// (PressGuard.once): the page after it came under the hand; nor of a row that turns a page or rolls again.
export interface Option { id: string; name: string; aside?: string; glyph?: string; shut?: string }
export class ComposedRow {
  // The mark of the one chosen before (come back to): the entry's gold on its mark alone, its ground the row's own (a
  // tone's name would tint the whole row: menu.css).
  static readonly before = 'var(--accent, #d9b46a)';
  // taken: committed, held taken while the engine answers (ReaderState.waiting): lit fully and marked so.
  static View({ option, n, chosen, lit, taken, onConsider, onChoose, children }: { option: Option; n?: number;
    chosen?: boolean; lit?: boolean; taken?: boolean; onConsider: (id: string) => void; onChoose: (id: string) => void;
    children?: ReactNode }) {
    // The one row (ChoiceRow), as every menu's: the one already chosen marked in the entry's gold.
    const own = { 'data-nav': true, disabled: !!option.shut, 'aria-current': chosen || taken || undefined,
      ...taken ? { 'data-taken': true } : {},
      'data-considered': lit || undefined, onMouseEnter: (e: MouseEvent<HTMLButtonElement>) => ComposedRow.hand(e.currentTarget)
        && onConsider(option.id), onFocus: () => onConsider(option.id),
      ...PressGuard.once(() => onChoose(option.id)) };
    return <ChoiceRow.Button className={`composed-row${chosen || taken ? ' chosen' : ''}`} data={{ option: option.id }} own={own}
      plain={chosen || taken ? 'chosen' : 'neutral'}
      label={option.glyph ? <><Glyphs.View id={option.glyph} className="row-glyph" />{Typography.curl(option.name)}</>
        : Typography.curl(option.name)}
      aside={Typography.curl(option.shut ?? option.aside ?? '')} extra={children} {...n !== undefined ? { number: n } : {}} />;
  }
  // The hand come to a choice that has moved since the page changed: the keys' focus goes with it, so that one choice
  // is lit, never the hand's and the keys' both (the owner, 16 November: two names lit at once on the name page).
  static hand(el: HTMLElement): boolean {
    if (!ComposedRow.moved()) { return false; }
    el.focus({ preventScroll: true });
    return true;
  }
  // Whether the hand has moved since the page changed (see PressGuard): a hand at rest considers nothing it is over.
  static moved(): boolean { return document.documentElement.dataset.still === undefined; }
}
