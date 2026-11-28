import type { ReactNode } from 'react';
import type { Backdrop as Kind } from '../../src/creation/opening-pages';
import { Backdrop } from './embers';

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
  // The theme the engine's page hints (PageHints.theme): the backstage's folio (Folio.theme, OR-1073), which the frame
  // applies, never the page: the dark table under the whole page, the header a quiet line on it, and the narrative and
  // menu on one parchment leaf of one size (.folio-leaf, scrolling, holding .folio-sheet), as every page of the Book is.
  theme?: 'folio';
  // What stands behind the page as the engine hints it (PageHints.backdrop): drawn by the frame under whatever the page
  // sets in its background (an instrument, the sky), never chosen by the page (creation's curtain, OR-1800).
  backdrop?: Kind;
}
export type Slot = 'background' | 'header' | 'narrative' | 'menu' | 'rail';
export class PageFrame {
  // What makes an element one of a page's slots: the only way a menu or a rail is marked (test/small/page-slots holds
  // that nothing else writes the marks), so that what the census counts as the menu is what PageFrame made one.
  static slot(name: Slot): Record<string, string | boolean> {
    return { 'data-slot': name, ...name === 'menu' ? { 'data-menu': true } : name === 'rail' ? { 'data-rail': true } : {} };
  }
  static View({ kind, className, background, header, narrative, menu, rail, over, attrs, body, hidden, apart,
    column, theme, backdrop }: PageParts) {
    const head = header && <div className="slot" {...PageFrame.slot('header')}>{header}</div>;
    const told = <>
      {narrative && <div className="slot" {...PageFrame.slot('narrative')}>{narrative}</div>}
      {menu && <div className="slot" {...PageFrame.slot('menu')}>{menu}</div>}
    </>;
    const inner = column ? <div className={column}>{told}</div> : told;
    const slots = <>{!apart && head}{theme ? PageFrame.leaf(inner) : inner}</>;
    return (
      <article className={`page-frame${className ? ` ${className}` : ''}`} id="page" data-page={kind}
        {...theme ? { 'data-theme': theme } : {}} {...attrs}>
        {(background || backdrop) && <div className="slot" {...PageFrame.slot('background')}>
          <Backdrop.View kind={backdrop} />{background}</div>}
        {apart && head}
        {body ? <main className={body} aria-hidden={hidden || undefined}>{slots}</main> : slots}
        {rail && <div className="slot" {...PageFrame.slot('rail')}>{rail}</div>}
        {over}
      </article>
    );
  }
  // The folio's one leaf: what scrolls, and the parchment in it (the Book's pages are the same two: BookStage).
  static leaf(inside: ReactNode) {
    return <div className="folio-leaf"><div className="folio-sheet">{inside}</div></div>;
  }
}
