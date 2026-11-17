import type { ReactNode } from 'react';

// The one page (the owner, 16 November night: "a page should always be -- a background, a header, narrative/description
// block, the four promoted actions, and possibly an icon rail at the bottom"): whatever the surface (the title, a step of
// a life, the opening, a place, a conversation, a fight), it is these five, each in its slot, and nothing pressable
// stands outside the menu and the rail (test/action-census-browser holds it). A slot lays nothing out of its own
// (display: contents): the surface's stylesheet places what is in it, so that the structure is one while the pages
// keep their compositions. The menu's rows are ChoiceRow's, the rail's marks the rail's.
export interface PageParts {
  // What the page is (data-page), and its own classes for its composition.
  kind: string; className?: string;
  background?: ReactNode; header?: ReactNode; narrative?: ReactNode; menu?: ReactNode; rail?: ReactNode;
  // What lies over the page and is not of it: a painting's credit, a toast.
  over?: ReactNode;
  // The page's own attributes (aria-label, data-beat).
  attrs?: Record<string, string | undefined>;
  // A body: where the surface sets its header, narrative and menu in one box of its own (the page's main); hidden while
  // it is not yet to be read (the title under the studio's mark).
  body?: string; hidden?: boolean;
  // The header standing apart from the body, beside it (a conversation's likeness and name, beside what is said).
  apart?: boolean;
  // A column inside the body holding the narrative and the menu together (a step of a life: its telling over its rows).
  column?: string;
}
export class PageFrame {
  static View({ kind, className, background, header, narrative, menu, rail, over, attrs, body, hidden, apart,
    column }: PageParts) {
    const head = header && <div className="slot" data-slot="header">{header}</div>;
    const told = <>
      {narrative && <div className="slot" data-slot="narrative">{narrative}</div>}
      {menu && <div className="slot" data-slot="menu" data-menu>{menu}</div>}
    </>;
    const slots = <>{!apart && head}{column ? <div className={column}>{told}</div> : told}</>;
    return (
      <article className={`page-frame${className ? ` ${className}` : ''}`} id="page" data-page={kind} {...attrs}>
        {background && <div className="slot" data-slot="background">{background}</div>}
        {apart && head}
        {body ? <main className={body} aria-hidden={hidden || undefined}>{slots}</main> : slots}
        {rail && <div className="slot" data-slot="rail" data-rail>{rail}</div>}
        {over}
      </article>
    );
  }
}
