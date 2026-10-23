import type { ReaderApp } from './reader-app';
import { Toast } from './toast';

// While the engine draws the country or finds where you left off: what it is doing, said once.
export class LoadingPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, heading = s.setting?.pitch.heading ?? s.saved?.title ?? 'Kyr';
    return (
      <div className="opening loading" data-mode="loading" aria-busy="true">
        <main>
          <h1>{heading}</h1>
          <p className="stage" role="status" aria-live="polite">{s.stage || 'Opening'}…</p>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
}
