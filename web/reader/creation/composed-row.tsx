import type { MouseEvent, ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';
import { Hold } from '../instrument/hold';
import { ChoiceRow } from '../stage/choice-row';

// One choice of creation drawn in the game's own grammar (the owner, 15 November: most of
// creation's decisions "should use the normal highlighted action-menu grammar, not their own card interfaces"): a row
// of one line, its words and a quiet aside on the same line, its number at the right, marked at the left when it is the
// one already chosen. A press is the choice made and the page gone on (see ComposedCreation); the hand or the keys on
// it only consider it (onConsider), which the page shows and the engine never hears.
// A card (ancestry, calling) is the same act drawn larger: its emblem, its name and its line.
// What is chosen is chosen by holding (the owner, 16 November: cards "should definitely require it"): the ring fills at
// the hand and the choice is made when it is full; a tap only considers it and arms it, and a second tap, or an
// assistive technology's click, does it (see Hold). A row that only turns a page or rolls again is a touch.
export interface Option { id: string; name: string; aside?: string; glyph?: string; shut?: string }
export class ComposedRow {
  // The mark of the one chosen before (come back to): the entry's gold on its mark alone, its ground the row's own (a
  // tone's name would tint the whole row: menu.css).
  static readonly before = 'var(--accent, #d9b46a)';
  static View({ option, n, chosen, lit, onConsider, onChoose, hold, children }: { option: Option; n?: number;
    chosen?: boolean; lit?: boolean; onConsider: (id: string) => void; onChoose: (id: string, held: boolean) => void; hold?: boolean;
    children?: ReactNode }) {
    // The one row (ChoiceRow), as every menu's: the one already chosen marked in the entry's gold.
    const own = { 'data-nav': true, disabled: !!option.shut, 'aria-current': chosen || undefined,
      'data-considered': lit || undefined, onMouseEnter: (e: MouseEvent<HTMLButtonElement>) => ComposedRow.hand(e.currentTarget)
        && onConsider(option.id), onFocus: () => onConsider(option.id),
      ...hold ? ComposedRow.held(option.id, onConsider, () => onChoose(option.id, true))
        : { onClick: () => onChoose(option.id, false) } };
    return <ChoiceRow.Button className={`composed-row${chosen ? ' chosen' : ''}`} data={{ option: option.id }} own={own}
      mark={chosen ? ComposedRow.before : ChoiceRow.neutral} label={Typography.curl(option.name)}
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
  // The hold that chooses: a press considers it as it goes down (a finger has no hover), the rest is Hold's.
  static held(id: string, consider: (id: string) => void, commit: () => void) {
    const held = Hold.bind(commit);
    return { ...held, onPointerDown: (e: Parameters<typeof held.onPointerDown>[0]) => {
      e.currentTarget.focus({ preventScroll: true }); consider(id); held.onPointerDown(e); } };
  }
  static Card({ option, chosen, lit, onConsider, onChoose }: { option: Option; chosen?: boolean; lit?: boolean;
    onConsider: (id: string) => void; onChoose: (id: string) => void }) {
    return (
      <button type="button" className="card composed-card" data-nav data-option={option.id} data-chosen={chosen || undefined}
        disabled={!!option.shut} aria-current={chosen || undefined} data-considered={lit || undefined}
        onMouseEnter={e => ComposedRow.hand(e.currentTarget) && onConsider(option.id)} onFocus={() => onConsider(option.id)}
        {...ComposedRow.held(option.id, onConsider, () => onChoose(option.id))}>
        {option.glyph && <Glyphs.View id={option.glyph} name={option.name} />}
        <span className="card-name">{Typography.curl(option.name)}</span>
        <span className="card-line">{Typography.curl(option.shut ?? option.aside ?? '')}</span>
      </button>
    );
  }
}
