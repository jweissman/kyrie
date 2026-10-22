import type { ReaderApp } from './reader-app';
import { Toast } from './toast';

// While the engine builds the world: what it is doing, said once, with a quiet sign that it is still working.
export class LoadingPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, heading = s.setting?.pitch.heading ?? s.saved?.title ?? 'Kyr';
    return (
      <div className="opening loading-page" data-mode="loading" aria-busy="true">
        <main className="loading-sheet">
          <p className="campaign">{heading}</p>
          <p className="stage" role="status" aria-live="polite">{s.stage || 'Opening'}…</p>
          <div className="working" aria-hidden="true"><span /></div>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
}
