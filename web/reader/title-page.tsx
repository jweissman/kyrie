import type { ChangeEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';

// The title: a saved game first if there is one, a new campaign, or a save file brought from elsewhere.
export class TitlePage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, saved = s.saved;
    return (
      <div className="opening title-page" data-mode="title">
        <main className="title-sheet">
          <h1 className="mark">Kyr</h1>
          <p className="tagline">Three companions, a world that keeps going without them, and the road out of town.</p>
          <nav className="title-menu" aria-label="Begin">
            {saved && <button type="button" data-nav data-action="continue" className="primary"
              onClick={app.opening.carryOn}>
              <span className="l">Continue: {saved.title}</span>
              <span className="note">{[saved.where, saved.when, saved.company].filter(Boolean).join(' · ')}</span>
            </button>}
            <button type="button" data-nav data-action="campaigns" className={saved ? '' : 'primary'}
              onClick={app.opening.campaigns}>
              <span className="l">Begin a new campaign</span>
              <span className="note">Choose where, then who goes.</span>
            </button>
            <label className="file" data-nav tabIndex={0} data-action="load-file">
              <span className="l">Load a saved game</span>
              <span className="note">A file downloaded from the journal.</span>
              <input type="file" id="load" accept="application/json" hidden onChange={TitlePage.load.bind(null, app)} />
            </label>
          </nav>
          <p className="books"><a href="handbook/index.html">The handbooks</a>: every ancestry, calling, spell and
            creature, and how far the game plays each.</p>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  private static load(app: ReaderApp, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { void file.text().then(text => app.opening.resume(text)); }
  }
}
