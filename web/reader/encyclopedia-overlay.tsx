import { useEffect, type MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';

// The encyclopedia while a game is played: an entry opens over the game, in the game, and is put away to go on where
// one was; the whole encyclopedia is a link of its own, said to open apart (the owner's play of 10 November: an entry
// had taken the player out of the game to another page, with nothing to say so).
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
  static View({ app }: { app: ReaderApp }) {
    const entry = app.state.entry, close = () => app.setState({ entry: undefined });
    useEffect(() => {
      if (!entry) { return undefined; }
      const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
      window.addEventListener('keydown', key, true);
      return () => window.removeEventListener('keydown', key, true);
    });
    if (!entry) { return null; }
    return (
      <div className="enc-overlay" role="dialog" aria-modal="true" aria-label="The encyclopedia" onClick={close}>
        <div className="enc-frame" onClick={e => e.stopPropagation()}>
          <header className="enc-head">
            <p className="label">The encyclopedia</p>
            <a className="enc-apart quiet-word" href="encyclopedia/index.html" target="_blank" rel="noopener">
              The whole encyclopedia, in a new tab ↗</a>
            <button type="button" className="option enc-close" data-action="close-entry" onClick={close}>Close</button>
          </header>
          <iframe className="enc-page" src={entry} title="The encyclopedia" />
        </div>
      </div>
    );
  }
}
