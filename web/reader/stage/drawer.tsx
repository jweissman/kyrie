import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Raised, type Sheet } from './raised';

// A sheet raised over a place's glance (see Raised): from the right on a desk or a tablet held sideways, from the foot
// of a screen held upright; its title and a cross at its head, held there while it scrolls; a touch beside it, the
// cross or Esc puts it away. The page under it stays where it was.
export class Drawer {
  static View({ app, sheet, title, shut, children }: { app: ReaderApp; sheet: Sheet; title: string; shut: string;
    children: ReactNode }) {
    return <>
      <div className="shade" aria-hidden="true" onClick={() => Raised.raise(app)} />
      <section className={`drawer drawer-${sheet}`} role="dialog" aria-modal="true" aria-label={title} data-sheet={sheet}>
        <div className="sheet-head">
          <p className="sheet-title">{Typography.curl(title)}</p>
          <button type="button" className="sheet-shut" aria-label={`Put away: ${title}`} data-action={shut}
            onClick={() => Raised.raise(app)}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </section>
    </>;
  }
}
