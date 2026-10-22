import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';

// Where the company will go: each campaign as a short pitch, the recommended one first.
export class CampaignPage {
  static View({ app }: { app: ReaderApp }) {
    const campaigns = app.state.catalog?.campaigns ?? [];
    return (
      <div className="opening campaign-page" data-mode="campaigns">
        <main className="campaign-sheet">
          <header className="opening-head">
            <button type="button" className="back" onClick={app.opening.title}>Kyr</button>
            <h1>Where will the company go?</h1>
          </header>
          <ol className="cards">
            {campaigns.map((c, i) => (
              <li key={c.id}>
                <button type="button" className={`card${c.recommended ? ' recommended' : ''}`} data-nav
                  data-action="campaign" data-id={c.id} data-index={i} onClick={CampaignPage.pick.bind(null, app)}>
                  <span className="l">{c.title}{c.recommended && <em> start here</em>}</span>
                  <span className="blurb">{c.note}</span>
                  <span className="meta">{c.detail}</span>
                </button>
              </li>
            ))}
          </ol>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  private static pick(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    void app.opening.pick(e.currentTarget.dataset.id!);
  }
}
