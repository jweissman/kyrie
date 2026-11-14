import type { CSSProperties } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { TitlePage } from './title-page';

// While the engine draws the country or finds where you left off: what it is doing, said once. Setting out from the
// choice of a life, only that, over the country chosen in: the country's question ("Who comes to Acornweald?") had
// been asked again of one who had just answered it, over the engine's own steps (the opening's critique).
export class LoadingPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, heading = s.setting?.pitch.heading ?? s.saved?.title;
    // Drawing a country after the title, and setting out from the choice of a life, under the title's own sky held as
    // New game left it, the road's dawn far off: one passage from the title into play, not a black page between, nor a
    // blurred photograph while the world is drawn (TO-03, IG-05).
    return (
      <div className={`opening loading sky-page${s.leaving ? ' leaving' : ''}`} data-mode="loading" aria-busy="true"
        data-focus="begin">
        <TitlePage.Sky />
        <main>
          {!s.leaving && heading && <h1>{heading}</h1>}
          <p className="stage" role="status" aria-live="polite">{s.leaving ? 'Setting out' : s.stage || 'Opening'}…</p>
          {s.leaving && <LoadingPage.Steps stage={s.stage} step={s.step} />}
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  // What the engine is doing while the company sets out, step by step as it reports each beginning (M19-49): no
  // share of the whole is guessed at.
  static readonly steps = ['Drawing the world', 'Placing its people', 'Telling where you are'];
  // The step under way breathes, so that the page is plainly alive while the engine works apart from it, and where
  // the engine says how far through it is (so many parts of the world of so many), a thin line fills: a twenty-second
  // wait on an iPad had looked like a page that had stopped (the owner, 11 November).
  static Steps({ stage, step }: { stage: string; step?: [number, number] }) {
    const at = LoadingPage.steps.indexOf(stage);
    if (at < 0) { return null; }
    return <ol className="steps" aria-hidden="true">{LoadingPage.steps.map((name, i) =>
      <li key={name} className={i < at ? 'done' : i === at ? 'now' : ''}>{name}
        {i === at && step && <span className="step-of" style={{ '--of': `${Math.round(100 * step[0] / step[1])}%` } as
          CSSProperties}><i /></span>}</li>)}</ol>;
  }
}
