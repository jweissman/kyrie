import type { ChangeEvent, MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Likeness } from '../../src/paintings/likeness';

// The title: carry on where you were, or begin in a country you have never seen. Nothing here says how the country
// is made. A save file brought from elsewhere and the handbooks are at the foot; the ways in that are for testing
// (a named campaign, a seed) only appear when the address asks for them (?dev).
export class TitlePage {
  // The country on the title: a painting of wide country with a way into it, a different one each day, set as a plate
  // with its credit as far as the painting itself says.
  static readonly views = ['indolence', 'idyll', 'bridge', 'wintre', 'fair', 'herd', 'city', 'harvest'];
  static view(day = Math.floor(Date.now() / 86400000)): string { return TitlePage.views[day % TitlePage.views.length]!; }
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, saved = s.saved, dev = app.props.query.has('dev'), view = TitlePage.view();
    return (
      <div className="opening title-page" data-mode="title">
        <figure className="plate" aria-hidden="true">
          <img src={`paintings/large/${view}.webp`} alt="" decoding="async"
            onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} />
          <figcaption>{Likeness.credits[view] ?? 'Painter unrecorded'}</figcaption>
        </figure>
        <main>
          <h1 className="mark">Kyr</h1>
          <p className="lede">A country that was there before you, people who live in it, and the road out of town.</p>
          <ul className="begin">
            {saved && <li><button type="button" className="act door" data-nav data-action="continue" onClick={app.opening.carryOn}>
              <span className="n">Continue</span><span className="why">{[saved.where, saved.when].filter(Boolean).join(' · ')}</span>
            </button></li>}
            <li><button type="button" className={`act door${saved ? '' : ' first'}`} data-nav data-action="begin" onClick={app.opening.anew}>
              <span className="n">Begin</span><span className="why">Somewhere you have never been, as someone with a reason to be there.</span>
            </button></li>
          </ul>
          <p className="small-ways">
            <label data-nav tabIndex={0} data-action="load-file">Open a save file
              <input type="file" id="load" accept="application/json" hidden onChange={TitlePage.load.bind(null, app)} /></label>
            <button type="button" className="link" data-nav data-action="options"
              onClick={TitlePage.options.bind(null, app)}>Options</button>
            <a href="handbook/index.html">The handbooks</a>
          </p>
          {dev && <TitlePage.Dev app={app} />}
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  // For testing: every campaign the build carries, by name, and the generated country by its seed.
  static Dev({ app }: { app: ReaderApp }) {
    const campaigns = app.state.catalog?.campaigns ?? [];
    return (
      <section className="dev" aria-label="Testing">
        <p className="label">Testing</p>
        <ol>{campaigns.map(c => <li key={c.id}><button type="button" className="act" data-nav data-action="campaign"
          data-id={c.id} onClick={TitlePage.pick.bind(null, app)}>{c.title}</button> <span className="note">{c.seed}</span></li>)}</ol>
      </section>
    );
  }
  private static options(app: ReaderApp) { app.setState({ phase: 'options' }); }
  private static pick(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { void app.opening.pick(e.currentTarget.dataset.id!); }
  private static load(app: ReaderApp, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { void file.text().then(text => app.opening.resume(text)); }
  }
}
