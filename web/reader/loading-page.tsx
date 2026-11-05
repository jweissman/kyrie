import type { ReaderApp } from './reader-app';
import { Toast } from './toast';

// While the engine draws the country or finds where you left off: what it is doing, said once. Setting out from the
// choice of a life, only that, over the country chosen in: the country's question ("Who comes to Acornweald?") had
// been asked again of one who had just answered it, over the engine's own steps (the opening's critique).
export class LoadingPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, heading = s.setting?.pitch.heading ?? s.saved?.title ?? 'Kyr';
    return (
      <div className={`opening loading${s.leaving ? ' leaving' : ''}`} data-mode="loading" aria-busy="true">
        <main>
          {!s.leaving && <h1>{heading}</h1>}
          <p className="stage" role="status" aria-live="polite">{s.leaving ? 'Setting out' : s.stage || 'Opening'}…</p>
          {s.leaving && <LoadingPage.Steps stage={s.stage} />}
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  // What the engine is doing while the company sets out, step by step as it reports each beginning (M19-49): no
  // share of the whole is guessed at.
  static readonly steps = ['Drawing the world', 'Placing its people', 'Telling where you are'];
  static Steps({ stage }: { stage: string }) {
    const at = LoadingPage.steps.indexOf(stage);
    if (at < 0) { return null; }
    return <ol className="steps" aria-hidden="true">{LoadingPage.steps.map((step, i) =>
      <li key={step} className={i < at ? 'done' : i === at ? 'now' : ''}>{step}</li>)}</ol>;
  }
}
