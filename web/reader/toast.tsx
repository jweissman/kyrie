import type { ReaderApp } from './reader-app';

// Something went wrong, said plainly where it can be seen and dismissed.
export class Toast {
  static View({ app }: { app: ReaderApp }) {
    if (!app.state.error) { return null; }
    return (
      <div className="toast" role="alert" data-id="error">
        <p>{app.state.error}</p>
        <button type="button" onClick={app.dismiss} aria-label="Dismiss">×</button>
      </div>
    );
  }
}
