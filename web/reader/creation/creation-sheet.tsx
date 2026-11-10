import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';

// What a sheet is of, when it is of one thing chosen: what kind of thing, its emblem and its likeness where it has one,
// and what it is in a sentence (the owner, 5 November: a title, a picture, a summary, then what it means, and back).
export interface SheetHead { kind?: string; glyph?: string; face?: string; summary?: string }

// What is behind Details: a dark veil over the page; of one thing chosen, its head (its likeness or emblem beside
// what kind of thing it is, its name and its sentence), else its title centred in the hand of creation's questions;
// its words beneath, scrolling downward; and Back to the cards at the foot (the first sheet had been a boxed dialog
// with a header bar, heavy furniture for a line). Close in the corner, Escape (see ReaderKeys) or the dark beside it
// puts it away too; while it is open the keys are its own. It is drawn over the whole page, outside the stage. A
// portal's clicks bubble to whatever opened it in React's tree: one on Close or Back to choosing had gone on to the card
// or the step under it, and a cold player was carried a page or two on (Mission 20's second round, B 03–08).
export class CreationSheet {
  static View({ title, onClose, children, head }: { title: string; onClose: () => void; children: ReactNode;
    head?: SheetHead }) {
    const close = useRef<HTMLButtonElement>(null);
    useEffect(() => { close.current?.focus({ preventScroll: true }); }, []);
    return createPortal(
      <div className="creation-sheet" role="dialog" aria-modal="true" aria-label={title}
        onClick={(e: MouseEvent) => { e.stopPropagation(); if (e.target === e.currentTarget) { onClose(); } }}>
        <button type="button" ref={close} className="quiet-word sheet-close" data-nav data-action="close"
          onClick={onClose}>Close</button>
        <div className={`sheet-panel${head ? ' headed' : ''}`}>
          {head ? <header className="sheet-head">
            {head.face ? <img className="sheet-face" src={head.face} alt="" decoding="async" />
              : head.glyph && <Glyphs.View id={head.glyph} className="sheet-glyph" />}
            <div>
              {head.kind && <p className="label">{Typography.curl(head.kind)}</p>}
              <h2>{head.face && head.glyph && <Glyphs.View id={head.glyph} className="sheet-glyph small" />}
                {Typography.curl(title)}</h2>
              {head.summary && <p className="sheet-summary">{Typography.curl(head.summary)}</p>}
            </div>
          </header> : <h2>{Typography.curl(title)}</h2>}
          <div className="sheet-body">{children}
            {head && <p className="sheet-back"><button type="button" className="option" data-nav data-action="sheet-back"
              onClick={onClose}>Back to choosing</button></p>}</div>
        </div>
      </div>, document.body);
  }
}
