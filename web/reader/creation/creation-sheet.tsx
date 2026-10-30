import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Typography } from '../../../src/presentation/typography';

// What is behind Details: a dark veil over the page, its title centred in the hand of creation's questions and its
// words beneath, scrolling downward (the first sheet had been a boxed dialog with a header bar, heavy furniture for a
// line). Close, a quiet word in the corner, Escape (see ReaderKeys) or the dark beside it puts it away; while it is
// open the keys are its own. It is drawn over the whole page, outside the stage that scrolls.
export class CreationSheet {
  static View({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    const close = useRef<HTMLButtonElement>(null);
    useEffect(() => { close.current?.focus({ preventScroll: true }); }, []);
    return createPortal(
      <div className="creation-sheet" role="dialog" aria-modal="true" aria-label={title}
        onClick={(e: MouseEvent) => { if (e.target === e.currentTarget) { onClose(); } }}>
        <button type="button" ref={close} className="quiet-word sheet-close" data-nav data-action="close"
          onClick={onClose}>Close</button>
        <div className="sheet-panel">
          <h2>{Typography.curl(title)}</h2>
          <div className="sheet-body">{children}</div>
        </div>
      </div>, document.body);
  }
}
