import { useEffect, type MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Folio } from '../../src/handbook/folio';
import { Signs } from '../../src/presentation/signs';
import { Typography } from '../../src/presentation/typography';
import { Act } from './stage/act';
import { PlaceMark } from './stage/place-mark';

// The encyclopedia while a game is played: an entry opens over the game, in the game, and is put away to go on where
// one was; the whole encyclopedia is a link of its own, said to open apart (the owner's play of 10 November: an entry
// had taken the player out of the game to another page, with nothing to say so). It is a page of the Book as the
// others are (the owner, 27 November: "the change in tone for the encyclopedia is really galling"; OR-1830): the
// backstage's folio (Folio.theme) applied as BookStage applies it, its head the Book's quiet line on the table, the way
// back a quiet word naming where it goes back to (a page of the Book, or the place), not a boxed Close over it; the
// encyclopedia's own head (its chapters) on the same table beneath it, its leaf where the Book's is.
export class EncyclopediaOverlay {
  static readonly link = 'a[href^="encyclopedia/"]';
  // A link into the encyclopedia, clicked in play: opened over the game, not followed.
  static caught(app: ReaderApp, e: MouseEvent): void {
    if (app.state.phase !== 'play' || e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>(EncyclopediaOverlay.link);
    if (!a) { return; }
    e.preventDefault();
    app.setState({ entry: a.getAttribute('href')! });
  }
  // Where putting it away goes back to: the page of the Book it was opened from, else the place.
  static back(app: ReaderApp): string | undefined {
    const page = Act.named(app)[app.state.view]?.[0];
    return page ?? app.state.frame?.screen.place.name;
  }
  static View({ app }: { app: ReaderApp }) {
    const entry = app.state.entry, close = () => app.setState({ entry: undefined });
    useEffect(() => {
      if (!entry) { return undefined; }
      const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
      window.addEventListener('keydown', key, true);
      return () => window.removeEventListener('keydown', key, true);
    });
    if (!entry) { return null; }
    const here = !Act.named(app)[app.state.view];
    return (
      <div className="enc-overlay" data-theme={Folio.theme} role="dialog" aria-modal="true" aria-label="The encyclopedia">
        <header className="book-head">
          <button type="button" className="quiet-word back-to" data-action="close-entry" onClick={close}>
            <span className="back-sign" aria-hidden="true">{Signs.way('Out')}</span>
            {here && <PlaceMark.Dash app={app} />}{Typography.curl(EncyclopediaOverlay.back(app) ?? 'Back')}</button>
          {/* Said whole where there is room, and as where it opens on a phone, so the head stays one line. */}
          <a className="enc-apart quiet-word" href="encyclopedia/index.html" target="_blank" rel="noopener">
            <span className="enc-whole">The whole encyclopedia, in</span><span className="enc-narrow">In</span>
            {' a new tab ↗'}</a>
        </header>
        <iframe className="enc-page" src={entry} title="The encyclopedia" />
      </div>
    );
  }
}
