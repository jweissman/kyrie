import type { ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';

// One choice of creation drawn in the game's own grammar (the first touch, ?touch: the owner, 15 November: most of
// creation's decisions "should use the normal highlighted action-menu grammar, not their own card interfaces"): a row
// of one line, its words and a quiet aside on the same line, its number at the right, marked at the left when it is the
// one already chosen. A press is the choice made and the page gone on (see ComposedCreation); the hand or the keys on
// it only consider it (onConsider), which the page shows and the engine never hears.
// A card (ancestry, calling) is the same act drawn larger: its emblem, its name and its line.
export interface Option { id: string; name: string; aside?: string; glyph?: string; shut?: string }
export class ComposedRow {
  static View({ option, n, chosen, lit, onConsider, onChoose, hold, children }: { option: Option; n?: number;
    chosen?: boolean; lit?: boolean; onConsider: (id: string) => void; onChoose: (id: string, held: boolean) => void; hold?: boolean;
    children?: ReactNode }) {
    return (
      <button type="button" className={`composed-row${chosen ? ' chosen' : ''}`} data-nav data-touch-row
        data-option={option.id} disabled={!!option.shut} aria-current={chosen || undefined}
        data-considered={lit || undefined} {...hold ? { 'data-touch-hold': 'commit' } : {}}
        onMouseEnter={() => ComposedRow.moved() && onConsider(option.id)} onFocus={() => onConsider(option.id)}
        onClick={e => onChoose(option.id, e.currentTarget.dataset.held !== undefined)}>
        <i className="row-mark" aria-hidden="true" />
        <span className="row-label">{Typography.curl(option.name)}</span>
        <span className="row-aside">{Typography.curl(option.shut ?? option.aside ?? '')}</span>
        {children}
        {n !== undefined && <kbd className="row-key" aria-hidden="true">{n}</kbd>}
      </button>
    );
  }
  // Whether the hand has moved since the page changed (see PressGuard): a hand at rest considers nothing it is over.
  static moved(): boolean { return document.documentElement.dataset.still === undefined; }
  static Card({ option, chosen, lit, onConsider, onChoose }: { option: Option; chosen?: boolean; lit?: boolean;
    onConsider: (id: string) => void; onChoose: (id: string) => void }) {
    return (
      <button type="button" className="card composed-card" data-nav data-option={option.id} data-chosen={chosen || undefined}
        disabled={!!option.shut} aria-current={chosen || undefined} data-considered={lit || undefined}
        onMouseEnter={() => ComposedRow.moved() && onConsider(option.id)} onFocus={() => onConsider(option.id)}
        onClick={() => onChoose(option.id)}>
        {option.glyph && <Glyphs.View id={option.glyph} name={option.name} />}
        <span className="card-name">{Typography.curl(option.name)}</span>
        <span className="card-line">{Typography.curl(option.shut ?? option.aside ?? '')}</span>
      </button>
    );
  }
}
